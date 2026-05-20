import { registerComponent } from "./registry.js";

registerComponent({
  name: "data-table",
  description: "Styled data table with headers, rows, and optional caption",
  category: "data",
  html_template: `<div class="table-wrap">
  <table class="data-table">
    {{? it.caption }}<caption>{{=it.caption}}</caption>{{?}}
    {{? it.headers }}
    <thead>
      <tr>{{~it.headers :h}}<th>{{=h}}</th>{{~}}</tr>
    </thead>
    {{?}}
    <tbody>
      {{~it.rows :row}}
      <tr>{{~row :cell}}<td>{{=cell}}</td>{{~}}</tr>
      {{~}}
    </tbody>
  </table>
</div>`,
  css: `.table-wrap { overflow-x: auto; border: 1px solid var(--border); border-radius: 8px; margin: 1em 0; }
.data-table { width: 100%; border-collapse: collapse; font-size: 14px; }
.data-table th { background: var(--bg-elevated, var(--bg-card)); padding: 10px 14px; text-align: left; font-weight: 600; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; color: var(--text-secondary); border-bottom: 1px solid var(--border); }
.data-table td { padding: 10px 14px; border-bottom: 1px solid var(--border); color: var(--text-secondary); }
.data-table tr:last-child td { border-bottom: none; }
.data-table tr:hover td { background: var(--bg-card-hover, rgba(255,255,255,0.02)); }
.data-table caption { padding: 8px 14px; text-align: left; font-weight: 600; color: var(--text-primary); caption-side: top; }`,
  js: "",
  schema: { headers: { type: "array", items: { type: "string" } }, rows: { type: "array", items: { type: "array", items: { type: "string" } } }, caption: { type: "string" } },
});
