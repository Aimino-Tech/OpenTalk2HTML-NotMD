import { readFile, atomicWrite } from "../writer.js";
import { renderComponent } from "../components/registry.js";
import { sanitizeHtml } from "../validator.js";

export interface EditSectionInput {
  file_path: string;
  section_index: number;
  component?: string;
  props?: Record<string, unknown>;
  html?: string;
}

export interface InsertSectionInput {
  file_path: string;
  section_index: number;
  component: string;
  props?: Record<string, unknown>;
  html?: string;
}

const SECTION_REGEX = /<!--\s*fm:section:(\d+):(\w+)\s*-->([\s\S]*?)<!--\s*\/fm:section:\1:\2\s*-->/g;

interface SectionMatch {
  index: number;
  component: string;
  content: string;
  fullMatch: string;
}

function parseSections(html: string): SectionMatch[] {
  const sections: SectionMatch[] = [];
  let match;
  while ((match = SECTION_REGEX.exec(html)) !== null) {
    sections.push({
      index: parseInt(match[1], 10),
      component: match[2],
      content: match[3].trim(),
      fullMatch: match[0],
    });
  }
  return sections;
}

export function editSection(input: EditSectionInput): string {
  const html = readFile(input.file_path);
  const sections = parseSections(html);

  const target = sections.find((s) => s.index === input.section_index);
  if (!target) {
    throw new Error(
      `Section ${input.section_index} not found. Available indices: ${sections.map((s) => s.index).join(", ")}`
    );
  }

  if (input.html !== undefined) {
    const newMarker = `<!-- fm:section:${input.section_index}:${target.component} -->\n${input.html}\n<!-- /fm:section:${input.section_index}:${target.component} -->`;
    const result = html.replace(target.fullMatch, newMarker);
    atomicWrite(input.file_path, result, { skipFormat: true });
    return `Replaced section ${input.section_index} (${target.component}) with provided HTML`;
  }

  const newComponent = input.component || target.component;
  const newProps = input.props ?? {};

  const rendered = renderComponent({ component: newComponent, props: newProps });
  const safe = sanitizeHtml(rendered);

  const newMarker = `<!-- fm:section:${input.section_index}:${newComponent} -->\n${safe}\n<!-- /fm:section:${input.section_index}:${newComponent} -->`;
  const result = html.replace(target.fullMatch, newMarker);
  atomicWrite(input.file_path, result, { skipFormat: true });

  return `Replaced section ${input.section_index} from ${target.component} to ${newComponent}`;
}

export function insertSection(input: InsertSectionInput): string {
  const html = readFile(input.file_path);
  const sections = parseSections(html);
  const totalSections = sections.length;

  const idx = input.section_index;

  let rendered: string;
  if (input.html !== undefined) {
    rendered = input.html;
  } else {
    rendered = renderComponent({ component: input.component, props: input.props ?? {} });
    rendered = sanitizeHtml(rendered);
  }

  if (idx >= totalSections) {
    // Append at end
    const newMarker = `<!-- fm:section:${idx}:${input.component} -->\n${rendered}\n<!-- /fm:section:${idx}:${input.component} -->`;
    const result = html + "\n" + newMarker;
    atomicWrite(input.file_path, result, { skipFormat: true });
    return `Inserted section at index ${idx} (appended at end)`;
  }

  // Insert before section at idx — find its position
  const targetSection = sections.find((s) => s.index === idx);
  if (!targetSection) {
    throw new Error(
      `Cannot determine insertion point. Section ${idx} not found. Sections: ${sections.map((s) => `${s.index}`).join(", ")}`
    );
  }

  // Insert new marker before target section
  const newMarker = `<!-- fm:section:${idx}:${input.component} -->\n${rendered}\n<!-- /fm:section:${idx}:${input.component} -->\n`;

  // Splice: insert new marker right before targetSection.fullMatch
  const insertPos = html.indexOf(targetSection.fullMatch);
  let result = html.slice(0, insertPos) + newMarker + html.slice(insertPos);

  // Renumber all sections at index >= idx by +1
  // Match patterns like fm:section:N:xxx and /fm:section:N:xxx
  // We need to bump indices that are >= idx (original sections only, not our new one)
  // Strategy: replace from the insertion point onward, matching section markers
  const afterInsert = result.slice(insertPos);
  const renumbered = afterInsert.replace(
    /<!--\s*\/?fm:section:(\d+):(\w+)\s*-->/g,
    (match, num, comp) => {
      const n = parseInt(num, 10);
      if (n >= idx) {
        const isClose = match.startsWith("<!-- /");
        return isClose
          ? `<!-- /fm:section:${n + 1}:${comp} -->`
          : `<!-- fm:section:${n + 1}:${comp} -->`;
      }
      return match;
    }
  );
  result = result.slice(0, insertPos) + renumbered;

  atomicWrite(input.file_path, result, { skipFormat: true });
  return `Inserted section at index ${idx} (${totalSections} → ${totalSections + 1} sections)`;
}

export function listSections(filePath: string): string {
  const html = readFile(filePath);
  const sections = parseSections(html);
  const summary = sections.map(
    (s) => `  [${s.index}] ${s.component} (${s.content.length} chars)`
  );
  return `Sections (${sections.length}):\n` + summary.join("\n");
}
