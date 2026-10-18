/* Locale-aware parsing and stepping for NumberInput. Pure functions, no React. */

export interface NumberSymbols {
  group: string;
  decimal: string;
  minus: string;
  /** Currency signs, percent signs and other literal text the formatter adds. */
  affixes: string[];
}

export function getNumberSymbols(locale: string, options?: Intl.NumberFormatOptions): NumberSymbols {
  const parts = new Intl.NumberFormat(locale, options).formatToParts(-12345.6);
  const plainParts = new Intl.NumberFormat(locale).formatToParts(-12345.6);
  const find = (type: string, fallback: string) =>
    parts.find((p) => p.type === type)?.value ?? plainParts.find((p) => p.type === type)?.value ?? fallback;
  const affixes = parts
    .filter((p) => p.type === "currency" || p.type === "percentSign" || p.type === "literal" || p.type === "unit")
    .map((p) => p.value.trim())
    .filter(Boolean);
  return { group: find("group", ","), decimal: find("decimal", "."), minus: find("minusSign", "-"), affixes };
}

/** Normalise user text to a plain JS number string ("-1234.5"), or null when it cannot become one. */
function normalise(text: string, symbols: NumberSymbols): string | null {
  let s = text.replace(/\s/g, "");
  for (const affix of symbols.affixes) s = s.split(affix.replace(/\s/g, "")).join("");
  s = s.replace(/[−‒–]/g, "-").split(symbols.minus).join("-");
  if (symbols.group && !/\s/.test(symbols.group) && symbols.group !== symbols.decimal) {
    s = s.split(symbols.group).join("");
  }
  // Locales with a decimal comma: also accept a dot, which is what most keyboards type.
  if (symbols.decimal !== ".") {
    s = s.split(symbols.decimal).join(".");
  }
  return /^-?\d*\.?\d*$/.test(s) ? s : null;
}

/** True while the text can still become a number: "", "-", "12,", "1 2". Used to block bad keystrokes. */
export function isPartialNumber(text: string, symbols: NumberSymbols, options: { allowNegative: boolean; allowDecimal: boolean }) {
  const normalised = normalise(text, symbols);
  if (normalised === null) return false;
  if (!options.allowNegative && normalised.includes("-")) return false;
  if (!options.allowDecimal && normalised.includes(".")) return false;
  return true;
}

/** Parse text to a number. Empty text is null; text that is not a number is NaN. */
export function parseNumber(text: string, symbols: NumberSymbols, isPercent = false): number | null {
  if (text.trim() === "") return null;
  const normalised = normalise(text, symbols);
  if (normalised === null || normalised === "-" || normalised === "." || normalised === "-.") return Number.NaN;
  const value = Number(normalised);
  if (Number.isNaN(value)) return Number.NaN;
  return isPercent ? roundTo(value / 100, decimals(value) + 2) : value;
}

/** Digits after the decimal point, including for numbers like 1e-7. */
export function decimals(value: number): number {
  if (!Number.isFinite(value)) return 0;
  const text = String(value);
  const exponent = text.match(/e-(\d+)$/);
  if (exponent) {
    const mantissa = text.split("e")[0] ?? "";
    return Number(exponent[1]) + (mantissa.split(".")[1]?.length ?? 0);
  }
  return text.split(".")[1]?.length ?? 0;
}

export function roundTo(value: number, digits: number): number {
  const factor = 10 ** Math.min(digits, 15);
  return Math.round(value * factor) / factor;
}

export function clamp(value: number, min?: number, max?: number): number {
  let next = value;
  if (min !== undefined) next = Math.max(next, min);
  if (max !== undefined) next = Math.min(next, max);
  return next;
}

/** current + amount without floating point noise: 0.2 + 0.1 === 0.3. */
export function addStep(current: number, amount: number): number {
  return roundTo(current + amount, Math.max(decimals(current), decimals(amount)));
}
