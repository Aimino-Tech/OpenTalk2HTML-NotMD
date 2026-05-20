import { getAttr } from "./entity-store.js";

export interface SelectorPart {
  tag?: string;
  id?: string;
  classes: string[];
  attrs: Array<{ name: string; value?: string }>;
}

export function parseSelectorPart(part: string): SelectorPart {
  const result: SelectorPart = { classes: [], attrs: [] };

  const tagMatch = part.match(/^([a-zA-Z0-9_-]+)/);
  if (tagMatch) result.tag = tagMatch[1].toLowerCase();

  const idMatch = part.match(/#([a-zA-Z0-9_-]+)/);
  if (idMatch) result.id = idMatch[1];

  const classMatches = part.match(/\.([a-zA-Z0-9_-]+)/g);
  if (classMatches) {
    result.classes = classMatches.map((c) => c.slice(1));
  }

  const attrRegex = /\[([a-zA-Z0-9_-]+)(?:=('|")(.*?)\2)?\]/g;
  let attrMatch;
  while ((attrMatch = attrRegex.exec(part)) !== null) {
    result.attrs.push({ name: attrMatch[1], value: attrMatch[3] });
  }

  return result;
}

export function matchesSelectorPart(el: any, part: SelectorPart): boolean {
  if (part.tag && el.tagName !== part.tag) return false;
  if (part.id) {
    const elId = getAttr(el, "id");
    if (elId !== part.id) return false;
  }
  if (part.classes.length > 0) {
    const elClass = (getAttr(el, "class") || "").split(/\s+/);
    for (const cls of part.classes) {
      if (!elClass.includes(cls)) return false;
    }
  }
  for (const attr of part.attrs) {
    const elAttr = getAttr(el, attr.name);
    if (elAttr === undefined) return false;
    if (attr.value !== undefined && elAttr !== attr.value) return false;
  }
  return true;
}

export function findElementBySelector(node: any, selector: string): any | null {
  const parts = selector.split(/\s+/).filter(Boolean);
  const parsed = parts.map(parseSelectorPart);

  if (parsed.length === 0) return null;

  if (parsed.length === 1) {
    return findFirstMatch(node, parsed[0]);
  }

  const lastPart = parsed[parsed.length - 1];
  const ancestors = parsed.slice(0, -1);

  const candidates: any[] = [];
  collectAllMatching(node, lastPart, candidates);

  for (const candidate of candidates) {
    if (hasAncestors(candidate, ancestors)) {
      return candidate;
    }
  }

  return null;
}

function findFirstMatch(node: any, part: SelectorPart): any | null {
  if (matchesSelectorPart(node, part)) return node;
  if (node.childNodes) {
    for (const child of node.childNodes) {
      const found = findFirstMatch(child, part);
      if (found) return found;
    }
  }
  return null;
}

function collectAllMatching(node: any, part: SelectorPart, results: any[]): void {
  if (matchesSelectorPart(node, part)) results.push(node);
  if (node.childNodes) {
    for (const child of node.childNodes) {
      collectAllMatching(child, part, results);
    }
  }
}

function hasAncestors(el: any, ancestors: SelectorPart[], index: number = ancestors.length - 1): boolean {
  if (index < 0) return true;
  const part = ancestors[index];

  let cur = el.parentNode;
  while (cur) {
    if (matchesSelectorPart(cur, part)) {
      return hasAncestors(cur, ancestors, index - 1);
    }
    cur = cur.parentNode;
  }
  return false;
}
