export function splitIntoChunks(html: string): string[] {
  const chunks: string[] = [];

  const hasHeadTag = /<head[^>]*>/i.test(html);
  const hasBodyTag = /<body[^>]*>/i.test(html);

  if (hasHeadTag && hasBodyTag) {
    const headMatch = html.match(/^[\s\S]*?<\/head>/i);
    if (headMatch) {
      chunks.push(headMatch[0].trim());
      let rest = html.slice(headMatch[0].length);

      const bodyMatch = rest.match(/<body[^>]*>/i);
      if (bodyMatch) {
        chunks.push(bodyMatch[0].trim());
        const afterBodyOpen = rest.slice((bodyMatch.index || 0) + bodyMatch[0].length);
        rest = afterBodyOpen;
      }

      const bodyCloseMatch = rest.match(/<\/body>/i);
      if (bodyCloseMatch) {
        const bodyContent = rest.slice(0, bodyCloseMatch.index);
        const bodyChunks = splitTopLevel(bodyContent);
        chunks.push(...bodyChunks);

        const tail = rest.slice(bodyCloseMatch.index);
        if (tail.trim()) chunks.push(tail.trim());
      } else {
        const bodyChunks = splitTopLevel(rest);
        chunks.push(...bodyChunks);
      }

      return chunks.filter((c) => c.trim().length > 0);
    }
  }

  const titleMatch = html.match(/<title>[\s\S]*?<\/title>/i);
  if (titleMatch && titleMatch.index !== undefined && titleMatch.index > 0) {
    chunks.push(html.slice(0, titleMatch.index + titleMatch[0].length).trim());
    let rest = html.slice(titleMatch.index + titleMatch[0].length);
    const restChunks = splitTopLevel(rest);
    chunks.push(...restChunks);
    return chunks.filter((c) => c.trim().length > 0);
  }

  const topLevelChunks = splitTopLevel(html);
  if (topLevelChunks.length > 1) {
    return topLevelChunks;
  }

  if (html.length > 500) {
    const tagBreaks = findTagBreakPoints(html, 3);
    if (tagBreaks.length > 1) {
      let start = 0;
      for (const breakPoint of tagBreaks) {
        chunks.push(html.slice(start, breakPoint).trim());
        start = breakPoint;
      }
      const tail = html.slice(start).trim();
      if (tail) chunks.push(tail);
      return chunks.filter((c) => c.trim().length > 0);
    }
  }

  return [html];
}

function splitTopLevel(html: string): string[] {
  const chunks: string[] = [];
  const tagRegex = /<\/?([a-z][a-z0-9]*)[^>]*>/gi;
  let lastEnd = 0;
  let match: RegExpExecArray | null;
  const openTags: string[] = [];
  let chunkStart = 0;
  let tagIndex = 0;

  while ((match = tagRegex.exec(html)) !== null) {
    const fullTag = match[0];
    const tagName = match[1].toLowerCase();
    const isClosing = fullTag.startsWith("</");
    const selfClosing = ["br", "hr", "img", "input", "meta", "link", "area", "base", "col", "embed", "source", "track", "wbr"];
    const isSelfClosing = fullTag.endsWith("/>") || selfClosing.includes(tagName);

    if (!isClosing && !isSelfClosing) {
      openTags.push(tagName);
      tagIndex++;
    } else if (isClosing && openTags.length > 0 && openTags[openTags.length - 1] === tagName) {
      openTags.pop();
      tagIndex--;
    }

    if (openTags.length === 0 && tagIndex === 0 && !isSelfClosing && !isClosing) {
      if (match.index > chunkStart) {
        const preText = html.slice(chunkStart, match.index).trim();
        if (preText) chunks.push(preText);
      }
      chunkStart = match.index;
    }

    if (openTags.length === 0 && tagIndex === 0 && (isClosing || isSelfClosing)) {
      const chunkContent = html.slice(chunkStart, match.index + fullTag.length).trim();
      if (chunkContent) chunks.push(chunkContent);
      chunkStart = match.index + fullTag.length;
    }
  }

  const remaining = html.slice(chunkStart).trim();
  if (remaining) chunks.push(remaining);

  return chunks;
}

function findTagBreakPoints(html: string, minChunks: number): number[] {
  const breaks: number[] = [];
  const chunkSize = Math.floor(html.length / minChunks);

  for (let i = 1; i < minChunks; i++) {
    const targetPos = i * chunkSize;
    const searchStart = Math.max(0, targetPos - 50);
    const searchEnd = Math.min(html.length, targetPos + 50);
    const searchArea = html.slice(searchStart, searchEnd);

    const tagCloseMatch = searchArea.match(/>/g);
    if (tagCloseMatch) {
      const lastClose = searchArea.lastIndexOf(">");
      if (lastClose >= 0) {
        breaks.push(searchStart + lastClose + 1);
      }
    }
  }

  return breaks;
}
