"use server";

export interface SaveState {
  errors?: Record<string, string>;
  saved?: string;
  repository?: string;
}

const repositories = ["ai-niche-scout", "cennge-ui", "payload-cache", "spredo-crypto-screener", "playwright-msi-scraper"];

export async function saveRepository(_previous: SaveState, data: FormData): Promise<SaveState> {
  const repository = String(data.get("repository") ?? "").trim();
  if (!repositories.includes(repository)) {
    return { repository, errors: { repository: `No repository named "${repository}"` } };
  }
  return { repository, saved: repository };
}
