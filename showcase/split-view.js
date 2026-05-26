let templates = [];
let promptCache = {};
let filteredTemplates = [];
let activeCategory = 'all';
let activeTemplate = null;

async function init() {
  try {
    const res = await fetch('../templates/index.json');
    const index = await res.json();
    templates = index.map(t => ({ ...t, prompt: null }));
    filteredTemplates = [...templates];
    renderFilterPills();
    renderGrid();
    document.getElementById('search-input').addEventListener('input', onSearch);
  } catch (err) {
    document.getElementById('template-grid').innerHTML = `<div class="error-state">Failed to load templates: ${err.message}</div>`;
  }
}

function getCategories() {
  const cats = new Set(templates.map(t => t.category));
  return ['all', ...Array.from(cats).sort()];
}

function getCount(category) {
  if (category === 'all') return templates.length;
  return templates.filter(t => t.category === category).length;
}

function renderFilterPills() {
  const container = document.getElementById('filter-pills');
  const categories = getCategories();
  const labels = { all: 'All', business: 'Business', technical: 'Technical', communication: 'Communication', presentation: 'Presentation', research: 'Research' };
  container.innerHTML = categories.map(cat => `
    <button class="filter-pill ${cat === activeCategory ? 'active' : ''}" data-category="${cat}" onclick="setCategory('${cat}')">
      ${labels[cat] || cat} <span class="count">${getCount(cat)}</span>
    </button>
  `).join('');
}

function setCategory(category) {
  activeCategory = category;
  renderFilterPills();
  applyFilters();
}

function onSearch() {
  applyFilters();
}

function applyFilters() {
  const query = document.getElementById('search-input').value.toLowerCase().trim();
  filteredTemplates = templates.filter(t => {
    if (activeCategory !== 'all' && t.category !== activeCategory) return false;
    if (query && !t.name.toLowerCase().includes(query) && !t.description.toLowerCase().includes(query)) return false;
    return true;
  });
  document.getElementById('template-count').textContent = `${filteredTemplates.length} template${filteredTemplates.length !== 1 ? 's' : ''}`;
  renderGrid();
}

function renderGrid() {
  const container = document.getElementById('template-grid');
  if (filteredTemplates.length === 0) {
    container.innerHTML = '<div class="empty-state">No templates match your search.</div>';
    return;
  }
  container.innerHTML = filteredTemplates.map(t => renderCard(t)).join('');
  filteredTemplates.forEach(t => {
    const el = document.getElementById(`preview-${t.name}`);
    if (el && t.preview_sections) {
      const html = renderSectionsPreview(t.preview_sections);
      el.srcdoc = html;
    }
  });
}

function renderCard(t) {
  return `
    <div class="template-card" onclick="openSplitView('${t.name}')">
      <div class="template-card-preview">
        <iframe id="preview-${t.name}" sandbox="allow-same-origin" loading="lazy" title="${t.name} preview"></iframe>
      </div>
      <div class="template-card-body">
        <div class="template-card-header">
          <span class="template-card-name">${t.name}</span>
          <span class="template-card-category">${capitalize(t.category)}</span>
        </div>
        <div class="template-card-desc">${escapeHtml(t.description)}</div>
        <div class="template-card-footer">
          <button class="template-card-btn" onclick="event.stopPropagation(); openSplitView('${t.name}')">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M8 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h6"/><path d="M16 3h3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-6"/><path d="M12 3v18"/></svg>
            Experience
          </button>
          <button class="template-card-btn secondary" onclick="event.stopPropagation(); copyPrompt('${t.name}')" title="Copy JSON">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
            Copy JSON
          </button>
        </div>
      </div>
    </div>
  `;
}

async function openSplitView(name) {
  const t = templates.find(t => t.name === name);
  if (!t) return;
  activeTemplate = t;

  const overlay = document.getElementById('split-view-overlay');
  document.getElementById('split-view-title').textContent = t.name;
  document.getElementById('split-view-category').textContent = capitalize(t.category);

  if (!t.prompt) {
    try {
      const res = await fetch(`../templates/${name}/PROMPT.json`);
      t.prompt = await res.json();
      promptCache[name] = t.prompt;
    } catch (err) {
      document.getElementById('json-content').textContent = `Error loading PROMPT.json: ${err.message}`;
      overlay.classList.add('open');
      document.body.style.overflow = 'hidden';
      return;
    }
  }

  const previewPane = document.getElementById('split-view-preview');
  const fullHtml = renderFullPreview(t.prompt);
  previewPane.srcdoc = fullHtml;

  renderHighlightedJson(t.prompt);
  const bar = document.getElementById('json-toggle-bar');
  const content = document.querySelector('#json-pane .pane-content');
  if (bar && content) {
    bar.classList.remove('collapsed');
    content.style.display = '';
  }
  overlay.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeSplitView() {
  document.getElementById('split-view-overlay').classList.remove('open');
  document.body.style.overflow = '';
  activeTemplate = null;
}

function renderHighlightedJson(prompt) {
  const json = JSON.stringify(prompt, null, 2);
  const container = document.getElementById('json-content');
  if (typeof hljs !== 'undefined') {
    const highlighted = hljs.highlight(json, { language: 'json' }).value;
    container.innerHTML = highlighted;
  } else {
    container.textContent = json;
  }
  container.dataset.json = json;
}

function copyJson() {
  const container = document.getElementById('json-content');
  const json = container.dataset.json;
  if (!json) return;
  navigator.clipboard.writeText(json).then(() => {
    const btn = document.querySelector('.copy-json-btn');
    btn.classList.add('copied');
    btn.textContent = 'Copied!';
    setTimeout(() => {
      btn.classList.remove('copied');
      btn.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg> Copy JSON';
    }, 2000);
  }).catch(() => {
    const ta = document.createElement('textarea');
    ta.value = json;
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    document.body.removeChild(ta);
  });
}

async function copyPrompt(name) {
  let t = templates.find(t => t.name === name);
  if (!t) return;

  let prompt = t.prompt || promptCache[name];
  if (!prompt) {
    try {
      const res = await fetch(`../templates/${name}/PROMPT.json`);
      prompt = await res.json();
      t.prompt = prompt;
      promptCache[name] = prompt;
    } catch {
      return;
    }
  }

  const json = JSON.stringify(prompt, null, 2);
  try {
    await navigator.clipboard.writeText(json);
  } catch {
    const ta = document.createElement('textarea');
    ta.value = json;
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    document.body.removeChild(ta);
  }

  const cards = document.querySelectorAll('.template-card');
  for (const card of cards) {
    const btn = card.querySelector('.template-card-btn.secondary');
    if (btn && card.textContent.includes(name)) {
      btn.textContent = 'Copied!';
      btn.classList.add('copied');
      setTimeout(() => {
        btn.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg> Copy JSON';
        btn.classList.remove('copied');
      }, 2000);
      break;
    }
  }
}

function toggleJsonPane() {
  const bar = document.getElementById('json-toggle-bar');
  const content = document.querySelector('#json-pane .pane-content');
  if (!content) return;
  bar.classList.toggle('collapsed');
  content.style.display = content.style.display === 'none' ? '' : 'none';
}

function renderSectionsPreview(sections) {
  const parts = (sections || []).map(s => renderComponent(s)).join('\n');
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>
    body { margin: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif; background: #f5f5f7; color: #1d1d1f; }
    .hero-section { padding: 40px 24px; text-align: center; background: linear-gradient(135deg, #6c63ff, #4a42d4); color: white; }
    .hero-section .badge { display: inline-block; padding: 4px 12px; border-radius: 999px; background: rgba(255,255,255,0.2); font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 12px; }
    .hero-section h1 { font-size: 24px; font-weight: 700; margin: 0 0 8px; line-height: 1.2; }
    .hero-section .subtitle { font-size: 14px; opacity: 0.85; margin: 0; }
  </style></head><body>${parts}</body></html>`;
}

function renderFullPreview(prompt) {
  const sections = prompt.sections || [];
  const parts = sections.map(s => renderComponent(s)).join('\n');
  const theme = (prompt.options && prompt.options.theme) || 'light';
  const bg = theme === 'dark' ? '#1a1a2e' : '#f5f5f7';
  const color = theme === 'dark' ? '#e8e8f0' : '#1d1d1f';
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>
    body { margin: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif; background: ${bg}; color: ${color}; }
    .hero-section { padding: 48px 24px; text-align: center; background: linear-gradient(135deg, #6c63ff, #4a42d4); color: white; }
    .hero-section .badge { display: inline-block; padding: 4px 12px; border-radius: 999px; background: rgba(255,255,255,0.2); font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 12px; }
    .hero-section h1 { font-size: 28px; font-weight: 700; margin: 0 0 8px; line-height: 1.2; }
    .hero-section .subtitle { font-size: 15px; opacity: 0.85; margin: 0; }
    .callout-section { padding: 16px 24px; }
    .callout-info { background: ${theme === 'dark' ? '#1e2a3a' : '#e8f4fd'}; border-left: 3px solid #60a5fa; padding: 12px 16px; border-radius: 6px; font-size: 13px; line-height: 1.5; color: ${theme === 'dark' ? '#93c5fd' : '#1e40af'}; }
    .page-header { padding: 12px 24px; display: flex; align-items: center; justify-content: space-between; background: ${theme === 'dark' ? '#12121a' : '#fff'}; border-bottom: 1px solid ${theme === 'dark' ? '#2a2a3e' : '#e5e5ea'}; }
    .page-header .brand { font-weight: 600; font-size: 15px; }
    .page-header nav { display: flex; gap: 16px; }
    .page-header nav a { text-decoration: none; font-size: 13px; color: ${theme === 'dark' ? '#9898b0' : '#6b7280'}; }
    .stats-grid { display: flex; gap: 16px; padding: 16px 24px; flex-wrap: wrap; justify-content: center; }
    .stat-item { background: ${theme === 'dark' ? '#1a1a26' : '#fff'}; border: 1px solid ${theme === 'dark' ? '#2a2a3e' : '#e5e5ea'}; border-radius: 10px; padding: 16px 20px; text-align: center; min-width: 120px; }
    .stat-item .value { font-size: 22px; font-weight: 700; color: ${theme === 'dark' ? '#a8a0ff' : '#6c63ff'}; }
    .stat-item .label { font-size: 11px; color: ${theme === 'dark' ? '#686888' : '#9ca3af'}; text-transform: uppercase; letter-spacing: 0.5px; margin-top: 4px; }
    .data-table-wrap { padding: 16px 24px; overflow-x: auto; }
    .data-table-wrap table { width: 100%; border-collapse: collapse; font-size: 13px; }
    .data-table-wrap th { text-align: left; padding: 10px 12px; border-bottom: 2px solid ${theme === 'dark' ? '#2a2a3e' : '#e5e5ea'}; font-weight: 600; color: ${theme === 'dark' ? '#9898b0' : '#6b7280'}; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; }
    .data-table-wrap td { padding: 10px 12px; border-bottom: 1px solid ${theme === 'dark' ? '#2a2a3e' : '#e5e5ea'}; }
    .data-table-wrap caption { caption-side: bottom; padding: 8px 12px; font-size: 11px; color: ${theme === 'dark' ? '#686888' : '#9ca3af'}; text-align: left; }
    .code-block-section { padding: 16px 24px; }
    .code-block-section pre { background: ${theme === 'dark' ? '#0d0d1a' : '#1e1e2e'}; color: #e8e8f0; padding: 16px; border-radius: 8px; font-family: 'JetBrains Mono', 'Fira Code', monospace; font-size: 12px; overflow-x: auto; line-height: 1.6; }
    .accordion-section { padding: 8px 24px; }
    .accordion-item { background: ${theme === 'dark' ? '#1a1a26' : '#fff'}; border: 1px solid ${theme === 'dark' ? '#2a2a3e' : '#e5e5ea'}; border-radius: 8px; margin-bottom: 8px; overflow: hidden; }
    .accordion-item .title { padding: 12px 16px; font-weight: 600; font-size: 13px; cursor: pointer; display: flex; align-items: center; gap: 8px; }
    .accordion-item .content { padding: 0 16px 12px; font-size: 13px; color: ${theme === 'dark' ? '#9898b0' : '#6b7280'}; }
    .card-deck { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 12px; padding: 16px 24px; }
    .card-deck .card { background: ${theme === 'dark' ? '#1a1a26' : '#fff'}; border: 1px solid ${theme === 'dark' ? '#2a2a3e' : '#e5e5ea'}; border-radius: 10px; padding: 16px; }
    .card-deck .card h3 { font-size: 14px; margin: 0 0 6px; }
    .card-deck .card p { font-size: 12px; color: ${theme === 'dark' ? '#9898b0' : '#6b7280'}; margin: 0; line-height: 1.5; }
    .page-footer { padding: 16px 24px; text-align: center; font-size: 12px; color: ${theme === 'dark' ? '#686888' : '#9ca3af'}; border-top: 1px solid ${theme === 'dark' ? '#2a2a3e' : '#e5e5ea'}; }
  </style></head><body>${parts}</body></html>`;
}

function renderComponent(section) {
  const p = section.props || {};
  switch (section.component) {
    case 'hero':
      return `<section class="hero-section"><div class="badge">${escapeHtml(p.badge || '')}</div><h1>${escapeHtml(p.title || '')}</h1>${p.subtitle ? `<p class="subtitle">${escapeHtml(p.subtitle)}</p>` : ''}</section>`;
    case 'header':
      return `<div class="page-header"><span class="brand">${escapeHtml(p.brand || '')}</span><nav>${(p.nav || []).map(n => `<a href="${escapeHtml(n.url || '#')}">${escapeHtml(n.label || '')}</a>`).join('')}</nav></div>`;
    case 'callout':
      return `<div class="callout-section"><div class="callout-info">${escapeHtml(p.content || '')}</div></div>`;
    case 'stats-grid':
      return `<div class="stats-grid">${(p.stats || []).map(s => `<div class="stat-item"><div class="value">${escapeHtml(s.value || '')}</div><div class="label">${escapeHtml(s.label || '')}</div></div>`).join('')}</div>`;
    case 'data-table':
      return `<div class="data-table-wrap"><table>${p.caption ? `<caption>${escapeHtml(p.caption)}</caption>` : ''}<thead><tr>${(p.headers || []).map(h => `<th>${escapeHtml(h)}</th>`).join('')}</tr></thead><tbody>${(p.rows || []).map(r => `<tr>${r.map(c => `<td>${escapeHtml(c)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
    case 'code-block':
      return `<div class="code-block-section"><pre>${escapeHtml(p.code || '')}</pre></div>`;
    case 'accordion':
      return `<div class="accordion-section"><div class="accordion-item"><div class="title">${escapeHtml(p.title || '')}</div><div class="content">${escapeHtml(p.content || '')}</div></div></div>`;
    case 'card-deck':
      return `<div class="card-deck">${(p.cards || []).map(c => `<div class="card"><h3>${escapeHtml(c.title || '')}</h3><p>${escapeHtml(c.content || '')}</p></div>`).join('')}</div>`;
    default:
      return `<div class="callout-section"><div class="callout-info">${escapeHtml(section.component)} component</div></div>`;
  }
}

function capitalize(s) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function escapeHtml(s) {
  if (s == null) return '';
  const d = document.createElement('div');
  d.textContent = s;
  return d.innerHTML;
}

document.addEventListener('DOMContentLoaded', init);
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeSplitView();
});
