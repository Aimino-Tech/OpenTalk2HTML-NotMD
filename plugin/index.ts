import type { Plugin, Hooks, BunShell, BunShellOutput } from "@opencode-ai/plugin"
import { tool as createToolDef } from "@opencode-ai/plugin/tool"
import { DocumentStateManager } from "./document-state.js"
import { recognizeHtmlIntent, isHtmlFile, isHtmlTool, HAS_HTML_INTENT, getGuidanceForIntent } from "./intent-router.js"
import { compressHtmlForContext } from "./context-compressor.js"
import { assessQuality, formatQualityWarning } from "./quality-gate.js"
import { McpClientManager } from "./mcp-client.js"
import { readFile } from "node:fs/promises"
import { resolve } from "node:path"

export { DocumentStateManager } from "./document-state.js"
export { recognizeHtmlIntent, isHtmlFile, isHtmlTool, getGuidanceForIntent } from "./intent-router.js"
export { McpClientManager } from "./mcp-client.js"
export { compressHtmlForContext } from "./context-compressor.js"
export { assessQuality, formatQualityWarning } from "./quality-gate.js"

const SKILL_PATH = "SKILL.md"

export const HtmlMcpPlugin: Plugin = async ({ $, directory }) => {
  const docState = new DocumentStateManager()
  const htmlMcp = new McpClientManager($)

  const s = createToolDef.schema

  const hooks: Hooks = {
    event: async (input) => {
      const ev = input.event
      if (ev.type === "session.created") {
        docState.init((ev.properties.info as { id: string }).id)
      } else if (ev.type === "session.updated") {
        docState.trackChanges((ev.properties.info as { id: string }).id)
      } else if (ev.type === "session.deleted") {
        docState.cleanup((ev.properties.info as { id: string }).id)
      }
    },

    tool: {
      html_show: createToolDef({
        description: "Display the full content of an HTML file after it has been compressed for context. Use when you need to see the complete HTML rather than a summary.",
        args: { file_path: s.string() },
        async execute(args, context) {
          try {
            const fullPath = resolve(context.worktree, args.file_path)
            const content = await readFile(fullPath, "utf-8")
            return {
              title: `HTML: ${args.file_path}`,
              output: content,
              metadata: { size: content.length },
            }
          } catch (err) {
            return {
              output: `Error reading file: ${(err as Error).message}`,
            }
          }
        },
      }),
    },

    "chat.message": async (input, output) => {
      const sessionId = input.sessionID
      docState.init(sessionId)

      const msg = output.message as Record<string, unknown> | undefined
      const summary = msg?.summary as Record<string, unknown> | undefined
      const textStr = typeof summary?.body === "string"
        ? summary.body
        : typeof summary?.title === "string"
          ? summary.title
          : output.parts
              .filter((p): p is { type: "text"; text: string } => (p as { type: string }).type === "text")
              .map((p) => (p as { text: string }).text)
              .join(" ")

      docState.setLastMessage(sessionId, textStr)

      const intent = recognizeHtmlIntent(textStr)
      if (intent) {
        docState.setIntent(sessionId, intent.tool)
      } else if (HAS_HTML_INTENT.test(textStr)) {
        docState.setIntent(sessionId, "html_general")
      } else {
        docState.setIntent(sessionId, null)
      }
    },

    "experimental.chat.system.transform": async (input, output) => {
      const sessionId = input.sessionID
      if (!sessionId) return

      const intent = docState.getIntent(sessionId)
      if (!intent) return

      const skillPath = `${directory}/${SKILL_PATH}`
      output.system.push(`\n# HTML Generation Capability\nYou have access to the Fast HTML MCP server for generating and editing HTML. Skill reference: ${skillPath}`)

      const docContext = docState.getContext(sessionId)
      if (docContext) {
        output.system.push(`\n# Active Documents\n${docContext}`)
      }

      const command = intent !== "html_general" ? { tool: intent, args: {} } : null
      const guidance = getGuidanceForIntent(command)
      if (guidance) {
        output.system.push(`\n# Intent Guidance\nDetected HTML intent. ${guidance}`)
      }
    },

    "tool.execute.before": async (input, output) => {
      if (input.tool === "edit") {
        const filePath = (output.args as Record<string, unknown>)?.filePath ?? ""
        if (isHtmlFile(String(filePath))) {
          const existing = { ...(output.args as Record<string, unknown>) }
          output.args = {
            ...existing,
            __htmlContext: "This file is an HTML document. Consider using patch_html for targeted edits or render_page for full page generation.",
          }
        }
      }
    },

    "tool.execute.after": async (input, output) => {
      const sessionId = input.sessionID
      docState.init(sessionId)

      if (isHtmlWrite(input)) {
        const htmlPath = extractHtmlPath(input)
        if (htmlPath) {
          docState.recordEdit(sessionId, htmlPath)
          htmlMcp.call("check_consistency", { file_path: htmlPath }).catch(() => {})
        }
      }

      if (isHtmlTool(input.tool) && output.output) {
        const originalHtml = output.output

        const quality = assessQuality(originalHtml)
        if (quality.score !== "A") {
          output.metadata = { ...(output.metadata || {}), quality }
        }

        if (originalHtml.length > 2000) {
          const compressed = compressHtmlForContext(originalHtml)
          let result = compressed
          if (quality.score === "C" || quality.score === "D" || quality.score === "F") {
            result += "\n\n" + formatQualityWarning(quality)
          }
          output.output = result
          output.metadata = { ...(output.metadata || {}), compressed: true, originalLength: originalHtml.length }
        }
      }
    },

    "permission.ask": async (input, output) => {
      const permissionStr = typeof input === "string" ? input : (input as Record<string, unknown>)?.permission ?? ""
      if (isHtmlPermission(String(permissionStr))) {
        output.status = "allow"
      }
    },
  }

  return hooks
}

function isHtmlWrite(input: { tool: string; args?: Record<string, unknown> }): boolean {
  const tool = input.tool
  if (tool === "write_raw_html" || tool === "write_html_file" || tool === "render_page") return true
  if (tool === "edit") {
    const filePath: string = String(input.args?.filePath ?? input.args?.file_path ?? "")
    return isHtmlFile(filePath)
  }
  return false
}

function extractHtmlPath(input: { tool: string; args?: Record<string, unknown> }): string | null {
  const args = input.args
  if (!args) return null
  return (args.output_path ?? args.file_path ?? args.filePath ?? null) as string | null
}

function isHtmlPermission(permission: string): boolean {
  const lower = permission.toLowerCase()
  return lower.includes("html") || lower.includes("fast-html-mcp")
}
