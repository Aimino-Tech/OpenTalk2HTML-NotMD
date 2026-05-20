import * as fs from "node:fs";
import type { DefaultTreeAdapterMap } from "parse5";

type Document = DefaultTreeAdapterMap["document"];

interface CacheEntry {
  mtime: number;
  document: Document;
}

const MAX_AST_CACHE = 100;
const MAX_SELECTOR_CACHE = 500;

const astCache = new Map<string, CacheEntry>();
const selectorCache = new Map<string, unknown>();

function evictOne(map: Map<string, unknown>): void {
  const key = map.keys().next().value;
  if (key !== undefined) map.delete(key);
}

function setWithEviction<K, V>(map: Map<K, V>, key: K, value: V, max: number): void {
  if (map.size >= max) evictOne(map as Map<string, unknown>);
  map.set(key, value);
}

export function getCachedAst(filePath: string): Document | null {
  try {
    const stat = fs.statSync(filePath);
    const entry = astCache.get(filePath);
    if (entry && entry.mtime === stat.mtimeMs) {
      return entry.document;
    }
  } catch {
    return null;
  }
  return null;
}

export function setCachedAst(filePath: string, document: Document): void {
  try {
    const stat = fs.statSync(filePath);
    setWithEviction(astCache, filePath, { mtime: stat.mtimeMs, document }, MAX_AST_CACHE);
  } catch {
    void undefined;
  }
}

export function invalidateCache(filePath: string): void {
  astCache.delete(filePath);
}

export function refreshCacheEntry(filePath: string, document: Document): void {
  try {
    const stat = fs.statSync(filePath);
    astCache.set(filePath, { mtime: stat.mtimeMs, document });
  } catch {
    void undefined;
  }
}

export function clearCache(): void {
  astCache.clear();
  selectorCache.clear();
}

export function getCachedSelector<T>(selector: string): T | undefined {
  return selectorCache.get(selector) as T | undefined;
}

export function setCachedSelector<T>(selector: string, parsed: T): void {
  setWithEviction(selectorCache, selector, parsed as unknown, MAX_SELECTOR_CACHE);
}
