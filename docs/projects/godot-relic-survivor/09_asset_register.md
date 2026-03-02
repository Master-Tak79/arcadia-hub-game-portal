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
| RS-001 | Audio SFX | Boss Warning SFX | internal-generated (ffmpeg) | internal | `/mnt/d/OpenClaw_Downloads/game-assets/audio/relic-survivor/boss_warning.ogg` | `assets/audio/boss_warning.ogg` | Yes | 2026-03-01 생성/주입 완료 (v2 envelope tuning) |
| RS-002 | Audio SFX | Boss Spawn SFX | internal-generated (ffmpeg) | internal | `/mnt/d/OpenClaw_Downloads/game-assets/audio/relic-survivor/boss_spawn.ogg` | `assets/audio/boss_spawn.ogg` | Yes | 2026-03-01 생성/주입 완료 (v2 low-rise tuning) |
| RS-003 | Audio SFX | Boss Defeat SFX | internal-generated (ffmpeg) | internal | `/mnt/d/OpenClaw_Downloads/game-assets/audio/relic-survivor/boss_defeat.ogg` | `assets/audio/boss_defeat.ogg` | Yes | 2026-03-01 생성/주입 완료 (v2 descend+echo) |

## 운영 규칙

- 신규 에셋 반입 시 표에 즉시 1행 추가
- 라이선스가 불명확하면 반입 보류
- 유료/제한 라이선스는 사용 범위 명시

## 2026-03-03 추가 에셋 (Visual Upgrade Pack 01)

### Kenney - Space Shooter Redux
- Source: https://kenney.nl/assets/space-shooter-redux
- License: CC0 1.0 (Public Domain)
- Local license copy: `games/godot-relic-survivor/docs/assets/kenney_space_shooter_redux_LICENSE.txt`

#### 반영 파일
- `assets/sprites/kenney/player/player_main.png`
- `assets/sprites/kenney/enemies/grunt.png`
- `assets/sprites/kenney/enemies/dasher.png`
- `assets/sprites/kenney/enemies/elite_grunt.png`
- `assets/sprites/kenney/enemies/elite_dasher.png`
- `assets/sprites/kenney/enemies/miniboss.png`
- `assets/sprites/kenney/projectiles/default.png`
- `assets/sprites/kenney/projectiles/pierce.png`
- `assets/sprites/kenney/projectiles/dot.png`
- `assets/sprites/kenney/projectiles/aoe.png`
- `assets/sprites/kenney/background/base.png`

#### 적용 범위
- Player / Enemy(일반·엘리트·미니보스) / Projectile / Arena Background 렌더링
