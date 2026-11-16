// The library's releases for the landing page, from CHANGELOG.md (written by changesets) and the git history:
// version, date, a short title and the changelog's entries. Newest first.
import { execFileSync } from "node:child_process";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const changelog = readFileSync(join(root, "CHANGELOG.md"), "utf8");

/** Titles written by hand for releases whose entries do not shorten well; any other release gets one made. */
const titles = {
  "0.3.1": "README maps set in New York",
  "0.3.0": "Charts, ThemeScript and five fixes",
  "0.2.0": "The map entry, cennge-ui/map",
  "0.1.1": "Date limits accept null",
  "0.1.0": "First release",
};

/**
 * The day a version was released: when main first carried it in package.json, which is the day its release
 * pull request was merged and it was published. In UTC, the same on every machine.
 */
function dateOf(version) {
  try {
    const out = execFileSync(
      "git",
      ["log", "--first-parent", "--diff-merges=first-parent", "--reverse", "--date=format-local:%Y-%m-%d", "--format=%cd", `-S"version": "${version}"`, "HEAD", "--", "package.json"],
      {
      cwd: root,
      env: { ...process.env, TZ: "UTC" },
      encoding: "utf8",
      },
    );
    return out.split("\n")[0]?.trim() || null;
  } catch {
    // No git, or a shallow clone: the date is left out.
    return null;
  }
}

/** What an entry is about: the name before its first colon ("`ProgressRing`", "Charts"), when that is a name. */
function subjectOf(entry) {
  const head = entry.split(":")[0].replaceAll("`", "").trim();
  return head.split(/\s+/).length <= 2 ? head : null;
}

/** "A, B and C", the subjects of a release; patches say what they fix. */
function titleOf(entries, kind) {
  const subjects = [...new Set(entries.map(subjectOf).filter(Boolean))];
  if (!subjects.length) return kind === "patch" ? "Fixes" : "New components";
  const list = subjects.length === 1 ? subjects[0] : `${subjects.slice(0, -1).join(", ")} and ${subjects.at(-1)}`;
  return kind === "patch" ? `${list} ${subjects.length === 1 ? "fix" : "fixes"}` : list;
}

const releases = [];
for (const section of changelog.split(/^## /m).slice(1)) {
  const version = section.split("\n")[0].trim();
  if (!/^\d+\.\d+\.\d+/.test(version)) continue;
  const kind = /### Major Changes|### Minor Changes/.test(section) ? "minor" : "patch";
  // Each entry: "- abc1234: Text…", the hash dropped, its first paragraph only.
  const entries = [...section.matchAll(/^- (?:[0-9a-f]{7,}: )?([\s\S]*?)(?=\n- |\n\n|\n###|$)/gm)].map((match) => match[1].replace(/\s+/g, " ").trim());
  releases.push({ version, date: dateOf(version), kind, title: titles[version] ?? titleOf(entries, kind), entries });
}

const out = join(root, "site", "generated", "releases.json");
mkdirSync(dirname(out), { recursive: true });
writeFileSync(out, JSON.stringify(releases, null, 2) + "\n");
console.log(`releases: ${releases.length}, latest ${releases[0]?.version} (${releases[0]?.title}) -> generated/releases.json`);
