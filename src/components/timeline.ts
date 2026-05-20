import { registerComponent } from "./registry.js";

registerComponent({
  name: "timeline",
  description: "Vertical timeline for chronological progression of events",
  category: "data",
  html_template: `<div class="timeline-component">
  {{~it.events :event}}
  <div class="timeline-event">
    <div class="timeline-marker"></div>
    <div class="timeline-card">
      {{? event.date }}<div class="timeline-date">{{=event.date}}</div>{{?}}
      {{? event.title }}<h4 class="timeline-title">{{=event.title}}</h4>{{?}}
      {{? event.content }}<p class="timeline-content">{{=event.content}}</p>{{?}}
    </div>
  </div>
  {{~}}
</div>`,
  css: `.timeline-component { position: relative; padding-left: 32px; margin: 1em 0; }
.timeline-component::before { content: ''; position: absolute; left: 11px; top: 8px; bottom: 8px; width: 2px; background: linear-gradient(to bottom, var(--accent), transparent); }
.timeline-event { position: relative; margin-bottom: 24px; }
.timeline-marker { position: absolute; left: -26px; top: 6px; width: 12px; height: 12px; border-radius: 50%; background: var(--accent); border: 3px solid var(--bg-primary); }
.timeline-card { background: var(--bg-card); border: 1px solid var(--border); border-radius: 8px; padding: 16px; }
.timeline-date { font-size: 12px; color: var(--accent); font-weight: 600; margin-bottom: 4px; text-transform: uppercase; letter-spacing: 0.5px; }
.timeline-title { font-size: 16px; font-weight: 700; margin-bottom: 6px; }
.timeline-content { font-size: 14px; color: var(--text-secondary); line-height: 1.6; }`,
  js: "",
  schema: { events: { type: "array", items: { type: "object", properties: { date: { type: "string" }, title: { type: "string" }, content: { type: "string" } } } } },
});
