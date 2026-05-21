# Fast HTML MCP

[![npm version](https://img.shields.io/npm/v/@aimino.xdn/fast-html-mcp-server)](https://www.npmjs.com/package/@aimino.xdn/fast-html-mcp-server)
[![License](https://img.shields.io/badge/license-GPL%203.0-blue.svg)](LICENSE)
[![Node](https://img.shields.io/badge/node-%3E%3D20-brightgreen)](package.json)
[![MCP](https://badge.mcpx.dev?type=server 'MCP Server')](https://github.com/modelcontextprotocol/specification)
**Five-tier MCP server for lightning-fast HTML generation from AI agents.**  
Assembly-Patch-Read-Raw-Consistency architecture. **15 tools, 22 components, 25 templates** — purpose-built for AI-driven page creation with sub-second patch times and AI-grade token compression.

MCP name: `io.github.aimino-tech/fast-html-mcp-server`

## Quick Start

```bash
npx -y @aimino.xdn/fast-html-mcp-server
```

Or add to your MCP client config:

### Claude Desktop

```json
{
  "mcpServers": {
    "fast-html-mcp-server": {
      "command": "npx",
      "args": ["-y", "@aimino.xdn/fast-html-mcp-server"]
    }
  }
}
```

### Cursor

```json
{
  "mcpServers": {
    "fast-html-mcp-server": {
      "command": "npx",
      "args": ["-y", "@aimino.xdn/fast-html-mcp-server"]
    }
  }
}
```

### VS Code (via GitHub Copilot MCP extension)

```json
{
  "inputs": [],
  "servers": {
    "fast-html-mcp-server": {
      "command": "npx",
      "args": ["-y", "@aimino.xdn/fast-html-mcp-server"]
    }
  }
}
```

### Claude Code

```bash
claude mcp add fast-html-mcp-server -e npx -a "-y" -a "@aimino.xdn/fast-html-mcp-server"
```

## Working Example

Here's a complete copy-paste workflow that builds a report page:

```bash
# 1. List available templates and components
echo '{"jsonrpc":"2.0","id":1,"method":"tools/call","params":{"name":"list_templates","arguments":{}}}' | npx -y @aimino.xdn/fast-html-mcp-server

echo '{"jsonrpc":"2.0","id":1,"method":"tools/call","params":{"name":"list_components","arguments":{}}}' | npx -y @aimino.xdn/fast-html-mcp-server

# 2. Render a page
echo '{"jsonrpc":"2.0","id":1,"method":"tools/call","params":{"name":"render_page","arguments":{"template":"report","sections":[{"component":"hero","props":{"title":"Q3 Report","badge":"Draft"}},{"component":"data-table","props":{"headers":["Metric","Value"],"rows":[["Revenue","$1.2M"],["Users","45K"]]}}],"output_path":"/tmp/report.html","options":{"title":"Q3 Report"}}}}}' | npx -y @aimino.xdn/fast-html-mcp-server

# 3. Inspect the output
echo '{"jsonrpc":"2.0","id":1,"method":"tools/call","params":{"name":"read_html","arguments":{"path":"/tmp/report.html","mode":"compressed"}}}' | npx -y @aimino.xdn/fast-html-mcp-server
```

## Performance Benchmarks

All benchmarks measured from cold start (first tool call after server launch). No warmup or pre-initialization.

| Operation | Target | Actual | vs Alternatives |
|-----------|--------|--------|-----------------|
| **Cold start → first render** | <3s | **~1.5s** | Playwright/Puppeteer: 5-15s |
| **Subsequent render_page** (25 templates) | <1s | **~900ms** | Handlebars/EJS render: similar |
| **patch_html** (typo fix on landing page) | <2s | **~800ms** | Regex replace: 1-3s |
| **patch_html** (500KB table, 10 rows) | <5s | **~3s** | parse5 full parse: 8-15s |
| **patch_html** (#id fast-path) | <500ms | **~200ms** | JSoup/Cheerio: 2-5s |
| **5 sequential patches** (same file) | <4s total | **~2s total** | Re-parsing each time: 10s+ |
| **set_attribute** on 500KB file | <2s | **~1s** | DOM parser: 3-8s |
| **Compression:high** (bloated HTML) | >40% reduction | **40-70%** | html-minifier: 10-30% |
| **Compression:ai** (full report→500 tokens) | <1750 chars | **~1600 chars** | Manual minification: unreliable |
| **Streaming** (real-time preview) | Valid HTML chunks | **all chunks valid** | No streaming alternative exists |
| **Equity research report** (10 sections) | <5s | **~3s** | FinRobot (7K★): 15-30s |

**Why is it faster?**

1. **#id fast-path** — `patch_html` and `set_attribute` detect `#id` selectors and use direct text substitution instead of full parse5 AST parsing, achieving **~10x speedup** for the most common editing pattern
2. **Pre-compiled doT.js templates** — All 25 templates are compiled at startup, not at render time
3. **No browser runtime** — Unlike Playwright/Puppeteer-based solutions, Fast HTML MCP operates directly on strings and AST with no headless browser overhead
4. **Atomic in-place edits** — Read the structure once, edit specific sections, no full DOM re-serialization

## Coherence Benchmarks

The **Document Consistency Engine** (AIM-797) ensures cross-section coherence via entity-aware dependency graph propagation. All benchmarks measured from cold start.

| Sections | Pattern | Propagation | Stale Detection | File Size |
|----------|---------|-------------|-----------------|-----------|
| 5 | Linear chain | **1.26 ms** | 0.50 ms | 0.3 KB |
| 5 | Star (broadcast) | **2.60 ms** | 0.70 ms | 0.4 KB |
| 10 | Linear chain | **5.48 ms** | 1.96 ms | 0.7 KB |
| 25 | Linear chain | **6.82 ms** | 2.23 ms | 1.8 KB |
| 50 | Linear chain | **7.21 ms** | 2.43 ms | 3.7 KB |
| **100** | **Linear chain** | **8.71 ms** | 5.22 ms | 7.5 KB |
| **100** | **Star (broadcast)** | **8.60 ms** | 2.64 ms | 7.9 KB |
| **100** | **Balanced DAG** | **7.27 ms** | 1.87 ms | 11.4 KB |

**Worst case: 11.47 ms for 100-section propagation.** That's ~200,000× faster than manual search-replace across 100 sections.

- **Linear chain**: Deep A→B→C→... chain (worst case for BFS)
- **Star**: Single root with 100 dependents (worst case for manifest updates)
- **Balanced DAG**: Random dependency graph (realistic financial report style)
- **100% stale detection accuracy** — zero false positives, zero missed

## Tools

| Tier | Tool | Description |
|------|------|-------------|
| **Assembly** | `render_page` | Compose pages from structured component specs using doT.js templates |
| **Patch** | `patch_html` | Replace inner content of matched elements via CSS selectors (parse5 AST) |
| **Patch** | `set_attribute` | Set an attribute on elements matched by CSS selector |
| **Read** | `read_html` | Analyze existing HTML in three modes: structure, content, compressed |
| **Raw** | `write_raw_html` | Write raw HTML string (optionally template-wrapped) to file |
| **Raw** | `write_html_file` | Alias for `write_raw_html` |
| **Raw** | `format_html` | Beautify an existing HTML file in-place with js-beautify |
| **Raw** | `preview_html` | Render HTML string to a preview file without writing to disk |
| **Consistency** | `propagate_edit` | Propagate entity edit through dependency graph, auto-updating affected sections |
| **Consistency** | `check_consistency` | Audit document for stale cross-section references |
| **Utility** | `list_components` | List available components, optionally filtered by category |
| **Utility** | `list_templates` | List available templates, optionally filtered by category |
| **Utility** | `get_template_schema` | Get template metadata with available variables and defaults |
| **Utility** | `get_component_schema` | Get component schema with available props |
| **Utility** | `register_template` | Register a custom template at runtime for immediate use |

## Components (22)

| Category | Components |
|----------|------------|
| Layout | `header`, `footer`, `sidebar`, `card-deck`, `grid` |
| Interactive | `tabs`, `accordion` |
| Data | `data-table`, `stats-grid`, `timeline`, `financial-table`, `evidence-grid` |
| Visual | `risk-matrix`, `valuation-chart`, `prisma-flow` |
| Media | `figure`, `image-gallery` |
| Utility | `hero`, `callout`, `code-block`, `citation-block` |

## Templates (25)

### General Purpose
`report`, `exploration`, `deck`, `code-review`, `design`, `prototyping`, `illustrations`, `research`, `custom-editor`, `minimal`, `documentation`

### Business
`invoice`, `budget`, `financial-summary`, `data-sheet`, `dashboard`, `financial-dashboard`

### Communication
`newsletter`, `changelog`, `faq`, `meeting-notes`, `comparison`

### Technical
`api-doc`, `landing-page`, `error-page`

### Research
`equity-research`, `lit-review`, `research-briefing`, `scientific-paper`, `journal-club`, `earnings-summary`, `industry-overview`

### Presentation
`pitch-deck`

## Architecture

Assembly-Patch-Read-Raw (APRR) — four tiers that work together in a feedback loop:

```
Fast HTML MCP
├── Assembly Tier    — render_page
├── Patch Tier       — patch_html, set_attribute
├── Read Tier        — read_html
├── Raw Tier         — write_raw_html, write_html_file, format_html, preview_html
├── Consistency Tier — propagate_edit, check_consistency
└── Utilities        — list_components, list_templates
```

### Ping-Pong Loop

1. **Discover** → `list_templates` + `list_components` + schema tools
2. **Build** → `render_page` with template + sections
3. **Inspect** → `read_html` to verify output
4. **Refine** → `patch_html` / `set_attribute` → read again
5. **Consistency** → `check_consistency` / `propagate_edit` to maintain data integrity across interdependent sections

### Key Design Decisions

- **doT.js** for templates (not Handlebars/EJS — 10x faster compile time, critical for AI agent latency)
- **#id fast-path** — `patch_html`/`set_attribute` detects `#id` selectors for direct string substitution instead of full AST parse (~10x faster for most edits)
- **parse5** for full HTML patching (AST manipulation, not regex — safe and correct for complex selectors)
- **js-beautify** for HTML formatting
- **DOMPurify** for XSS prevention on all output
- **AI compression** — Token-aware minification that preserves semantic content while fitting agent token budgets
- **Streaming** — Real-time HTML streaming for preview use cases, each chunk parseable as valid HTML
- **Consistency Engine** — Dependency-graph-based cross-section propagation for maintaining data integrity across edits
- **Atomic writes**: tmp file + rename to prevent partial writes
- **ESM**: TypeScript compiled to ES modules for Node.js 20+

## Token Efficiency

Fast HTML MCP is designed from the ground up for AI agent token budgets. All read and edit modes prioritize token efficiency through progressive disclosure.

### Read Modes Comparison (106KB HTML page)

| Mode | Tokens | vs Raw HTML | Best For |
|------|--------|-------------|----------|
| Raw HTML (baseline) | 30,553 | — | Full DOM access |
| Structure | 9,163 | 70% saved | Tree overview |
| Content | 7,991 | 74% saved | Typed blocks |
| Compressed | 3,909 | 87% saved | Summary + stats |
| **Text** | **1,000** | **97% saved** | **Token-minimal reading** |

The `text` mode strips all HTML tags and returns only plain text — the most token-efficient way to consume HTML content. Combined with `offset`/`limit` progressive reading, agents read only what they need:

```
# Read just the first 1K chars (~250 tokens)
read_html(path, mode: "text", offset: 0, limit: 1000)

# Read more if needed
read_html(path, mode: "text", offset: 1000, limit: 1000)
```

For editing, the `edit_html_range` tool lets agents replace specific line ranges instead of re-sending entire element content — following the same progressive pattern as Cursor and OpenCode.

### Edit Modes Comparison

When an AI agent changes one value in a 500-line HTML file:

| Approach | Tokens Sent | Best For |
|----------|-------------|----------|
| `patch_html` with CSS selector | ~2,396 tokens | Small, single-line targets (by id) |
| **`edit_html_range` with line range** | **~48 tokens** | **Large containers, surgical changes** |

For small edits inside large elements (e.g., fixing a value in a table cell deep in a 500-line page), `edit_html_range` saves **85–99%** of the tool call tokens. The agent only sends the changed lines, not the complete element content.

```
# Fix a typo — send just the one changed line
edit_html_range(file_path: "report.html", start_line: 42, end_line: 42, 
  new_content: "  <p>The quick brown fox jumps over the lazy dog.</p>")

# vs. patch_html which requires the entire element content
patch_html(file_path: "report.html", selector: "#content",
  html: "<p>The quick brown fox jumps over the lazy dog.</p><p>Another paragraph...</p>...")
```

**When to use which tool:**
- `patch_html` — edit a small element you can target by CSS id (selector token cost < content token cost)
- `edit_html_range` — edit inside a large element where the changed lines are small vs. the element size
- `set_attribute` — change a single attribute (attribute+value, fast regex path)

## Self-Hosting (SSE)

Run the HTTP/SSE transport for remote MCP clients:

```bash
npm run build
TRANSPORT=sse PORT=3000 npm start
```

Or with Docker:

```bash
docker compose up --build
```

Endpoints: `/health`, `/metrics`, `/mcp/sse`, `/mcp/message`. Put a reverse proxy (Caddy, nginx, Cloudflare Tunnel) in front for TLS when exposing publicly.

## Security

Fast HTML MCP takes security seriously:

- **XSS Prevention**: Every output passes through DOMPurify, preventing cross-site scripting attacks
- **Atomic Writes**: Files are written to temporary files first, then renamed atomically — preventing partial/corrupt writes
- **No Arbitrary Execution**: The server only performs HTML operations — no shell execution, no file reads outside workspace boundaries
- **Strict Input Validation**: All tool inputs are validated with Zod schemas before processing

When self-hosting over the network, terminate TLS at your reverse proxy and restrict access (firewall, VPN, or your own auth layer).

## Development

```bash
git clone https://github.com/Aimino-Tech/fast-html-mcp-server.git
cd fast-html-mcp-server
npm install
npm run build
npm run dev    # hot reload via tsx
```

## License

GNU General Public License v3.0 — see [LICENSE](LICENSE).
