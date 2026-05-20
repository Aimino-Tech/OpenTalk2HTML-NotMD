import { registerComponent } from "./registry.js";

registerComponent({
  name: "risk-matrix",
  description: "Risk assessment heatmap table showing probability vs impact grid with mitigation",
  category: "data",
  html_template: `<div class="risk-matrix">
  <table class="risk-table">
    <thead>
      <tr>
        <th>Risk Factor</th>
        <th>Probability</th>
        <th>Impact</th>
        <th>Risk Score</th>
        <th>Severity</th>
        {{? it.risks[0] && it.risks[0].mitigation }}<th>Mitigation</th>{{?}}
      </tr>
    </thead>
    <tbody>
      {{~it.risks :risk}}
      {{? var score = (risk.probability * risk.impact); }}
      {{? var sev = score >= 0.6 ? 'critical' : (score >= 0.3 ? 'high' : (score >= 0.15 ? 'medium' : 'low')); }}
      <tr class="risk-row severity-{{=sev}}">
        <td class="risk-factor">{{=risk.factor}}</td>
        <td class="risk-bar-cell"><div class="risk-bar"><div class="risk-bar-fill" style="width:{{=Math.round(risk.probability * 100)}}%"></div></div><span class="risk-pct">{{=Math.round(risk.probability * 100)}}%</span></td>
        <td class="risk-bar-cell"><div class="risk-bar"><div class="risk-bar-fill" style="width:{{=Math.round(risk.impact * 100)}}%"></div></div><span class="risk-pct">{{=Math.round(risk.impact * 100)}}%</span></td>
        <td class="risk-score"><span class="risk-score-val">{{=score.toFixed(2)}}</span></td>
        <td class="risk-sev"><span class="severity-dot dot-{{=sev}}"></span><span class="severity-label">{{=sev}}</span></td>
        {{? risk.mitigation }}<td class="risk-mitigation">{{=risk.mitigation}}</td>{{?}}
      </tr>
      {{~}}
    </tbody>
  </table>
</div>`,
  css: `.risk-matrix { overflow-x: auto; border: 1px solid var(--border); border-radius: 8px; margin: 1em 0; }
.risk-table { width: 100%; border-collapse: collapse; font-size: 13px; }
.risk-table th { background: var(--bg-elevated, var(--bg-card)); padding: 10px 12px; text-align: left; font-weight: 600; font-size: 11px; text-transform: uppercase; letter-spacing: 0.4px; color: var(--text-secondary); border-bottom: 1px solid var(--border); }
.risk-table td { padding: 10px 12px; border-bottom: 1px solid var(--border); color: var(--text-primary); }
.risk-table tr:last-child td { border-bottom: none; }
.risk-factor { font-weight: 600; }
.risk-bar-cell { display: flex; align-items: center; gap: 8px; }
.risk-bar { flex: 1; height: 6px; background: var(--bg-primary); border-radius: 4px; overflow: hidden; min-width: 60px; }
.risk-bar-fill { height: 100%; border-radius: 4px; background: var(--accent); transition: width 0.3s; }
.risk-pct { font-size: 12px; font-weight: 600; color: var(--text-secondary); min-width: 36px; text-align: right; }
.risk-score { text-align: center; }
.risk-score-val { font-weight: 700; font-family: 'SF Mono', 'Fira Code', monospace; }
.risk-sev { display: flex; align-items: center; gap: 6px; }
.severity-dot { width: 10px; height: 10px; border-radius: 50%; display: inline-block; }
.dot-critical { background: #ef4444; }
.dot-high { background: #f97316; }
.dot-medium { background: #eab308; }
.dot-low { background: #22c55e; }
.severity-label { font-size: 12px; font-weight: 600; text-transform: capitalize; }
.severity-critical .risk-bar-fill { background: #ef4444; }
.severity-high .risk-bar-fill { background: #f97316; }
.severity-medium .risk-bar-fill { background: #eab308; }
.severity-low .risk-bar-fill { background: #22c55e; }
.severity-critical .risk-factor { color: #ef4444; }
.severity-high .risk-factor { color: #f97316; }
.risk-mitigation { font-size: 12px; color: var(--text-secondary); max-width: 240px; line-height: 1.5; }
@media (max-width: 640px) { .risk-table { font-size: 12px; } .risk-table th, .risk-table td { padding: 8px 6px; } }`,
  js: "",
  schema: { risks: { type: "array", items: { type: "object", properties: { factor: { type: "string" }, probability: { type: "number" }, impact: { type: "number" }, mitigation: { type: "string" } } } } },
});
