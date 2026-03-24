# Kody Engine

Multi-agent CI/CD pipeline that converts GitHub issues into implemented pull requests.

Comment `@kody` on any GitHub issue and the engine takes it from there: spec analysis, architecture planning, code generation, review, and PR creation — all automated via GitHub Actions.

## How It Works

```
@kody on issue → taskify → gap → architect → build → review → verify → PR
```

Each stage runs an LLM agent with specialized prompts. The engine orchestrates execution through a state machine with gates, retries, and quality checks.

## Install in Your Repo

```bash
npx @kody-ade/kody-engine init
```

This copies:

- `.github/workflows/kody.yml` — GitHub Actions workflow
- `.opencode/` — Agent prompt definitions
- `kody.config.json` — Pipeline configuration

Then add your LLM API keys as GitHub repo secrets and you're ready to go.

## Pipeline Modes

| Mode    | What it does                                 |
| ------- | -------------------------------------------- |
| `full`  | Spec + implementation (default)              |
| `spec`  | Analyze and spec the task only               |
| `impl`  | Skip to implementation (needs existing spec) |
| `rerun` | Resume from last failure point               |
| `fix`   | Re-review and fix cycle                      |

## Usage

Comment on a GitHub issue:

```
@kody                          # full pipeline
@kody spec                     # spec only
@kody impl                     # implementation only
@kody rerun --from build       # resume from build stage
@kody approve                  # approve a paused gate
```

Or trigger via `workflow_dispatch` with explicit inputs.

## Configuration

Edit `kody.config.json` in your target repo:

```json
{
  "quality": {
    "typecheck": "pnpm tsc --noEmit",
    "lint": "pnpm lint",
    "testUnit": "pnpm test:unit"
  },
  "git": {
    "defaultBranch": "dev"
  },
  "github": {
    "owner": "your-org",
    "repo": "your-repo"
  }
}
```

## Required Secrets

Add these to your GitHub repo settings:

| Secret              | Required                 | Purpose               |
| ------------------- | ------------------------ | --------------------- |
| `MINIMAX_API_KEY`   | Yes (or another LLM key) | LLM provider          |
| `GEMINI_API_KEY`    | Optional                 | Google Gemini         |
| `OPENAI_API_KEY`    | Optional                 | OpenAI                |
| `ANTHROPIC_API_KEY` | Optional                 | Anthropic Claude      |
| `GH_PAT`            | Optional                 | Cross-repo operations |

## Development

```bash
# Install dependencies
pnpm install

# Run pipeline locally
pnpm kody --task-id <id> --mode full

# Type check
pnpm typecheck

# Run tests
pnpm test

# Build npm package
pnpm build:engine

# Publish
pnpm publish:engine
```

## Architecture

See [src/engine/README.md](./src/engine/README.md) for the full architecture reference, including:

- State machine design and execution flow
- Stage types (agent, scripted, git, gate)
- Post-action system
- Gate and approval workflow
- Complexity-based stage routing
- Rerun and recovery

## Project Structure

```
src/engine/           # Pipeline engine source
packages/kody-engine/ # Publishable npm package
.opencode/agents/     # LLM agent prompt definitions
.github/workflows/    # CI workflow
config/               # Example configuration
```

## License

MIT
