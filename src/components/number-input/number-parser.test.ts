import { addStep, clamp, decimals, getNumberSymbols, isPartialNumber, parseNumber } from "./number-parser";

const en = getNumberSymbols("en-US");
const ru = getNumberSymbols("ru-RU");
const de = getNumberSymbols("de-DE");
const usd = getNumberSymbols("en-US", { style: "currency", currency: "USD" });
const percent = getNumberSymbols("en-US", { style: "percent" });

describe("parseNumber", () => {
  it("parses plain and grouped numbers per locale", () => {
    expect(parseNumber("1234.5", en)).toBe(1234.5);
    expect(parseNumber("1,234.5", en)).toBe(1234.5);
    expect(parseNumber("1 234,5", ru)).toBe(1234.5);
    expect(parseNumber("1 234,5", ru)).toBe(1234.5);
    expect(parseNumber("1 234,5", ru)).toBe(1234.5);
    expect(parseNumber("1.234,5", de)).toBe(1234.5);
  });

  it("accepts a dot in decimal-comma locales", () => {
    expect(parseNumber("12.5", ru)).toBe(12.5);
  });

  it("handles negatives, including the typographic minus", () => {
    expect(parseNumber("-42", en)).toBe(-42);
    expect(parseNumber("−42", en)).toBe(-42);
  });

  it("strips currency and percent signs", () => {
    expect(parseNumber("$1,234.50", usd)).toBe(1234.5);
    expect(parseNumber("25%", percent, true)).toBe(0.25);
    expect(parseNumber("7%", percent, true)).toBe(0.07);
  });

  it("returns null for empty and NaN for garbage", () => {
    expect(parseNumber("", en)).toBeNull();
    expect(parseNumber("   ", en)).toBeNull();
    expect(parseNumber("-", en)).toBeNaN();
    expect(parseNumber("12a", en)).toBeNaN();
  });
});

describe("isPartialNumber", () => {
  const any = { allowNegative: true, allowDecimal: true };
  it("allows text on its way to a number", () => {
    expect(isPartialNumber("", en, any)).toBe(true);
    expect(isPartialNumber("-", en, any)).toBe(true);
    expect(isPartialNumber("12.", en, any)).toBe(true);
    expect(isPartialNumber("12,", ru, any)).toBe(true);
  });

  it("blocks letters, a second decimal point, and disallowed signs", () => {
    expect(isPartialNumber("12a", en, any)).toBe(false);
    expect(isPartialNumber("1.2.3", en, any)).toBe(false);
    expect(isPartialNumber("-1", en, { allowNegative: false, allowDecimal: true })).toBe(false);
    expect(isPartialNumber("1.5", en, { allowNegative: true, allowDecimal: false })).toBe(false);
  });
});

describe("stepping", () => {
  it("adds without floating point noise", () => {
    expect(addStep(0.2, 0.1)).toBe(0.3);
    expect(addStep(1.005, 0.001)).toBe(1.006);
    expect(addStep(0.3, -0.1)).toBe(0.2);
  });

  it("counts decimals, including exponent notation", () => {
    expect(decimals(1)).toBe(0);
    expect(decimals(0.25)).toBe(2);
    expect(decimals(1e-7)).toBe(7);
  });

  it("clamps to optional bounds", () => {
    expect(clamp(5, 0, 3)).toBe(3);
    expect(clamp(-1, 0)).toBe(0);
    expect(clamp(5)).toBe(5);
  });
});
