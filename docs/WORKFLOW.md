# Development Workflow

## Getting Started

```bash
# Clone the repository
git clone git@github.com:Aimino-Tech/OpenTalk2HTML-NotMD.git
cd OpenTalk2HTML-NotMD
```

## Development Workflow

### 1. Branch Naming

Use **kebab-case** with category prefixes:

| Prefix   | Purpose          | Branch From | Merge To |
|----------|------------------|-------------|----------|
| `feature/` | New features   | `main`      | `main`   |
| `fix/`     | Bug fixes      | `main`      | `main`   |
| `hotfix/`  | Critical fixes | `main`      | `main`   |
| `chore/`   | Maintenance    | `main`      | `main`   |
| `docs/`    | Documentation  | `main`      | `main`   |

Examples:
```
feature/user-authentication
fix/login-validation
hotfix/security-patch
docs/api-endpoints
```

### 2. Development Cycle

1. **Create** a branch from `main` with an appropriate prefix
2. **Develop** with regular, atomic commits
3. **Rebase** on latest `main` before opening a PR
4. **Open PR** targeting `main`
5. **Address review** feedback
6. **Merge** via squash merge
7. **Delete** the branch after merge

### 3. Commit Conventions

Follow conventional commits:

```
<type>: <short description>

<optional body>
<optional footer>
```

Types: `feat`, `fix`, `chore`, `docs`, `refactor`, `test`, `style`, `perf`

Examples:
```
feat: add user authentication endpoint
fix: resolve race condition in cache layer
docs: update API documentation
```

## Build & Test

```bash
# Install dependencies
npm install

# Run linting
npx @biomejs/biome check .

# Run type checking (if applicable)
npx tsc --noEmit

# Run tests
npm test

# Build
npm run build
```

## Linting & Formatting

This project enforces code quality through automated linting and formatting.

- **Linting rules** are defined in the project's linting configuration
- **Formatting** is automatically checked in CI
- Run linting locally before committing to avoid CI failures

## Pull Request Process

1. Ensure all CI checks pass
2. Request review from at least one maintainer
3. Address all reviewer comments
4. Keep PRs focused — one feature/fix per PR
5. Update PR description with context and testing evidence

## CI/CD

- **CI** runs on every PR: lint → typecheck → test → build
- **Merge requirements**: all CI checks must pass, at least one review approval required
- **Branch protection**: direct pushes to `main` are blocked — all changes must go through PRs