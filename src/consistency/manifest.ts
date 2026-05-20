import * as fs from "node:fs";
import type { EntityManifest, EntityNode } from "./types.js";

const ENTITY_REGEX = /data-entity=["']([^"']+)["'][^>]*>([^<]+)</g;

export function manifestPath(filePath: string): string {
  return filePath + ".consistency-manifest.json";
}

export function loadManifest(filePath: string): EntityManifest | null {
  const mPath = manifestPath(filePath);
  if (!fs.existsSync(mPath)) return null;
  try {
    return JSON.parse(fs.readFileSync(mPath, "utf-8"));
  } catch {
    return null;
  }
}

export function saveManifest(filePath: string, manifest: EntityManifest): void {
  fs.writeFileSync(manifestPath(filePath), JSON.stringify(manifest, null, 2), "utf-8");
}

export function createManifestFromEntities(entities: EntityNode[]): EntityManifest {
  const entity_values: Record<string, string> = {};
  for (const e of entities) {
    entity_values[e.id] = e.value;
  }
  return { entity_values };
}

export function extractEntityValuesFromHtmlString(html: string): Record<string, string> {
  const values: Record<string, string> = {};
  let match: RegExpExecArray | null;
  const re = new RegExp(ENTITY_REGEX.source, "g");
  while ((match = re.exec(html)) !== null) {
    values[match[1]] = match[2].trim();
  }
  return values;
}
