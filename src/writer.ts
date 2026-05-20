import * as fs from "node:fs";
import * as path from "node:path";
import * as os from "node:os";
import { formatHtml } from "./formatter.js";

export function atomicWrite(targetPath: string, content: string, options?: { skipFormat?: boolean }): void {
  const dir = path.dirname(targetPath);
  fs.mkdirSync(dir, { recursive: true });
  const tmpFile = path.join(os.tmpdir(), `.html-mcp-${Date.now()}-${Math.random().toString(36).slice(2)}.tmp`);
  const finalContent = options?.skipFormat ? content : formatHtml(content);
  fs.writeFileSync(tmpFile, finalContent, "utf-8");
  fs.renameSync(tmpFile, targetPath);
}

export function readFile(filePath: string): string {
  return fs.readFileSync(filePath, "utf-8");
}

export function fileExists(filePath: string): boolean {
  return fs.existsSync(filePath);
}
