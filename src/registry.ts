import { z } from "zod";

const OptionsSchema = z.object({
  title: z.string().optional(),
  theme: z.enum(["dark", "light"]).optional(),
  css_vars: z.record(z.string()).optional(),
  inject_css: z.string().optional(),
  inject_js: z.string().optional(),
  line_width: z.number().optional(),
  compression: z.enum(["none", "low", "high", "ai"]).optional(),
  mode: z.enum(["normal", "stream"]).optional(),
  skip_format: z.boolean().optional(),
});

const BudgetSchema = z.object({
  max_tokens: z.number(),
}).optional();

export const RenderPageSchema = z.object({
  template: z.string().describe("Template name (report, exploration, deck, code-review, design, prototyping, illustrations, research, custom-editor, minimal, documentation, invoice, data-sheet, pitch-deck, dashboard, newsletter, changelog, faq, api-doc, landing-page, budget, meeting-notes, comparison, financial-summary, error-page)"),
  sections: z.array(z.object({
    component: z.string(),
    props: z.record(z.unknown()).optional(),
    children: z.array(z.any()).optional(),
  })).describe("Array of component sections to assemble"),
  output_path: z.string().describe("Absolute path for the output HTML file"),
  options: OptionsSchema.optional(),
  budget: BudgetSchema,
  entity_annotations: z.array(z.object({
    selector: z.string(),
    entity_id: z.string(),
    depends_on: z.array(z.string()).optional(),
  })).describe("Optional CSS selector-to-entity mappings for consistency engine support").optional(),
});

export const PatchHtmlSchema = z.object({
  file_path: z.string(),
  selector: z.string(),
  html: z.string(),
});

export const SetAttributeSchema = z.object({
  file_path: z.string(),
  selector: z.string(),
  attribute: z.string(),
  value: z.string(),
});

export const EditSectionSchema = z.object({
  file_path: z.string(),
  section_index: z.number().int().min(0).describe("Section index to replace (from render_page sections order)"),
  component: z.string().optional().describe("Component type to replace with (e.g. hero, callout, data-table)"),
  props: z.record(z.unknown()).optional().describe("Props for the new component"),
  html: z.string().optional().describe("Raw HTML to inject directly (bypasses component rendering)"),
});

export const InsertSectionSchema = z.object({
  file_path: z.string(),
  section_index: z.number().int().min(0).describe("Index to insert at (pushes existing section at this index + all later ones forward)"),
  component: z.string().describe("Component type to insert (e.g. hero, callout, data-table)"),
  props: z.record(z.unknown()).optional().describe("Props for the new component"),
  html: z.string().optional().describe("Raw HTML to inject directly (bypasses component rendering)"),
});

export const EditLineRangeSchema = z.object({
  file_path: z.string(),
  start_line: z.number().int().min(1).describe("First line to replace (1-indexed)"),
  end_line: z.number().int().min(1).describe("Last line to replace (1-indexed, inclusive)"),
  new_content: z.string().describe("Replacement content for the specified lines"),
});

const WriteRawHtmlBaseSchema = z.object({
  content: z.string().optional(),
  html: z.string().optional(),
  output_path: z.string(),
  template: z.string().optional(),
  options: OptionsSchema.optional(),
  budget: BudgetSchema,
});

export const WriteRawHtmlSchema = WriteRawHtmlBaseSchema.refine((data) => data.content || data.html, {
  message: "Either 'content' or 'html' must be provided",
});

export const WriteHtmlFileSchema = WriteRawHtmlSchema;
export const WriteRawHtmlShape = WriteRawHtmlBaseSchema.shape;

export const FormatHtmlSchema = z.object({
  file_path: z.string(),
  options: z.object({
    compression: z.enum(["none", "low", "high", "ai"]).optional(),
    max_tokens: z.number().optional(),
  }).optional(),
});

const PreviewHtmlBaseSchema = z.object({
  content: z.string().optional(),
  html: z.string().optional(),
  template: z.string().optional(),
  sections: z.array(z.object({
    component: z.string(),
    props: z.record(z.unknown()).optional(),
    children: z.array(z.any()).optional(),
  })).optional(),
  options: OptionsSchema.optional(),
  budget: BudgetSchema,
});

export const PreviewHtmlSchema = PreviewHtmlBaseSchema.refine((data) => data.content || data.html || data.sections, {
  message: "Either 'content', 'html', or 'sections' must be provided",
});
export const PreviewHtmlShape = PreviewHtmlBaseSchema.shape;

export const ReadHtmlSchema = z.object({
  file_path: z.string(),
  mode: z.enum(["structure", "content", "compressed", "text"]),
  offset: z.number().int().min(0).optional().describe("Character offset for progressive reading (text mode)"),
  limit: z.number().int().min(1).optional().describe("Max characters to return (text mode, default 4000)"),
});

export const PropagateEditSchema = z.object({
  file_path: z.string().describe("Absolute path to the HTML file"),
  section_selector: z.string().describe("CSS selector for the changed element"),
  old_value: z.string().describe("Previous value of the entity"),
  new_value: z.string().describe("New value of the entity"),
});

export const CheckConsistencySchema = z.object({
  file_path: z.string().describe("Absolute path to the HTML file"),
  mode: z.enum(["cross-section"]).describe("Consistency check mode"),
});

export const GetTemplateSchemaSchema = z.object({
  name: z.string().describe("Template name"),
});

export const GetComponentSchemaSchema = z.object({
  name: z.string().describe("Component name"),
});

export const ListTemplatesSchema = z.object({
  category: z.string().optional().describe("Filter by category (business, presentation, communication, technical)"),
});

export const ListComponentsSchema = z.object({
  category: z.string().optional().describe("Filter by category (layout, interactive, data, media, utility)"),
});

const templateNameRegex = /^[a-zA-Z0-9][a-zA-Z0-9_-]*$/;

export const RegisterTemplateSchema = z.object({
  name: z.string().min(1).regex(templateNameRegex, "Template name must start with alphanumeric and contain only alphanumeric, hyphens, or underscores").describe("Template name (alphanumeric, hyphens, underscores allowed)"),
  description: z.string().describe("Template description"),
  category: z.string().default("custom").describe("Template category"),
  html_template: z.string().min(1, "HTML template is required").describe("doT.js HTML template string with {{=it.content}} placeholder"),
  css: z.string().optional().describe("Built-in CSS for the template"),
});
