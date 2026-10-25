import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { extname, resolve, sep } from "node:path";
import { handle } from "./app.js";

const frontendDir = resolve(process.cwd(), "dist");
const contentTypes: Record<string, string> = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".ico": "image/x-icon",
  ".jpeg": "image/jpeg",
  ".jpg": "image/jpeg",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".webp": "image/webp",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
};

async function staticFile(path: string) {
  try {
    const info = await stat(path);
    const file = info.isDirectory() ? resolve(path, "index.html") : path;
    return (await stat(file)).isFile() ? file : null;
  } catch (error) {
    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      (error.code === "ENOENT" || error.code === "ENOTDIR")
    )
      return null;
    throw error;
  }
}

const server = createServer(async (req, res) => {
  try {
    let pathname: string;
    try {
      pathname = decodeURIComponent(
        new URL(req.url || "/", "http://localhost").pathname,
      );
    } catch {
      res.statusCode = 400;
      return res.end("Invalid request path");
    }

    if (pathname === "/api" || pathname.startsWith("/api/"))
      return await handle(req, res);

    if (!["GET", "HEAD"].includes(req.method || "GET")) {
      res.statusCode = 405;
      res.setHeader("Allow", "GET, HEAD");
      return res.end("Method not allowed");
    }

    const candidate = resolve(frontendDir, pathname.slice(1));
    if (candidate !== frontendDir && !candidate.startsWith(frontendDir + sep)) {
      res.statusCode = 404;
      return res.end("Not found");
    }

    const file =
      (await staticFile(candidate)) ||
      (extname(pathname) ? null : resolve(frontendDir, "index.html"));
    if (!file) {
      res.statusCode = 404;
      return res.end("Not found");
    }

    const data = await readFile(file);
    res.setHeader(
      "Content-Type",
      contentTypes[extname(file).toLowerCase()] || "application/octet-stream",
    );
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader(
      "Cache-Control",
      file.endsWith("index.html") ? "no-cache" : "public, max-age=3600",
    );
    res.setHeader("Content-Length", data.length);
    res.end(req.method === "HEAD" ? undefined : data);
  } catch (error) {
    console.error(
      "Web request failed",
      error instanceof Error ? error.name : "UnknownError",
    );
    if (!res.headersSent) {
      res.statusCode = 500;
      res.end("The request could not be completed");
    }
  }
});

const port = Number(process.env.PORT || 8787);
if (!Number.isInteger(port) || port < 1 || port > 65535)
  throw new Error("PORT must be an integer between 1 and 65535");

server.listen(port, "0.0.0.0", () => {
  console.log(`Califnco web service listening on 0.0.0.0:${port}`);
});
