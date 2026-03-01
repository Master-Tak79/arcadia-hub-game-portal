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
  - `11_manual_qa_protocol.md`
  - `12_balance_tuning_log.md`
  - `13_alpha_readiness_report.md`
  - `14_pr_description_alpha_candidate.md`
  - `15_merge_handover_checklist.md`
  - `16_alpha_candidate_quality_lock.md`
- 기존 `Godot Neon Dodge` 아카이브 전환
- 코어 전투 시스템 1차
  - 자동공격(`auto_attack_system.gd`)
  - 발사체 엔티티(`projectile.gd`)
  - 전투 판정(`combat_system.gd`)
  - 적 2종(`enemy_grunt.gd`, `enemy_dasher.gd`)
- 스폰 디렉터 고도화(주기 램프 + 대셔 확률 램프)
- EXP/레벨업 시스템 1차
  - 업그레이드 데이터 16종(`data/upgrades.gd`, 복합 효과 포함)
  - 업그레이드 적용기(`systems/upgrade_system.gd`, multi-effect 지원)
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
- `game_root` 책임 분리 리팩터링
  - `core/runtime_options.gd`
  - `systems/qa_runtime.gd`
  - `systems/boss_reward_runtime.gd`
- 난이도 2차 튜닝(적 속도/대시 빈도/스폰 곡선/보스 압박)
- 난이도 3차 미세 튜닝(페이즈 기반 스폰 간격/Dasher 확률 보정)
- 스폰 안전장치 추가(`ACTIVE_ENEMY_SOFT_CAP`, `ACTIVE_ENEMY_HARD_CAP`)
- 이벤트 배너 2차 폴리싱(배경/페이드/상황별 강조색)
- 카메라 연출 추가(`camera_fx.gd`): 경고/등장/처치 임팩트
- 보스 페이즈 스폰 가드레일(보스 활성 시 웨이브 압박 완화)
- 난이도 4차/5차 미세 튜닝(보스 페이즈/보스 처치 직후 회복 구간)
- 난이도 6차 미세 튜닝(후반 웨이브 곡선 잠금: ramp/backoff/late-phase shaping)
- 사운드 슬롯 구조 추가(`audio/sfx_slots.gd`) 및 보스 이벤트 훅 연결
- SFX 프리셋 옵션화(`--sfx-preset=default|quiet|hype`) + 이벤트 타이밍 딜레이 조정
- 업그레이드 확장:
  - 총 16종으로 확대(기존 12 + 복합 효과 4)
  - `upgrade_system.gd` multi-effect 처리 지원

## Fixed
- `spawn_director.gd` 타입 추론 경고 에러 처리(명시 타입 적용)
- `game_root` 과대 책임 구조 1차 해소(모듈 분리)

## Verification
- 문서/경로 구조 반영 확인
- `godotw --headless` 스모크 실행 통과 (`RELIC_SURVIVOR_BOOT_OK`)
- 10분 시뮬레이션:
  - `godotw --headless --fixed-fps 60 --quit-after 36000 -- --auto-levelup` x3 통과
  - 튜닝 후 `godotw --headless --fixed-fps 60 --quit-after 36000 -- --auto-levelup --qa-autopilot` x2 통과
- 5분 회귀 시뮬레이션:
  - `godotw --headless --fixed-fps 60 --quit-after 18000 -- --auto-levelup --qa-autopilot` 통과
  - `godotw --headless --fixed-fps 60 --quit-after 18000 -- --auto-levelup --qa-autopilot --sfx-preset=quiet` 통과
- SFX 슬롯 검증:
  - `--boss-test --auto-levelup --qa-autopilot --sfx-preset=hype`에서 warning/spawn/defeat 훅 정상 트리거
  - `--sfx-preset=quiet` 실행 정상
  - `SFX_SLOT_UNASSIGNED` 미출력 확인
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
- 현재 보스 SFX는 generated 자산(v2)이며, 향후 최종 음원 교체 여지
- 후반 웨이브 밀도 미세조정(6차 폴리싱) 여지
- 실수동 QA 3회(키 입력 기반 조작감/난이도 체감) 사용자 요청으로 보류
- 실GUI 환경 FPS 실측 체크 보류(수동 QA 재개 시 동시 수행)
