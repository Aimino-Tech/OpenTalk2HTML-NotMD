import { getTemplateInfo } from "../templates/registry.js";
import { formatOrCompress, formatHtml } from "../formatter.js";
import { compressHtml } from "../compressor/minify.js";
import { sanitizeHtml } from "../validator.js";
import { unlinkSync } from "node:fs";
import { atomicWrite, readFile } from "../writer.js";
import { saveManifest, extractEntityValuesFromHtmlString } from "../consistency/manifest.js";
import { splitIntoChunks } from "../compressor/stream.js";
import { buildPage } from "../builder.js";
import type { WriteRawHtmlInput, WriteHtmlFileInput, FormatHtmlInput, PreviewHtmlInput, CompressionStats } from "../types.js";

function getContent(input: WriteRawHtmlInput | PreviewHtmlInput): string {
  return (input as any).html || input.content || "";
}

async function processHtml(
  input: WriteRawHtmlInput | PreviewHtmlInput,
): Promise<{ html: string; stats?: CompressionStats; originalContent: string }> {
  const content = getContent(input);
  const sanitized = sanitizeHtml(content);
  let html = input.template
    ? getTemplateInfo(input.template).render(sanitized, input.options || {})
    : sanitized;

  const compression = input.options?.compression;
  const maxTokens = input.budget?.max_tokens;

  if (compression && compression !== "none") {
    const result = await formatOrCompress(html, compression, maxTokens);
    if (result.stats) {
      result.stats.original_chars = content.length;
      const newRatio = content.length > 0
        ? Math.round(((content.length - result.html.length) / content.length) * 1000) / 10
        : 0;
      result.stats.compression_ratio = newRatio;
      result.stats.original_tokens = Math.ceil(content.length / 3.5);
    }
    return { html: result.html, stats: result.stats, originalContent: content };
  }

  if (input.options?.skip_format) {
    return { html, originalContent: content };
  }

  html = formatHtml(html);
  return { html, originalContent: content };
}

export async function writeRawHtml(input: WriteRawHtmlInput): Promise<{
  filePath?: string;
  size?: number;
  html?: string;
  stats?: CompressionStats;
  chunks?: string[];
}> {
  const { html, stats } = await processHtml(input);

  if (input.options?.mode === "stream") {
    const chunks = splitIntoChunks(html);
    return { chunks, stats };
  }

  const size = Buffer.byteLength(html, "utf-8");
  atomicWrite(input.output_path, html);

  const entityValues = extractEntityValuesFromHtmlString(html);
  if (Object.keys(entityValues).length > 0) {
    saveManifest(input.output_path, { entity_values: entityValues });
  }

  return {
    filePath: input.output_path,
    size,
    html,
    stats,
  };
}

export async function writeHtmlFile(input: WriteHtmlFileInput): Promise<ReturnType<typeof writeRawHtml>> {
  return writeRawHtml(input as WriteRawHtmlInput);
}

export async function formatHtmlFile(input: FormatHtmlInput): Promise<{
  filePath: string;
  size: number;
  stats?: CompressionStats;
}> {
  const content = readFile(input.file_path);

  if (input.options?.compression && input.options.compression !== "none") {
    const result = await compressHtml(content, {
      level: input.options.compression,
      maxTokens: input.options.max_tokens,
    });
    atomicWrite(input.file_path, result.html);
    return {
      filePath: input.file_path,
      size: Buffer.byteLength(result.html, "utf-8"),
      stats: result.stats,
    };
  }

  const formatted = formatHtml(content);
  atomicWrite(input.file_path, formatted);
  return { filePath: input.file_path, size: Buffer.byteLength(formatted, "utf-8") };
}

export async function previewHtml(input: PreviewHtmlInput): Promise<{
  html: string;
  size: number;
  stats?: CompressionStats;
  chunks?: string[];
}> {
  if (input.sections && input.sections.length > 0) {
    const tmpPath = `/tmp/preview-${Date.now()}.html`;
    const result = await buildPage({
      template: input.template || "minimal",
      sections: input.sections,
      output_path: tmpPath,
      options: input.options,
      budget: input.budget,
    });
    const content = readFile(tmpPath);
    try { unlinkSync(tmpPath); } catch { }
    const size = Buffer.byteLength(content, "utf-8");
    return { html: content, size, stats: result.stats };
  }

  const { html, stats } = await processHtml(input);

  if (input.options?.mode === "stream") {
    const chunks = splitIntoChunks(html);
    return { html, size: Buffer.byteLength(html, "utf-8"), chunks, stats };
  }

  return { html, size: Buffer.byteLength(html, "utf-8"), stats };
}
