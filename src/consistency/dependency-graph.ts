import type { DepGraph } from "./types.js";
import { getAttr } from "./entity-store.js";

export function buildDependencyGraph(node: any): DepGraph {
  const graph: DepGraph = {
    dependents: new Map(),
    dependencies: new Map(),
  };

  walk(node);

  return graph;

  function walk(current: any): void {
    if (current.tagName) {
      const entityId = getAttr(current, "data-entity");
      const dependsOn = getAttr(current, "data-depends-on");
      if (entityId && dependsOn) {
        const deps = dependsOn.split(",").map((s: string) => s.trim());
        for (const dep of deps) {
          if (!graph.dependents.has(dep)) graph.dependents.set(dep, []);
          const depList = graph.dependents.get(dep)!;
          if (!depList.includes(entityId)) depList.push(entityId);

          if (!graph.dependencies.has(entityId)) graph.dependencies.set(entityId, []);
          const entityDeps = graph.dependencies.get(entityId)!;
          if (!entityDeps.includes(dep)) entityDeps.push(dep);
        }
      }
    }
    if (current.childNodes) {
      for (const child of current.childNodes) {
        walk(child);
      }
    }
  }
}

export function getDependents(graph: DepGraph, entityId: string): string[] {
  return graph.dependents.get(entityId) || [];
}

export function getDependencies(graph: DepGraph, entityId: string): string[] {
  return graph.dependencies.get(entityId) || [];
}

export interface CascadeEntry {
  id: string;
  depth: number;
}

export function bfsCascade(startId: string, graph: DepGraph, maxDepth: number): string[] {
  const visited = new Set<string>([startId]);
  const result: string[] = [];
  const queue: CascadeEntry[] = getDependents(graph, startId).map((id) => ({ id, depth: 1 }));

  while (queue.length > 0) {
    const entry = queue.shift()!;
    if (visited.has(entry.id)) continue;
    visited.add(entry.id);
    if (entry.depth <= maxDepth) {
      result.push(entry.id);
      if (entry.depth < maxDepth) {
        for (const depId of getDependents(graph, entry.id)) {
          queue.push({ id: depId, depth: entry.depth + 1 });
        }
      }
    }
  }

  return result;
}

export function topologicalSort(entityIds: string[], graph: DepGraph): string[] {
  const inDegree = new Map<string, number>();
  const adjacency = new Map<string, string[]>();

  for (const id of entityIds) {
    if (!inDegree.has(id)) inDegree.set(id, 0);
    if (!adjacency.has(id)) adjacency.set(id, []);

    const deps = getDependencies(graph, id);
    for (const dep of deps) {
      if (!entityIds.includes(dep)) continue;
      if (!adjacency.has(dep)) adjacency.set(dep, []);
      adjacency.get(dep)!.push(id);
      inDegree.set(id, (inDegree.get(id) || 0) + 1);
    }
  }

  const queue: string[] = [];
  for (const [id, degree] of inDegree) {
    if (degree === 0) queue.push(id);
  }

  const result: string[] = [];
  while (queue.length > 0) {
    const node = queue.shift()!;
    result.push(node);
    const neighbors = adjacency.get(node) || [];
    for (const neighbor of neighbors) {
      const newDegree = (inDegree.get(neighbor) || 1) - 1;
      inDegree.set(neighbor, newDegree);
      if (newDegree === 0) {
        queue.push(neighbor);
      }
    }
  }

  return result;
}
