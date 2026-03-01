# 06_release_notes — Godot Relic Survivor

## Version
- version: v0.1.0-dev
- date: 2026-03-01

## Added
- 신규 프로젝트 문서 세트(청사진/GDD/개발계획/로드맵/개발일지/QA/릴리즈노트)
- 추가 운영 문서 세트
  - `07_dev_guidelines.md`
  - `08_update_guidelines.md`
  - `09_asset_register.md`
  - `10_development_journal.md`
- 기존 `Godot Neon Dodge` 아카이브 전환
- 코어 전투 시스템 1차
  - 자동공격(`auto_attack_system.gd`)
  - 발사체 엔티티(`projectile.gd`)
  - 전투 판정(`combat_system.gd`)
  - 적 2종(`enemy_grunt.gd`, `enemy_dasher.gd`)
- 스폰 디렉터 고도화(주기 램프 + 대셔 확률 램프)
- EXP/레벨업 시스템 1차
  - 업그레이드 데이터 12종(`data/upgrades.gd`)
  - 업그레이드 적용기(`systems/upgrade_system.gd`)
  - 레벨업 선택 패널(`ui/level_up_panel.gd`, 1/2/3 입력)

## Changed
- `docs/projects/_index.md` 상태 갱신(archived + in-progress)
- HUD 정보 확장(ENEMIES/SHOTS/EXP/MAX_HP/DASH)
- 씬 구조 확장(ProjectileContainer 추가)
- 입력 액션 확장(level-up 선택 `1/2/3`)
- 게임 상태 구조 확장(EXP/업그레이드 스택/런타임 모디파이어)

## Fixed
- `spawn_director.gd` 타입 추론 경고 에러 처리(명시 타입 적용)

## Verification
- 문서/경로 구조 반영 확인
- `godotw --headless` 스모크 실행 통과 (`RELIC_SURVIVOR_BOOT_OK`)
- `godotw --headless --fixed-fps 60 --quit-after 9000` 통과
- `mcporter call godot-local.godot_run_headless` 실행 통과

## Known Issues
- EXP/레벨업 3지선다 미구현
- 미니 보스 미구현
- 수동 QA 3회(조작감/난이도 체감) 대기
