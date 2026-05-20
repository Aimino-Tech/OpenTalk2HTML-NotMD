import { registerComponent } from "./registry.js";

registerComponent({
  name: "tabs",
  description: "Tabbed container for switching between content panels",
  category: "interactive",
  html_template: `<div class="tabs-component">
  <div class="tabs-header" role="tablist">
    {{~it.items :item:idx}}
    <button class="tab-btn{{?idx===0}} active{{?}}" data-tab="{{=idx}}" role="tab">{{=item.title}}</button>
    {{~}}
  </div>
  {{~it.items :item:idx}}
  <div class="tab-panel{{?idx===0}} active{{?}}" data-panel="{{=idx}}" role="tabpanel">{{=item.content}}</div>
  {{~}}
</div>`,
  css: `.tabs-component { margin: 1em 0; }
.tabs-header { display: flex; gap: 2px; background: var(--bg-secondary); border-radius: 8px; padding: 4px; border: 1px solid var(--border); }
.tab-btn { padding: 8px 16px; border-radius: 6px; border: none; background: transparent; color: var(--text-secondary); cursor: pointer; font-size: 13px; font-weight: 500; font-family: inherit; transition: all 0.2s; }
.tab-btn:hover { color: var(--text-primary); }
.tab-btn.active { background: var(--bg-elevated, var(--bg-card)); color: var(--accent); }
.tab-panel { display: none; padding: 16px 0; }
.tab-panel.active { display: block; }`,
  js: `document.querySelectorAll('.tabs-component').forEach(tabs => {
  tabs.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const idx = btn.dataset.tab;
      tabs.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      tabs.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
      btn.classList.add('active');
      tabs.querySelector('.tab-panel[data-panel="'+idx+'"]')?.classList.add('active');
    });
  });
});`,
  schema: { items: { type: "array", items: { type: "object", properties: { title: { type: "string" }, content: { type: "string" } } } } },
});
