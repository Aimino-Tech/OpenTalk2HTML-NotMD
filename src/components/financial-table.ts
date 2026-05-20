import { registerComponent } from "./registry.js";

registerComponent({
  name: "financial-table",
  description: "Financial data table with section headers, monetary formatting, and YoY change columns",
  category: "data",
  html_template: `<div class="financial-table-wrap">
  <table class="financial-table">
    {{? it.caption }}<caption>{{=it.caption}}</caption>{{?}}
    {{~it.sections :section}}
    {{? section.label }}<thead class="financial-section">
      <tr><th colspan="3">{{=section.label}}</th></tr>
    </thead>{{?}}
    <tbody>
      {{~section.rows :row}}
      <tr>
        <td class="fin-label">{{=row.label}}</td>
        {{~row.values :val}}
        <td class="fin-value">{{=val}}</td>
        {{~}}
        {{~row.changes :chg}}
        <td class="fin-change {{=chg.indexOf('-') >= 0 || chg.indexOf('(') >= 0 ? 'change-negative' : 'change-positive'}}">{{=chg}}</td>
        {{~}}
      </tr>
      {{~}}
    </tbody>
    {{~}}
  </table>
</div>`,
  css: ".financial-table-wrap{overflow-x:auto;border:1px solid var(--border);border-radius:8px;margin:1em 0}.financial-table{width:100%;border-collapse:collapse;font-size:13px}.financial-table caption{padding:10px 14px;text-align:left;font-weight:700;color:var(--text-primary);caption-side:top;border-bottom:1px solid var(--border);background:var(--bg-card)}.financial-section th{background:var(--bg-elevated,var(--bg-card));padding:8px 14px;text-align:left;font-weight:700;font-size:12px;text-transform:uppercase;letter-spacing:.4px;color:var(--accent);border-bottom:1px solid var(--border)}.financial-table td{padding:8px 14px;border-bottom:1px solid var(--border);vertical-align:middle}.financial-table tbody tr:nth-child(even){background:rgba(255,255,255,.02)}.financial-table tbody tr:last-child td{border-bottom:none}.fin-label{font-weight:500;color:var(--text-primary);white-space:nowrap}.fin-value{font-family:'SF Mono','Fira Code',monospace;text-align:right;font-weight:600;color:var(--text-primary);padding-left:20px}.fin-change{font-family:'SF Mono','Fira Code',monospace;text-align:right;font-weight:700;font-size:12px;padding-left:12px}.change-positive{color:#34d399}.change-negative{color:#f87171}",
  js: "",
  schema: { caption: { type: "string" }, sections: { type: "array", items: { type: "object", properties: { label: { type: "string" }, rows: { type: "array", items: { type: "object", properties: { label: { type: "string" }, values: { type: "array", items: { type: "string" } }, changes: { type: "array", items: { type: "string" } } } } } } } } },
});
