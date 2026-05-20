import { registerComponent } from "./registry.js";

registerComponent({
  name: "footer",
  description: "Page footer with copyright, links, and optional social icons",
  category: "layout",
  html_template: `<footer class="page-footer">
  <div class="footer-content">
    {{? it.copyright }}<span class="footer-copy">{{=it.copyright}}</span>{{?}}
    {{? it.links }}
    <nav class="footer-links">
      {{~it.links :link}}
      <a href="{{=link.url || '#'}}" class="footer-link">{{=link.label}}</a>
      {{~}}
    </nav>
    {{?}}
  </div>
  {{? it.social }}<div class="footer-social">{{=it.social}}</div>{{?}}
</footer>`,
  css: `.page-footer { margin-top: 48px; padding: 24px 0; border-top: 1px solid var(--border); }
.footer-content { display: flex; justify-content: space-between; align-items: center; gap: 16px; flex-wrap: wrap; }
.footer-copy { font-size: 13px; color: var(--text-tertiary); }
.footer-links { display: flex; gap: 16px; }
.footer-link { font-size: 13px; color: var(--text-tertiary); text-decoration: none; transition: color 0.2s; }
.footer-link:hover { color: var(--accent); }
.footer-social { margin-top: 12px; }`,
  js: "",
  schema: { copyright: { type: "string" }, links: { type: "array", items: { type: "object", properties: { label: { type: "string" }, url: { type: "string" } } } }, social: { type: "string" } },
});
