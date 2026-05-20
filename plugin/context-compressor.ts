export function compressHtmlForContext(html: string, maxLength = 2000): string {
  if (html.length < maxLength) return html

  const tagCounts: Record<string, number> = {}
  const tagRx = /<(\w+)[\s>]/g
  let m: RegExpExecArray | null
  while ((m = tagRx.exec(html))) {
    tagCounts[m[1]] = (tagCounts[m[1]] || 0) + 1
  }

  const headings: string[] = []
  const hRx = /<h([1-6])[^>]*>([^<]+)<\/h\1>/g
  while ((m = hRx.exec(html))) {
    headings.push(`${m[1]}. ${m[2].trim()}`)
  }

  const tagLine = `Tags: ${Object.entries(tagCounts).sort((a, b) => b[1] - a[1]).slice(0, 8).map(([t, c]) => `<${t}>:${c}`).join(", ")}`
  const outlineLine = headings.length ? `Outline:\n${headings.join("\n")}` : ""
  const hintLine = "(use /html-preview for full content)"

  const body = [tagLine, outlineLine, hintLine].filter(Boolean).join("\n")
  const origKB = (html.length / 1024).toFixed(1)
  const compKB = (body.length / 1024).toFixed(1)
  const pct = html.length > 0 ? ((1 - body.length / html.length) * 100).toFixed(1) : "0.0"

  return `[HTML ${origKB}KB → ${compKB}KB (${pct}% reduction)]\n${body}`
}
