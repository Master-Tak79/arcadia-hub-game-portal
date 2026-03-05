# Godot MCP Bridge (Local)

Godot 4.6.x를 MCP로 호출하기 위한 로컬 stdio 서버입니다.

## 포함된 툴

- `godot_version`
- `godot_create_project`
- `godot_run_headless`
- `godot_export_build`

## 빠른 확인

```bash
mcporter list godot-local --schema
mcporter call godot-local.godot_version
```

## 예시: 헤드리스 프로젝트 생성 + 실행

```bash
mcporter call godot-local.godot_create_project \
  projectPath=.openclaw/godot-mcp-sample \
  projectName=GodotMcpSample \
  sceneName=Main \
  message=GREEN_MCP_OK

mcporter call godot-local.godot_run_headless \
  projectPath=.openclaw/godot-mcp-sample \
  quitAfter:300
```

## Godot 실행 우선순위

1. `$GODOT_BIN`
2. `/mnt/d/OpenClaw_Downloads/Godot/latest-win64/Godot_v4.6.1-stable_win64_console.exe`
3. `/mnt/d/OpenClaw_Downloads/Godot/latest-win64/Godot_v4.6.1-stable_win64.exe`
4. `/mnt/d/OpenClaw_Downloads/Godot/4.6.1-stable/Godot_v4.6.1-stable_win64_console.exe`
5. `/mnt/d/OpenClaw_Downloads/Godot/4.6.1-stable/Godot_v4.6.1-stable_win64.exe`

`godot_export_build`를 쓰려면 프로젝트에 export preset이 설정되어 있어야 합니다.
