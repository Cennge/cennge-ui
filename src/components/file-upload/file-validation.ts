/* File checks and size formatting for FileUpload. Pure functions, no React. */

export type FileErrorCode = "file-invalid-type" | "file-too-large" | "file-too-small" | "too-many-files";

export interface FileRejection {
  file: File;
  errors: FileErrorCode[];
}

export interface FileLimits {
  /** MIME types, wildcards or extensions: "image/*", "application/pdf", ".png". */
  accept?: string[];
  maxSize?: number;
  minSize?: number;
}

export function normaliseAccept(accept?: string | string[]): string[] | undefined {
  if (accept === undefined) return undefined;
  const list = (Array.isArray(accept) ? accept : accept.split(","))
    .map((entry) => entry.trim().toLowerCase())
    .filter(Boolean);
  return list.length > 0 ? list : undefined;
}

/** Same rules as the native accept attribute: extension, exact MIME type, or "type/*". */
export function isAccepted(file: File, accept?: string[]): boolean {
  if (!accept) return true;
  const name = file.name.toLowerCase();
  const type = (file.type || "").toLowerCase();
  return accept.some((pattern) => {
    if (pattern.startsWith(".")) return name.endsWith(pattern);
    if (pattern.endsWith("/*")) return type.startsWith(pattern.slice(0, -1));
    return type === pattern;
  });
}

export function checkFile(file: File, limits: FileLimits): FileErrorCode[] {
  const errors: FileErrorCode[] = [];
  if (!isAccepted(file, limits.accept)) errors.push("file-invalid-type");
  if (limits.maxSize !== undefined && file.size > limits.maxSize) errors.push("file-too-large");
  if (limits.minSize !== undefined && file.size < limits.minSize) errors.push("file-too-small");
  return errors;
}

/** The same file picked twice: name, size and modification time match. */
export function isSameFile(a: File, b: File): boolean {
  return a.name === b.name && a.size === b.size && a.lastModified === b.lastModified;
}

const units = ["byte", "kilobyte", "megabyte", "gigabyte", "terabyte"] as const;

/** 1536 → "1.5 kB". Binary steps (1024), locale-aware number and unit. */
export function formatBytes(bytes: number, locale = "en-US"): string {
  let value = bytes;
  let unit = 0;
  while (value >= 1024 && unit < units.length - 1) {
    value /= 1024;
    unit += 1;
  }
  return new Intl.NumberFormat(locale, {
    style: "unit",
    unit: units[unit],
    // "short" spells bytes out ("68 byte" in English); "narrow" gives "68B" / "68 Б".
    unitDisplay: unit === 0 ? "narrow" : "short",
    maximumFractionDigits: unit > 0 && value < 10 ? 1 : 0,
  }).format(value);
}

/** "report.pdf" → "PDF", used on non-image file icons. */
export function extensionOf(name: string): string {
  const dot = name.lastIndexOf(".");
  return dot > 0 && dot < name.length - 1 ? name.slice(dot + 1, dot + 5).toUpperCase() : "FILE";
}
