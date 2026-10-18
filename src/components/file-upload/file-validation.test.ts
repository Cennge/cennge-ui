import { checkFile, extensionOf, formatBytes, isAccepted, isSameFile, normaliseAccept } from "./file-validation";

const file = (name: string, type: string, size = 10, lastModified = 1) =>
  new File([new Uint8Array(size)], name, { type, lastModified });

describe("accept rules", () => {
  it("normalises a string or a list", () => {
    expect(normaliseAccept("image/*, .PDF")).toEqual(["image/*", ".pdf"]);
    expect(normaliseAccept(["image/png"])).toEqual(["image/png"]);
    expect(normaliseAccept("")).toBeUndefined();
  });

  it("matches extensions, wildcards and exact types like the native attribute", () => {
    const accept = ["image/*", ".pdf", "text/csv"];
    expect(isAccepted(file("cat.PNG", "image/png"), accept)).toBe(true);
    expect(isAccepted(file("spec.pdf", ""), accept)).toBe(true);
    expect(isAccepted(file("data.csv", "text/csv"), accept)).toBe(true);
    expect(isAccepted(file("movie.mp4", "video/mp4"), accept)).toBe(false);
    expect(isAccepted(file("anything", ""), undefined)).toBe(true);
  });
});

describe("checkFile", () => {
  it("reports every reason at once", () => {
    expect(checkFile(file("huge.mp4", "video/mp4", 100), { accept: ["image/*"], maxSize: 50 })).toEqual([
      "file-invalid-type",
      "file-too-large",
    ]);
    expect(checkFile(file("empty.png", "image/png", 0), { minSize: 1 })).toEqual(["file-too-small"]);
    expect(checkFile(file("ok.png", "image/png", 10), { accept: ["image/*"], maxSize: 50 })).toEqual([]);
  });
});

describe("helpers", () => {
  it("formats sizes per locale with binary steps", () => {
    expect(formatBytes(512)).toBe("512B");
    expect(formatBytes(512, "ru-RU")).toMatch(/^512\sБ$/);
    expect(formatBytes(1536)).toBe("1.5 kB");
    expect(formatBytes(5 * 1024 * 1024)).toBe("5 MB");
    // ICU versions differ in the case of the abbreviation ("кБ" / "КБ").
    expect(formatBytes(1536, "ru-RU")).toMatch(/^1,5\sкб$/i);
  });

  it("recognises the same file picked twice", () => {
    expect(isSameFile(file("a.png", "image/png", 5, 7), file("a.png", "image/png", 5, 7))).toBe(true);
    expect(isSameFile(file("a.png", "image/png", 5, 7), file("a.png", "image/png", 6, 7))).toBe(false);
  });

  it("derives a short extension label", () => {
    expect(extensionOf("report.pdf")).toBe("PDF");
    expect(extensionOf("archive.tar.gz")).toBe("GZ");
    expect(extensionOf("README")).toBe("FILE");
  });
});
