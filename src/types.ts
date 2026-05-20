export type CompressionLevel = "none" | "low" | "high" | "ai";

export interface CompressionStats {
  original_chars: number;
  compressed_chars: number;
  compression_ratio: number;
  estimated_tokens: number;
  original_tokens: number;
}

export interface PageOptions {
  title?: string;
  theme?: "dark" | "light";
  css_vars?: Record<string, string>;
  inject_css?: string;
  inject_js?: string;
  line_width?: number;
  compression?: CompressionLevel;
  mode?: "normal" | "stream";
  skip_format?: boolean;
}

export interface BudgetOptions {
  max_tokens: number;
}

export interface SectionDef {
  component: string;
  props?: Record<string, unknown>;
  children?: SectionDef[];
}

export interface RenderPageInput {
  template: string;
  sections: SectionDef[];
  output_path: string;
  options?: PageOptions;
  entity_annotations?: EntityAnnotation[];
  budget?: BudgetOptions;
}

export interface PatchHtmlInput {
  file_path: string;
  selector: string;
  html: string;
}

export interface SetAttributeInput {
  file_path: string;
  selector: string;
  attribute: string;
  value: string;
}

export interface WriteRawHtmlInput {
  content: string;
  output_path: string;
  template?: string;
  options?: PageOptions;
  budget?: BudgetOptions;
}

export interface WriteHtmlFileInput {
  content: string;
  output_path: string;
  template?: string;
  options?: PageOptions;
  budget?: BudgetOptions;
}

export interface FormatHtmlInput {
  file_path: string;
  options?: {
    compression?: CompressionLevel;
    max_tokens?: number;
  };
}

export interface PreviewHtmlInput {
  content?: string;
  html?: string;
  template?: string;
  sections?: SectionDef[];
  options?: PageOptions;
  budget?: BudgetOptions;
}

export interface ReadHtmlInput {
  file_path: string;
  mode: "structure" | "content" | "compressed" | "text";
  offset?: number;
  limit?: number;
}

export interface EditLineRangeInput {
  file_path: string;
  start_line: number;
  end_line: number;
  new_content: string;
}

export interface EditSectionInput {
  file_path: string;
  section_index: number;
  component?: string;
  props?: Record<string, unknown>;
  html?: string;
}

export interface EntityAnnotation {
  selector: string;
  entity_id: string;
  depends_on?: string[];
}

export interface ComponentDef {
  name: string;
  description: string;
  html_template: string;
  css?: string;
  js?: string;
  category: "layout" | "interactive" | "data" | "media" | "utility";
  schema: Record<string, unknown>;
}

export interface TemplateDef {
  name: string;
  description: string;
  category: string;
  subcategory?: string;
  builtin_css: string;
  render: (content: string, options: PageOptions) => string;
}

export interface ToolResult {
  content: Array<{ type: string; text: string }>;
  isError?: boolean;
}

export interface RegisterTemplateInput {
  name: string;
  description: string;
  category: string;
  html_template: string;
  css?: string;
}

export interface TemplateSchemaDef {
  name: string;
  description: string;
  category: string;
  subcategory?: string;
  variables: Record<string, { type: string; default?: unknown; description?: string }>;
  preview: string;
}

export interface ComponentSchemaDef {
  name: string;
  description: string;
  category: string;
  schema: Record<string, unknown>;
}
