import doT from "dot";
import type { PageOptions, TemplateDef } from "../types.js";
import { extractNav } from "./nav.js";

const BUILTIN_TEMPLATE_NAMES = [
  "report", "exploration", "deck", "code-review", "design",
  "prototyping", "illustrations", "research", "custom-editor", "minimal",
  "documentation",
  "invoice", "data-sheet", "pitch-deck", "dashboard", "newsletter",
  "changelog", "faq", "api-doc", "landing-page", "budget",
  "meeting-notes", "comparison", "financial-summary", "error-page",
];

type DotRenderFn = (...args: unknown[]) => string;

interface CustomTemplateEntry {
  name: string;
  description: string;
  category: string;
  html_template: string;
  css?: string;
  compiledFn: DotRenderFn;
}

const customTemplates = new Map<string, CustomTemplateEntry>();

export function registerCustomTemplate(name: string, description: string, category: string, htmlTemplate: string, css?: string): void {
  if (customTemplates.has(name)) {
    throw new Error(`Custom template "${name}" is already registered`);
  }
  if (BUILTIN_TEMPLATE_NAMES.includes(name)) {
    throw new Error(`Cannot register custom template "${name}": name conflicts with a built-in template`);
  }
  const compiledFn = doT.template(htmlTemplate);
  customTemplates.set(name, { name, description, category, html_template: htmlTemplate, css, compiledFn });
}

export function getCustomTemplateNames(category?: string): string[] {
  if (category) {
    return Array.from(customTemplates.values()).filter((e) => e.category === category).map((e) => e.name);
  }
  return Array.from(customTemplates.keys());
}

export function getCustomTemplateInfo(name: string): TemplateDef | undefined {
  const entry = customTemplates.get(name);
  if (!entry) return undefined;
  return {
    name: entry.name,
    description: entry.description,
    category: entry.category,
    builtin_css: entry.css || "",
    render: (content: string, options: PageOptions) => {
      const nav = extractNav(content);
      return entry.compiledFn({
        content,
        nav,
        title: options.title || "Document",
        theme: options.theme || "light",
        css_vars: options.css_vars || {},
        inject_css: options.inject_css || "",
        inject_js: options.inject_js || "",
        line_width: options.line_width || 900,
        custom_css: "",
      });
    },
  };
}

export function getAllCustomTemplates(category?: string): TemplateDef[] {
  const names = category
    ? Array.from(customTemplates.values()).filter((e) => e.category === category).map((e) => e.name)
    : Array.from(customTemplates.keys());
  return names.map((name) => getCustomTemplateInfo(name)!).filter(Boolean);
}
