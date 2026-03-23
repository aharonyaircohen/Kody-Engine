# @aguyinvest/kody-engine

Multi-agent CI/CD pipeline engine that converts GitHub issues into pull requests.

## Quick Start

```bash
# Initialize Kody in your repo
npx @aguyinvest/kody-engine init
```

This sets up:
- `.github/workflows/kody.yml` — GitHub Actions workflow
- `.opencode/` — Agent prompt definitions
- `kody.config.json` — Pipeline configuration

## Setup

1. Run `npx @aguyinvest/kody-engine init` in your repo
2. Edit `kody.config.json` with your repo details
3. Add LLM API keys as GitHub repo secrets (e.g., `MINIMAX_API_KEY`)
4. Commit and push the workflow file
5. Comment `@kody` on any issue to run the pipeline

## Commands

```bash
# Initialize in target repo
kody-engine init [--force] [--workflow-only]

# Run pipeline (used by CI workflow)
kody-engine run

# CI helper commands
kody-engine parse-safety
kody-engine parse-inputs
kody-engine checkout-branch
```

## Usage on GitHub Issues

```
@kody                     # Full pipeline (spec + implementation)
@kody spec                # Analyze and spec only
@kody impl                # Implementation only
@kody rerun --from build  # Resume from stage
@kody approve             # Approve paused gate
```

## Configuration

`kody.config.json`:

```json
{
  "quality": {
    "typecheck": "pnpm tsc --noEmit",
    "lint": "pnpm lint",
    "testUnit": "pnpm test:unit"
  },
  "git": { "defaultBranch": "dev" },
  "github": { "owner": "your-org", "repo": "your-repo" }
}
```

## Required Secrets

| Secret | Purpose |
|--------|---------|
| `MINIMAX_API_KEY` | LLM provider (or `OPENAI_API_KEY`, `ANTHROPIC_API_KEY`, `GEMINI_API_KEY`) |
| `GH_PAT` | Optional: cross-repo operations |

## License

MIT
