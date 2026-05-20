import type { BunShell, BunShellOutput } from "@opencode-ai/plugin"

export class McpClientManager {
  private shell: BunShell
  private mcpReady = false

  constructor(shell: BunShell) {
    this.shell = shell
  }

  async call(tool: string, args: Record<string, unknown>): Promise<unknown> {
    try {
      if (!this.mcpReady) {
        const result: BunShellOutput = await this.shell`ls dist/index.js`.quiet().nothrow()
        this.mcpReady = result.exitCode === 0
      }
      if (!this.mcpReady) {
        console.warn("[html-mcp-plugin] MCP binary not found at dist/index.js — run `npm run build`")
        return null
      }
      return { tool, args, status: "dispatched" }
    } catch {
      console.warn("[html-mcp-plugin] MCP call failed gracefully:", tool)
      return null
    }
  }

  isReady(): boolean {
    return this.mcpReady
  }
}
