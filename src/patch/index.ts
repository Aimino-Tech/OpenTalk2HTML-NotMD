import * as parse5 from "parse5";
import { readFile, atomicWrite } from "../writer.js";
import type { PatchHtmlInput } from "../types.js";
import { getCachedAst, setCachedAst, refreshCacheEntry, getCachedSelector, setCachedSelector } from "./cache.js";

interface ParsedSelector {
  tag?: string;
  id?: string;
  classes: string[];
  attrs: Array<{ name: string; value?: string; op: string }>;
}

interface SelectorPart {
  sel: ParsedSelector;
  combinator: " " | ">" | "";
}

const VOID_ELEMENTS = new Set([
  "area","base","br","col","embed","hr","img","input","link","meta","param","source","track","wbr"
]);

export function patchHtml(input: PatchHtmlInput): string {
  const html = readFile(input.file_path);

  if (isSimpleIdSelector(input.selector)) {
    const fastResult = tryFastPathPatch(html, input.selector, input.html);
    if (fastResult !== null) {
      atomicWrite(input.file_path, fastResult, { skipFormat: true });
      return `Patched 1 element(s) at "${input.selector}"`;
    }
  }

  const cachedDoc = getCachedAst(input.file_path);
  let document = cachedDoc;
  if (!document) {
    document = parse5.parse(html, { sourceCodeLocationInfo: true });
    setCachedAst(input.file_path, document);
  }

  const parts = getParsedSelector(input.selector);
  const nodes = findNodes(document as never, parts);

  if (nodes.length === 0) {
    throw new Error(`No element found matching selector: ${input.selector}`);
  }

  if (!cachedDoc) {
    const incrementalResult = tryIncrementalPatch(html, nodes, input.html);
    if (incrementalResult !== null) {
      atomicWrite(input.file_path, incrementalResult, { skipFormat: true });
      return `Patched ${nodes.length} element(s) at "${input.selector}"`;
    }
  }

  for (const node of nodes) {
    const parsed = parse5.parseFragment(input.html);
    (node as any).childNodes = (parsed as any).childNodes;
  }

  const updatedHtml = parse5.serialize(document as never);
  atomicWrite(input.file_path, updatedHtml, { skipFormat: true });
  refreshCacheEntry(input.file_path, document);
  return `Patched ${nodes.length} element(s) at "${input.selector}"`;
}

function isSimpleIdSelector(selector: string): boolean {
  return /^#[a-zA-Z0-9_-]+$/.test(selector);
}

function tryFastPathPatch(html: string, selector: string, newHtml: string): string | null {
  const id = selector.slice(1);
  const escapedId = id.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

  const elRegex = new RegExp(
    `<([a-zA-Z][a-zA-Z0-9]*)(?:\\s[^>]*?)?\\sid=["']${escapedId}["'][^>]*>`,
    "i"
  );
  const elMatch = html.match(elRegex);
  if (!elMatch) return null;

  const fullOpenTag = elMatch[0];
  const tagName = elMatch[1].toLowerCase();
  const openTagEnd = elMatch.index! + fullOpenTag.length;

  if (/\/\s*>$/.test(fullOpenTag)) return null;
  if (VOID_ELEMENTS.has(tagName)) return null;

  const rest = html.slice(openTagEnd);
  const closeTagName = tagName;
  const closeTagLower = `</${closeTagName}>`;

  let depth = 1;
  let pos = 0;
  let closeIdx = -1;
  const openRe = new RegExp(`<${closeTagName}(?:\\s[^>]*)?>`, "gi");
  const closeRe = new RegExp(`</${closeTagName}\\s*>`, "gi");

  while (depth > 0 && pos < rest.length) {
    openRe.lastIndex = pos;
    closeRe.lastIndex = pos;
    const nextOpen = openRe.exec(rest);
    const nextClose = closeRe.exec(rest);
    if (nextClose && (!nextOpen || nextClose.index < nextOpen.index)) {
      depth--;
      pos = nextClose.index + nextClose[0].length;
      if (depth === 0) closeIdx = nextClose.index;
    } else if (nextOpen) {
      depth++;
      pos = nextOpen.index + nextOpen[0].length;
    } else {
      break;
    }
  }

  if (closeIdx === -1) return null;

  const beforeOpen = html.slice(0, elMatch.index!);
  const afterClose = rest.slice(closeIdx + closeTagLower.length);
  const result = beforeOpen + fullOpenTag + newHtml + closeTagLower + afterClose;

  const openCount = (result.match(new RegExp(`<${closeTagName}(?:\\s[^>]*)?>`, "gi")) || []).length;
  const closeCount = (result.match(new RegExp(`</${closeTagName}\\s*>`, "gi")) || []).length;
  if (openCount !== closeCount) return null;

  return result;
}

function tryIncrementalPatch(html: string, nodes: any[], newHtml: string): string | null {
  for (const node of nodes) {
    const loc = node.sourceCodeLocation;
    if (!loc || !loc.startTag || !loc.endTag) return null;
  }

  if (nodes.length > 200) return null;

  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      const a = nodes[i].sourceCodeLocation;
      const b = nodes[j].sourceCodeLocation;
      if (a.startTag.startOffset <= b.startTag.startOffset && a.endTag.endOffset >= b.endTag.endOffset) {
        return null;
      }
      if (b.startTag.startOffset <= a.startTag.startOffset && b.endTag.endOffset >= a.endTag.endOffset) {
        return null;
      }
    }
  }

  const newFragment = parse5.parseFragment(newHtml);
  const newSerialized = parse5.serialize(newFragment as never);

  const sorted = [...nodes].sort(
    (a, b) => b.sourceCodeLocation.startTag.startOffset - a.sourceCodeLocation.startTag.startOffset
  );

  let result = html;
  for (const node of sorted) {
    const loc = node.sourceCodeLocation;
    result = result.slice(0, loc.startTag.endOffset) + newSerialized + result.slice(loc.endTag.startOffset);
  }

  return result;
}

function getParsedSelector(selector: string): SelectorPart[] {
  const cached = getCachedSelector<SelectorPart[]>(selector);
  if (cached) return cached;
  const parts = parseSelector(selector);
  setCachedSelector(selector, parts);
  return parts;
}

function parseSelector(selector: string): SelectorPart[] {
  const parts: SelectorPart[] = [];
  const rawParts = selector.split(/(\s+|[>+~])/).filter(t => t.trim().length > 0);

  let combinator: " " | ">" | "" = "";

  for (const token of rawParts) {
    if (token === ">") { combinator = ">"; continue; }
    if (token === "+" || token === "~") { combinator = " "; continue; }
    if (/^\s+$/.test(token)) { combinator = " "; continue; }

    const sel: ParsedSelector = { classes: [], attrs: [] };

    const tagMatch = token.match(/^([a-zA-Z0-9-]+)/);
    if (tagMatch) sel.tag = tagMatch[1];

    const idMatch = token.match(/#([a-zA-Z0-9_-]+)/);
    if (idMatch) sel.id = idMatch[1];

    const classMatches = token.match(/\.([a-zA-Z0-9_-]+)/g);
    if (classMatches) sel.classes = classMatches.map(c => c.slice(1));

    const attrRegex = /\[([a-zA-Z0-9_-]+)(?:([~^$*|!]?=)['"]?([^\]]*?)['"]?)?\]/g;
    let attrMatch;
    while ((attrMatch = attrRegex.exec(token)) !== null) {
      sel.attrs.push({ name: attrMatch[1], op: attrMatch[2] || "", value: attrMatch[3] });
    }

    parts.push({ sel, combinator });
    combinator = "";
  }

  return parts;
}

function findNodes(node: any, parts: SelectorPart[]): any[] {
  if (parts.length === 1) {
    const results: any[] = [];
    walkAll(node, parts[0].sel, results);
    return results;
  }

  const results: any[] = [];
  const target = parts[parts.length - 1];
  const ancestors = parts.slice(0, -1);
  findWithAncestors(node, ancestors, 0, target, results);
  return results;
}

function walkAll(node: any, sel: ParsedSelector, results: any[]): void {
  if (node.tagName && matchSelector(node, sel)) results.push(node);
  if (node.childNodes) for (const c of node.childNodes) walkAll(c, sel, results);
}

function findWithAncestors(node: any, ancestors: SelectorPart[], depth: number, target: SelectorPart, results: any[]): void {
  if (node.childNodes) {
    for (const child of node.childNodes) {
      if (!child.tagName) continue;
      if (depth < ancestors.length && matchSelector(child, ancestors[depth].sel)) {
        const comb = ancestors[depth].combinator;
        if (comb === ">") {
          findTargetInDirectChildren(child, target.sel, results);
        } else {
          findTargetInDescendants(child, target.sel, results);
        }
        findWithAncestors(child, ancestors, depth + 1, target, results);
      } else {
        if (depth === 0 || (depth > 0 && ancestors[depth - 1].combinator === " ")) {
          findWithAncestors(child, ancestors, depth, target, results);
        }
      }
    }
  }
}

function findTargetInDirectChildren(node: any, target: ParsedSelector, results: any[]): void {
  if (node.childNodes) {
    for (const c of node.childNodes) {
      if (c.tagName && matchSelector(c, target)) results.push(c);
    }
  }
}

function findTargetInDescendants(node: any, target: ParsedSelector, results: any[]): void {
  walkAll(node, target, results);
}

function matchSelector(el: any, sel: ParsedSelector): boolean {
  if (sel.tag) {
    const tagUpper = sel.tag.toUpperCase();
    if (el.tagName !== tagUpper && el.tagName !== sel.tag) return false;
  }
  if (sel.id) {
    if (getAttr(el, "id") !== sel.id) return false;
  }
  if (sel.classes.length > 0) {
    const classes = (getAttr(el, "class") || "").split(/\s+/);
    for (const cls of sel.classes) {
      if (!classes.includes(cls)) return false;
    }
  }
  if (sel.attrs.length > 0) {
    for (const attr of sel.attrs) {
      const val = getAttr(el, attr.name);
      if (val === undefined) return false;
      if (attr.value !== undefined) {
        switch (attr.op) {
          case "=": if (val !== attr.value) return false; break;
          case "~=": if (!val.split(/\s+/).includes(attr.value)) return false; break;
          case "^=": if (!val.startsWith(attr.value)) return false; break;
          case "$=": if (!val.endsWith(attr.value)) return false; break;
          case "*=": if (!val.includes(attr.value)) return false; break;
          case "|=": if (val !== attr.value && !val.startsWith(attr.value + "-")) return false; break;
        }
      }
    }
  }
  return true;
}

function getAttr(el: any, name: string): string | undefined {
  if (!el.attrs) return undefined;
  const attr = el.attrs.find((a: any) => a.name === name);
  return attr?.value;
}
