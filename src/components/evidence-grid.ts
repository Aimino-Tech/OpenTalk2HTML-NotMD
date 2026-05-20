import { registerComponent } from "./registry.js";

registerComponent({
  name: "evidence-grid",
  description: "Evidence quality grid with confidence ratings and source counts",
  category: "data",
  html_template: `<div class="evidence-grid">
  {{~it.findings :finding}}
  <div class="evidence-card">
    <div class="evidence-claim">{{=finding.claim}}</div>
    <div class="evidence-meta">
      <span class="evidence-confidence confidence-{{=finding.confidence}}">{{=finding.confidence}}</span>
      <span class="evidence-sources">{{=finding.sources}} {{=finding.sources === 1 ? 'source' : 'sources'}}</span>
    </div>
  </div>
  {{~}}
</div>`,
  css: `.evidence-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 12px; margin: 1em 0; }
.evidence-card { background: var(--bg-card); border: 1px solid var(--border); border-radius: 10px; padding: 16px; display: flex; flex-direction: column; gap: 12px; transition: box-shadow 0.2s; }
.evidence-card:hover { box-shadow: 0 2px 8px rgba(0,0,0,0.06); }
.evidence-claim { font-size: 14px; line-height: 1.6; color: var(--text-primary); font-weight: 500; }
.evidence-meta { display: flex; align-items: center; justify-content: space-between; gap: 10px; }
.evidence-confidence { font-size: 11px; font-weight: 700; padding: 3px 10px; border-radius: 100px; text-transform: uppercase; letter-spacing: 0.5px; }
.confidence-high { background: rgba(52,211,153,0.12); color: #34d399; }
.confidence-medium { background: rgba(245,158,11,0.12); color: #f59e0b; }
.confidence-low { background: rgba(239,68,68,0.12); color: #ef4444; }
.evidence-sources { font-size: 12px; color: var(--text-secondary); font-weight: 500; }
@media (max-width: 640px) { .evidence-grid { grid-template-columns: 1fr; } }`,
  js: "",
  schema: { findings: { type: "array", items: { type: "object", properties: { claim: { type: "string" }, confidence: { type: "string" }, sources: { type: "number" } } } } },
});
