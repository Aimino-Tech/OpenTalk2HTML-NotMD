import { registerComponent } from "./registry.js";

registerComponent({
  name: "stats-grid",
  description: "Grid of statistics with numbers, labels, and optional trends",
  category: "data",
  html_template: `<div class="stats-grid" style="--stat-cols:{{=it.columns || 4}}">
  {{~it.stats :stat}}
  <div class="stat-card">
    {{? stat.icon }}<div class="stat-icon">{{=stat.icon}}</div>{{?}}
    <div class="stat-value">{{=stat.value}}</div>
    <div class="stat-label">{{=stat.label}}</div>
    {{? stat.trend }}<div class="stat-trend trend-{{=stat.trend > 0 ? 'up' : 'down'}}">{{=stat.trend > 0 ? '↑' : '↓'}} {{=Math.abs(stat.trend)}}%</div>{{?}}
  </div>
  {{~}}
</div>`,
  css: `.stats-grid { display: grid; grid-template-columns: repeat(var(--stat-cols, 4), 1fr); gap: 12px; margin: 1em 0; }
@media (max-width: 768px) { .stats-grid { grid-template-columns: repeat(2, 1fr); } }
@media (max-width: 480px) { .stats-grid { grid-template-columns: 1fr; } }
.stat-card { background: var(--bg-card); border: 1px solid var(--border); border-radius: 12px; padding: 20px; text-align: center; }
.stat-icon { font-size: 24px; margin-bottom: 8px; }
.stat-value { font-size: 28px; font-weight: 800; letter-spacing: -1px; color: var(--accent); }
.stat-label { font-size: 13px; color: var(--text-secondary); margin-top: 4px; font-weight: 500; }
.stat-trend { font-size: 12px; margin-top: 8px; font-weight: 600; }
.trend-up { color: #34d399; }
.trend-down { color: #f87171; }`,
  js: "",
  schema: { columns: { type: "number" }, stats: { type: "array", items: { type: "object", properties: { icon: { type: "string" }, value: { type: "string" }, label: { type: "string" }, trend: { type: "number" } } } } },
});
