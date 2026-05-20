import { JSDOM } from "jsdom";
import DOMPurify from "dompurify";

let purify: ReturnType<typeof DOMPurify>;

export function ensurePurify(): void {
  if (!purify) {
    const window = new JSDOM("").window as unknown as Window & typeof globalThis;
    purify = DOMPurify(window);
  }
}

function getPurify(): typeof purify {
  ensurePurify();
  return purify;
}

export function sanitizeHtml(raw: string): string {
  return getPurify().sanitize(raw, {
    ADD_TAGS: ["style", "svg", "path", "circle", "rect", "line", "text", "g", "defs", "linearGradient", "stop", "clipPath", "iframe"],
    ADD_ATTR: ["style", "class", "id", "data-*", "viewBox", "xmlns", "d", "fill", "stroke", "stroke-width", "stroke-linecap", "stroke-dasharray", "stroke-dashoffset", "cx", "cy", "r", "x", "y", "width", "height", "rx", "ry", "points", "transform", "clip-path"],
    ALLOW_DATA_ATTR: true,
  });
}
