import jsBeautify from "js-beautify";
import { compressHtml } from "./compressor/minify.js";
import type { CompressionLevel, CompressionStats } from "./types.js";

const beautifyHtml = jsBeautify.html;

export function formatHtml(raw: string, indentSize = 2): string {
  return beautifyHtml(raw, {
    indent_size: indentSize,
    indent_char: " ",
    wrap_line_length: 100,
    unformatted: ["code", "pre"],
    extra_liners: [],
    preserve_newlines: true,
    max_preserve_newlines: 2,
  });
}

export async function formatOrCompress(
  raw: string,
  compression?: CompressionLevel,
  maxTokens?: number
): Promise<{ html: string; stats?: CompressionStats }> {
  if (!compression || compression === "none") {
    return { html: formatHtml(raw) };
  }

  return compressHtml(raw, { level: compression, maxTokens });
}
