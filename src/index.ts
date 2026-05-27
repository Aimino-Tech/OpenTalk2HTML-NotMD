#!/usr/bin/env node
import { z } from "zod";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

import "./components/index.js";

import { buildPage, buildHtmlString } from "./builder.js";
import { patchHtml } from "./patch/index.js";
import { setAttribute } from "./patch/attribute.js";
import { editLineRange } from "./patch/line-range.js";
import { editSection, insertSection, listSections } from "./patch/section.js";
import { writeRawHtml, writeHtmlFile, formatHtmlFile, previewHtml } from "./raw/index.js";
import { readHtml } from "./reader/index.js";
import { getAllTemplates, getTemplateSchema, precompileAllTemplates } from "./templates/registry.js";
import { registerCustomTemplate } from "./templates/custom.js";
import { getAllComponents, getComponentSchema } from "./components/index.js";
import { ensurePurify } from "./validator.js";

import {
  RenderPageSchema,
  PatchHtmlSchema,
  SetAttributeSchema,
  EditLineRangeSchema,
  EditSectionSchema,
  InsertSectionSchema,
  WriteRawHtmlShape,
  FormatHtmlSchema,
  PreviewHtmlShape,
  ReadHtmlSchema,
  PropagateEditSchema,
  CheckConsistencySchema,
  GetTemplateSchemaSchema,
  GetComponentSchemaSchema,
  ListTemplatesSchema,
  ListComponentsSchema,
  RegisterTemplateSchema,
} from "./registry.js";
import { handlePropagateEdit, handleCheckConsistency } from "./consistency/index.js";

const server = new McpServer({
    name: "@aimino/opentalk2html-notmd",
  version: "0.1.0",
});

server.tool("render_page", "Assemble page from structured components", RenderPageSchema.shape, async (args) => {
  try {
    const result = await buildPage(args as any);
    if (result.chunks) {
      return {
        content: result.chunks.map((chunk) => ({ type: "text" as const, text: chunk })),
      };
    }
    return {
      content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
    };
  } catch (err) {
    return { content: [{ type: "text", text: `Error: ${(err as Error).message}` }], isError: true };
  }
});

server.tool("patch_html", "Patch HTML element(s) by CSS selector", PatchHtmlSchema.shape, async (args) => {
  try {
    const msg = patchHtml(args);
    return { content: [{ type: "text", text: msg }] };
  } catch (err) {
    return { content: [{ type: "text", text: `Error: ${(err as Error).message}` }], isError: true };
  }
});

server.tool("set_attribute", "Set attribute on element(s) by CSS selector", SetAttributeSchema.shape, async (args) => {
  try {
    const msg = setAttribute(args);
    return { content: [{ type: "text", text: msg }] };
  } catch (err) {
    return { content: [{ type: "text", text: `Error: ${(err as Error).message}` }], isError: true };
  }
});

server.tool("edit_html_range", "Replace a range of lines in an HTML file with new content (most token-efficient edit — send only the changed lines)", EditLineRangeSchema.shape, async (args) => {
  try {
    const msg = editLineRange(args);
    return { content: [{ type: "text", text: msg }] };
  } catch (err) {
    return { content: [{ type: "text", text: `Error: ${(err as Error).message}` }], isError: true };
  }
});

server.tool("edit_section", "Replace a rendered section in an HTML file with a new component. Pages rendered with render_page embed section markers. Use list_sections to discover available indices. Provide component+props to re-render, or html for raw replacement.", EditSectionSchema.shape, async (args) => {
  try {
    const msg = editSection(args);
    return { content: [{ type: "text", text: msg }] };
  } catch (err) {
    return { content: [{ type: "text", text: `Error: ${(err as Error).message}` }], isError: true };
  }
});

server.tool("insert_section", "Insert a new component section at a specific index, pushing existing sections forward. Uses the same section marker system as render_page. Auto-renumbers all subsequent sections.", InsertSectionSchema.shape, async (args) => {
  try {
    const msg = insertSection(args);
    return { content: [{ type: "text", text: msg }] };
  } catch (err) {
    return { content: [{ type: "text", text: `Error: ${(err as Error).message}` }], isError: true };
  }
});

server.tool("list_sections", "List all component sections in an HTML file that was built with render_page. Returns section indices, component types, and sizes.", z.object({ file_path: z.string() }).shape, async (args) => {
  try {
    const msg = listSections(args.file_path);
    return { content: [{ type: "text", text: msg }] };
  } catch (err) {
    return { content: [{ type: "text", text: `Error: ${(err as Error).message}` }], isError: true };
  }
});

server.tool("read_html", "Read/analyze existing HTML file. Use mode='text' for token-efficient plain text extraction with offset/limit progressive reading.", ReadHtmlSchema.shape, async (args) => {
  try {
    const result = readHtml(args as any);
    return { content: [{ type: "text", text: typeof result.data === "string" ? result.data : JSON.stringify(result.data, null, 2) }] };
  } catch (err) {
    return { content: [{ type: "text", text: `Error: ${(err as Error).message}` }], isError: true };
  }
});

server.tool("write_raw_html", "Write raw HTML content directly to file", WriteRawHtmlShape, async (args) => {
  try {
    const result = await writeRawHtml(args as any);
    if (result.chunks) {
      return {
        content: result.chunks.map((chunk) => ({ type: "text" as const, text: chunk })),
        meta: result.stats ? { compression: result.stats } : undefined,
      };
    }
    return {
      content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
    };
  } catch (err) {
    return { content: [{ type: "text", text: `Error: ${(err as Error).message}` }], isError: true };
  }
});

server.tool("write_html_file", "Write content as formatted HTML file", WriteRawHtmlShape, async (args) => {
  try {
    const result = await writeHtmlFile(args as any);
    if (result.chunks) {
      return {
        content: result.chunks.map((chunk) => ({ type: "text" as const, text: chunk })),
        meta: result.stats ? { compression: result.stats } : undefined,
      };
    }
    return {
      content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
    };
  } catch (err) {
    return { content: [{ type: "text", text: `Error: ${(err as Error).message}` }], isError: true };
  }
});

server.tool("format_html", "Format/beautify an existing HTML file", FormatHtmlSchema.shape, async (args) => {
  try {
    const result = await formatHtmlFile(args as any);
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
  } catch (err) {
    return { content: [{ type: "text", text: `Error: ${(err as Error).message}` }], isError: true };
  }
});

server.tool("preview_html", "Preview rendered HTML string without writing", PreviewHtmlShape, async (args) => {
  try {
    const result = await previewHtml(args as any);
    if (result.chunks) {
      return {
        content: result.chunks.map((chunk) => ({ type: "text" as const, text: chunk })),
        meta: result.stats ? { compression: result.stats } : undefined,
      };
    }
    return {
      content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
    };
  } catch (err) {
    return { content: [{ type: "text", text: `Error: ${(err as Error).message}` }], isError: true };
  }
});

server.tool("list_templates", "List available template shells (optionally filter by category)", ListTemplatesSchema.shape, async (args) => {
  const category = args?.category || undefined;
  const templates = getAllTemplates(category).map((t) => ({
    name: t.name,
    description: t.description,
    category: t.category,
    subcategory: t.subcategory,
  }));
  return { content: [{ type: "text", text: JSON.stringify(templates, null, 2) }] };
});

server.tool("propagate_edit", "Propagate an entity edit through the dependency graph, updating all transitively affected sections", PropagateEditSchema.shape, async (args) => {
  try {
    const result = handlePropagateEdit(args);
    return { content: [{ type: "text", text: result }] };
  } catch (err) {
    return { content: [{ type: "text", text: `Error: ${(err as Error).message}` }], isError: true };
  }
});

server.tool("check_consistency", "Audit document for stale cross-section references and dependency violations", CheckConsistencySchema.shape, async (args) => {
  try {
    const result = handleCheckConsistency(args);
    return { content: [{ type: "text", text: result }] };
  } catch (err) {
    return { content: [{ type: "text", text: `Error: ${(err as Error).message}` }], isError: true };
  }
});

server.tool("list_components", "List available interactive components (optionally filter by category)", ListComponentsSchema.shape, async (args) => {
  const category = args?.category || undefined;
  const components = getAllComponents(category).map((c) => ({
    name: c.name,
    description: c.description,
    category: c.category,
  }));
  return { content: [{ type: "text", text: JSON.stringify(components, null, 2) }] };
});

server.tool("get_template_schema", "Get template metadata including available variables with defaults", GetTemplateSchemaSchema.shape, async (args) => {
  try {
    const schema = getTemplateSchema(args.name);
    return { content: [{ type: "text", text: JSON.stringify(schema, null, 2) }] };
  } catch (err) {
    return { content: [{ type: "text", text: `Error: ${(err as Error).message}` }], isError: true };
  }
});

server.tool("get_component_schema", "Get component schema with available props", GetComponentSchemaSchema.shape, async (args) => {
  try {
    const schema = getComponentSchema(args.name);
    return { content: [{ type: "text", text: JSON.stringify(schema, null, 2) }] };
  } catch (err) {
    return { content: [{ type: "text", text: `Error: ${(err as Error).message}` }], isError: true };
  }
});

server.tool("register_template", "Register a custom template at runtime for immediate use with render_page/preview_html", RegisterTemplateSchema.shape, async (args) => {
  try {
    registerCustomTemplate(args.name, args.description, args.category, args.html_template, args.css);
    return {
      content: [{ type: "text", text: JSON.stringify({ success: true, name: args.name, message: `Template "${args.name}" registered` }, null, 2) }],
    };
  } catch (err) {
    return { content: [{ type: "text", text: `Error: ${(err as Error).message}` }], isError: true };
  }
});

function initWarmup(): void {
  try {
    ensurePurify();
    precompileAllTemplates();
  } catch {
    // warmup is best-effort; lazy init handles failures later
  }
}

async function main() {
  if (process.env.TRANSPORT === "sse") {
    const { startSSEServer } = await import("./sse-server.js");
    const sse = await startSSEServer(server);
    process.on("SIGTERM", () => {
      sse.close();
      process.exit(0);
    });
    process.on("SIGINT", () => {
      sse.close();
      process.exit(0);
    });
    return;
  }

  const transport = new StdioServerTransport();
  await server.connect(transport);

  // Warmup after handshake — don't block MCP initialization
  // Templates and DOMPurify are lazily initialized on first use
  initWarmup();
}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
