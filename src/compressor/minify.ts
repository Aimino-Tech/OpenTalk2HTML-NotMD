import { minify } from "html-minifier-terser";
import { estimateTokens, enforceBudget } from "./tokens.js";
import type { CompressionLevel, CompressionStats } from "../types.js";

export interface MinifyOptions {
  level: CompressionLevel;
  maxTokens?: number;
}

const COMPRESSION_PRESETS: Record<CompressionLevel, Record<string, boolean>> = {
  none: {},
  low: {
    removeComments: true,
    collapseWhitespace: false,
    removeEmptyAttributes: true,
  },
  high: {
    removeComments: true,
    collapseWhitespace: true,
    collapseBooleanAttributes: true,
    removeEmptyAttributes: true,
    removeScriptTypeAttributes: true,
    removeStyleLinkTypeAttributes: true,
    minifyCSS: true,
    minifyJS: true,
    removeOptionalTags: true,
    removeRedundantAttributes: true,
    useShortDoctype: true,
  },
  ai: {
    removeComments: true,
    collapseWhitespace: true,
    collapseBooleanAttributes: true,
    removeEmptyAttributes: true,
    removeScriptTypeAttributes: true,
    removeStyleLinkTypeAttributes: true,
    minifyCSS: true,
    minifyJS: true,
    removeOptionalTags: true,
    removeRedundantAttributes: true,
    useShortDoctype: true,
  },
};

export async function compressHtml(
  html: string,
  options: MinifyOptions
): Promise<{ html: string; stats: CompressionStats }> {
  const originalChars = html.length;
  const originalTokens = estimateTokens(html);

  let compressed: string;

  if (options.level === "none") {
    compressed = html;
  } else {
    compressed = await minify(html, COMPRESSION_PRESETS[options.level]);
  }

  if (options.maxTokens) {
    compressed = enforceBudget(compressed, options.maxTokens);
  }

  const compressedChars = compressed.length;
  const estimatedTokens = estimateTokens(compressed);
  const compressionRatio = originalChars > 0
    ? Math.round(((originalChars - compressedChars) / originalChars) * 1000) / 10
    : 0;

  return {
    html: compressed,
    stats: {
      original_chars: originalChars,
      compressed_chars: compressedChars,
      compression_ratio: compressionRatio,
      estimated_tokens: estimatedTokens,
      original_tokens: originalTokens,
    },
  };
}
