// Serves the static export (out/) the way any static host would: a folder's index.html, 404.html otherwise.
import { createReadStream, existsSync, statSync } from "node:fs";
import { createServer } from "node:http";
import { extname, join, normalize, resolve } from "node:path";

const root = resolve(import.meta.dirname, "../out");
const port = Number(process.env.PORT ?? 3200);
const types = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript",
  ".mjs": "text/javascript",
  ".css": "text/css",
  ".json": "application/json",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".webp": "image/webp",
  ".woff2": "font/woff2",
  ".woff": "font/woff",
  ".txt": "text/plain; charset=utf-8",
  ".ico": "image/x-icon",
};

createServer((request, response) => {
  const path = decodeURIComponent(new URL(request.url ?? "/", "http://localhost").pathname);
  let file = normalize(join(root, path));
  if (!file.startsWith(root)) return response.writeHead(403).end();
  if (existsSync(file) && statSync(file).isDirectory()) file = join(file, "index.html");
  if (!existsSync(file) && existsSync(`${file}.html`)) file = `${file}.html`;
  const found = existsSync(file);
  if (!found) file = join(root, "404.html");
  response.writeHead(found ? 200 : 404, { "content-type": types[extname(file)] ?? "application/octet-stream" });
  createReadStream(file).pipe(response);
}).listen(port, () => console.log(`out/ on http://localhost:${port}`));
