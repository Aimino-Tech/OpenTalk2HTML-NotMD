import { registerComponent } from "./registry.js";

registerComponent({
  name: "callout",
  description: "Emphasized information box with icon and type (info, warning, tip, error)",
  category: "utility",
  html_template: `<div class="callout callout-{{=it.type || 'info'}}">
  {{? it.icon }}<span class="callout-icon">{{=it.icon}}</span>{{?}}
  <div class="callout-body">
    {{? it.title }}<strong class="callout-title">{{=it.title}}</strong>{{?}}
    <span class="callout-text">{{=it.content}}</span>
  </div>
</div>`,
  css: `.callout { display: flex; gap: 12px; padding: 16px 20px; border-radius: 8px; margin: 1em 0; border-left: 4px solid; }
.callout-info { background: rgba(96,165,250,0.1); border-color: #60a5fa; }
.callout-warning { background: rgba(245,158,11,0.1); border-color: #f59e0b; }
.callout-tip { background: rgba(52,211,153,0.1); border-color: #34d399; }
.callout-error { background: rgba(248,113,113,0.1); border-color: #f87171; }
.callout-icon { font-size: 20px; flex-shrink: 0; margin-top: 2px; }
.callout-body { font-size: 14px; color: var(--text-secondary); line-height: 1.6; }
.callout-title { display: block; margin-bottom: 4px; color: var(--text-primary); }`,
  js: "",
  schema: { type: { type: "string", enum: ["info", "warning", "tip", "error"] }, icon: { type: "string" }, title: { type: "string" }, content: { type: "string" } },
});
