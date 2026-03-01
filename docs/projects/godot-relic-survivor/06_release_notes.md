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
- 미니 보스 시스템 1차
  - 미니보스 엔티티(`entities/enemy_miniboss.gd`)
  - 보스 디렉터(`systems/miniboss_director.gd`)
  - 10분 페이즈 경고/등장/처치 루프 + HUD 경고 표기
- 보스 처치 UX 1차
  - 이벤트 배너(`ui/event_banner.gd`)
  - 보스 처치 보상(`+EXP`, `+HP`) 적용
  - 짧은 슬로우모션 연출 적용

## Changed
- `docs/projects/_index.md` 상태 갱신(archived + in-progress)
- HUD 정보 확장(ENEMIES/SHOTS/EXP/MAX_HP/DASH + 보스 경고/활성/격파 상태)
- 씬/UI 구조 확장(ProjectileContainer + EventBanner 추가)
- 입력 액션 확장(level-up 선택 `1/2/3`)
- 게임 상태 구조 확장(EXP/업그레이드 스택/런타임 모디파이어)
- 전투 판정 확장(적별 접촉 피해/EXP 보상)
- QA 런타임 옵션 확장(`--qa-autopilot`, `--qa-force-damage`, `--qa-auto-restart`)

## Fixed
- `spawn_director.gd` 타입 추론 경고 에러 처리(명시 타입 적용)

## Verification
- 문서/경로 구조 반영 확인
- `godotw --headless` 스모크 실행 통과 (`RELIC_SURVIVOR_BOOT_OK`)
- 10분 시뮬레이션 3회:
  - `godotw --headless --fixed-fps 60 --quit-after 36000 -- --auto-levelup` x3 통과
- 보스 루프 QA 3회:
  - `godotw --headless --fixed-fps 60 --quit-after 5400 -- --boss-test --auto-levelup --qa-autopilot` x3
  - `MINIBOSS_WARNING_ON`
  - `MINIBOSS_SPAWNED`
  - `MINIBOSS_DEFEATED`
  - `BOSS_CLEAR_REWARD_APPLIED`
  로그 확인
- 재시작 루프 QA:
  - `godotw --headless --fixed-fps 60 --quit-after 3000 -- --qa-force-damage --qa-auto-restart`
  - `QA_FORCE_DEATH`, `QA_AUTO_RESTART_TRIGGERED` 반복 확인
- `mcporter call godot-local.godot_run_headless` 실행 통과

## Known Issues
- 미니보스 소환 패턴/본체 돌진 패턴 난이도 2차 튜닝 필요
- 보스 처치 연출/보상 UX 폴리싱 미완
- 실수동 QA 3회(키 입력 기반 조작감/난이도 체감) 아직 미진행
