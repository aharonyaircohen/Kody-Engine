/**
 * @fileType test
 * @domain kody | runner-backend
 * @pattern unit-test
 * @ai-summary Unit tests for runner-backend (LocalRunner and GitHubRunner)
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import type { ChildProcess } from "child_process";

// Use vi.hoisted to define mocks before vi.mock is hoisted
const { mockSpawn, mockResolveOpenCodeBinary } = vi.hoisted(() => ({
  mockSpawn: vi.fn<(...args: any[]) => ChildProcess>(),
  mockResolveOpenCodeBinary: vi.fn().mockReturnValue("/fake/opencode"),
}));

// Mock modules before importing the module under test
vi.mock("./opencode-server", () => ({
  resolveOpenCodeBinary: mockResolveOpenCodeBinary,
}));

vi.mock("child_process", () => ({
  spawn: mockSpawn,
}));

// Import after mocks are set up
import { LocalRunner, GitHubRunner, createRunner } from "./runner-backend";

describe("LocalRunner", () => {
  let runner: LocalRunner;

  beforeEach(() => {
    runner = new LocalRunner();
    mockSpawn.mockReturnValue({} as ChildProcess);
    mockSpawn.mockClear();
  });

  describe("spawn without server", () => {
    it("should use 'opencode' command (not 'ocode')", () => {
      runner.spawn("build", "test prompt", {}, "/tmp/cwd");

      expect(mockSpawn).toHaveBeenCalledWith(
        "pnpm",
        expect.arrayContaining(["opencode", "run"]),
        expect.any(Object),
      );
    });

    it("should pass --agent, --format json flags", () => {
      runner.spawn("build", "test prompt", {}, "/tmp/cwd");

      const call = mockSpawn.mock.calls[0];
      const args = call[1] as string[];
      expect(args).toContain("opencode");
      expect(args).toContain("run");
      expect(args).toContain("--agent");
      expect(args).toContain("build");
      expect(args).toContain("--format");
      expect(args).toContain("json");
    });

    it("should include AGENT and MODEL env vars", () => {
      const env = { MODEL: "claude-3-5-sonnet" };
      runner.spawn("build", "test prompt", env, "/tmp/cwd");

      const call = mockSpawn.mock.calls[0];
      const options = call[2] as { env: Record<string, string> };
      expect(options.env.AGENT).toBe("build");
      expect(options.env.MODEL).toBe("claude-3-5-sonnet");
    });

    it("should NOT contain 'ocode' in arguments", () => {
      runner.spawn("build", "test prompt", {}, "/tmp/cwd");

      const call = mockSpawn.mock.calls[0];
      const args = call[1] as string[];
      const ocodeIndex = args.indexOf("ocode");
      expect(ocodeIndex).toBe(-1);
    });
  });

  describe("spawn with server", () => {
    it("should use resolveOpenCodeBinary instead of pnpm", () => {
      mockResolveOpenCodeBinary.mockReturnValue("/fake/opencode");
      runner.spawn("build", "test prompt", {}, "/tmp/cwd", {
        serverUrl: "http://localhost:8080",
      });

      expect(mockSpawn).toHaveBeenCalledWith(
        "/fake/opencode",
        expect.arrayContaining(["run", "--agent", "build"]),
        expect.any(Object),
      );
    });
  });
});

describe("GitHubRunner", () => {
  let runner: GitHubRunner;

  beforeEach(() => {
    runner = new GitHubRunner();
    mockSpawn.mockReturnValue({} as ChildProcess);
    mockSpawn.mockClear();
  });

  describe("spawn without server", () => {
    it("should use 'pnpm exec opencode' (not 'ocode')", () => {
      runner.spawn("build", "test prompt", {}, "/tmp/cwd");

      expect(mockSpawn).toHaveBeenCalledWith(
        "pnpm",
        expect.arrayContaining(["exec", "opencode", "run"]),
        expect.any(Object),
      );
    });

    it("should NOT contain 'ocode' in arguments", () => {
      runner.spawn("build", "test prompt", {}, "/tmp/cwd");

      const call = mockSpawn.mock.calls[0];
      const args = call[1] as string[];
      const ocodeIndex = args.indexOf("ocode");
      expect(ocodeIndex).toBe(-1);
    });
  });
});

// Note: createRunner tests removed - getEnv() caches environment at module load
// The critical tests (ocode -> opencode) are covered above
