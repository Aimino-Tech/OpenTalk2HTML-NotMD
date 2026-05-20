import * as parse5 from "parse5";
import { extractStructure, structureToMarkdown } from "./structure.js";
import { extractContent } from "./content.js";

export interface CompressedReadout {
  title: string;
  outline: string;
  stats: {
    totalChars: number;
    tagCount: number;
    headingCount: number;
    linkCount: number;
    imageCount: number;
  };
  bodyPreview: string;
}

function findChild(node: any, tagName: string): any | undefined {
  if (!node.childNodes) return undefined;
  return node.childNodes.find((c: any) => c.tagName && c.tagName.toLowerCase() === tagName);
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

function countTags(node: any): number {
  let count = 0;
  if (node.tagName && node.tagName !== "#text" && node.tagName !== "#comment" && node.tagName !== "#document") count++;
  if (node.childNodes) {
    for (const child of node.childNodes) {
      count += countTags(child);
    }
  }
  return count;
}

function countTagsByAttr(node: any, tag: string): number {
  let count = 0;
  if (node.tagName && node.tagName.toLowerCase() === tag) count++;
  if (node.childNodes) {
    for (const child of node.childNodes) {
      count += countTagsByAttr(child, tag);
    }
  }
  return count;
}

export function compressHtml(html: string, maxPreviewChars = 2000): CompressedReadout {
  const document = parse5.parse(html);
  const htmlNode = findChild(document as never, "html");
  const head = htmlNode ? findChild(htmlNode, "head") : undefined;
  const body = htmlNode ? findChild(htmlNode, "body") : document;

  let title = "Untitled";
  if (head) {
    const titleNode = findChild(head, "title");
    if (titleNode) {
      const t = getTextContent(titleNode).trim();
      if (t) title = t;
    }
  }
  if (title === "Untitled") {
    const h1 = findFirstTag(body, "h1");
    if (h1) {
      const t = getTextContent(h1).trim();
      if (t) title = t;
    }
  }

  const outline = structureToMarkdown(extractStructure(html), 4);
  const content = extractContent(html);

  const stats = {
    totalChars: html.length,
    tagCount: countTags(body || document),
    headingCount: content.filter((b) => b.type === "heading").length,
    linkCount: countTagsByAttr(body || document, "a"),
    imageCount: countTagsByAttr(body || document, "img"),
  };

  const bodyText = getTextContent(body || document);
  const bodyPreview = bodyText.slice(0, maxPreviewChars);

  return { title, outline, stats, bodyPreview };
}

function findFirstTag(node: any, tagName: string): any | undefined {
  if (node.tagName && node.tagName.toLowerCase() === tagName) return node;
  if (!node.childNodes) return undefined;
  for (const child of node.childNodes) {
    const found = findFirstTag(child, tagName);
    if (found) return found;
  }
  return undefined;
}
