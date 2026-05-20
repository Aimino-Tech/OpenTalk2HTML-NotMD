import { registerComponent } from "./registry.js";

registerComponent({
  name: "card-deck",
  description: "Responsive grid of cards with title, content, and optional footer",
  category: "layout",
  html_template: `<div class="card-deck" style="--deck-cols:{{=it.columns || 3}}">
  {{~it.cards :card}}
  <div class="deck-card">
    {{? card.icon }}<div class="deck-icon">{{=card.icon}}</div>{{?}}
    {{? card.title }}<h3 class="deck-title">{{=card.title}}</h3>{{?}}
    {{? card.content }}<p class="deck-content">{{=card.content}}</p>{{?}}
    {{? card.footer }}<div class="deck-footer">{{=card.footer}}</div>{{?}}
  </div>
  {{~}}
</div>`,
  css: `.card-deck { display: grid; grid-template-columns: repeat(var(--deck-cols, 3), 1fr); gap: 16px; margin: 1em 0; }
@media (max-width: 768px) { .card-deck { grid-template-columns: 1fr; } }
.deck-card { background: var(--bg-card); border: 1px solid var(--border); border-radius: 12px; padding: 24px; transition: all 0.3s; }
.deck-card:hover { border-color: var(--border-active, var(--accent)); transform: translateY(-2px); box-shadow: 0 4px 20px rgba(0,0,0,0.2); }
.deck-icon { font-size: 28px; margin-bottom: 12px; }
.deck-title { font-size: 16px; font-weight: 700; margin-bottom: 8px; letter-spacing: -0.3px; }
.deck-content { font-size: 14px; color: var(--text-secondary); line-height: 1.6; }
.deck-footer { margin-top: 12px; padding-top: 12px; border-top: 1px solid var(--border); font-size: 13px; color: var(--text-tertiary); }`,
  js: "",
  schema: { columns: { type: "number" }, cards: { type: "array", items: { type: "object", properties: { icon: { type: "string" }, title: { type: "string" }, content: { type: "string" }, footer: { type: "string" } } } } },
});
