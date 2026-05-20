import * as parse5 from "parse5";

export interface ContentBlock {
  type: "heading" | "paragraph" | "code" | "list" | "table" | "image" | "divider";
  text: string;
  level?: number;
}

export function extractContent(html: string): ContentBlock[] {
  const document = parse5.parse(html);
  const htmlNode = findChild(document as never, "html");
  const body = htmlNode ? findChild(htmlNode, "body") : document;
  const blocks: ContentBlock[] = [];
  walkForContent(body || document, blocks);
  return blocks;
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

function walkForContent(node: any, blocks: ContentBlock[]): void {
  if (!node.childNodes) return;
  for (const child of node.childNodes) {
    if (!child.tagName || child.tagName === "#text" || child.tagName === "#comment") continue;
    const tag = child.tagName.toLowerCase();

    if (/^h[1-6]$/.test(tag)) {
      blocks.push({ type: "heading", text: getTextContent(child).trim(), level: parseInt(tag[1]) });
    } else if (tag === "p") {
      const text = getTextContent(child).trim();
      if (text) blocks.push({ type: "paragraph", text });
    } else if (tag === "pre" || tag === "code") {
      blocks.push({ type: "code", text: getTextContent(child).trim() });
    } else if (["ul", "ol"].includes(tag)) {
      blocks.push({ type: "list", text: getTextContent(child).trim() });
    } else if (tag === "table") {
      blocks.push({ type: "table", text: getTextContent(child).trim() });
    } else if (tag === "img") {
      blocks.push({ type: "image", text: getAttr(child, "src") || "" });
    } else if (tag === "hr") {
      blocks.push({ type: "divider", text: "" });
    } else {
      walkForContent(child, blocks);
    }
  }
}
