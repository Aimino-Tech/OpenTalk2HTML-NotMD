export interface NavItem {
  id: string;
  label: string;
  index: number;
}

function unescapeHtml(s: string): string {
  return s.replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#39;/g, "'");
}

export function extractNav(content: string): NavItem[] {
  const items: NavItem[] = [];
  const sectionRe = /<section[^>]*?id=["']([^"']+)["'][^>]*>[\s\S]*?<h2[^>]*>([^<]+)<\/h2>/gi;
  let m: RegExpExecArray | null;
  while ((m = sectionRe.exec(content)) !== null) {
    items.push({ id: m[1], label: unescapeHtml(m[2]), index: items.length });
  }
  if (items.length === 0) {
    const h2Re = /<h2[^>]*?id=["']([^"']+)["'][^>]*>([^<]+)<\/h2>/gi;
    while ((m = h2Re.exec(content)) !== null) {
      items.push({ id: m[1], label: unescapeHtml(m[2]), index: items.length });
    }
  }
  return items;
}
