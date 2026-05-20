import * as parse5 from "parse5";
import { renderComponent, collectComponentCss, collectComponentJs } from "./components/index.js";
import { getTemplateInfo } from "./templates/registry.js";
import { formatOrCompress, formatHtml } from "./formatter.js";
import { sanitizeHtml } from "./validator.js";
import { atomicWrite } from "./writer.js";
import { splitIntoChunks } from "./compressor/stream.js";
import type { RenderPageInput, EntityAnnotation, CompressionStats } from "./types.js";

export interface BuildResult {
  filePath: string;
  size: number;
  assemblyTimeMs: number;
  stats?: CompressionStats;
  chunks?: string[];
}

export async function buildPage(input: RenderPageInput): Promise<BuildResult> {
  const start = performance.now();

  const template = getTemplateInfo(input.template);
  const options = { ...(input.options || {}) };

  const contentParts: string[] = [];
  if (options.inject_css || input.sections.length > 0) {
    const componentCss = collectComponentCss(input.sections);
    if (componentCss) {
      options.inject_css = (options.inject_css || "") + "\n" + componentCss;
    }
  }

  for (let i = 0; i < input.sections.length; i++) {
    const section = input.sections[i];
    const rendered = renderComponent(section);
    const safe = sanitizeHtml(rendered);
    contentParts.push(`<!-- fm:section:${i}:${section.component} -->\n${safe}\n<!-- /fm:section:${i}:${section.component} -->`);
  }

  const bodyContent = contentParts.join("\n");
  const componentJs = collectComponentJs(input.sections);
  if (componentJs) {
    options.inject_js = (options.inject_js || "") + "\n" + componentJs;
  }

  let html = template.render(bodyContent, options);

  if (input.entity_annotations && input.entity_annotations.length > 0) {
    html = injectEntityAttributes(html, input.entity_annotations);
  }

  const compression = options.compression;
  const maxTokens = input.budget?.max_tokens;
  let stats: CompressionStats | undefined;

  if (compression && compression !== "none") {
    const result = await formatOrCompress(html, compression, maxTokens);
    html = result.html;
    stats = result.stats;
  } else if (!options.skip_format) {
    html = formatHtml(html);
  }

  if (options.mode === "stream") {
    const chunks = splitIntoChunks(html);
    const elapsed = performance.now() - start;
    return {
      filePath: input.output_path,
      size: Buffer.byteLength(html, "utf-8"),
      assemblyTimeMs: Math.round(elapsed * 100) / 100,
      stats,
      chunks,
    };
  }

  atomicWrite(input.output_path, html);

  const elapsed = performance.now() - start;
  return {
    filePath: input.output_path,
    size: Buffer.byteLength(html, "utf-8"),
    assemblyTimeMs: Math.round(elapsed * 100) / 100,
    stats,
  };
}

function getAttr(el: any, name: string): string | undefined {
  if (!el.attrs) return undefined;
  const attr = el.attrs.find((a: any) => a.name === name);
  return attr?.value;
}

function setAttr(el: any, name: string, value: string): void {
  if (!el.attrs) return;
  const existing = el.attrs.find((a: any) => a.name === name);
  if (existing) {
    existing.value = value;
  } else {
    el.attrs.push({ name, value });
  }
}

function matchesSimpleSelector(el: any, part: string): boolean {
  const tagMatch = part.match(/^([a-zA-Z0-9_-]+)/);
  const idMatch = part.match(/#([a-zA-Z0-9_-]+)/);
  const classMatches = part.match(/\.([a-zA-Z0-9_-]+)/g);
  const attrRegex = /\[([a-zA-Z0-9_-]+)(?:=('|")(.*?)\2)?\]/g;

  if (tagMatch && el.tagName !== tagMatch[1].toLowerCase()) return false;
  if (idMatch) {
    const elId = getAttr(el, "id");
    if (elId !== idMatch[1]) return false;
  }
  if (classMatches) {
    const classes = (getAttr(el, "class") || "").split(/\s+/);
    for (const cls of classMatches) {
      if (!classes.includes(cls.slice(1))) return false;
    }
  }
  let attrMatch;
  const re = new RegExp(attrRegex.source, "g");
  while ((attrMatch = re.exec(part)) !== null) {
    const elAttr = getAttr(el, attrMatch[1]);
    if (elAttr === undefined) return false;
    if (attrMatch[3] !== undefined && elAttr !== attrMatch[3]) return false;
  }
  return true;
}

function findElementBySelector(node: any, selector: string): any | null {
  const parts = selector.split(/\s+/).filter(Boolean);
  if (parts.length === 0) return null;
  const lastPart = parts[parts.length - 1];
  const ancestors = parts.slice(0, -1);

  function collectAll(el: any, results: any[]): void {
    if (matchesSimpleSelector(el, lastPart)) results.push(el);
    if (el.childNodes) {
      for (const child of el.childNodes) collectAll(child, results);
    }
  }

  function hasAncestors(el: any, remaining: string[], idx: number = remaining.length - 1): boolean {
    if (idx < 0) return true;
    let cur = el.parentNode;
    while (cur) {
      if (matchesSimpleSelector(cur, remaining[idx])) {
        return hasAncestors(cur, remaining, idx - 1);
      }
      cur = cur.parentNode;
    }
    return false;
  }

  const candidates: any[] = [];
  collectAll(node, candidates);

  if (ancestors.length === 0) return candidates[0] || null;

  for (const c of candidates) {
    if (hasAncestors(c, ancestors)) return c;
  }
  return null;
}

function injectEntityAttributes(html: string, annotations: EntityAnnotation[]): string {
  const document = parse5.parse(html, { sourceCodeLocationInfo: true });

  for (const ann of annotations) {
    const el = findElementBySelector(document as never, ann.selector);
    if (el) {
      setAttr(el, "data-entity", ann.entity_id);
      if (ann.depends_on && ann.depends_on.length > 0) {
        setAttr(el, "data-depends-on", ann.depends_on.join(","));
      }
    }
  }

  return parse5.serialize(document as never);
}

export async function buildHtmlString(
  templateName: string,
  content: string,
  options?: Record<string, unknown>,
  compression?: "none" | "low" | "high" | "ai",
  maxTokens?: number,
  skipFormat?: boolean
): Promise<string> {
  const template = getTemplateInfo(templateName);
  const sanitized = sanitizeHtml(content);
  let html = template.render(sanitized, options as never);

  if (compression && compression !== "none") {
    const result = await formatOrCompress(html, compression, maxTokens);
    html = result.html;
  } else if (!skipFormat && !options?.skip_format) {
    html = formatHtml(html);
  }

  return html;
}
