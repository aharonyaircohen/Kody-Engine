import { defineConfig } from 'tsup'
import * as path from 'path'

// All npm dependencies stay external (installed from package.json at runtime)
const EXTERNAL_DEPS = [
  '@ai-sdk/google',
  '@ai-sdk/mcp',
  '@ai-sdk/react',
  '@anthropic-ai/sdk',
  '@modelcontextprotocol/sdk',
  '@octokit/core',
  '@octokit/plugin-throttling',
  '@octokit/rest',
  'ai',
  'commander',
  'date-fns',
  'dotenv',
  'ms',
  'pino',
  'pino-pretty',
  'slugify',
  'znv',
  'zod',
]

export default defineConfig({
  entry: {
    'bin/cli': 'src/bin/cli.ts',
  },
  format: ['esm'],
  outDir: 'dist',
  outExtension: () => ({ js: '.mjs' }),
  target: 'node22',
  platform: 'node',
  splitting: false,
  clean: true,
  sourcemap: true,
  banner: {
    js: '#!/usr/bin/env node',
  },
  // Resolve path aliases for engine imports
  esbuildOptions(options) {
    options.alias = {
      '@engine': path.resolve(__dirname, '../../src/engine'),
    }
  },
  external: EXTERNAL_DEPS,
})
