import { registerComponent } from "./registry.js";

registerComponent({
  name: "valuation-chart",
  description: "Valuation summary with DCF fair value, comparable companies table, and range indicator",
  category: "data",
  html_template: `<div class="valuation-chart">
  {{? it.dcf }}
  <div class="dcf-card">
    <div class="dcf-header">DCF Valuation</div>
    <div class="dcf-value">{{=it.dcf.fair_value}}</div>
    <div class="dcf-meta">
      <span class="dcf-wacc">WACC: {{=it.dcf.wacc}}%</span>
      {{? it.dcf.upside !== undefined }}
      <span class="dcf-upside {{=it.dcf.upside >= 0 ? 'upside-positive' : 'upside-negative'}}">
        {{=it.dcf.upside >= 0 ? '+' : ''}}{{=it.dcf.upside}}%
      </span>
      {{?}}
    </div>
    {{? it.dcf.range_low !== undefined && it.dcf.range_high !== undefined }}
    <div class="valuation-range">
      <span class="range-label range-low">{{=it.dcf.range_low}}</span>
      <div class="range-bar">
        <div class="range-fill" style="left:{{=it.dcf.range_position || 50}}%"></div>
      </div>
      <span class="range-label range-high">{{=it.dcf.range_high}}</span>
    </div>
    {{?}}
  </div>
  {{?}}
  {{? it.comps && it.comps.length }}
  <div class="comps-section">
    <div class="comps-header">Comparable Companies</div>
    <table class="comps-table">
      <thead>
        <tr>
          <th>Company</th>
          {{? it.comps[0].ev_ebitda !== undefined }}<th>EV/EBITDA</th>{{?}}
          {{? it.comps[0].pe_ratio !== undefined }}<th>P/E</th>{{?}}
        </tr>
      </thead>
      <tbody>
        {{~it.comps :comp}}
        <tr>
          <td class="comp-name">{{=comp.company}}</td>
          {{? comp.ev_ebitda !== undefined }}<td class="comp-num">{{=comp.ev_ebitda.toFixed(1)}}x</td>{{?}}
          {{? comp.pe_ratio !== undefined }}<td class="comp-num">{{=comp.pe_ratio.toFixed(1)}}x</td>{{?}}
        </tr>
        {{~}}
      </tbody>
    </table>
  </div>
  {{?}}
</div>`,
  css: `.valuation-chart { margin: 1em 0; display: flex; flex-direction: column; gap: 20px; }
.dcf-card { background: var(--bg-card); border: 1px solid var(--border); border-radius: 12px; padding: 24px; text-align: center; }
.dcf-header { font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; color: var(--text-secondary); margin-bottom: 8px; }
.dcf-value { font-size: 42px; font-weight: 900; letter-spacing: -2px; color: var(--accent); line-height: 1.1; margin-bottom: 8px; }
.dcf-meta { display: flex; justify-content: center; align-items: center; gap: 16px; font-size: 14px; }
.dcf-wacc { color: var(--text-secondary); font-weight: 500; }
.dcf-upside { font-weight: 700; padding: 2px 10px; border-radius: 100px; font-size: 14px; }
.upside-positive { color: #34d399; background: rgba(52,211,153,0.1); }
.upside-negative { color: #f87171; background: rgba(248,113,113,0.1); }
.valuation-range { display: flex; align-items: center; gap: 12px; margin-top: 16px; }
.range-label { font-size: 12px; font-weight: 600; color: var(--text-secondary); white-space: nowrap; }
.range-bar { flex: 1; height: 6px; background: var(--bg-primary); border-radius: 4px; position: relative; }
.range-fill { position: absolute; top: -4px; width: 14px; height: 14px; border-radius: 50%; background: var(--accent); transform: translateX(-50%); border: 2px solid var(--bg-card); box-shadow: 0 1px 4px rgba(0,0,0,0.15); }
.comps-section { border: 1px solid var(--border); border-radius: 8px; overflow: hidden; }
.comps-header { padding: 12px 16px; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; color: var(--text-secondary); background: var(--bg-elevated, var(--bg-card)); border-bottom: 1px solid var(--border); }
.comps-table { width: 100%; border-collapse: collapse; font-size: 14px; }
.comps-table th { padding: 10px 14px; text-align: left; font-weight: 600; font-size: 11px; text-transform: uppercase; letter-spacing: 0.4px; color: var(--text-secondary); background: var(--bg-card); border-bottom: 1px solid var(--border); }
.comps-table td { padding: 10px 14px; border-bottom: 1px solid var(--border); color: var(--text-primary); }
.comps-table tr:last-child td { border-bottom: none; }
.comp-name { font-weight: 600; }
.comp-num { font-family: 'SF Mono', 'Fira Code', monospace; text-align: right; font-weight: 600; }`,
  js: "",
  schema: { dcf: { type: "object", properties: { fair_value: { type: "string" }, wacc: { type: "number" }, upside: { type: "number" }, range_low: { type: "string" }, range_high: { type: "string" }, range_position: { type: "number" } } }, comps: { type: "array", items: { type: "object", properties: { company: { type: "string" }, ev_ebitda: { type: "number" }, pe_ratio: { type: "number" } } } } },
});
