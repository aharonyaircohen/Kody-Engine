# Kody Pipeline — Agent Reference

## Architecture

Two layers:

1. **CI Layer** — `.github/workflows/kody.yml` (parse + orchestrate jobs)
2. **Engine Layer** — `src/engine/` (state machine, stage handlers, agent runner)

See [src/engine/README.md](./src/engine/README.md) for the full architecture reference.

## Project Structure

```
.github/workflows/kody.yml    # CI workflow
src/engine/                    # Pipeline engine (entry.ts, state machine, handlers)
  ├── pipeline/                # Stage definitions, post-actions, orchestrator
  ├── handlers/                # Stage type handlers (agent, scripted, git, gate)
  ├── modes/                   # Pipeline modes (full, spec, impl, rerun, fix)
  ├── config/                  # Constants, project config
  ├── stages/                  # Stage registry (source of truth)
  ├── agent/                   # Agent execution (file watcher, session, log parser)
  └── engine/                  # State machine, types, status, pipeline resolver
.opencode/agents/              # LLM agent prompt definitions (~30 agents)
.opencode/docs/                # Pipeline and browser automation docs
opencode.json                  # Agent model configuration
config/                        # Example configs (kody.config.example.json)
packages/kody-engine/          # Publishable npm package (@kody-ade/kody-engine)
```

## Pipeline Flow

```
@kody on issue → taskify → gap → architect → plan-gap → build → commit → review → fix → verify → pr
```

## Pipeline Modes

| Mode    | Stages                                                             |
| ------- | ------------------------------------------------------------------ |
| `full`  | spec (taskify → gap) + impl (architect → pr)                       |
| `spec`  | taskify → gap → clarify                                            |
| `impl`  | architect → plan-gap → build → commit → review → fix → verify → pr |
| `rerun` | Resume from last failure/pause point                               |
| `fix`   | review → fix → commit → verify → pr                                |

## Key Files

| File                                  | Purpose                                    |
| ------------------------------------- | ------------------------------------------ |
| `src/engine/entry.ts`                 | CLI entry point, mode routing              |
| `src/engine/engine/state-machine.ts`  | Main execution loop                        |
| `src/engine/pipeline/definitions.ts`  | Stage order and definitions                |
| `src/engine/stages/registry.ts`       | Stage metadata (source of truth)           |
| `src/engine/config/project-config.ts` | Target project config (`kody.config.json`) |
| `opencode.json`                       | LLM model and agent configuration          |

## Agent Prompts

All agent prompts live in `.opencode/agents/`. Each pipeline stage that runs an LLM agent has a corresponding prompt file.

| Agent          | Purpose                                    |
| -------------- | ------------------------------------------ |
| `taskify.md`   | Convert issue body to structured task.json |
| `gap.md`       | Analyze spec for gaps and inconsistencies  |
| `architect.md` | Create implementation plan                 |
| `plan-gap.md`  | Analyze plan vs spec for coverage gaps     |
| `build.md`     | Implement code changes                     |
| `review.md`    | Architect-level code review                |
| `fix.md`       | Fix issues found by review/verify          |
| `autofix.md`   | Fix lint/type/format errors                |
| `pr.md`        | Create PR with summary                     |

## Quality Gates

After build, the engine runs quality checks:

1. TypeScript check (`tsc --noEmit`)
2. Unit tests
3. On failure: autofix agent retries (up to 2 loops)

Commands are configurable via `kody.config.json` in the target project.

## Environment Variables

### Engine (CI)

| Variable              | Purpose                                  |
| --------------------- | ---------------------------------------- |
| `GH_TOKEN` / `GH_PAT` | GitHub API access                        |
| `MINIMAX_API_KEY`     | LLM provider key                         |
| `GEMINI_API_KEY`      | LLM provider key                         |
| `OPENAI_API_KEY`      | LLM provider key                         |
| `ANTHROPIC_API_KEY`   | LLM provider key                         |
| `TASK_ID`             | Pipeline task identifier                 |
| `MODE`                | Pipeline mode (full/spec/impl/rerun/fix) |
| `ISSUE_NUMBER`        | GitHub issue number                      |

## Debug

```bash
# Check pipeline status
cat .tasks/<task-id>/status.json | jq '.state'

# Check which stages ran
cat .tasks/<task-id>/status.json | jq '.stages | to_entries[] | select(.value.state != "pending")'

# Resume from stage
@kody rerun <task-id> --from build

# Resume with feedback
@kody rerun <task-id> --from architect --feedback "Use existing Button component"
```

## Adding a New Stage

1. Add name to `STAGE_NAMES` in `src/engine/stages/registry.ts`
2. Add metadata in `STAGE_REGISTRY`
3. Add to pipeline order arrays
4. Define in `createStageDefinitions()` in `pipeline/definitions.ts`
5. Create agent prompt in `.opencode/agents/<stage>.md`

See [src/engine/STAGE_AUTHORING.md](./src/engine/STAGE_AUTHORING.md) for details.
