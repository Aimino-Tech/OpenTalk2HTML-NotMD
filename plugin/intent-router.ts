export interface McpCommand {
  tool: string
  args: Record<string, unknown>
}

const INTENT_PATTERNS: Array<{ pattern: RegExp; route: string; template: string }> = [
  { pattern: /\b(?:research|report|study|analysis|paper)\b.*\b(?:on|about|of)\b/i, route: "deep_research", template: "" },
  { pattern: /\b(?:equity|stock|fundamental|valuation)\b.*\b(?:analysis|report)\b/i, route: "deep_research", template: "equity-research" },
  { pattern: /\b(?:literature|lit|systematic)\b.*\b(?:review|survey)\b/i, route: "deep_research", template: "lit-review" },
  { pattern: /\b(?:dashboard|kpi|metrics|scorecard)\b/i, route: "render_page", template: "dashboard" },
  { pattern: /\b(?:financial|budget|spend)\b.*\b(?:dashboard|overview|summary)\b/i, route: "render_page", template: "financial-dashboard" },
  { pattern: /\b(?:hero|landing|homepage|marketing)\b.*\b(?:page|section)\b/i, route: "render_page", template: "landing-page" },
  { pattern: /\b(?:invoice|receipt|bill)\b/i, route: "render_page", template: "invoice" },
  { pattern: /\b(?:email|newsletter|campaign)\b/i, route: "render_page", template: "newsletter" },
  { pattern: /\b(?:change|update|edit|fix|modify)\b.*\b(?:html|page|component|section|cta|button|color)\b/i, route: "patch_html", template: "" },
  { pattern: /(?:selector|\.\w+|#\w+)\s+(?:to|should be|becomes?)\s+/i, route: "patch_html", template: "" },
  { pattern: /\b(?:check|verify|audit|lint)\b.*\b(?:consisten(?:cy|t)|quality|html)\b/i, route: "check_consistency", template: "" },
]

const ARG_KEY: Record<string, string> = {
  deep_research: "query",
  render_page: "section",
  patch_html: "selector",
  check_consistency: "file_path",
}

export function recognizeHtmlIntent(input: unknown): McpCommand | null {
  const text = typeof input === "string" ? input : String((input as Record<string, unknown>)?.text ?? "")
  if (!text.trim()) return null
  for (const cp of INTENT_PATTERNS) {
    const match = text.match(cp.pattern)
    if (!match) continue
    return {
      tool: cp.route,
      args: { [ARG_KEY[cp.route] || "selector"]: text },
    }
  }
  return null
}

export function isHtmlFile(filePath: string): boolean {
  return /\.html?$/i.test(filePath)
}

export function isHtmlTool(tool: string): boolean {
  const htmlTools = new Set([
    "render_page",
    "patch_html",
    "set_attribute",
    "read_html",
    "write_raw_html",
    "write_html_file",
    "format_html",
    "preview_html",
    "list_templates",
    "list_components",
  ])
  return htmlTools.has(tool)
}

export const HAS_HTML_INTENT = /\b(?:html?|render|template|component|dashboard|page|landing|hero|button|div|section|footer|header|navbar|card|table|grid|layout)\b/i

export function getGuidanceForIntent(intent: McpCommand | null): string {
  if (!intent) return ""

  const guidance: Record<string, string> = {
    deep_research: "For research reports, use `render_page` with template 'report' and sections for each major finding.",
    render_page: "Use `render_page` to assemble pages. First call `list_templates` to see available shells, then `list_components` to discover components.",
    patch_html: "Use `patch_html` with a CSS selector to modify existing HTML. First use `read_html` with mode 'structure' to understand the document.",
    check_consistency: "Use `read_html` in 'content' mode to verify document structure, then cross-reference sections.",
  }

  return guidance[intent.tool] || ""
}
