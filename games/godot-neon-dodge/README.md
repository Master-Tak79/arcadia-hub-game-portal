# Godot Neon Dodge (v0.1.0-dev)

모듈형 구조를 기준으로 초기화된 Godot 2D 탑다운 회피 프로젝트입니다.

## 구조

- `scenes/Main.tscn` — 메인 씬
- `scripts/core/` — 루프/상태/시그널
- `scripts/entities/` — 플레이어/적 엔티티
- `scripts/systems/` — 스폰/스코어 시스템
- `scripts/ui/` — HUD
- `scripts/data/` — 밸런스 상수

## 실행

```bash
../../scripts/godotw --headless --path . --quit-after 300
```

> 현재는 bootstrap 단계이며, 다음 단계에서 실제 플레이 루프 완성도를 높입니다.
