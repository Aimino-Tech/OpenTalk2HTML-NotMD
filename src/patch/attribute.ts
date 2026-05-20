import * as parse5 from "parse5";
import { readFile, atomicWrite } from "../writer.js";
import type { SetAttributeInput } from "../types.js";
import { getCachedAst, setCachedAst, refreshCacheEntry, getCachedSelector, setCachedSelector } from "./cache.js";

interface ParsedSelector {
  tag?: string;
  id?: string;
  classes: string[];
}

interface SelectorPart {
  sel: ParsedSelector;
  combinator: " " | ">" | "";
}

export function setAttribute(input: SetAttributeInput): string {
  const html = readFile(input.file_path);

  if (isSimpleIdSelector(input.selector)) {
    const fastResult = tryFastPathSetAttribute(html, input.selector, input.attribute, input.value);
    if (fastResult !== null) {
      atomicWrite(input.file_path, fastResult, { skipFormat: true });
      return `Set attribute "${input.attribute}" on 1 element(s)`;
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
    const incrementalResult = tryIncrementalSetAttribute(html, nodes, input.attribute, input.value);
    if (incrementalResult !== null) {
      atomicWrite(input.file_path, incrementalResult, { skipFormat: true });
      return `Set attribute "${input.attribute}" on ${nodes.length} element(s)`;
    }
  }

  for (const node of nodes) {
    setNodeAttr(node, input.attribute, input.value);
  }

  const updatedHtml = parse5.serialize(document as never);
  atomicWrite(input.file_path, updatedHtml, { skipFormat: true });
  refreshCacheEntry(input.file_path, document);
  return `Set attribute "${input.attribute}" on ${nodes.length} element(s)`;
}

function tryIncrementalSetAttribute(html: string, nodes: any[], attr: string, value: string): string | null {
  for (const node of nodes) {
    const loc = node.sourceCodeLocation;
    if (!loc || !loc.startTag) return null;
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

  const sorted = [...nodes].sort(
    (a, b) => b.sourceCodeLocation.startTag.startOffset - a.sourceCodeLocation.startTag.startOffset
  );

  let result = html;
  const safeValue = value.replace(/"/g, "&quot;");

  for (const node of sorted) {
    const loc = node.sourceCodeLocation;
    const tagText = result.slice(loc.startTag.startOffset, loc.startTag.endOffset);
    const escapedAttr = attr.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const attrRegex = new RegExp(`\\s${escapedAttr}=["'][^"']*["']`, "i");

    let newTag: string;
    if (attrRegex.test(tagText)) {
      newTag = tagText.replace(attrRegex, ` ${attr}="${safeValue}"`);
    } else {
      newTag = tagText.slice(0, -1) + ` ${attr}="${safeValue}"` + ">";
    }

    result = result.slice(0, loc.startTag.startOffset) + newTag + result.slice(loc.startTag.endOffset);
  }

  return result;
}

function isSimpleIdSelector(selector: string): boolean {
  return /^#[a-zA-Z0-9_-]+$/.test(selector);
}

function tryFastPathSetAttribute(html: string, selector: string, attr: string, value: string): string | null {
  const id = selector.slice(1);
  const escapedId = id.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const escapedAttr = attr.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

  const elRegex = new RegExp(
    `(<[a-zA-Z][a-zA-Z0-9]*(?:\\s[^>]*?)?\\sid=["']${escapedId}["'][^>]*)>`,
    "i"
  );
  const match = html.match(elRegex);

  if (!match) return null;
  if (/\/\s*>$/.test(match[1])) return null;

  const openTag = match[1];
  const tagEnd = match.index! + match[0].length;
  const safeValue = value.replace(/"/g, "&quot;");

  const attrRegex = new RegExp(`\\s${escapedAttr}=["'][^"']*["']`, "i");
  const existingAttr = openTag.match(attrRegex);

  let newOpenTag: string;
  if (existingAttr) {
    newOpenTag = openTag.replace(attrRegex, ` ${attr}="${safeValue}"`);
  } else {
    newOpenTag = openTag + ` ${attr}="${safeValue}"`;
  }

  return html.slice(0, match.index!) + newOpenTag + ">" + html.slice(tagEnd);
}

function setNodeAttr(node: any, name: string, value: string): void {
  if (!node.attrs) node.attrs = [];
  const existing = node.attrs.find((a: any) => a.name === name);
  if (existing) {
    existing.value = value;
  } else {
    node.attrs.push({ name, value });
  }
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

    const sel: ParsedSelector = { classes: [] };

    const tagMatch = token.match(/^([a-zA-Z0-9-]+)/);
    if (tagMatch) sel.tag = tagMatch[1];

    const idMatch = token.match(/#([a-zA-Z0-9_-]+)/);
    if (idMatch) sel.id = idMatch[1];

    const classMatches = token.match(/\.([a-zA-Z0-9_-]+)/g);
    if (classMatches) sel.classes = classMatches.map(c => c.slice(1));

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
  return true;
}

function getAttr(el: any, name: string): string | undefined {
  if (!el.attrs) return undefined;
  const attr = el.attrs.find((a: any) => a.name === name);
  return attr?.value;
}
