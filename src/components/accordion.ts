import { registerComponent } from "./registry.js";

registerComponent({
  name: "accordion",
  description: "Expandable accordion panels for progressive disclosure",
  category: "interactive",
  html_template: `<div class="accordion-component">
  {{~it.items :item:idx}}
  <div class="accordion-item{{?idx===0}} open{{?}}">
    <div class="accordion-trigger" role="button" tabindex="0">
      <span>{{=item.title}}</span>
      <span class="accordion-arrow">&#9660;</span>
    </div>
    <div class="accordion-body">{{=item.content}}</div>
  </div>
  {{~}}
</div>`,
  css: `.accordion-component { border: 1px solid var(--border); border-radius: 8px; overflow: hidden; margin: 1em 0; }
.accordion-item { border-bottom: 1px solid var(--border); }
.accordion-item:last-child { border-bottom: none; }
.accordion-trigger { display: flex; justify-content: space-between; align-items: center; padding: 14px 16px; background: var(--bg-card); cursor: pointer; user-select: none; gap: 12px; font-weight: 600; font-size: 14px; transition: background 0.2s; }
.accordion-trigger:hover { background: var(--bg-card-hover, var(--bg-secondary)); }
.accordion-arrow { transition: transform 0.3s; font-size: 10px; color: var(--text-tertiary); }
.accordion-item.open .accordion-arrow { transform: rotate(180deg); }
.accordion-body { max-height: 0; overflow: hidden; transition: max-height 0.3s ease, padding 0.3s ease; padding: 0 16px; background: var(--bg-secondary); }
.accordion-item.open .accordion-body { max-height: 2000px; padding: 16px; }`,
  js: `document.querySelectorAll('.accordion-trigger').forEach(el => {
  const toggle = () => {
    const item = el.closest('.accordion-item');
    item.classList.toggle('open');
  };
  el.addEventListener('click', toggle);
  el.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(); } });
});`,
  schema: { items: { type: "array", items: { type: "object", properties: { title: { type: "string" }, content: { type: "string" } } } } },
});
