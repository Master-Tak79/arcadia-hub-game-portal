#!/usr/bin/env node
import { spawn } from "node:child_process";
import fs from "node:fs/promises";
import path from "node:path";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

const GODOT_CANDIDATES = [
  process.env.GODOT_BIN,
  "/mnt/d/OpenClaw_Downloads/Godot/latest-win64/Godot_v4.6.1-stable_win64_console.exe",
  "/mnt/d/OpenClaw_Downloads/Godot/latest-win64/Godot_v4.6.1-stable_win64.exe",
  "/mnt/d/OpenClaw_Downloads/Godot/4.6.1-stable/Godot_v4.6.1-stable_win64_console.exe",
  "/mnt/d/OpenClaw_Downloads/Godot/4.6.1-stable/Godot_v4.6.1-stable_win64.exe"
].filter(Boolean);

async function pickGodotBin() {
  for (const candidate of GODOT_CANDIDATES) {
    try {
      await fs.access(candidate);
      return candidate;
    } catch {}
  }
  throw new Error("Godot executable not found. Set GODOT_BIN or install under /mnt/d/OpenClaw_Downloads/Godot");
}

const WORKSPACE_ROOT = process.env.WORKSPACE_ROOT || process.cwd();

function toAbs(p) {
  return path.isAbsolute(p) ? p : path.resolve(WORKSPACE_ROOT, p);
}

function run(bin, args, opts = {}) {
  const { cwd = process.cwd(), timeoutMs = 180_000 } = opts;

  return new Promise((resolve, reject) => {
    const child = spawn(bin, args, { cwd, stdio: ["ignore", "pipe", "pipe"] });
    let stdout = "";
    let stderr = "";

    const timer = setTimeout(() => {
      child.kill("SIGTERM");
      reject(new Error(`Command timed out after ${timeoutMs}ms: ${bin} ${args.join(" ")}`));
    }, timeoutMs);

    child.stdout.on("data", (chunk) => {
      stdout += chunk.toString();
    });

    child.stderr.on("data", (chunk) => {
      stderr += chunk.toString();
    });

    child.on("error", (err) => {
      clearTimeout(timer);
      reject(err);
    });

    child.on("close", (code) => {
      clearTimeout(timer);
      if (code === 0) {
        resolve({ code, stdout: stdout.trim(), stderr: stderr.trim() });
      } else {
        reject(new Error(`Exit ${code}\nSTDOUT:\n${stdout}\nSTDERR:\n${stderr}`));
      }
    });
  });
}

async function createHeadlessStarter({ projectPath, projectName, sceneName, message }) {
  const abs = toAbs(projectPath);
  await fs.mkdir(abs, { recursive: true });

  const projectGodot = `; Engine configuration file.\nconfig_version=5\n\n[application]\nconfig/name="${projectName}"\nrun/main_scene="res://${sceneName}.tscn"\n`;

  const scene = `[gd_scene load_steps=2 format=3]\n\n[ext_resource type="Script" path="res://${sceneName}.gd" id="1_1"]\n\n[node name="${sceneName}" type="Node2D"]\nscript = ExtResource("1_1")\n`;

  const script = `extends Node2D\n\nfunc _ready() -> void:\n\tprint("${message}")\n\tget_tree().quit()\n`;

  await Promise.all([
    fs.writeFile(path.join(abs, "project.godot"), projectGodot, "utf8"),
    fs.writeFile(path.join(abs, `${sceneName}.tscn`), scene, "utf8"),
    fs.writeFile(path.join(abs, `${sceneName}.gd`), script, "utf8")
  ]);

  return abs;
}

const server = new McpServer({
  name: "godot-local-bridge",
  version: "0.1.0"
});

server.tool(
  "godot_version",
  "Return installed Godot version via local executable",
  {},
  async () => {
    const godot = await pickGodotBin();
    const result = await run(godot, ["--version"]);
    return {
      content: [{ type: "text", text: result.stdout || result.stderr || "(no output)" }],
      structuredContent: { godot, version: result.stdout || result.stderr || "unknown" }
    };
  }
);

server.tool(
  "godot_create_project",
  "Create a minimal headless-ready Godot project with one scene/script",
  {
    projectPath: z.string().describe("Project directory path"),
    projectName: z.string().default("HeadlessStarter").describe("Godot project name"),
    sceneName: z.string().default("Main").describe("Main scene/script base name"),
    message: z.string().default("HEADLESS_OK").describe("Text printed on run")
  },
  async ({ projectPath, projectName, sceneName, message }) => {
    const abs = await createHeadlessStarter({ projectPath, projectName, sceneName, message });
    return {
      content: [{ type: "text", text: `Project created at ${abs}` }],
      structuredContent: { projectPath: abs, projectName, sceneName }
    };
  }
);

server.tool(
  "godot_run_headless",
  "Run a Godot project in headless mode",
  {
    projectPath: z.string().describe("Directory that contains project.godot"),
    quitAfter: z.number().int().positive().default(300).describe("Iterations before forced quit"),
    extraArgs: z.array(z.string()).optional().describe("Additional CLI args")
  },
  async ({ projectPath, quitAfter, extraArgs }) => {
    const godot = await pickGodotBin();
    const abs = toAbs(projectPath);

    const args = ["--headless", "--path", abs, "--quit-after", String(quitAfter), ...(extraArgs ?? [])];
    const result = await run(godot, args, { timeoutMs: 240_000 });

    const text = [result.stdout, result.stderr].filter(Boolean).join("\n").trim() || "(no output)";
    return {
      content: [{ type: "text", text }],
      structuredContent: { projectPath: abs, args }
    };
  }
);

server.tool(
  "godot_export_build",
  "Export a Godot project build (requires export presets configured)",
  {
    projectPath: z.string().describe("Directory that contains project.godot"),
    preset: z.string().describe("Export preset name, e.g., Windows Desktop"),
    outputPath: z.string().describe("Output file path"),
    mode: z.enum(["release", "debug"]).default("release")
  },
  async ({ projectPath, preset, outputPath, mode }) => {
    const godot = await pickGodotBin();
    const absProject = toAbs(projectPath);
    const absOutput = toAbs(outputPath);

    await fs.mkdir(path.dirname(absOutput), { recursive: true });

    const exportFlag = mode === "debug" ? "--export-debug" : "--export-release";
    const args = ["--headless", "--path", absProject, exportFlag, preset, absOutput];
    const result = await run(godot, args, { timeoutMs: 600_000 });

    const text = [result.stdout, result.stderr].filter(Boolean).join("\n").trim() || "(no output)";
    return {
      content: [{ type: "text", text }],
      structuredContent: { projectPath: absProject, preset, outputPath: absOutput, mode }
    };
  }
);

const transport = new StdioServerTransport();
await server.connect(transport);
