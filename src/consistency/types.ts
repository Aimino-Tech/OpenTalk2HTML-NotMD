export interface EntityNode {
  id: string;
  value: string;
  sectionId: string | null;
}

export interface EntityManifest {
  entity_values: Record<string, string>;
}

export interface PropagateEditInput {
  file_path: string;
  section_selector: string;
  old_value: string;
  new_value: string;
}

export interface AffectedSection {
  selector: string;
  old_value: string | number;
  new_value: string | number;
  update_applied: boolean;
}

export interface PropagateEditOutput {
  changed_sections: number;
  affected_sections: AffectedSection[];
  unchanged_sections: number;
  propagation_time_ms: number;
}

export interface ConsistencyIssue {
  section_selector: string;
  entity_id: string;
  expected_value: string;
  actual_value: string;
  severity: "stale" | "contradiction";
}

export interface CheckConsistencyInput {
  file_path: string;
  mode: "cross-section";
}

export interface CheckConsistencyOutput {
  status: "pass" | "fail";
  total_sections: number;
  issues_found: number;
  facts_verified: number;
  cross_refs_valid: boolean;
  issues?: ConsistencyIssue[];
}

export interface DepGraph {
  dependents: Map<string, string[]>;
  dependencies: Map<string, string[]>;
}
