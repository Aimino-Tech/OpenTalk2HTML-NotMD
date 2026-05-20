export function estimateTokens(html: string): number {
  return Math.ceil(html.length / 3.5);
}

export function enforceBudget(html: string, maxTokens: number): string {
  const estimated = estimateTokens(html);
  if (estimated <= maxTokens) return html;

  let result = html;
  let passes = 0;

  while (estimateTokens(result) > maxTokens && passes < 5) {
    if (result.includes("<style")) {
      result = result.replace(/<style[^>]*>[\s\S]*?<\/style>/g, "");
      passes++;
      if (estimateTokens(result) <= maxTokens) break;
    }

    if (result.includes("<script")) {
      result = result.replace(/<script[^>]*>[\s\S]*?<\/script>/g, "");
      passes++;
      if (estimateTokens(result) <= maxTokens) break;
    }

    if (result.includes("<footer")) {
      result = result.replace(/<footer[^>]*>[\s\S]*?<\/footer>/gi, "");
      passes++;
      if (estimateTokens(result) <= maxTokens) break;
    }

    if (result.includes("<nav")) {
      result = result.replace(/<nav[^>]*>[\s\S]*?<\/nav>/gi, "");
      passes++;
      if (estimateTokens(result) <= maxTokens) break;
    }

    if (result.includes("<header")) {
      result = result.replace(/<header[^>]*>[\s\S]*?<\/header>/gi, "");
      passes++;
      if (estimateTokens(result) <= maxTokens) break;
    }

    const maxBudgetChars = Math.floor(maxTokens * 3.5);
    if (result.length > maxBudgetChars) {
      result = result.slice(0, maxBudgetChars);
      passes++;
    }
  }

  return result;
}
