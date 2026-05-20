import { registerComponent } from "./registry.js";

registerComponent({
  name: "hero",
  description: "Page hero section with title, subtitle, and optional call-to-action",
  category: "utility",
  html_template: `<div class="hero-section">
  {{? it.badge }}<div class="hero-badge">{{=it.badge}}</div>{{?}}
  <h1 class="hero-title">{{=it.title}}</h1>
  {{? it.subtitle }}<p class="hero-subtitle">{{=it.subtitle}}</p>{{?}}
  {{? it.cta }}<div class="hero-cta">{{=it.cta}}</div>{{?}}
  {{? it.children }}<div class="hero-children">{{~it.children :child}}{{=child}}{{~}}</div>{{?}}
</div>`,
  css: `.hero-section { padding: 60px 0 40px; position: relative; }
.hero-badge { display: inline-flex; align-items: center; gap: 6px; padding: 6px 14px; border-radius: 100px; background: rgba(var(--accent-rgb, 245,158,11), 0.1); color: var(--accent); font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 16px; border: 1px solid rgba(var(--accent-rgb, 245,158,11), 0.15); }
.hero-title { font-size: clamp(32px, 5vw, 56px); font-weight: 900; letter-spacing: -2px; line-height: 1.05; margin-bottom: 12px; }
.hero-subtitle { font-size: 18px; color: var(--text-secondary); max-width: 640px; line-height: 1.7; margin-bottom: 24px; }
.hero-cta { margin-top: 16px; }
.hero-children { margin-top: 24px; }`,
  js: "",
  schema: { badge: { type: "string" }, title: { type: "string" }, subtitle: { type: "string" }, cta: { type: "string" } },
});
