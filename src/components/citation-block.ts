import { registerComponent } from "./registry.js";

registerComponent({
  name: "citation-block",
  description: "Reference citation block with source details, DOI link, and hover preview",
  category: "data",
  html_template: `<div class="citation-block">
  {{~it.citations :cite}}
  <div class="citation-item">
    <span class="citation-id">[{{=cite.id}}]</span>
    <span class="citation-text">{{=cite.text}}</span>
    {{? cite.doi }}<a class="citation-doi" href="https://doi.org/{{=cite.doi}}" target="_blank">DOI</a>{{?}}
    {{? cite.year }}<span class="citation-year">{{=cite.year}}</span>{{?}}
    {{? cite.type }}<span class="citation-type type-{{=cite.type}}">{{=cite.type}}</span>{{?}}
  </div>
  {{~}}
</div>`,
  css: `.citation-block { display: flex; flex-direction: column; gap: 8px; margin: 1em 0; }
.citation-item { display: flex; align-items: baseline; gap: 8px; padding: 10px 14px; background: var(--bg-card); border: 1px solid var(--border); border-radius: 8px; font-size: 14px; line-height: 1.6; transition: box-shadow 0.2s; }
.citation-item:hover { box-shadow: 0 2px 8px rgba(0,0,0,0.08); }
.citation-id { font-weight: 700; color: var(--accent); font-size: 13px; min-width: 28px; }
.citation-text { color: var(--text-primary); flex: 1; }
.citation-doi { font-size: 11px; font-weight: 600; padding: 2px 8px; border-radius: 4px; background: var(--accent); color: #fff; text-decoration: none; white-space: nowrap; text-transform: uppercase; letter-spacing: 0.3px; }
.citation-year { font-size: 12px; color: var(--text-secondary); font-weight: 500; white-space: nowrap; padding: 2px 6px; background: var(--bg-primary); border-radius: 4px; }
.citation-type { font-size: 11px; font-weight: 600; padding: 2px 8px; border-radius: 4px; text-transform: uppercase; letter-spacing: 0.3px; white-space: nowrap; }
.type-journal { background: rgba(59,130,246,0.12); color: #60a5fa; }
.type-conference { background: rgba(245,158,11,0.12); color: #fbbf24; }
.type-preprint { background: rgba(168,85,247,0.12); color: #c084fc; }`,
  js: "",
  schema: { citations: { type: "array", items: { type: "object", properties: { id: { type: "string" }, text: { type: "string" }, doi: { type: "string" }, year: { type: "string" }, type: { type: "string" } } } } },
});
