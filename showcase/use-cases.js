// Fast HTML MCP — Use Case Showcase Controller
(function () {
  'use strict';

  // ──────────────────────────────────────────────
  // DATA: 22 Use Cases
  // ──────────────────────────────────────────────
  const USE_CASES = [
    // ── Business (5) ──
    {
      slug: "pharma-invoice",
      title: "Create Invoice for Pharma Industry",
      category: "Business",
      industry: "Pharmaceutical",
      description: "Generate a professional invoice with drug line items, GST/HST, and regulatory footer for pharmaceutical compliance.",
      template: "invoice",
      prompt: 'Create an invoice for Acme Pharma Supplies Ltd. with items including Paracetamol 500mg (500 boxes at $4.50/unit), Amoxicillin 250mg (200 boxes at $8.75/unit), and Omeprazole 20mg (300 boxes at $6.20/unit). Include line items for Atorvastatin and Metformin, 13% HST, a 0.5% regulatory fee, Net 30 payment terms, and a regulatory compliance footer.',
      tags: ["invoice", "pharma", "business", "compliance"],
      toolCall: { method: "render_page", template: "invoice", options: { title: "Acme Pharma Supplies Ltd. — Invoice" } }
    },
    {
      slug: "saas-report",
      title: "Generate SaaS Quarterly Report",
      category: "Business",
      industry: "SaaS",
      description: "Create a professional quarterly business report with KPI stats grid, revenue-by-segment tables, and business highlights sections.",
      template: "report",
      prompt: 'Generate a Q3 2026 quarterly report for CloudNova SaaS Inc. Include 4 KPI stat cards (ARR: $4.2M, Active Customers: 1,847, Retention: 94.2%, Avg MRR: $187), a revenue-by-segment table with 4 segments, and 3 business highlight callout cards about product launch, expansion, and NPS.',
      tags: ["report", "saas", "business", "kpi"],
      toolCall: { method: "render_page", template: "report", options: { title: "CloudNova SaaS Q3 2026 Report" } }
    },
    {
      slug: "budget-proposal",
      title: "Build Department Budget Proposal",
      category: "Business",
      industry: "Finance",
      description: "Build a professional budget proposal with department breakdown, summary metrics, and YoY variance analysis.",
      template: "budget",
      prompt: 'Build an FY2027 budget proposal for the Enterprise Technology Division. Include 3 summary metrics (Total: $12.4M, YoY Increase: $2.8M, Growth: 29.2%), a department breakdown table with 8 departments showing FY2026 actuals vs FY2027 proposed with variance percentages, and an executive summary callout.',
      tags: ["budget", "finance", "business", "planning"],
      toolCall: { method: "render_page", template: "budget", options: { title: "FY2027 Budget Proposal — Enterprise Technology" } }
    },
    {
      slug: "data-sheet",
      title: "Create Enterprise Product Data Sheet",
      category: "Business",
      industry: "Technology",
      description: "Create a professional product data sheet with specifications grid, edition comparison table, and feature highlights.",
      template: "data-sheet",
      prompt: 'Create an enterprise product data sheet for Nebula DB v4.2, a distributed SQL database. Include 8 key specification items (engine, storage, throughput, latency, consistency, replication, compliance, deployment), an edition comparison table with 3 tiers (Community, Enterprise, Enterprise Plus) and 6 feature rows, and 3 feature highlight cards.',
      tags: ["data-sheet", "product", "enterprise", "specs"],
      toolCall: { method: "render_page", template: "data-sheet", options: { title: "Nebula DB v4.2 — Product Data Sheet" } }
    },
    {
      slug: "financial-summary",
      title: "Generate P&L and Balance Sheet Summary",
      category: "Business",
      industry: "Finance",
      description: "Create a complete annual financial summary with P&L statement, balance sheet highlights, and KPI metrics.",
      template: "financial-summary",
      prompt: 'Generate an FY2026 financial summary for Meridian Corporation. Include 4 KPI metric cards (Revenue: $48.2B, Net Income: $9.6B, Margin: 19.9%, EPS: $7.42), a full P&L statement with 10 line items and YoY comparison, and a balance sheet highlights section with 5 key line items including Debt-to-Equity ratio.',
      tags: ["financial", "pnl", "balance-sheet", "accounting"],
      toolCall: { method: "render_page", template: "financial-summary", options: { title: "Meridian Corporation FY2026 Annual Summary" } }
    },
    // ── Marketing (5) ──
    {
      slug: "landing-page",
      title: "Build SaaS Landing Page",
      category: "Marketing",
      industry: "SaaS",
      description: "Build a complete marketing landing page with hero CTA, features grid, and pricing tiers section.",
      template: "landing-page",
      prompt: 'Build a marketing landing page for DataPulse Analytics, an enterprise intelligence platform. Include a hero with badge and CTA buttons, a 6-card features grid (50+ integrations, AI insights, dashboards, security, mobile, multi-cloud), and a 3-tier pricing section (Starter $49/mo, Business $149/mo, Enterprise Custom).',
      tags: ["landing", "marketing", "saas", "pricing"],
      toolCall: { method: "render_page", template: "landing-page", options: { title: "DataPulse Analytics — Enterprise Intelligence" } }
    },
    {
      slug: "newsletter",
      title: "Generate Tech Company Newsletter",
      category: "Marketing",
      industry: "Technology",
      description: "Generate an email-style monthly newsletter with article cards, bylines, and social links footer.",
      template: "newsletter",
      prompt: 'Generate a June 2026 Tech Pulse newsletter for Nova AI Technologies. Include a header with issue #42, 4 article cards covering topics (product launch 2.0, multimodal research paper, MediCorp customer story, AI Summit event), each with tag, title, byline, description, and read-more link, plus a footer with social icons and unsubscribe links.',
      tags: ["newsletter", "email", "marketing", "content"],
      toolCall: { method: "render_page", template: "newsletter", options: { title: "Tech Pulse — June 2026" } }
    },
    {
      slug: "changelog",
      title: "Create Product Changelog",
      category: "Marketing",
      industry: "Technology",
      description: "Create a product changelog with version history, feature additions, fixes, and breaking changes.",
      template: "changelog",
      prompt: 'Create a product changelog for the Nova AI Platform. Include 3 version entries (v2.6.0 latest with 6 changes, v2.5.0 stable with 5 changes, v2.4.0 with 4 changes). Each version should have a date, status pill (latest/stable), and categorized changes with colored tags for Added, Changed, Fixed, and Removed.',
      tags: ["changelog", "release", "product", "version"],
      toolCall: { method: "render_page", template: "changelog", options: { title: "Nova AI Platform — Changelog" } }
    },
    {
      slug: "faq-page",
      title: "Build FAQ Page with Categories",
      category: "Marketing",
      industry: "Technology",
      description: "Build an FAQ page with searchable categories, expandable items, and filter pills.",
      template: "faq",
      prompt: 'Build an FAQ page for Fast HTML MCP. Include a search box, 5 category filter pills (All, Getting Started, Templates, API & Tools, Deployment, Pricing), and 4 FAQ groups with 2-3 items each. Each FAQ item should have an expandable question/answer with click-to-toggle functionality.',
      tags: ["faq", "support", "documentation", "help"],
      toolCall: { method: "render_page", template: "faq", options: { title: "Fast HTML MCP — FAQ" } }
    },
    {
      slug: "comparison",
      title: "Build Side-by-Side Product Comparison",
      category: "Marketing",
      industry: "Technology",
      description: "Create a side-by-side feature comparison table with ratings, check/cross indicators, and key takeaway.",
      template: "comparison",
      prompt: 'Create a product comparison page comparing Fast HTML MCP against Playwright/Puppeteer, Handlebars/EJS, and Regex Replace. Include a 14-row feature comparison table with Fast HTML MCP highlighted. Use checkmark/cross/partial indicators, rating colors, and a key takeaway callout at the bottom.',
      tags: ["comparison", "competitive", "table", "features"],
      toolCall: { method: "render_page", template: "comparison", options: { title: "Fast HTML MCP vs Alternatives" } }
    },
    // ── Technical (4) ──
    {
      slug: "api-docs",
      title: "Create API Documentation",
      category: "Technical",
      industry: "Developer Tools",
      description: "Create comprehensive API reference documentation with endpoints, request/response examples, and code snippets.",
      template: "api-doc",
      prompt: 'Create API documentation for the Fast HTML MCP REST API v3. Include 6 endpoint cards (POST /v1/render, POST /v1/render/html, PATCH /v1/patch, GET /v1/templates, GET /v1/components, GET /v1/openapi.json). Each endpoint should have method badge, path, description, and JSON code example with syntax-highlighted parameters.',
      tags: ["api", "documentation", "developer", "reference"],
      toolCall: { method: "render_page", template: "api-doc", options: { title: "Fast HTML MCP — REST API v3" } }
    },
    {
      slug: "error-page",
      title: "Design Branded Error Page",
      category: "Technical",
      industry: "Web Development",
      description: "Design a branded 404 error page with illustration, search functionality, and navigation links.",
      template: "error-page",
      prompt: 'Design a branded 404 error page for Nova AI with a space-themed illustration (🔭). Include a large gradient 404 code, error label, friendly message about pages drifting out of orbit, two CTA buttons (Return Home, Contact Support), a search box, and 6 navigation links (Documentation, API Reference, Changelog, GitHub, Status). Add an error tracking ID.',
      tags: ["error", "404", "branded", "ux"],
      toolCall: { method: "render_page", template: "error-page", options: { title: "404 — Nova AI" } }
    },
    {
      slug: "code-review",
      title: "Generate Code Review Report",
      category: "Technical",
      industry: "Software Engineering",
      description: "Generate a code review report with PR summary, diff stats, file changes, and review notes.",
      template: "code-review",
      prompt: 'Generate a code review report for PR #347: Authentication Middleware Refactor. Include PR metadata (author, date, base/compare branches, labels), summary stats grid (14 commits, +847/-312, 12 files changed), 6 changed files with +/- counts, a code diff example showing the refactor from switch statement to strategy pattern, and 3 review notes with error/warning/info severity levels.',
      tags: ["code-review", "pr", "engineering", "diff"],
      toolCall: { method: "render_page", template: "code-review", options: { title: "PR #347 — Auth Middleware Refactor" } }
    },
    {
      slug: "meeting-notes",
      title: "Create Structured Meeting Notes",
      category: "Technical",
      industry: "Business Operations",
      description: "Create structured meeting notes with attendees, goals, discussion, action items, and decisions.",
      template: "meeting-notes",
      prompt: 'Create meeting notes for Sprint Planning Week 44. Include 6 attendees (5 present, 1 absent), 4 sprint goals, 3 discussion notes about API gateway migration/dashboard performance/security audit, 4 action items with assignees and due dates, and 3 decisions made (Fastify adoption, SSE for dashboard, postpone mobile redesign).',
      tags: ["meeting", "notes", "agenda", "action-items"],
      toolCall: { method: "render_page", template: "meeting-notes", options: { title: "Sprint Planning — Week 44" } }
    },
    // ── Research (4) ──
    {
      slug: "equity-research",
      title: "Generate Equity Research Report",
      category: "Research",
      industry: "Financial Services",
      description: "Generate a full equity research report with rating, price target, financial forecasts, and risk analysis.",
      template: "equity-research",
      prompt: 'Generate an equity research report for NVIDIA (NVDA) with a BUY rating and $1,250 price target. Include a recommendation bar with 4 metrics, 4 KPI cards (Revenue: $130.5B, Net Income: $72.8B, Margin: 55.8%, P/E: 48.2x), an executive summary, a 4-year financial forecast table (Revenue, Data Center, Gross Margin, EPS, P/E), and 4 key risks.',
      tags: ["equity", "research", "finance", "investing"],
      toolCall: { method: "render_page", template: "equity-research", options: { title: "NVIDIA (NVDA) — Equity Research" } }
    },
    {
      slug: "industry-overview",
      title: "Build Market Industry Overview",
      category: "Research",
      industry: "Market Research",
      description: "Build an industry overview with market sizing, competitive landscape table, and SWOT analysis.",
      template: "industry-overview",
      prompt: 'Build an industry overview for the MCP Server Ecosystem 2026. Include 4 market metrics (Size: $2.8B, CAGR: 47.3%, 1200+ servers, 85% adoption), market overview paragraphs, a competitive landscape table with 5 products compared across 5 dimensions, and a SWOT analysis grid with 4 items each for Strengths, Weaknesses, Opportunities, and Threats.',
      tags: ["industry", "market", "swot", "competitive"],
      toolCall: { method: "render_page", template: "industry-overview", options: { title: "MCP Server Ecosystem 2026" } }
    },
    {
      slug: "scientific-paper",
      title: "Generate Academic Scientific Paper",
      category: "Research",
      industry: "Academia",
      description: "Generate an academic paper with abstract, methodology, equations, results, and references.",
      template: "scientific-paper",
      prompt: 'Generate an academic scientific paper titled "Sparse Multimodal Attention: Efficient Cross-Modal Understanding with Sublinear Complexity" by Park et al. Include authors and affiliations, an abstract, introduction section, methodology with equations for sparse attention masking, a figure placeholder for attention patterns, results section, conclusion, and 5 numbered references.',
      tags: ["scientific", "paper", "academic", "research"],
      toolCall: { method: "render_page", template: "scientific-paper", options: { title: "Sparse Multimodal Attention — Park et al." } }
    },
    {
      slug: "analytics-dashboard",
      title: "Build Campaign Analytics Dashboard",
      category: "Research",
      industry: "Marketing Analytics",
      description: "Build an analytics dashboard with KPI row, bar charts, channel performance bars, and campaign table.",
      template: "dashboard",
      prompt: 'Build a Q3 2026 campaign analytics dashboard. Include 5 KPI cards (Impressions: 12.4M ↑18%, Clicks: 348K ↑13%, CTR: 2.81%, Conversions: 8,942 ↑24%, CPA: $47.20), a monthly performance chart with 3 metrics stacked bars, a channel performance section with 5 channels and progress bars, and a campaign details table with 4 campaigns showing budget/spent/conv/ROAS.',
      tags: ["dashboard", "analytics", "campaign", "marketing"],
      toolCall: { method: "render_page", template: "dashboard", options: { title: "Q3 2026 — Campaign Analytics" } }
    },
    // ── Presentation (2) ──
    {
      slug: "pitch-deck",
      title: "Create Investor Pitch Deck",
      category: "Presentations",
      industry: "Startups",
      description: "Create an investor pitch deck with full-viewport slides covering problem, solution, traction, and team.",
      template: "pitch-deck",
      prompt: 'Create a 6-slide investor pitch deck for Nova AI\'s $5M seed round. Slide 1: Title with badge and CTA. Slide 2: Problem (3 stats: 60% time waste, $18K cost, 73% integration barrier). Slide 3: Solution with 3 feature cards. Slide 4: Traction with 4 metrics ($2.8M ARR, 1200+ orgs, 98% retention, 4.9★). Slide 5: Team with 3 founders (Sarah/Ex-Google, Alex/Ex-Meta, Michael/Ex-OpenAI). Slide 6: Ask.',
      tags: ["pitch-deck", "investor", "startup", "fundraising"],
      toolCall: { method: "render_page", template: "pitch-deck", options: { title: "Nova AI — $5M Seed Round" } }
    },
    {
      slug: "research-briefing",
      title: "Generate Executive Research Briefing",
      category: "Presentations",
      industry: "Security Research",
      description: "Generate an executive research briefing with key findings, attack vectors, and recommendations.",
      template: "research-briefing",
      prompt: 'Generate an executive research briefing on AI Agent Security: Prompt Injection & Tool-Use Vulnerabilities. Include a high-priority alert badge, 4 key findings as bullet points, executive summary, 3 attack vector cards (Tool Output Injection, Context Window Poisoning, Tool-Use Confusion) each with evidence levels and sources, and 4 numbered recommendations with details.',
      tags: ["briefing", "security", "research", "executive"],
      toolCall: { method: "render_page", template: "research-briefing", options: { title: "AI Agent Security — Briefing" } }
    },
    // ── Design (2) ──
    {
      slug: "design-system",
      title: "Build Component Design System",
      category: "Design",
      industry: "UI/UX Design",
      description: "Build a design system showcase with color palette, typography specs, component cards, and usage examples.",
      template: "design",
      prompt: 'Build a design system page for Nebula UI v2.0. Include a 9-swatch color palette (primary, secondary, success, danger, warning, info, surface, background, border) with hex values, a 6-item typography grid (H1-H3, Body, Small, Code) with font specs, a 6-card component grid (Button, Card, Data Table, Callout, Badge, Input), and a button row with 6 variant examples.',
      tags: ["design-system", "ui", "components", "style-guide"],
      toolCall: { method: "render_page", template: "design", options: { title: "Nebula UI v2.0 — Design System" } }
    },
    {
      slug: "prototyping",
      title: "Create Interactive Wireframe Mockup",
      category: "Design",
      industry: "UX Design",
      description: "Create an interactive wireframe mockup with navigation, sidebar, dashboard cards, and data visualization.",
      template: "prototyping",
      prompt: 'Create an interactive wireframe prototype for a Campaign Manager dashboard. Include a top navigation bar with logo and 5 nav items, a sidebar with 6 menu items, a content area with header and action buttons, 3 stat cards (Total Spend: $128.4K, Conversions: 8,942, ROAS: 3.2x), an active campaigns list, and a bar chart performance trend with 10 bars and date labels.',
      tags: ["prototype", "wireframe", "ux", "mockup"],
      toolCall: { method: "render_page", template: "prototyping", options: { title: "Campaign Manager — Wireframe" } }
    }
  ];

  // ──────────────────────────────────────────────
  // STATE
  // ──────────────────────────────────────────────
  const state = {
    activeSlug: null,
    searchQuery: '',
    activeCategory: 'All',
    promptOpen: false,
    activeDetailTab: 'prompt',
    mobilePanel: 'list' // 'list' | 'preview'
  };

  // ──────────────────────────────────────────────
  // DOM REFS
  // ──────────────────────────────────────────────
  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => document.querySelectorAll(sel);

  const els = {};
  function cacheEls() {
    els.list = document.getElementById('useCaseList');
    els.search = document.getElementById('searchInput');
    els.filterRow = document.getElementById('filterRow');
    els.resultCount = document.getElementById('resultCount');
    els.previewFrame = document.getElementById('previewFrame');
    els.previewPlaceholder = document.getElementById('previewPlaceholder');
    els.panelTitle = document.getElementById('panelTitle');
    els.panelCategory = document.getElementById('panelCategory');
    els.panelIndustry = document.getElementById('panelIndustry');
    els.promptToggle = document.getElementById('promptToggle');
    els.promptContent = document.getElementById('promptContent');
    els.promptText = document.getElementById('promptText');
    els.copyDetailBtn = document.getElementById('copyDetailBtn');
    els.toolCallText = document.getElementById('toolCallText');
    els.detailTabs = document.getElementById('detailTabs');
    els.mobileToggle = document.getElementById('mobileToggle');
    els.npxCmdCopy = document.getElementById('npxCmdCopy');
  }

  // ──────────────────────────────────────────────
  // HELPERS
  // ──────────────────────────────────────────────
  function getCategories() {
    const cats = ['All'];
    USE_CASES.forEach(uc => {
      if (!cats.includes(uc.category)) cats.push(uc.category);
    });
    return cats;
  }

  function getFiltered() {
    return USE_CASES.filter(uc => {
      if (state.activeCategory !== 'All' && uc.category !== state.activeCategory) return false;
      if (state.searchQuery) {
        const q = state.searchQuery.toLowerCase();
        const match = uc.title.toLowerCase().includes(q) ||
          uc.description.toLowerCase().includes(q) ||
          uc.category.toLowerCase().includes(q) ||
          uc.industry.toLowerCase().includes(q) ||
          uc.tags.some(t => t.toLowerCase().includes(q));
        if (!match) return false;
      }
      return true;
    });
  }

  function groupByCategory(items) {
    const groups = {};
    items.forEach(uc => {
      if (!groups[uc.category]) groups[uc.category] = [];
      groups[uc.category].push(uc);
    });
    return groups;
  }

  function categoryCount(cat) {
    if (cat === 'All') return USE_CASES.length;
    return USE_CASES.filter(uc => uc.category === cat).length;
  }

  // ──────────────────────────────────────────────
  // RENDER
  // ──────────────────────────────────────────────
  function render() {
    renderFilters();
    renderList();
    if (state.activeSlug) {
      const uc = USE_CASES.find(u => u.slug === state.activeSlug);
      if (uc) loadPreview(uc);
    }
  }

  function renderFilters() {
    const cats = getCategories();
    els.filterRow.innerHTML = cats.map(cat =>
      `<button class="filter-pill${state.activeCategory === cat ? ' active' : ''}" data-cat="${cat}">
        ${cat} <span class="count">${categoryCount(cat)}</span>
      </button>`
    ).join('');

    // Bind filter clicks
    els.filterRow.querySelectorAll('.filter-pill').forEach(btn => {
      btn.addEventListener('click', () => {
        state.activeCategory = btn.dataset.cat;
        state.activeSlug = null;
        showPlaceholder();
        render();
      });
    });
  }

  function renderList() {
    const items = getFiltered();
    els.resultCount.textContent = `${items.length} use case${items.length !== 1 ? 's' : ''}`;

    if (items.length === 0) {
      els.list.innerHTML = `<div class="empty-state">No use cases match your search. Try different keywords.</div>`;
      return;
    }

    const groups = groupByCategory(items);
    let html = '';
    for (const [cat, cases] of Object.entries(groups)) {
      html += `<div class="category-group">`;
      html += `<div class="category-group-header"><span class="collapse-icon">▾</span>${cat}</div>`;
      cases.forEach(uc => {
        const isActive = uc.slug === state.activeSlug;
        html += `<div class="use-case-item${isActive ? ' active' : ''}" data-slug="${uc.slug}">
          <div class="uc-title">${uc.title}</div>
          <div class="uc-desc">${uc.description}</div>
          <div class="uc-industry">${uc.industry}</div>
          <div class="uc-tags">${uc.tags.slice(0, 3).map(t => `<span class="uc-tag">${t}</span>`).join('')}</div>
        </div>`;
      });
      html += `</div>`;
    }
    els.list.innerHTML = html;

    // Bind item clicks
    els.list.querySelectorAll('.use-case-item').forEach(item => {
      item.addEventListener('click', () => {
        const slug = item.dataset.slug;
        const uc = USE_CASES.find(u => u.slug === slug);
        if (uc) {
          state.activeSlug = slug;
          loadPreview(uc);
          renderList(); // re-render to update active state
          // On mobile, switch to preview panel
          if (window.innerWidth <= 768) {
            state.mobilePanel = 'preview';
            updateMobileView();
          }
        }
      });
    });
  }

  function buildToolCallJSON(uc) {
    const tc = uc.toolCall || { method: "render_page", template: uc.template, options: {} };
    return JSON.stringify({
      jsonrpc: "2.0",
      id: 1,
      method: "tools/call",
      params: {
        name: tc.method,
        arguments: {
          template: tc.template,
          sections: "/* see prompt */",
          output_path: `/tmp/${uc.slug}.html`,
          options: tc.options
        }
      }
    }, null, 2);
  }

  function loadPreview(uc) {
    // Update right panel header
    els.panelTitle.textContent = uc.title;
    els.panelCategory.textContent = uc.category;
    els.panelIndustry.textContent = uc.industry;

    // Show iframe, hide placeholder
    els.previewPlaceholder.style.display = 'none';
    els.previewFrame.style.display = 'block';
    els.previewFrame.src = `use-cases/${uc.slug}.html`;

    els.promptText.textContent = uc.prompt;
    els.toolCallText.textContent = buildToolCallJSON(uc);
    state.promptOpen = false;
    els.promptToggle.classList.remove('open');
    els.promptContent.classList.remove('open');
    switchDetailTab('prompt');
  }

  function switchDetailTab(tab) {
    els.detailTabs.querySelectorAll('.detail-tab').forEach(t => {
      t.classList.toggle('active', t.dataset.tab === tab);
    });
    els.promptText.style.display = tab === 'prompt' ? 'block' : 'none';
    els.toolCallText.style.display = tab === 'toolcall' ? 'block' : 'none';
    state.activeDetailTab = tab;
  }

  function showPlaceholder() {
    els.previewPlaceholder.style.display = 'flex';
    els.previewFrame.style.display = 'none';
    els.panelTitle.textContent = 'Select a Use Case';
    els.panelCategory.textContent = '';
    els.panelIndustry.textContent = '';
    els.promptText.textContent = '';
    els.toolCallText.textContent = '';
    els.promptToggle.classList.remove('open');
    els.promptContent.classList.remove('open');
  }

  function updateMobileView() {
    const left = document.querySelector('.left-panel');
    const right = document.querySelector('.right-panel');
    if (state.mobilePanel === 'list') {
      left.style.display = 'flex';
      right.style.display = 'none';
    } else {
      left.style.display = 'none';
      right.style.display = 'flex';
    }
  }

  // ──────────────────────────────────────────────
  // EVENT BINDING
  // ──────────────────────────────────────────────
  function bindEvents() {
    // Search
    els.search.addEventListener('input', (e) => {
      state.searchQuery = e.target.value;
      state.activeSlug = null;
      showPlaceholder();
      renderList();
      renderFilters();
    });

    // Prompt toggle
    els.promptToggle.addEventListener('click', togglePrompt);
    els.promptToggle.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        togglePrompt();
      }
    });

    function togglePrompt() {
      state.promptOpen = !state.promptOpen;
      els.promptToggle.classList.toggle('open', state.promptOpen);
      els.promptToggle.setAttribute('aria-expanded', state.promptOpen);
      els.promptContent.classList.toggle('open', state.promptOpen);
    }

    els.detailTabs.addEventListener('click', (e) => {
      const tab = e.target.closest('.detail-tab');
      if (tab) switchDetailTab(tab.dataset.tab);
    });

    els.copyDetailBtn.addEventListener('click', async (e) => {
      e.stopPropagation();
      const tab = state.activeDetailTab || 'prompt';
      const text = tab === 'prompt' ? els.promptText.textContent : els.toolCallText.textContent;
      try {
        await navigator.clipboard.writeText(text);
        els.copyDetailBtn.textContent = '✓ Copied!';
        els.copyDetailBtn.classList.add('copied');
        setTimeout(() => {
          els.copyDetailBtn.textContent = '📋 Copy';
          els.copyDetailBtn.classList.remove('copied');
        }, 2000);
      } catch {
        const ta = document.createElement('textarea');
        ta.value = text;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        ta.remove();
        els.copyDetailBtn.textContent = '✓ Copied!';
        setTimeout(() => { els.copyDetailBtn.textContent = '📋 Copy'; }, 2000);
      }
    });

    // Mobile toggle
    if (els.mobileToggle) {
      els.mobileToggle.addEventListener('click', () => {
        state.mobilePanel = state.mobilePanel === 'list' ? 'preview' : 'list';
        updateMobileView();
      });
    }

    // Copy npx command
    if (els.npxCmdCopy) {
      els.npxCmdCopy.addEventListener('click', async () => {
        const text = 'npx -y @aimino/fast-html-mcp-server';
        try {
          await navigator.clipboard.writeText(text);
          els.npxCmdCopy.textContent = '✓ Copied!';
          els.npxCmdCopy.classList.add('copied');
          setTimeout(() => {
            els.npxCmdCopy.textContent = '📋 Copy';
            els.npxCmdCopy.classList.remove('copied');
          }, 2000);
        } catch {
          const ta = document.createElement('textarea');
          ta.value = text;
          document.body.appendChild(ta);
          ta.select();
          document.execCommand('copy');
          ta.remove();
          els.npxCmdCopy.textContent = '✓ Copied!';
          setTimeout(() => { els.npxCmdCopy.textContent = '📋 Copy'; }, 2000);
        }
      });
    }

    // Handle window resize for mobile
    window.addEventListener('resize', () => {
      if (window.innerWidth > 768) {
        document.querySelector('.left-panel').style.display = '';
        document.querySelector('.right-panel').style.display = '';
      } else {
        updateMobileView();
      }
    });
  }

  // ──────────────────────────────────────────────
  // INIT
  // ──────────────────────────────────────────────
  function init() {
    cacheEls();
    // Initially show first use case if available
    if (USE_CASES.length > 0) {
      const first = USE_CASES[0];
      state.activeSlug = first.slug;
      loadPreview(first);
    }
    render();
    bindEvents();

    // Mobile initial state
    if (window.innerWidth <= 768) {
      state.mobilePanel = 'list';
      updateMobileView();
    }
  }

  // Wait for DOM
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
