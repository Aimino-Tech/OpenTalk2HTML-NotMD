import { readFile, atomicWrite } from "../writer.js";

export interface EditLineRangeInput {
  file_path: string;
  start_line: number;
  end_line: number;
  new_content: string;
}

export function editLineRange(input: EditLineRangeInput): string {
  const content = readFile(input.file_path);
  const lines = content.split("\n");

  if (input.start_line < 1 || input.start_line > lines.length) {
    throw new Error(`start_line ${input.start_line} out of range (file has ${lines.length} lines)`);
  }
  if (input.end_line < input.start_line || input.end_line > lines.length) {
    throw new Error(`end_line ${input.end_line} out of range (file has ${lines.length} lines)`);
  }

  lines.splice(input.start_line - 1, input.end_line - input.start_line + 1, input.new_content);
  const result = lines.join("\n");

  atomicWrite(input.file_path, result, { skipFormat: true });
  return `Replaced lines ${input.start_line}-${input.end_line}`;
}
