# 14_pr_description_alpha_candidate

> 아래 내용을 PR 본문으로 그대로 사용 가능합니다.

## PR Meta

- **Title:** `feat: ship relic survivor v0.1.0-alpha-candidate (auto-verified)`
- **Base branch:** `main`
- **Head branch:** `feat/relic-survivor-bootstrap`
- **Release stage:** `v0.1.0-alpha-candidate`

## Summary

`Godot Relic Survivor`를 `v0.1.0-alpha-candidate` 수준까지 고도화했습니다.

주요 반영:
- 코어 전투 루프(이동/대시/자동공격/충돌/적 2종)
- EXP/레벨업 3지선다 + 업그레이드 12종
- 미니보스(경고/등장/처치/보상) + 소환 패턴
- 보스 처치 UX(배너/보상/슬로우모션)
- 자동 QA 모드 확장 및 회귀 검증 체계 확립
- `game_root` 책임 분리 리팩터링
- 난이도 2차 튜닝 + 적 개체수 캡 안전장치

## Scope

### Added
- `scripts/entities/enemy_miniboss.gd`
- `scripts/ui/event_banner.gd`
- `scripts/core/runtime_options.gd`
- `scripts/systems/qa_runtime.gd`
- `scripts/systems/boss_reward_runtime.gd`
- 문서:
  - `11_manual_qa_protocol.md`
  - `12_balance_tuning_log.md`
  - `13_alpha_readiness_report.md`
  - `14_pr_description_alpha_candidate.md`
  - `15_merge_handover_checklist.md`

### Changed
- `scripts/core/game_root.gd` (orchestrator 중심으로 단순화)
- `scripts/systems/spawn_director.gd` (soft/hard cap)
- `scripts/data/balance.gd` (2차 튜닝)
- `README.md`, `04_devlog.md`, `05_qa_checklist.md`, `06_release_notes.md`, `10_development_journal.md`

## Verification

### Smoke
- `godotw --headless --path ./games/godot-relic-survivor --quit-after 900`

### 10-min stability
- `godotw --headless --fixed-fps 60 --quit-after 36000 -- --auto-levelup` (x3)
- tuning 후:
- `godotw --headless --fixed-fps 60 --quit-after 36000 -- --auto-levelup --qa-autopilot` (x2)

### Boss loop
- `godotw --headless --fixed-fps 60 --quit-after 5400 -- --boss-test --auto-levelup --qa-autopilot` (x3)
- 확인 로그:
  - `MINIBOSS_WARNING_ON`
  - `MINIBOSS_SPAWNED`
  - `MINIBOSS_DEFEATED`
  - `BOSS_CLEAR_REWARD_APPLIED`

### Restart loop
- `godotw --headless --fixed-fps 60 --quit-after 3000 -- --qa-force-damage --qa-auto-restart`
- 확인 로그:
  - `QA_FORCE_DEATH`
  - `QA_AUTO_RESTART_TRIGGERED`

## Key Commits (head branch)
- `d6b4242` archive neon dodge + bootstrap relic survivor
- `8b1aa84` core combat loop (auto-attack + enemy 2종)
- `93209b2` EXP level-up choices + 12 upgrades
- `c0698a0` miniboss phase (warning/spawn)
- `3191ab7` miniboss summon pattern + defeat loop QA
- `3c0d19c` boss clear UX + comprehensive QA runtime
- `a87e5cc` refactor runtime/QA/boss-reward from game_root
- `e4991e0` balance 2nd tuning + enemy cap safeguards
- `65332b2` alpha readiness report + manual QA deferred note
- `be4c67b` PR/merge handover packaging docs

## Risks / Deferred

- 실수동 QA 3회(키 입력 기반 조작감/난이도 체감) 보류
- GUI FPS 실측 보류
- 보스 연출 추가 폴리싱(사운드/카메라) 잔여

## Release Gate

현재 상태: **v0.1.0-alpha-candidate (자동검증 기준)**

최종 `v0.1.0-alpha` 확정 조건:
1. 수동 QA 3회 완료 (`11_manual_qa_protocol.md`)
2. GUI FPS 실측 체크 완료
3. 체크리스트/릴리즈노트 최종 동기화

## Recommendation

현재는 **alpha-candidate로 merge 후, 수동 QA 재개 시 alpha 확정 태깅** 전략을 권장합니다.
