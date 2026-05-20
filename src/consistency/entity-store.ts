import type { EntityNode } from "./types.js";

export function findSectionId(node: any): string | null {
  let cur = node.parentNode;
  while (cur) {
    if (cur.tagName && getAttr(cur, "id")) {
      return getAttr(cur, "id") || null;
    }
    cur = cur.parentNode;
  }
  return null;
}

export function getAttr(el: any, name: string): string | undefined {
  if (!el.attrs) return undefined;
  const attr = el.attrs.find((a: any) => a.name === name);
  return attr?.value;
}

export function getTextContent(element: any): string {
  if (element.childNodes) {
    for (const child of element.childNodes) {
      if (child.nodeName === "#text") {
        return child.value || "";
      }
    }
  }
  return "";
}

export function setTextContent(element: any, value: string): void {
  if (element.childNodes) {
    for (const child of element.childNodes) {
      if (child.nodeName === "#text") {
        child.value = value;
        return;
      }
    }
  }
}

export function extractEntities(node: any, entities: EntityNode[] = []): EntityNode[] {
  if (node.tagName) {
    const entityAttr = getAttr(node, "data-entity");
    if (entityAttr) {
      entities.push({
        id: entityAttr,
        value: getTextContent(node),
        sectionId: findSectionId(node),
      });
    }
  }
  if (node.childNodes) {
    for (const child of node.childNodes) {
      extractEntities(child, entities);
    }
  }
  return entities;
}

export function findEntityElement(node: any, entityId: string): any | null {
  if (node.tagName) {
    const e = getAttr(node, "data-entity");
    if (e === entityId) return node;
  }
  if (node.childNodes) {
    for (const child of node.childNodes) {
      const found = findEntityElement(child, entityId);
      if (found) return found;
    }
  }
  return null;
}

export function getNumericValue(value: string): number | null {
  const num = parseFloat(value);
  return isNaN(num) ? null : num;
}

export function findEffectiveEntityElement(node: any): any {
  const entityAttr = getAttr(node, "data-entity");
  if (entityAttr) return node;

  const text = getTextContent(node);
  if (text.trim()) return node;

  if (node.childNodes) {
    for (const child of node.childNodes) {
      if (child.tagName) {
        const result = findEffectiveEntityElement(child);
        if (result) return result;
      }
    }
  }
  return null;
}
