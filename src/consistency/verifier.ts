import * as parse5 from "parse5";
import { readFile } from "../writer.js";
import { extractEntities } from "./entity-store.js";
import { buildDependencyGraph, getDependencies } from "./dependency-graph.js";
import { loadManifest, saveManifest, createManifestFromEntities } from "./manifest.js";
import type { CheckConsistencyInput, CheckConsistencyOutput, ConsistencyIssue, EntityNode } from "./types.js";

export function checkConsistency(input: CheckConsistencyInput): CheckConsistencyOutput {
  const html = readFile(input.file_path);
  const document = parse5.parse(html, { sourceCodeLocationInfo: true });

  const entities = extractEntities(document);
  const graph = buildDependencyGraph(document);

  let manifest = loadManifest(input.file_path);

  const issues: ConsistencyIssue[] = [];
  let crossRefsValid = true;

  const entityMap = new Map<string, EntityNode>();
  for (const e of entities) {
    entityMap.set(e.id, e);
  }

  for (const e of entities) {
    const deps = getDependencies(graph, e.id);
    for (const depId of deps) {
      if (!entityMap.has(depId)) {
        crossRefsValid = false;
        issues.push({
          section_selector: e.sectionId ? `#${e.sectionId}` : e.id,
          entity_id: e.id,
          expected_value: `Entity "${depId}" exists`,
          actual_value: `Entity "${depId}" not found`,
          severity: "contradiction",
        });
      }
    }
  }

  if (manifest) {
    const currentValues = new Map<string, string>();
    for (const e of entities) {
      currentValues.set(e.id, e.value);
    }

    const changedEntities = new Set<string>();
    for (const [entityId, manifestValue] of Object.entries(manifest.entity_values)) {
      const currentValue = currentValues.get(entityId);
      if (currentValue !== undefined && currentValue !== manifestValue) {
        changedEntities.add(entityId);
      }
    }

    for (const changedId of changedEntities) {
      const dependents = graph.dependents.get(changedId) ?? [];
      for (const depId of dependents) {
        const depCurrent = currentValues.get(depId);
        const depManifest = manifest.entity_values[depId];
        if (depCurrent !== undefined && depManifest !== undefined && depCurrent === depManifest) {
          const entity = entityMap.get(depId);
          issues.push({
            section_selector: entity?.sectionId ? `#${entity.sectionId}` : depId,
            entity_id: depId,
            expected_value: `Updated from ${depManifest} due to ${changedId} change`,
            actual_value: depManifest,
            severity: "stale",
          });
        }
      }
    }
  } else {
    manifest = createManifestFromEntities(entities);
    saveManifest(input.file_path, manifest);
  }

  const sectionIds = new Set<string>();
  for (const e of entities) {
    if (e.sectionId) sectionIds.add(e.sectionId);
  }

  return {
    status: issues.length === 0 ? "pass" : "fail",
    total_sections: sectionIds.size || 1,
    issues_found: issues.length,
    facts_verified: entities.length,
    cross_refs_valid: crossRefsValid,
    issues: issues.length > 0 ? issues : undefined,
  };
}
