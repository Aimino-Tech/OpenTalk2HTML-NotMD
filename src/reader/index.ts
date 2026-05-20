import { readFile } from "../writer.js";
import { extractStructure, structureToMarkdown } from "./structure.js";
import { extractContent } from "./content.js";
import { compressHtml } from "./compressor.js";
import { extractText } from "./text.js";
import type { ReadHtmlInput } from "../types.js";

export interface ReadResult {
  mode: string;
  data: unknown;
}

export function readHtml(input: ReadHtmlInput): ReadResult {
  const html = readFile(input.file_path);

  switch (input.mode) {
    case "structure": {
      const structure = extractStructure(html);
      return { mode: "structure", data: structureToMarkdown(structure) };
    }
    case "content": {
      const blocks = extractContent(html);
      return { mode: "content", data: blocks.map((b) => `[${b.type}${b.level ? " h" + b.level : ""}] ${b.text}`) };
    }
    case "compressed": {
      const compressed = compressHtml(html);
      return { mode: "compressed", data: compressed };
    }
    case "text": {
      const text = extractText(html, input.offset ?? 0, input.limit ?? 4000);
      return { mode: "text", data: text };
    }
    default: {
      return { mode: "structure", data: extractStructure(html) };
    }
  }
}
