/**
 * @fileType configuration
 * @domain kody | pipeline
 * @pattern project-config
 * @ai-summary Configurable project settings — replaces hardcoded quality commands
 */

import * as fs from 'fs'
import * as path from 'path'

export interface QualityCommands {
  typecheck: string
  lint: string
  lintFix: string
  format: string
  formatFix: string
  testUnit: string
  testE2e?: string
}

export interface GitConfig {
  defaultBranch: string
  userEmail?: string
  userName?: string
}

export interface GitHubConfig {
  owner: string
  repo: string
  appId?: number
}

export interface AgentConfig {
  /** Project-specific instruction files to inject into agent prompts */
  instructions: string[]
  /** Domain agent → territory glob mapping */
  domainMap: Record<string, string[]>
}

export interface KodyProjectConfig {
  quality: QualityCommands
  git: GitConfig
  github: GitHubConfig
  agents: AgentConfig
  paths: {
    taskDir: string
  }
}

const DEFAULT_CONFIG: KodyProjectConfig = {
  quality: {
    typecheck: 'pnpm -s tsc --noEmit',
    lint: 'pnpm -s lint',
    lintFix: 'pnpm lint:fix',
    format: 'pnpm -s format:check',
    formatFix: 'pnpm format:fix',
    testUnit: 'pnpm -s test:unit',
  },
  git: {
    defaultBranch: 'dev',
  },
  github: {
    owner: '',
    repo: '',
  },
  agents: {
    instructions: [],
    domainMap: {},
  },
  paths: {
    taskDir: '.tasks',
  },
}

let _config: KodyProjectConfig | null = null

/**
 * Load project config from kody.config.json in the project root.
 * Falls back to defaults if no config file exists.
 */
export function loadProjectConfig(projectRoot: string = process.cwd()): KodyProjectConfig {
  if (_config) return _config

  const configPath = path.join(projectRoot, 'kody.config.json')

  if (fs.existsSync(configPath)) {
    try {
      const raw = JSON.parse(fs.readFileSync(configPath, 'utf-8'))
      _config = {
        quality: { ...DEFAULT_CONFIG.quality, ...raw.quality },
        git: { ...DEFAULT_CONFIG.git, ...raw.git },
        github: { ...DEFAULT_CONFIG.github, ...raw.github },
        agents: {
          instructions: raw.agents?.instructions ?? DEFAULT_CONFIG.agents.instructions,
          domainMap: raw.agents?.domainMap ?? DEFAULT_CONFIG.agents.domainMap,
        },
        paths: { ...DEFAULT_CONFIG.paths, ...raw.paths },
      }
    } catch {
      _config = DEFAULT_CONFIG
    }
  } else {
    _config = DEFAULT_CONFIG
  }

  return _config
}

/**
 * Get the current project config (must call loadProjectConfig first).
 */
export function getProjectConfig(): KodyProjectConfig {
  if (!_config) return loadProjectConfig()
  return _config
}

/**
 * Reset config cache (for testing).
 */
export function resetProjectConfig(): void {
  _config = null
}
