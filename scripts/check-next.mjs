// A real Next.js App Router app (tests/next/app) on the packed package: `next build`, then the browsers
// check server rendering, a hydration without a single error or warning, and that the page works after.
// The app is copied out of the repository, so it resolves only what the package itself declares.
// Run `pnpm build` first. Arguments go to Playwright: `pnpm check:next --project=dev-chromium`.
import { execSync } from "node:child_process";
import { cpSync, existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const work = join(process.env.RUNNER_TEMP ?? tmpdir(), "cennge-ui-next");
const app = join(work, "app");
const env = { ...process.env, NEXT_TELEMETRY_DISABLED: "1", NEXT_APP_DIR: app };
const run = (command, cwd) => execSync(command, { cwd, env, stdio: "inherit" });

if (!existsSync(join(root, "dist/index.js"))) throw new Error("No dist/: run `pnpm build` first.");

// The package as npm would get it.
mkdirSync(app, { recursive: true });
run(`pnpm pack --out "${join(work, "cennge-ui.tgz")}"`, root);

// A fresh copy of the app. node_modules stays between local runs; npm brings it up to date.
for (const entry of readdirSync(app)) {
  if (entry !== "node_modules") rmSync(join(app, entry), { recursive: true, force: true });
}
cpSync(join(root, "tests/next/app"), app, { recursive: true });

// The playground (App.tsx and the demos it renders), as client components under the page.
const playground = join(app, "app/playground");
mkdirSync(playground);
for (const file of readdirSync(join(root, "playground"))) {
  if (/^[A-Z]\w*\.tsx$/.test(file)) cpSync(join(root, "playground", file), join(playground, file));
}
writeFileSync(join(playground, "App.tsx"), `"use client";\n\n${readFileSync(join(playground, "App.tsx"), "utf8")}`);

// Its static files too: the demos show /avatar.svg.
cpSync(join(root, "playground/public"), join(app, "public"), { recursive: true });

const manifest = JSON.parse(readFileSync(join(app, "package.json"), "utf8"));
manifest.dependencies["cennge-ui"] = "file:../cennge-ui.tgz";
writeFileSync(join(app, "package.json"), `${JSON.stringify(manifest, null, 2)}\n`);

// npm takes a package installed from a file of the same name as up to date: drop it to get this build.
rmSync(join(app, "node_modules/cennge-ui"), { recursive: true, force: true });
rmSync(join(app, "node_modules/.package-lock.json"), { force: true });
run("npm install --no-audit --no-fund", app);
run("npm run build", app);
run(["pnpm exec playwright test -c tests/next/playwright.config.ts", ...process.argv.slice(2)].join(" "), root);
