import { registerComponent } from "./registry.js";

registerComponent({
  name: "figure",
  description: "Image or diagram with caption and optional attribution",
  category: "media",
  html_template: `<figure class="content-figure">
  {{=it.content}}
  <figcaption class="figure-caption">
    {{=it.caption}}
    {{? it.attribution }}<span class="figure-attribution">— {{=it.attribution}}</span>{{?}}
  </figcaption>
</figure>`,
  css: `.content-figure { margin: 1.5em 0; text-align: center; }
.content-figure img, .content-figure svg { max-width: 100%; height: auto; border-radius: 8px; }
.figure-caption { margin-top: 8px; font-size: 14px; color: var(--text-secondary); font-style: italic; }
.figure-attribution { display: block; font-size: 12px; color: var(--text-tertiary); margin-top: 4px; font-style: normal; }`,
  js: "",
  schema: { content: { type: "string" }, caption: { type: "string" }, attribution: { type: "string" } },
});
