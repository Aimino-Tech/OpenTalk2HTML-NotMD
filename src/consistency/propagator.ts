import * as parse5 from "parse5";
import { readFile, atomicWrite } from "../writer.js";
import { formatHtml } from "../formatter.js";
import {
  extractEntities,
  findEntityElement,
  getAttr,
  setTextContent,
  getNumericValue,
  findEffectiveEntityElement,
} from "./entity-store.js";
import { buildDependencyGraph, bfsCascade, topologicalSort, getDependencies } from "./dependency-graph.js";
import { loadManifest, saveManifest, createManifestFromEntities } from "./manifest.js";
import { findElementBySelector } from "./selector.js";
import type { PropagateEditInput, PropagateEditOutput, AffectedSection } from "./types.js";

function toValue(v: string): string | number {
  const n = Number(v);
  return !Number.isNaN(n) && v.trim() !== "" ? n : v;
}

export function propagateEdit(input: PropagateEditInput): PropagateEditOutput {
  const start = performance.now();

  const html = readFile(input.file_path);
  const document = parse5.parse(html, { sourceCodeLocationInfo: true });

  const entities = extractEntities(document);
  const graph = buildDependencyGraph(document);

  let manifest = loadManifest(input.file_path);
  if (!manifest) {
    manifest = createManifestFromEntities(entities);
    saveManifest(input.file_path, manifest);
  }

  const matchedElement = findElementBySelector(document as never, input.section_selector);
  if (!matchedElement) {
    throw new Error(`No element found matching selector: ${input.section_selector}`);
  }

  const targetElement = findEffectiveEntityElement(matchedElement) || matchedElement;
  const entityId = getAttr(targetElement, "data-entity");
  const affectedSections: AffectedSection[] = [];
  const changedSectionSelector = entityId
    ? `#${entities.find((e) => e.id === entityId)?.sectionId || ""}`
    : input.section_selector;

  affectedSections.push({
    selector: changedSectionSelector || input.section_selector,
    old_value: toValue(input.old_value),
    new_value: toValue(input.new_value),
    update_applied: true,
  });

  setTextContent(targetElement, input.new_value);

  if (entityId) {
    const originalValue = manifest.entity_values[entityId] ?? input.old_value;
    const originalNum = getNumericValue(originalValue);
    const newNum = getNumericValue(input.new_value);

    const cascadeIds = bfsCascade(entityId, graph, 3);
    const orderedIds = topologicalSort([entityId, ...cascadeIds], graph);

    const valueOverrides = new Map<string, string>();
    valueOverrides.set(entityId, input.new_value);

    for (const eid of orderedIds) {
      if (eid === entityId) continue;
      if (!cascadeIds.includes(eid)) continue;

      const entity = entities.find((e) => e.id === eid);
      if (!entity) continue;

      const deps = getDependencies(graph, eid);
      const oldEntityValue = manifest.entity_values[eid] ?? entity.value;

      let newValue = entity.value;
      for (const dep of deps) {
        const depNewValue = valueOverrides.get(dep);
        if (depNewValue !== undefined && originalNum !== null && newNum !== null) {
          const depOldValue = manifest.entity_values[dep];
          const depOldNum = getNumericValue(depOldValue ?? "");
          if (depOldNum !== null && depOldNum !== 0) {
            const ratio = getNumericValue(depNewValue)! / depOldNum;
            const entityOldNum = getNumericValue(oldEntityValue);
            if (entityOldNum !== null) {
              newValue = String(Math.round(entityOldNum * ratio));
            }
          }
        }
        break;
      }

      valueOverrides.set(eid, newValue);

      const element = findEntityElement(document, eid);
      if (element) {
        setTextContent(element, newValue);
      }

      affectedSections.push({
        selector: entity.sectionId ? `#${entity.sectionId}` : eid,
        old_value: toValue(oldEntityValue),
        new_value: toValue(newValue),
        update_applied: true,
      });
    }
  }

  const updatedHtml = parse5.serialize(document as never);
  const formatted = formatHtml(updatedHtml);
  atomicWrite(input.file_path, formatted);

  const updatedManifest = loadManifest(input.file_path) || { entity_values: {} };
  for (const section of affectedSections) {
    const eid = entities.find((e) => `#${e.sectionId}` === section.selector)?.id;
    if (eid) {
      updatedManifest.entity_values[eid] = String(section.new_value);
    }
  }
  saveManifest(input.file_path, updatedManifest);

  const allSectionSelectors = new Set<string>();
  for (const e of entities) {
    if (e.sectionId) allSectionSelectors.add(`#${e.sectionId}`);
  }

  const end = performance.now();

  return {
    changed_sections: affectedSections.length,
    affected_sections: affectedSections,
    unchanged_sections: allSectionSelectors.size - affectedSections.length,
    propagation_time_ms: Math.round(end - start),
  };
}
