import { registerComponent } from "./registry.js";

registerComponent({
  name: "prisma-flow",
  description: "PRISMA 2020 flow diagram showing literature screening process",
  category: "data",
  html_template: `<div class="prisma-flow">
  <div class="prisma-step">
    <div class="prisma-box">Records identified<br><strong>{{=it.identified || 0}}</strong></div>
  </div>
  <div class="prisma-arrow">&#8593;</div>
  <div class="prisma-step prisma-step-removed">
    <div class="prisma-box prisma-box-removed">Duplicates removed<br><strong>{{=it.duplicates_removed || 0}}</strong></div>
  </div>
  <div class="prisma-arrow">&#8593;</div>
  <div class="prisma-step">
    <div class="prisma-box">Records screened<br><strong>{{=it.screened || 0}}</strong></div>
  </div>
  <div class="prisma-split">
    <div class="prisma-split-branch">
      <div class="prisma-arrow prisma-arrow-right">&#8594;</div>
      <div class="prisma-step prisma-step-removed">
        <div class="prisma-box prisma-box-removed">Excluded (title/abstract)<br><strong>{{=it.excluded_title_abstract || 0}}</strong></div>
      </div>
    </div>
    <div class="prisma-split-branch">
      <div class="prisma-step">
        <div class="prisma-box">Full-text assessed<br><strong>{{=it.full_text || 0}}</strong></div>
      </div>
      <div class="prisma-split">
        <div class="prisma-split-branch">
          <div class="prisma-arrow prisma-arrow-right">&#8594;</div>
          <div class="prisma-step prisma-step-removed">
            <div class="prisma-box prisma-box-removed">Excluded (full text)<br><strong>{{=it.excluded_full_text || 0}}</strong></div>
          </div>
        </div>
        <div class="prisma-split-branch">
          <div class="prisma-arrow prisma-arrow-right">&#8594;</div>
          <div class="prisma-step prisma-step-included">
            <div class="prisma-box prisma-box-included">Studies included<br><strong>{{=it.included || 0}}</strong></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>`,
  css: `.prisma-flow { display: flex; flex-direction: column; align-items: center; gap: 4px; margin: 1.5em 0; font-size: 14px; }
.prisma-step { display: flex; justify-content: center; }
.prisma-box { background: var(--bg-card); border: 2px solid var(--border); border-radius: 8px; padding: 10px 24px; text-align: center; min-width: 160px; line-height: 1.6; color: var(--text-primary); font-weight: 500; }
.prisma-box strong { font-size: 18px; font-weight: 800; color: var(--accent); display: block; margin-top: 2px; }
.prisma-box-removed { border-color: #f87171; background: rgba(248,113,113,0.05); }
.prisma-box-removed strong { color: #f87171; }
.prisma-box-included { border-color: #34d399; background: rgba(52,211,153,0.05); }
.prisma-box-included strong { color: #34d399; }
.prisma-arrow { text-align: center; font-size: 18px; color: var(--text-secondary); line-height: 1; padding: 2px 0; }
.prisma-arrow-right { display: inline-block; padding: 0 8px; }
.prisma-split { display: flex; gap: 24px; align-items: flex-start; width: 100%; justify-content: center; }
.prisma-split-branch { display: flex; flex-direction: column; align-items: center; gap: 4px; flex: 1; max-width: 300px; }
@media (max-width: 640px) {
  .prisma-split { flex-direction: column; align-items: center; }
  .prisma-split-branch { max-width: 100%; }
  .prisma-box { min-width: 140px; padding: 8px 16px; }
  .prisma-arrow-right { transform: rotate(90deg); }
}`,
  js: "",
  schema: { identified: { type: "number" }, duplicates_removed: { type: "number" }, screened: { type: "number" }, excluded_title_abstract: { type: "number" }, full_text: { type: "number" }, excluded_full_text: { type: "number" }, included: { type: "number" } },
});
