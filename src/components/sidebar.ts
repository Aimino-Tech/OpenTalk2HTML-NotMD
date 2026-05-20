import { registerComponent } from "./registry.js";

registerComponent({
  name: "sidebar",
  description: "Side panel for navigation, table of contents, or supplementary content",
  category: "layout",
  html_template: `<div class="sidebar-component">
  {{~it.sections :section}}
  <div class="sidebar-section">
    {{? section.title }}<h4 class="sidebar-section-title">{{=section.title}}</h4>{{?}}
    {{? section.items }}
    <ul class="sidebar-items">
      {{~section.items :item}}
      <li><a href="{{=item.url || '#'}}" class="sidebar-link">{{=item.label}}</a></li>
      {{~}}
    </ul>
    {{?}}
    {{? section.content }}<div class="sidebar-content">{{=section.content}}</div>{{?}}
  </div>
  {{~}}
</div>`,
  css: `.sidebar-component { padding: 16px; background: var(--bg-card); border: 1px solid var(--border); border-radius: 12px; }
.sidebar-section { margin-bottom: 20px; }
.sidebar-section:last-child { margin-bottom: 0; }
.sidebar-section-title { font-size: 12px; text-transform: uppercase; letter-spacing: 1px; color: var(--text-tertiary); margin-bottom: 8px; font-weight: 600; }
.sidebar-items { list-style: none; padding: 0; margin: 0; }
.sidebar-link { display: block; padding: 6px 0; font-size: 14px; color: var(--text-secondary); text-decoration: none; transition: color 0.2s; }
.sidebar-link:hover { color: var(--accent); }
.sidebar-content { font-size: 14px; color: var(--text-secondary); line-height: 1.6; }`,
  js: "",
  schema: { sections: { type: "array", items: { type: "object", properties: { title: { type: "string" }, items: { type: "array", items: { type: "object", properties: { label: { type: "string" }, url: { type: "string" } } } }, content: { type: "string" } } } } },
});
