/**
 * CLI entry point for @kody-ade/kody-engine
 *
 * Commands:
 *   init     — Copy kody.yml workflow + opencode config to target repo
 *   run      — Run the Kody pipeline (default when no command given)
 *   version  — Print package version
 */

import { Command } from "commander";
import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Resolve paths relative to the package root (dist/bin/cli.mjs → package root)
const PKG_ROOT = path.resolve(__dirname, "..", "..");

function getVersion(): string {
  const pkgPath = path.join(PKG_ROOT, "package.json");
  const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf-8"));
  return pkg.version;
}

// ==========================================================================
// init command — bootstrap target repo with kody.yml + kody config
// ==========================================================================

function initCommand(opts: { force: boolean; workflowOnly: boolean }) {
  const cwd = process.cwd();
  const templatesDir = path.join(PKG_ROOT, "templates");
  const opencodeDir = path.join(PKG_ROOT, "opencode");

  // 1. Copy kody.yml
  const workflowSrc = path.join(templatesDir, "kody.yml");
  const workflowDest = path.join(cwd, ".github", "workflows", "kody.yml");

  if (!fs.existsSync(workflowSrc)) {
    console.error("Error: Template kody.yml not found in package.");
    process.exit(1);
  }

  if (fs.existsSync(workflowDest) && !opts.force) {
    console.log(
      "⚠ .github/workflows/kody.yml already exists. Use --force to overwrite.",
    );
  } else {
    fs.mkdirSync(path.dirname(workflowDest), { recursive: true });
    fs.copyFileSync(workflowSrc, workflowDest);
    console.log("✓ Copied .github/workflows/kody.yml");
  }

  // 2. Create kody.config.json if it doesn't exist
  const configDest = path.join(cwd, "kody.config.json");
  if (!fs.existsSync(configDest)) {
    const defaultConfig = {
      quality: {
        typecheck: "pnpm -s tsc --noEmit",
        lint: "pnpm -s lint",
        lintFix: "pnpm lint:fix",
        format: "pnpm -s format:check",
        formatFix: "pnpm format:fix",
        testUnit: "pnpm -s test:unit",
      },
      git: {
        defaultBranch: "dev",
      },
      github: {
        owner: "",
        repo: "",
      },
      paths: {
        taskDir: ".tasks",
      },
    };
    fs.writeFileSync(configDest, JSON.stringify(defaultConfig, null, 2) + "\n");
    console.log(
      "✓ Created kody.config.json (edit github.owner and github.repo)",
    );
  }

  console.log(`
Done! Next steps:
  1. Edit kody.config.json — set github.owner and github.repo
  2. Add secrets to your GitHub repo settings:
     - MINIMAX_API_KEY (or other LLM keys)
     - GH_PAT (optional, for cross-repo operations)
  3. Commit and push the workflow file
  4. Comment "@kody full <task-id>" on any issue to run the pipeline
`);
}

// ==========================================================================
// run command — execute the Kody pipeline
// ==========================================================================

async function runCommand() {
  const { main } = await import("@engine/entry");
  await main(process.argv.slice(3));
}

// ==========================================================================
// CI helper commands — used by the workflow in parse/orchestrate jobs
// ==========================================================================

async function parseSafetyCommand() {
  await import("@engine/parse-safety");
}

async function parseInputsCommand() {
  await import("@engine/parse-inputs");
}

async function checkoutBranchCommand() {
  await import("@engine/checkout-task-branch");
}

// ==========================================================================
// Utilities
// ==========================================================================

function copyDirRecursive(src: string, dest: string, force: boolean) {
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDirRecursive(srcPath, destPath, force);
    } else {
      if (fs.existsSync(destPath) && !force) continue;
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

// ==========================================================================
// Program
// ==========================================================================

const program = new Command()
  .name("kody-engine")
  .version(getVersion())
  .description("Kody CI/CD pipeline engine");

program
  .command("init")
  .description("Initialize Kody in the current repo (copies workflow + config)")
  .option("-f, --force", "Overwrite existing files", false)
  .option("-w, --workflow-only", "Only copy the workflow file", false)
  .action(initCommand);

program
  .command("run", { isDefault: true })
  .description("Run the Kody pipeline (default command)")
  .allowUnknownOption()
  .allowExcessArguments()
  .action(runCommand);

program
  .command("parse-safety")
  .description("Validate comment trigger safety (CI helper)")
  .action(parseSafetyCommand);

program
  .command("parse-inputs")
  .description("Parse command inputs from trigger (CI helper)")
  .action(parseInputsCommand);

program
  .command("checkout-branch")
  .description("Checkout or create feature branch for task (CI helper)")
  .action(checkoutBranchCommand);

program.parse();
