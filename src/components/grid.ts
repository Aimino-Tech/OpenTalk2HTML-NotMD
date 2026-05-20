import { registerComponent } from "./registry.js";

registerComponent({
  name: "grid",
  description: "Generic responsive grid container for child components",
  category: "layout",
  html_template: `<div class="grid-component" style="--grid-cols:{{=it.columns || 2}}; --grid-gap:{{=it.gap || 16}}px">
  {{~it.children :child}}
  <div class="grid-cell">{{=child}}</div>
  {{~}}
</div>`,
  css: `.grid-component { display: grid; grid-template-columns: repeat(var(--grid-cols, 2), 1fr); gap: var(--grid-gap, 16px); margin: 1em 0; }
@media (max-width: 768px) { .grid-component { grid-template-columns: 1fr; } }
.grid-cell { min-width: 0; }`,
  js: "",
  schema: { columns: { type: "number" }, gap: { type: "number" } },
});
