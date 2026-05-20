export interface QualityReport {
  score: "A" | "B" | "C" | "D" | "F"
  issues: string[]
  tokenEstimate: number
  sizeKB: number
}

const INLINE_STYLE_RX = /style\s*=\s*["']/gi
const MISSING_ALT_RX = /<img(?!\s*[^>]*\salt\s*=)[^>]*>/gi
const EMPTY_HEADING_RX = /<h[1-6][^>]*>\s*<\/h[1-6]>/gi
const BROKEN_LINK_RX = /<a[^>]*href\s*=\s*["'](?:undefined|javascript:void)[^>]*>/gi

export function assessQuality(html: string): QualityReport {
  const issues: string[] = []
  let score: QualityReport["score"] = "A"

  const inlineStyles = (html.match(INLINE_STYLE_RX) || []).length
  if (inlineStyles > 0) issues.push(`${inlineStyles} inline style(s) detected — prefer CSS classes`)

  const missingAlt = (html.match(MISSING_ALT_RX) || []).length
  if (missingAlt > 0) issues.push(`${missingAlt} image(s) missing alt text`)

  const emptyHeadings = (html.match(EMPTY_HEADING_RX) || []).length
  if (emptyHeadings > 0) issues.push(`${emptyHeadings} empty heading(s)`)

  const brokenLinks = (html.match(BROKEN_LINK_RX) || []).length
  if (brokenLinks > 0) issues.push(`${brokenLinks} broken link(s)`)

  const penalty = inlineStyles * 2 + missingAlt * 3 + emptyHeadings * 1 + brokenLinks * 5

  if (penalty === 0) score = "A"
  else if (penalty <= 3) score = "B"
  else if (penalty <= 8) score = "C"
  else if (penalty <= 15) score = "D"
  else score = "F"

  return {
    score,
    issues,
    tokenEstimate: Math.ceil(html.length / 4),
    sizeKB: parseFloat((html.length / 1024).toFixed(1)),
  }
}

export function formatQualityWarning(report: QualityReport): string {
  const parts = [`HTML output: ${report.sizeKB}KB (≈${report.tokenEstimate.toLocaleString()} tokens)`]
  if (report.score !== "A") {
    parts.push(`Score: ${report.score}`)
    for (const issue of report.issues) {
      parts.push(`  - ${issue}`)
    }
    if (report.score === "C" || report.score === "D" || report.score === "F") {
      parts.push("Consider running quality improvements.")
    }
  }
  return parts.join("\n")
}
