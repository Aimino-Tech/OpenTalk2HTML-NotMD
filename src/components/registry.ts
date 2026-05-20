import doT from "dot";
import type { ComponentDef, SectionDef } from "../types.js";

type DotRenderFn = (...args: unknown[]) => string;

const componentRegistry = new Map<string, ComponentDef>();
const compiledCache = new Map<string, DotRenderFn>();

export function registerComponent(def: ComponentDef): void {
  componentRegistry.set(def.name, def);
}

export function getComponent(name: string): ComponentDef | undefined {
  return componentRegistry.get(name);
}

export function getAllComponents(category?: string): ComponentDef[] {
  const all = Array.from(componentRegistry.values());
  if (category) return all.filter((c) => c.category === category);
  return all;
}

export function getComponentNames(): string[] {
  return Array.from(componentRegistry.keys());
}

export function getComponentSchema(name: string): { name: string; description: string; category: string; schema: Record<string, unknown> } {
  const def = getComponent(name);
  if (!def) throw new Error(`Unknown component: ${name}`);
  return {
    name: def.name,
    description: def.description,
    category: def.category,
    schema: def.schema,
  };
}

function getCompiled(def: ComponentDef): DotRenderFn {
  const cached = compiledCache.get(def.name);
  if (cached) return cached;
  const fn = doT.template(def.html_template);
  compiledCache.set(def.name, fn);
  return fn;
}

export function renderComponent(section: SectionDef): string {
  const def = getComponent(section.component);
  if (!def) {
    return `<div class="unknown-component" data-component="${section.component}">${section.props?.content || ""}</div>`;
  }
  const fn = getCompiled(def);
  const data: Record<string, unknown> = { ...section.props };
  if (section.children) {
    data.children = section.children.map(renderComponent);
  }
  return fn(data);
}

export function collectComponentCss(sections: SectionDef[]): string {
  const seen = new Set<string>();
  const parts: string[] = [];
  function walk(list: SectionDef[]) {
    for (const s of list) {
      if (seen.has(s.component)) continue;
      const def = getComponent(s.component);
      if (def?.css) {
        parts.push(def.css);
        seen.add(s.component);
      }
      if (s.children) walk(s.children);
    }
  }
  walk(sections);
  return parts.join("\n");
}

export function collectComponentJs(sections: SectionDef[]): string {
  const seen = new Set<string>();
  const parts: string[] = [];
  function walk(list: SectionDef[]) {
    for (const s of list) {
      if (seen.has(s.component)) continue;
      const def = getComponent(s.component);
      if (def?.js) {
        parts.push(def.js);
        seen.add(s.component);
      }
      if (s.children) walk(s.children);
    }
  }
  walk(sections);
  return parts.join("\n");
}
