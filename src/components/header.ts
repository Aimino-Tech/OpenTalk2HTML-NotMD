import { registerComponent } from "./registry.js";

registerComponent({
  name: "header",
  description: "Page header with logo, navigation links, and optional actions",
  category: "layout",
  html_template: `<header class="page-header">
  <div class="header-brand">
    {{? it.logo }}<span class="header-logo">{{=it.logo}}</span>{{?}}
    {{? it.brand }}<span class="header-brand-text">{{=it.brand}}</span>{{?}}
  </div>
  {{? it.nav }}
  <nav class="header-nav">
    {{~it.nav :link}}
    <a href="{{=link.url || '#'}}" class="header-link">{{=link.label}}</a>
    {{~}}
  </nav>
  {{?}}
  {{? it.actions }}<div class="header-actions">{{=it.actions}}</div>{{?}}
</header>`,
  css: `.page-header { display: flex; align-items: center; justify-content: space-between; padding: 16px 0; border-bottom: 1px solid var(--border); margin-bottom: 24px; gap: 24px; flex-wrap: wrap; }
.header-brand { display: flex; align-items: center; gap: 10px; font-weight: 700; font-size: 18px; }
.header-logo { font-size: 24px; }
.header-nav { display: flex; gap: 8px; flex-wrap: wrap; }
.header-link { padding: 6px 12px; border-radius: 6px; color: var(--text-secondary); text-decoration: none; font-size: 14px; font-weight: 500; transition: all 0.2s; }
.header-link:hover { color: var(--text-primary); background: var(--bg-card); }
.header-actions { display: flex; gap: 8px; }`,
  js: "",
  schema: { logo: { type: "string" }, brand: { type: "string" }, nav: { type: "array", items: { type: "object", properties: { label: { type: "string" }, url: { type: "string" } } } }, actions: { type: "string" } },
});
