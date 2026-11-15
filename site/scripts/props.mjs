// Reads every exported `...Props` interface and type in the library's sources with the TypeScript compiler and
// writes generated/props.json: each prop's type as written, its literal values, JSDoc text and @default. The
// props tables on the site come from here, so they cannot drift from the code.
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import ts from "typescript";

const root = resolve(import.meta.dirname, "../..");
const out = resolve(import.meta.dirname, "../generated/props.json");
const entries = ["src/index.ts", "src/charts/index.ts", "src/map/index.ts"].map((file) => join(root, file));

const configFile = ts.readConfigFile(join(root, "tsconfig.json"), ts.sys.readFile);
const config = ts.parseJsonConfigFileContent(configFile.config, ts.sys, root);
const program = ts.createProgram(entries, { ...config.options, noEmit: true });
const checker = program.getTypeChecker();

const fromLibrary = (node) => {
  const file = node.getSourceFile().fileName.replaceAll("\\", "/");
  return file.startsWith(root.replaceAll("\\", "/") + "/src/");
};
const docs = (symbol) => ts.displayPartsToString(symbol.getDocumentationComment(checker)).trim() || undefined;
const tag = (symbol, name) => {
  const found = symbol.getJsDocTags(checker).find((t) => t.name === name);
  return found ? ts.displayPartsToString(found.text).trim() : undefined;
};

/** The literal members of a union (`"sm" | "md"`), when every member is one; otherwise undefined. */
function literals(type) {
  const members = type.isUnion() ? type.types : [type];
  const values = [];
  for (const member of members) {
    if (member.isStringLiteral()) values.push(JSON.stringify(member.value));
    else if (member.isNumberLiteral()) values.push(String(member.value));
    else if (member.flags & ts.TypeFlags.BooleanLiteral) values.push(checker.typeToString(member));
    else if (member.flags & (ts.TypeFlags.Undefined | ts.TypeFlags.Null)) continue;
    else return undefined;
  }
  // `boolean` is `true | false`: not worth listing.
  if (values.length === 2 && values.includes("true") && values.includes("false")) return undefined;
  return values.length > 1 ? values : undefined;
}

function describe(symbol) {
  const declaration = symbol.valueDeclaration ?? symbol.declarations?.[0];
  if (!declaration || !fromLibrary(declaration)) return null;
  const written = declaration.type ? declaration.type.getText().replace(/\s+/g, " ") : undefined;
  const type = checker.getNonNullableType(checker.getTypeOfSymbolAtLocation(symbol, declaration));
  return {
    name: symbol.getName(),
    type: written ?? checker.typeToString(type),
    values: literals(type),
    required: !(symbol.flags & ts.SymbolFlags.Optional),
    default: tag(symbol, "default"),
    deprecated: tag(symbol, "deprecated"),
    description: docs(symbol),
  };
}

/** What the props inherit from React's DOM types, as written in the heritage clause or intersection. */
function inherits(declaration) {
  const texts = [];
  const visit = (node) => {
    const text = node.getText().replace(/\s+/g, " ");
    if (/React\.|HTMLAttributes|ComponentProps/.test(text)) texts.push(text);
  };
  if (ts.isInterfaceDeclaration(declaration)) {
    for (const clause of declaration.heritageClauses ?? []) clause.types.forEach(visit);
  } else if (ts.isTypeAliasDeclaration(declaration) && ts.isIntersectionTypeNode(declaration.type)) {
    declaration.type.types.forEach(visit);
  }
  return texts;
}

const result = {};
for (const entry of entries) {
  const module = checker.getSymbolAtLocation(program.getSourceFile(entry));
  for (let exported of checker.getExportsOfModule(module)) {
    if (exported.flags & ts.SymbolFlags.Alias) exported = checker.getAliasedSymbol(exported);
    const name = exported.getName();
    if (!/Props$/.test(name) || result[name]) continue;
    const declaration = exported.declarations?.find((d) => ts.isInterfaceDeclaration(d) || ts.isTypeAliasDeclaration(d));
    if (!declaration) continue;
    const type = checker.getDeclaredTypeOfSymbol(exported);

    // A union of prop sets (single or multiple selection): every member's props, marked where only some have them.
    const members = type.isUnion() ? type.types : [type];
    const seen = new Map();
    members.forEach((member, index) => {
      for (const property of checker.getPropertiesOfType(member)) {
        const described = describe(property);
        if (!described) continue;
        const known = seen.get(described.name);
        if (!known) {
          seen.set(described.name, { ...described, in: [index] });
          continue;
        }
        known.in.push(index);
        // The discriminant: `selectionMode?: "single"` in one member, `selectionMode: "multiple"` in the other.
        if (known.type !== described.type) {
          known.type = `${known.type} | ${described.type}`;
          known.values = known.values && described.values ? [...new Set([...known.values, ...described.values])] : undefined;
        }
        known.required &&= described.required;
        known.default ??= described.default;
        known.description ??= described.description;
      }
    });
    const props = [...seen.values()].map(({ in: found, ...prop }) => {
      if (found.length === members.length) return prop;
      // Name the variant by its discriminating literal, e.g. selectionMode="multiple".
      const variant = members[found[0]];
      const discriminant = checker
        .getPropertiesOfType(variant)
        .map((p) => [p.getName(), checker.getTypeOfSymbolAtLocation(p, p.valueDeclaration ?? declaration)])
        .find(([, t]) => checker.getNonNullableType(t).isStringLiteral());
      const only = discriminant
        ? `${discriminant[0]}=${JSON.stringify(checker.getNonNullableType(discriminant[1]).value)}`
        : undefined;
      return { ...prop, only };
    });

    result[name] = {
      source: relative(root, declaration.getSourceFile().fileName).replaceAll("\\", "/"),
      description: docs(exported),
      inherits: [...new Set(members.length > 1 ? inherits(declaration) : inherits(declaration))],
      props,
    };
  }
}

mkdirSync(dirname(out), { recursive: true });
writeFileSync(out, `${JSON.stringify(result, null, 2)}\n`);
console.log(`props: ${Object.keys(result).length} prop types -> ${relative(process.cwd(), out)}`);
