import { propagateEdit } from "./propagator.js";
import { checkConsistency } from "./verifier.js";
import type { PropagateEditInput, CheckConsistencyInput } from "./types.js";

export function handlePropagateEdit(args: Record<string, unknown>): string {
  const result = propagateEdit(args as unknown as PropagateEditInput);
  return JSON.stringify(result, null, 2);
}

export function handleCheckConsistency(args: Record<string, unknown>): string {
  const result = checkConsistency(args as unknown as CheckConsistencyInput);
  return JSON.stringify(result, null, 2);
}

export { propagateEdit, checkConsistency };
