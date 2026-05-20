import * as parse5 from "parse5";

export interface TextResult {
  /** Extracted plain text (newline-separated, HTML-free) */
  text: string;
  /** Total plain text chars in the document */
  total_chars: number;
  /** Character offset used for this read */
  offset: number;
  /** Chars returned in this read */
  returned_chars: number;
  /** Whether more text is available beyond this slice */
  has_more: boolean;
  /** Offset to use for the next read (0 if done) */
  next_offset: number;
  /** Estimated tokens (~4 chars/token) */
  token_estimate: number;
}

const BLOCK_TAGS = new Set([
  "p", "div", "h1", "h2", "h3", "h4", "h5", "h6",
  "li", "tr", "td", "th", "br", "hr",
  "blockquote", "pre", "section", "article",
  "header", "footer", "nav", "main", "aside",
]);

/**
 * Extract plain text from HTML, stripped of all tags, with
 * offset/limit for progressive reading (Cursor/OpenCode-style pagination).
 *
 * Returns only text content — no HTML structure, no attributes, no metadata.
 * This is the most token-efficient read mode (typically 70-90% fewer tokens
 * than full HTML).
 */
export function extractText(
  html: string,
  offset = 0,
  limit = 4000
): TextResult {
  const document = parse5.parse(html);
  const htmlNode = findChild(document as never, "html");
  const body = htmlNode ? findChild(htmlNode, "body") : document;

  const allText = collectText(body || document);
  const total = allText.length;

  const safeOffset = Math.max(0, Math.min(offset, total));
  const sliced = allText.slice(safeOffset, safeOffset + limit);
  const hasMore = safeOffset + limit < total;

  return {
    text: sliced,
    total_chars: total,
    offset: safeOffset,
    returned_chars: sliced.length,
    has_more: hasMore,
    next_offset: hasMore ? safeOffset + limit : 0,
    token_estimate: Math.ceil(sliced.length / 4),
  };
}

function collectText(node: any): string {
  const parts: string[] = [];
  walkText(node, parts);

  // Collapse 3+ consecutive newlines down to 2 (keeps paragraph separation)
  const joined = parts.join("").replace(/\n{3,}/g, "\n\n").trim();
  return joined;
}

function walkText(node: any, parts: string[]): void {
  if (!node.childNodes) return;

  for (const child of node.childNodes) {
    if (child.nodeName === "#comment") continue;

    if (child.nodeName === "#text") {
      const text = (child.value || "").replace(/\s+/g, " ");
      if (text.trim()) {
        parts.push(text);
      }
      continue;
    }

    if (!child.tagName) continue;

    const tag = child.tagName.toLowerCase();

    if (tag === "script" || tag === "style" || tag === "noscript") continue;

    if (BLOCK_TAGS.has(tag)) {
      ensureNewline(parts);
      if (child.childNodes) {
        walkText(child, parts);
      }
      ensureNewline(parts);
    } else {
      if (child.childNodes) {
        walkText(child, parts);
      }
    }
  }
}

function ensureNewline(parts: string[]): void {
  const last = parts[parts.length - 1];
  if (last === undefined || last === "" || (last.length > 0 && !last.endsWith("\n"))) {
    parts.push("\n");
  }
}

function findChild(node: any, tagName: string): any | undefined {
  if (!node.childNodes) return undefined;
  return node.childNodes.find(
    (c: any) => c.tagName && c.tagName.toLowerCase() === tagName
  );
}
