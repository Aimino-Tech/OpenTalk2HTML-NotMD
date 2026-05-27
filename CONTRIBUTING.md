# Contributing

Thank you for considering contributing to OpenTalk2HTML-NotMD!

## Development Setup

```bash
git clone https://github.com/Aimino-Tech/OpenTalk2HTML-NotMD.git
cd OpenTalk2HTML-NotMD
npm install
npm run build
```

## Code Style

- TypeScript strict mode
- ESM modules only (no CommonJS)
- No markdown converters — pure HTML generation with doT.js templates
- parse5 for HTML AST manipulation (not regex)
- All output sanitized through DOMPurify

## Pull Request Process

1. Run `npm run build` — must compile cleanly with zero errors
2. Update `README.md` if adding or changing tools, components, or templates
3. Update `src/registry.ts` if modifying tool schemas
4. Open a PR against the `master` branch
5. Describe the problem and solution clearly in the PR description

## Adding a New Component

1. Create a doT template in `src/templates/` following existing patterns
2. Register the component in `src/components/` and `src/registry.ts`
3. Verify the component renders standalone and inside a page via `render_page`

## Reporting Issues

Report bugs and suggest features at https://github.com/Aimino-Tech/OpenTalk2HTML-NotMD/issues

Include:
- Node.js version
- MCP client and version
- Steps to reproduce
- Expected vs actual behavior

## Code of Conduct

Be respectful and constructive. We welcome contributors of all experience levels.
