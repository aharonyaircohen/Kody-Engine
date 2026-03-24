# Kody Engine — CI/CD Multi-Agent Pipeline

Pipeline engine for automated software development. Runs in GitHub Actions on target repos via the `@kody-ade/kody-engine` npm package.

## Architecture

- **Engine** (`src/engine/`) — Pipeline state machine, stage handlers, agent runner, git/GitHub utilities
- **Agent Prompts** (`.opencode/agents/`) — LLM agent definitions for each pipeline stage
- **NPM Package** (`packages/kody-engine/`) — Publishable CLI wrapper for target repos
- **Config** (`opencode.json`) — Model and agent configuration

## Quick Commands

### Pipeline CLI

- `pnpm kody --task-id <id> --mode full` — Run full pipeline
- `pnpm kody:spec --task-id <id>` — Spec-only mode
- `pnpm kody:impl --task-id <id>` — Implementation-only mode
- `pnpm kody:rerun --task-id <id> --from <stage>` — Rerun from stage
- `pnpm kody:status --task-id <id>` — Check status

### Development

- `pnpm typecheck` — Type check
- `pnpm lint` / `pnpm lint:fix` — Lint
- `pnpm format:check` / `pnpm format` — Format

### Testing

- `pnpm test` — Run all tests
- `pnpm test:unit` — Run unit tests

### NPM Package

- `pnpm build:engine` — Build the publishable package
- `pnpm publish:engine` — Publish to npm

## Project Config

When using Kody with a target project, create a `kody.config.json` in the project root.
See `config/kody.config.example.json` for the full schema.

Key configurable settings:

- Quality gate commands (typecheck, lint, format, test)
- Git config (default branch)
- GitHub config (owner, repo)
- Agent instructions and domain mapping

## Environment Variables (CI)

- `GH_TOKEN` or `GH_PAT` — GitHub token for pipeline operations
- `GITHUB_REPOSITORY` — Target repo (owner/repo format)
- Standard GitHub Actions env vars
