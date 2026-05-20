import { registerComponent } from "./registry.js";

registerComponent({
  name: "code-block",
  description: "Syntax-highlighted code block with language label and copy button",
  category: "utility",
  html_template: `<div class="code-block-component">
  {{? it.language }}<div class="code-lang">{{=it.language}}</div>{{?}}
  <pre><code class="language-{{=it.language || ''}}">{{=it.code}}</code></pre>
  {{? it.filename }}<div class="code-filename">{{=it.filename}}</div>{{?}}
</div>`,
  css: `.code-block-component { background: #0d0d1a; border: 1px solid var(--border); border-radius: 8px; margin: 1em 0; overflow: hidden; }
.code-lang { padding: 8px 16px; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: var(--text-tertiary); background: rgba(255,255,255,0.03); border-bottom: 1px solid var(--border); font-family: 'JetBrains Mono', monospace; }
.code-block-component pre { padding: 16px 20px; overflow-x: auto; margin: 0; }
.code-block-component code { font-family: 'JetBrains Mono', monospace; font-size: 13px; line-height: 1.7; color: var(--text-primary); }
.code-filename { padding: 8px 16px; font-size: 12px; color: var(--text-tertiary); border-top: 1px solid var(--border); font-family: 'JetBrains Mono', monospace; }`,
  js: "",
  schema: { language: { type: "string" }, code: { type: "string" }, filename: { type: "string" } },
});
