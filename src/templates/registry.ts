import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import doT from "dot";
import type { PageOptions, TemplateDef, TemplateSchemaDef } from "../types.js";
import { extractNav } from "./nav.js";
import { getCustomTemplateNames, getCustomTemplateInfo, getAllCustomTemplates, registerCustomTemplate } from "./custom.js";

type DotRenderFn = (...args: unknown[]) => string;

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const TEMPLATE_NAMES = [
  "report", "exploration", "deck", "code-review", "design",
  "prototyping", "illustrations", "research", "custom-editor", "minimal",
  "documentation",
  "invoice", "data-sheet", "pitch-deck", "dashboard", "newsletter",
  "changelog", "faq", "api-doc", "landing-page", "budget",
  "meeting-notes", "comparison", "financial-summary", "error-page",
  "equity-research", "lit-review", "research-briefing", "financial-dashboard",
  "scientific-paper", "journal-club", "earnings-summary", "industry-overview",
] as const;

export type TemplateName = (typeof TEMPLATE_NAMES)[number];

const compiledCache = new Map<string, DotRenderFn>();

function loadTemplate(name: string): DotRenderFn {
  const cached = compiledCache.get(name);
  if (cached) return cached;
  const filePath = join(__dirname, `${name}.dot`);
  const source = readFileSync(filePath, "utf-8");
  const fn = doT.template(source);
  compiledCache.set(name, fn);
  return fn;
}

export function precompileAllTemplates(): void {
  for (const name of TEMPLATE_NAMES) {
    try {
      loadTemplate(name);
    } catch {
      void 0;
    }
  }
}

export function getTemplateNames(category?: string): string[] {
  const builtin = category
    ? TEMPLATE_NAMES.filter((n) => TEMPLATE_METADATA[n]?.category === category)
    : [...TEMPLATE_NAMES];
  const custom = getCustomTemplateNames(category);
  return [...builtin, ...custom];
}

export function getAllTemplates(category?: string): TemplateDef[] {
  const builtin = category
    ? TEMPLATE_NAMES.filter((n) => TEMPLATE_METADATA[n]?.category === category).map((n) => getTemplateInfo(n))
    : TEMPLATE_NAMES.map((n) => getTemplateInfo(n));
  const custom = getAllCustomTemplates(category);
  return [...builtin, ...custom];
}

export function getTemplateSchema(name: string): TemplateSchemaDef {
  const custom = getCustomTemplateInfo(name);
  if (custom) {
    return {
      name: custom.name,
      description: custom.description,
      category: custom.category,
      subcategory: undefined,
      variables: {
        content: { type: "string", description: "HTML content to render inside the template" },
        title: { type: "string", default: "Document", description: "Page title" },
        theme: { type: "string", default: "light", description: "Theme (light or dark)" },
        line_width: { type: "number", default: 900, description: "Max content width in pixels" },
        inject_css: { type: "string", default: "", description: "Additional CSS to inject" },
        inject_js: { type: "string", default: "", description: "Additional JavaScript to inject" },
        css_vars: { type: "object", default: {}, description: "CSS variable overrides" },
      },
      preview: `<${name} custom template>`,
    };
  }
  const info = TEMPLATE_METADATA[name];
  if (!info) throw new Error(`Unknown template: ${name}`);
  return {
    name: info.name,
    description: info.description,
    category: info.category,
    subcategory: info.subcategory,
    variables: {
      content: { type: "string", description: "HTML content to render inside the template" },
      title: { type: "string", default: "Document", description: "Page title" },
      theme: { type: "string", default: info.category === "presentation" ? "dark" : "light", description: "Theme (light or dark)" },
      line_width: { type: "number", default: 900, description: "Max content width in pixels" },
      inject_css: { type: "string", default: "", description: "Additional CSS to inject" },
      inject_js: { type: "string", default: "", description: "Additional JavaScript to inject" },
      css_vars: { type: "object", default: {}, description: "CSS variable overrides" },
    },
    preview: `<${name} template>`,
  };
}

export type { NavItem } from "./nav.js";

function defaultThemeForCategory(category: string): "dark" | "light" {
  const lightCategories = ["business", "communication", "technical"];
  return lightCategories.includes(category) ? "light" : "dark";
}

export function getTemplateInfo(name: string): TemplateDef {
  const custom = getCustomTemplateInfo(name);
  if (custom) return custom;
  const info = TEMPLATE_METADATA[name];
  if (!info) throw new Error(`Unknown template: ${name}`);
  return {
    ...info,
    render: (content: string, options: PageOptions) => {
      const fn = loadTemplate(name);
      const nav = extractNav(content);
      return fn({
        content,
        nav,
        title: options.title || "Document",
        theme: options.theme || defaultThemeForCategory(info.category),
        css_vars: options.css_vars || {},
        inject_css: options.inject_css || "",
        inject_js: options.inject_js || "",
        line_width: options.line_width || 900,
        custom_css: "",
      });
    },
  };
}

const TEMPLATE_METADATA: Record<string, Omit<TemplateDef, "render">> = {
  report: {
    name: "report",
    description: "Professional document template with clear typography and structured layout",
    category: "report",
    builtin_css: "Professional styling with accent-colored headings and card-based sections",
  },
  exploration: {
    name: "exploration",
    description: "Interactive data narrative template with wide layout for visual content",
    category: "exploration",
    builtin_css: "Wide format with blue accent and card-based data presentation",
  },
  deck: {
    name: "deck",
    description: "Slide-style presentation template with full-viewport sections",
    category: "deck",
    builtin_css: "Full-screen slides with purple accent and vertical rhythm",
  },
  "code-review": {
    name: "code-review",
    description: "Code-focused template with monospace typography and diff-friendly styling",
    category: "code-review",
    builtin_css: "Green accent, monospace fonts, optimized for code diffs and reviews",
  },
  design: {
    name: "design",
    description: "Visual mockup showcase template with elevated cards",
    category: "design",
    builtin_css: "Pink accent, elevated cards, designed for visual portfolio presentations",
  },
  prototyping: {
    name: "prototyping",
    description: "Interactive component demo template with full-width layout",
    category: "prototyping",
    builtin_css: "Full-width layout with amber accent for interactive prototypes",
  },
  illustrations: {
    name: "illustrations",
    description: "SVG and diagram-heavy template with dark canvas background",
    category: "illustrations",
    builtin_css: "Dark canvas, SVG-friendly, blue accent with minimal chrome",
  },
  research: {
    name: "research",
    description: "Academic long-form template with serif-like reading experience",
    category: "research",
    builtin_css: "Narrow column (800px), yellow accent, large body text for comfortable reading",
  },
  "custom-editor": {
    name: "custom-editor",
    description: "Embedded interactive tools template with fixed toolbar support",
    category: "custom-editor",
    builtin_css: "Empty canvas with fixed toolbar slot, amber accent",
  },
  minimal: {
    name: "minimal",
    description: "Minimal shell with no theme or styling — just the content",
    category: "minimal",
    builtin_css: "System font, no theme, bare minimum structure",
  },
  documentation: {
    name: "documentation",
    description: "Professional documentation template with rich dark theme, sidebar navigation, and comprehensive styling for reference documents",
    category: "documentation",
    builtin_css: "Rich dark theme with amber accent, fixed sidebar nav with auto-generated heading links, grid background, glow effects, hero sections, card grids, code blocks, accordions, tabs, timelines, architecture diagrams, tables, tags, buttons, responsive layout, scroll-spy, and fade-in animations",
  },
  invoice: {
    name: "invoice",
    description: "Professional invoice with line items, totals, tax, and payment terms",
    category: "business",
    subcategory: "financial",
    builtin_css: "Light-themed, print-friendly, monospace amounts, address grid, totals section, payment terms box",
  },
  "data-sheet": {
    name: "data-sheet",
    description: "Spreadsheet-like grid with filters, sorting, and pagination",
    category: "business",
    subcategory: "data",
    builtin_css: "Light-themed, wide layout, sortable headers, filter controls, pagination bar, hover highlights",
  },
  "pitch-deck": {
    name: "pitch-deck",
    description: "Investor pitch deck with full-viewport slide sections, stats, features, and team grid",
    category: "presentation",
    subcategory: "slides",
    builtin_css: "Dark-themed full-screen slides with purple accent, slide navigation, progress bar, feature cards",
  },
  dashboard: {
    name: "dashboard",
    description: "KPI/metric dashboard with cards, charts, data tables, and filter bar",
    category: "business",
    subcategory: "analytics",
    builtin_css: "Light-themed, KPI row with change indicators, two-column chart+table layout, filter bar",
  },
  newsletter: {
    name: "newsletter",
    description: "Email-style newsletter with hero, articles, and social links footer",
    category: "communication",
    subcategory: "email",
    builtin_css: "Light-themed, centered narrow layout, hero section, article cards, social links, unsubscribe footer",
  },
  changelog: {
    name: "changelog",
    description: "Release notes with version history, features, fixes, and breaking changes",
    category: "communication",
    subcategory: "release",
    builtin_css: "Light-themed, version entries with date and badges, categorized change groups, RSS subscribe",
  },
  faq: {
    name: "faq",
    description: "Structured Q&A with category anchors and interactive expand/collapse",
    category: "communication",
    subcategory: "support",
    builtin_css: "Light-themed, category navigation pills, accordion-style Q&A items, anchor link targets",
  },
  "api-doc": {
    name: "api-doc",
    description: "API reference documentation with endpoint list, request/response schemas, and code examples",
    category: "technical",
    subcategory: "reference",
    builtin_css: "Light-themed, two-column sidebar+main layout, method color tags, param tables, dark code blocks",
  },
  "landing-page": {
    name: "landing-page",
    description: "Marketing landing page with hero CTA, features grid, testimonials, and pricing",
    category: "technical",
    subcategory: "marketing",
    builtin_css: "Light-themed, hero with CTA buttons, feature cards with hover lift, testimonial cards, pricing grid",
  },
  budget: {
    name: "budget",
    description: "Financial budget with categories, planned vs actual, totals, and variance indicators",
    category: "business",
    subcategory: "financial",
    builtin_css: "Light-themed, summary bar cards, category grouping, variance visualization, monospace amounts",
  },
  "meeting-notes": {
    name: "meeting-notes",
    description: "Meeting agenda, discussion notes, and action items with assignees",
    category: "presentation",
    subcategory: "collaboration",
    builtin_css: "Light-themed, meta header grid, agenda items with left accent border, action items with checkboxes",
  },
  comparison: {
    name: "comparison",
    description: "Product/feature comparison tables with highlight column and check/cross indicators",
    category: "presentation",
    subcategory: "decision",
    builtin_css: "Light-themed, sticky first column, highlight column, check/cross/partial indicators, hover rows",
  },
  "financial-summary": {
    name: "financial-summary",
    description: "Quarterly/annual financial overview with revenue/expense tables, KPIs, and growth chart",
    category: "business",
    subcategory: "financial",
    builtin_css: "Light-themed, KPI grid, revenue/expense tables with section headers, growth bar visualization",
  },
  "error-page": {
    name: "error-page",
    description: "404/500 error page with branding, error code, message, search, and navigation links",
    category: "technical",
    subcategory: "utility",
    builtin_css: "Light-themed, centered layout, gradient error code, search box, brand logo, nav links",
  },
  "equity-research": {
    name: "equity-research",
    description: "Full equity research report with executive summary, financial analysis, valuation, risk assessment, ESG, and recommendation",
    category: "report",
    subcategory: "financial",
    builtin_css: "Dark-themed, amber accent, executive summary box, financial tables, valuation section, risk heatmap, ESG bars, estimate tracker, recommendation box, print-friendly",
  },
  "lit-review": {
    name: "lit-review",
    description: "PRISMA-compliant systematic literature review with abstract, methodology, PRISMA flow diagram, and thematic synthesis",
    category: "report",
    subcategory: "research",
    builtin_css: "Dark-themed, blue accent, methodology sections, PRISMA flow container, study quality assessment, evidence tables, abstract box, citation list, database badges, thematic synthesis cards",
  },
  "research-briefing": {
    name: "research-briefing",
    description: "Quick research briefing with key findings, evidence gap analysis, methodology box, and TL;DR summary",
    category: "report",
    subcategory: "research",
    builtin_css: "Dark-themed, teal accent, key findings cards with confidence badges, evidence gaps section, methodology box, data sources table, TL;DR box, timeline markers",
  },
  "financial-dashboard": {
    name: "financial-dashboard",
    description: "Financial KPI dashboard with metric cards, change indicators, color-coded data, and responsive grid",
    category: "dashboard",
    subcategory: "financial",
    builtin_css: "Dark-themed, green accent, KPI card grid, change indicators (green up/red down), data table, color-coded metrics, filter bar, sparkline area, responsive layout",
  },
  "scientific-paper": {
    name: "scientific-paper",
    description: "Academic/scientific paper with title page, abstract, numbered sections, equations, references, and print layout",
    category: "research",
    subcategory: "academic",
    builtin_css: "Dark-themed, sky blue accent, title page, author block, abstract box, section numbering, figure/table captions, equation block, references list, DOI badges, keywords tags, @media print page breaks",
  },
  "journal-club": {
    name: "journal-club",
    description: "Journal club article review with critical appraisal, PICO framework, evidence meter, and discussion points",
    category: "research",
    subcategory: "academic",
    builtin_css: "Dark-themed, purple accent, article header, critical appraisal cards, study design badges, PICO framework grid, evidence-strength meter, Q&A block, key takeaways",
  },
  "earnings-summary": {
    name: "earnings-summary",
    description: "Earnings call summary with financial highlights, segment performance, guidance, and source-annotated data",
    category: "report",
    subcategory: "financial",
    builtin_css: "Dark-themed, indigo accent, earnings header with EPS beat/miss badge, financial highlights grid, revenue breakdown table, segment performance cards, guidance box, source annotation tags, YoY change arrows",
  },
  "industry-overview": {
    name: "industry-overview",
    description: "Industry/competitive analysis with market sizing, competitive positioning, SWOT, and growth trajectory",
    category: "report",
    subcategory: "business",
    builtin_css: "Dark-themed, rose accent, TAM/SAM/SOM visualization bars, competitive positioning grid, market share bar chart, SWOT cards, growth trajectory bars, key metrics table, company comparison cards",
  },
};
