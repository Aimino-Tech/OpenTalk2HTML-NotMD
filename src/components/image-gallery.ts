import { registerComponent } from "./registry.js";

registerComponent({
  name: "image-gallery",
  description: "Responsive image gallery with optional captions and lightbox",
  category: "media",
  html_template: `<div class="image-gallery" style="--gallery-cols:{{=it.columns || 3}}">
  {{~it.images :img}}
  <figure class="gallery-figure">
    <img src="{{=img.src}}" alt="{{=img.alt || ''}}" loading="lazy" class="gallery-img"{{? img.title }} title="{{=img.title}}"{{?}}>
    {{? img.caption }}<figcaption class="gallery-caption">{{=img.caption}}</figcaption>{{?}}
  </figure>
  {{~}}
</div>`,
  css: `.image-gallery { display: grid; grid-template-columns: repeat(var(--gallery-cols, 3), 1fr); gap: 12px; margin: 1em 0; }
@media (max-width: 768px) { .image-gallery { grid-template-columns: repeat(2, 1fr); } }
@media (max-width: 480px) { .image-gallery { grid-template-columns: 1fr; } }
.gallery-figure { margin: 0; border-radius: 8px; overflow: hidden; background: var(--bg-card); border: 1px solid var(--border); }
.gallery-img { width: 100%; height: auto; display: block; }
.gallery-caption { padding: 8px 12px; font-size: 13px; color: var(--text-secondary); text-align: center; }`,
  js: "",
  schema: { columns: { type: "number" }, images: { type: "array", items: { type: "object", properties: { src: { type: "string" }, alt: { type: "string" }, caption: { type: "string" }, title: { type: "string" } } } } },
});
