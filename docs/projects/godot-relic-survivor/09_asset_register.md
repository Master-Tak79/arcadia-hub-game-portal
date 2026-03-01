# 09_asset_register — Godot Relic Survivor

## 목적

프로젝트에서 사용하는 외부/내부 에셋의 출처, 라이선스, 저장 경로를 추적 관리합니다.

## 저장 경로 원칙

- 원본 저장: `/mnt/d/OpenClaw_Downloads/game-assets/`
- 프로젝트 반영본: `games/godot-relic-survivor/assets/` (필요 시)

## 등록 표

| ID | Type | Name | Source | License | Original Path (D:) | Project Path | Modified | Notes |
|---|---|---|---|---|---|---|---|---|
| RS-000 | Placeholder | Procedural shapes (code draw) | internal | internal | - | scripts/ui, scripts/entities | Yes | 초기 개발 단계 코드 기반 렌더 |
| RS-001 | Audio Slot | Boss Warning SFX (slot) | pending | pending | `/mnt/d/OpenClaw_Downloads/game-assets/audio/relic-survivor/boss_warning.*` | `assets/audio/boss_warning.ogg` | TBD | 슬롯 구조만 선반영, 파일은 추후 주입 |
| RS-002 | Audio Slot | Boss Spawn SFX (slot) | pending | pending | `/mnt/d/OpenClaw_Downloads/game-assets/audio/relic-survivor/boss_spawn.*` | `assets/audio/boss_spawn.ogg` | TBD | 슬롯 구조만 선반영, 파일은 추후 주입 |
| RS-003 | Audio Slot | Boss Defeat SFX (slot) | pending | pending | `/mnt/d/OpenClaw_Downloads/game-assets/audio/relic-survivor/boss_defeat.*` | `assets/audio/boss_defeat.ogg` | TBD | 슬롯 구조만 선반영, 파일은 추후 주입 |

## 운영 규칙

- 신규 에셋 반입 시 표에 즉시 1행 추가
- 라이선스가 불명확하면 반입 보류
- 유료/제한 라이선스는 사용 범위 명시
