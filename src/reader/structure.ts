import * as parse5 from "parse5";

export interface StructureNode {
  tag: string;
  id?: string;
  classes?: string[];
  children: StructureNode[];
  textLength: number;
  depth: number;
}

export function extractStructure(html: string): StructureNode {
  const document = parse5.parse(html);
  const htmlNode = findChild(document as never, "html");
  const body = htmlNode ? findChild(htmlNode, "body") : document;
  return buildTree(body || document, 0);
}

function buildTree(el: any, depth: number): StructureNode {
  const node: StructureNode = {
    tag: (el.tagName || "#root").toLowerCase(),
    children: [],
    textLength: getTextContent(el).trim().length,
    depth,
  };
  const id = getAttr(el, "id");
  if (id) node.id = id;
  const cls = getAttr(el, "class");
  if (cls) node.classes = cls.split(/\s+/).filter(Boolean);

  if (el.childNodes) {
    for (const child of el.childNodes) {
      if (child.tagName && child.tagName !== "#text" && child.tagName !== "#comment") {
        node.children.push(buildTree(child, depth + 1));
      }
    }
  }
  return node;
}

function findChild(node: any, tagName: string): any | undefined {
  if (!node.childNodes) return undefined;
  return node.childNodes.find((c: any) => c.tagName && c.tagName.toLowerCase() === tagName);
}

function getAttr(el: any, name: string): string | undefined {
  if (!el.attrs) return undefined;
  const attr = el.attrs.find((a: any) => a.name === name);
  return attr?.value;
}

function getTextContent(node: any): string {
  if (!node.childNodes) return "";
  let text = "";
  for (const child of node.childNodes) {
    if (child.nodeName === "#text") {
      text += child.value || "";
    } else if (child.childNodes) {
      text += getTextContent(child);
    }
  }
  return text;
}

export function structureToMarkdown(node: StructureNode, maxDepth = 6): string {
  const lines: string[] = [];
  function walk(n: StructureNode, prefix: string) {
    if (n.depth > maxDepth) return;
    const label = n.tag + (n.id ? `#${n.id}` : "") + (n.classes?.length ? `.${n.classes.join(".")}` : "");
    const sizeSuffix = n.textLength > 0 ? ` [${n.textLength} chars]` : "";
    lines.push(`${prefix} <${label}>${sizeSuffix}`);
    for (const c of n.children) {
      walk(c, prefix + "  ");
    }
  }
  walk(node, "");
  return lines.join("\n");
}
