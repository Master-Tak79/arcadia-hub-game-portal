# 14_pr_description_alpha_candidate

> 아래 내용을 PR 본문으로 그대로 사용 가능합니다.

## PR Meta

- **Title:** `feat: ship relic survivor v0.1.0-alpha-candidate (auto-verified)`
- **Base branch:** `main`
- **Head branch:** `feat/relic-survivor-bootstrap`
- **Release stage:** `v0.1.0-alpha-candidate`

## Summary

`Godot Relic Survivor`를 `v0.1.0-alpha-candidate` 기준으로 고도화하고,
수동 QA 전 단계에서 필요한 자동 검증/문서/운영 가드레일을 정리했습니다.

주요 반영:
- 코어 전투 루프(이동/대시/자동공격/충돌/적 2종)
- EXP/레벨업 3지선다 + 업그레이드 16종(복합 효과 포함)
- 미니보스(경고/등장/처치/보상) + 소환 패턴
- 보스 처치 UX(배너/보상/슬로우모션/카메라/SFX 슬롯)
- 보스 대시 텔레그래프 강화(예고/windup, 안전구간, 대시 로그 검증)
- 레벨업 선택지 가독성 강화(역할 태그/효과 요약/추천 문구)
- 자동 QA 모드 확장 및 회귀 검증 체계 확립
- `game_root` 책임 분리 리팩터링
- 난이도 6차 튜닝 + 스폰 가드레일/캡 안정화
- 헤드리스 원클릭 게이트 + leak trace + 수동 QA 전 readiness 체크 추가

## Scope

### Added
- `games/godot-relic-survivor/tools/qa/headless-alpha-gate.sh`
- `games/godot-relic-survivor/tools/qa/trace-objectdb-leak.sh`
- `games/godot-relic-survivor/tools/qa/pre-manual-qa-check.sh`
- `games/godot-relic-survivor/tools/qa/checkpoint-report.sh`
- 문서:
  - `11_manual_qa_protocol.md`
  - `12_balance_tuning_log.md`
  - `13_alpha_readiness_report.md`
  - `14_pr_description_alpha_candidate.md`
  - `15_merge_handover_checklist.md`
  - `16_alpha_candidate_quality_lock.md`

### Changed
- `scripts/core/game_root.gd` (orchestrator 중심으로 단순화)
- `scripts/systems/spawn_director.gd` (phase shaping + soft/hard cap + guardrail)
- `scripts/data/balance.gd` (후반 곡선 포함 6차 튜닝)
- `scripts/audio/sfx_slots.gd` (headless 안전모드 포함)
- `README.md`, `04_devlog.md`, `05_qa_checklist.md`, `06_release_notes.md`, `10_development_journal.md`, `13_alpha_readiness_report.md`

## Verification

### One-click alpha gate (권장)
```bash
cd games/godot-relic-survivor
./tools/qa/headless-alpha-gate.sh
```
검증 항목:
- smoke / boss_loop / restart_loop / long_sim
- 필수 토큰:
  - `RELIC_SURVIVOR_BOOT_OK`
  - `MINIBOSS_WARNING_ON`
  - `MINIBOSS_SPAWNED`
  - `MINIBOSS_DASH_TELEGRAPH_ON`
  - `MINIBOSS_DASH_START`
  - `MINIBOSS_DEFEATED`
  - `BOSS_CLEAR_REWARD_APPLIED`
  - `QA_FORCE_DEATH`
  - `QA_AUTO_RESTART_TRIGGERED`
- 경고 요약 파일:
  - `.qa/headless/<timestamp>/warnings-summary.txt`

### Leak trace (심화)
```bash
./tools/qa/trace-objectdb-leak.sh
```
- 산출: `.qa/leak-trace/<timestamp>/leak-summary.txt`

### Pre-manual readiness
```bash
./tools/qa/pre-manual-qa-check.sh
./tools/qa/checkpoint-report.sh
```
- 수동 QA 재개 직전 문서/도구/최근 게이트 상태 점검
- 체크포인트 핸드오프 리포트 자동 생성

## Key Commits (recent, head branch)
- `969ab32` 보스 텔레그래프 폴리싱 + 레벨업 가독성 강화
- `83249b5` headless QA 강화 + leak trace + readiness check
- `005562d` 원클릭 headless alpha gate 추가
- `d59a8cc` 업그레이드 가중치 롤 안정화
- `c7410b6` 업그레이드 16종 + multi-effect 확장
- `ba5ca07` late-wave tuning v6 + quality lock 문서
- `a87e5cc` runtime/QA/boss-reward 분리 리팩터링

## Risks / Deferred

- 수동 QA 3회(키 입력 기반 조작감/난이도 체감) 보류
- GUI FPS 실측 보류
- 일부 플랫폼/환경별 입력 매핑 경고(엔진 출력) 관찰 필요

## Release Gate

현재 상태: **v0.1.0-alpha-candidate (자동검증 기준)**

최종 `v0.1.0-alpha` 확정 조건:
1. 수동 QA 3회 완료 (`11_manual_qa_protocol.md`)
2. GUI FPS 실측 체크 완료
3. 체크리스트/릴리즈노트/리드니스 문서 최종 동기화

## Recommendation

현재는 **alpha-candidate로 merge 후, 수동 QA 재개 시 alpha 확정 태깅** 전략을 권장합니다.
