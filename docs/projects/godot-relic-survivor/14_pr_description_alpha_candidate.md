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
- 보스 대시/소환 텔레그래프 강화(예고/windup, 안전구간, 패턴 로그 검증)
- 보스 패턴 테스트 안정화(`boss_pattern` 다양성 검증: RING/WALL 최소 1회)
- Elite Pack 01 추가(Elite Grunt / Elite Dasher + elite_loop 검증)
- Relic System 01 추가(유물 12종 + relic_loop 검증)
- Stage Event Pack 01 추가(안개/감속/전류 + event_loop 검증)
- Boss Phase 2 Upgrade 추가(전환/안전구간/템포 강화 + boss_phase2 검증)
- Meta Growth 01 추가(Shard 보상/영구특성 3종/프로파일 저장 + meta_loop 검증)
- Character Pack 01 추가(Ranger/Warden + character_loop 검증)
- Weapon Archetype Pack 01 추가(pierce/dot/aoe + weapon_loop 검증)
- Active Skill Pack 01 추가(Ranger/Warden 전용 스킬 + active_loop 검증)
- Character/Weapon Tree Runtime 01 추가(트리 데이터/적용기 + tree_loop 검증)
- Tree UI/UX Pack 01 추가(트리 패널/수동 해금 UX + tree_ui 검증)
- Visual Upgrade Pack 01 추가(CC0 에셋 기반 스프라이트/배경 교체 + 라이선스 등록)
- Quality+Feature Upgrade Pack 01 추가(VFX/트레일 + 미션 시스템 + 엘리트 변형 패턴)
- Core Runtime Refactor Pack 01 추가(`pressure_runtime`/`levelup_advisor` 분리 + QA freeze check 구조 대응)
- Interface Boundary Cleanup Pack 01 추가(`game_root` has_method 경계 정리)
- Interface Boundary Cleanup Pack 02 추가(`hud`/`boss_reward_runtime` has_method 경계 정리)
- VFX/Animation Polish Pack 01 추가(`impact_fx`/`event_banner`/`level_up_panel` 미세 애니메이션 강화)
- LevelUp Card UI Fast Follow 추가(카드형 3선택 레이아웃 + 역할 컬러/요약/추천 노트)
- UX Input/History Fast Follow 추가(마우스 카드 선택 + H 히스토리 패널)
- UI/Graphics Overhaul Pack 01 추가(HUD 패널형 재설계 + 배경 연출 강화)
- Level Design / Fun Curve Pack 01 추가(스폰 페이싱 + Recover 미션 완화)
- Combat Feel Polish Pack 01 추가(전투 카메라 임팩트 연동)
- Title/Menu Framework Pack 01 추가(부트 타이틀 + ESC 메뉴 흐름)
- Options/Settings Pack 01 추가(SFX/카메라/창모드 + 설정 저장/복원)
- Content/Fun Expansion Pack 01 추가(보스 CROSS 패턴 + 이벤트 가중치 + 유물 세트 보너스)
- 레벨업 선택지 가독성 강화(역할 태그/효과 요약/추천 문구/예상 지표)
- 압박도 기반 추천 보정(웨이브/보스 압박 신호를 가중치에 반영)
- auto-levelup 선택 로직의 multi-effect 반영 + 스폰 안전 반경/전투 후보 인덱스 적용
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
- `games/godot-relic-survivor/tools/qa/balance-freeze-check.sh`
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
- smoke / boss_loop / boss_pattern / boss_phase2 / elite_loop / relic_loop / event_loop / feel_loop / mission_loop / elite_variant_loop / character_ranger / character_warden / active_ranger / active_warden / tree_ranger / tree_warden / tree_ui / weapon_pierce / weapon_dot / weapon_aoe / meta_loop / restart_loop / long_sim
- 필수 토큰:
  - `RELIC_SURVIVOR_BOOT_OK`
  - `MINIBOSS_WARNING_ON`
  - `MINIBOSS_SPAWNED`
  - `MINIBOSS_SUMMON_TELEGRAPH_ON`
  - `MINIBOSS_SUMMON_CAST`
  - `MINIBOSS_DASH_TELEGRAPH_ON`
  - `MINIBOSS_DASH_START`
  - `MINIBOSS_PHASE2_TRANSITION`
  - `MINIBOSS_PHASE2_ACTIVE`
  - `MINIBOSS_DEFEATED`
  - `BOSS_CLEAR_REWARD_APPLIED`
  - `ELITE_SPAWNED:elite_grunt`
  - `ELITE_SPAWNED:elite_dasher`
  - `RELIC_TEST_ON`
  - `RELIC_GRANTED:*` (2회 이상)
  - `EVENT_TEST_ON`
  - `EVENT_START:fog`
  - `EVENT_START:slow_zone`
  - `EVENT_START:shock_zone`
  - `CHARACTER_SELECTED:ranger`
  - `CHARACTER_SELECTED:warden`
  - `WEAPON_PIERCE_HIT`
  - `WEAPON_DOT_APPLIED`
  - `WEAPON_AOE_HIT`
  - `ACTIVE_SKILL_USED:ranger_burst`
  - `ACTIVE_SKILL_USED:warden_bulwark`
  - `TREE_PROFILE_LOADED`
  - `TREE_NODE_UNLOCKED:*`
  - `TREE_APPLIED:*`
  - `TREE_PANEL_OPEN`
  - `TREE_UI_UNLOCK_CONFIRMED:*`
  - `HIT_FX_ON`
  - `KILL_FX_ON`
  - `PROJECTILE_TRAIL_ON`
  - `MISSION_ASSIGNED:*`
  - `MISSION_COMPLETED:*`
  - `MISSION_STREAK:*`
  - `ELITE_VARIANT:*`
  - `META_PROFILE_LOADED`
  - `META_RUN_REWARD`
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
./tools/qa/balance-freeze-check.sh
```
- 수동 QA 재개 직전 문서/도구/최근 게이트 상태 점검
- 체크포인트 핸드오프 리포트 자동 생성

## Key Commits (recent, head branch)
- `9a0db13` Content/Fun Expansion Pack 01(CROSS 패턴 + 이벤트 가중치 + 유물 세트 보너스 + QA 재검증)
- `2323bc2` Options/Settings Pack 01(옵션 메뉴 + 설정 저장/복원 + QA 재검증)
- `639ea2f` Title/Menu Framework Pack 01(부트 타이틀 + ESC 메뉴 프레임워크 + QA 재검증)
- `220f972` Combat Feel Polish Pack 01(전투 카메라 임팩트 연동 + QA 재검증)
- `acd0535` Level Design/Fun Curve Pack 01(스폰 페이싱 + Recover 미션 완화 + QA 재검증)
- `8c2c651` UI/Graphics Overhaul Pack 01(HUD 패널형 재설계 + 배경 연출 강화 + QA 재검증)
- `a954e3e` UX Input/History Fast Follow(마우스 카드 선택 + H 히스토리 패널 + QA 재검증)
- `435f965` LevelUp Card UI Fast Follow(카드형 3선택 UI + QA 재검증)
- `a8d43ce` VFX/Animation Polish Pack 01(impact_fx/event_banner/level_up_panel 강화 + QA 재검증)
- `e69f9a2` Interface Boundary Cleanup Pack 02(hud/boss runtime has_method 경계 정리 + QA 재검증)
- `a683183` Interface Boundary Cleanup Pack 01(game_root has_method 경계 정리 + QA 재검증)
- `1366b5c` Core Runtime Refactor Pack 01(game_root pressure/advisor 분리 + QA freeze 구조 대응)
- `ef23837` Feedback/Runtime Polish Fast Follow(미션 스트릭 + 텍스처 캐시 + impact FX) + 문서 동기화
- `a385afc` Quality+Feature Upgrade Pack 01(VFX/미션/엘리트 변형) + 문서 동기화
- `e3d3d2e` Visual Upgrade Pack 01(CC0 에셋 통합) + 문서 동기화
- `238263e` Tree UI/UX Pack 01 + tree_ui 게이트 + 문서 동기화
- `8ca4a88` Character/Weapon Tree Runtime 01 + tree_loop 게이트 + 문서 동기화
- `7072b7f` Active Skill Pack 01 + active_loop 게이트 + 문서 동기화
- `0576aa0` Weapon Archetype Pack 01 + weapon_loop 게이트 + 문서 동기화
- `46d2d8b` Character Pack 01 + character_loop 게이트 + 문서 동기화
- `836b40a` Meta Growth 01 + meta_loop 게이트 + 문서 동기화
- `bc3cfc0` Boss Phase2 업그레이드 + boss_phase2 게이트 + 문서 동기화
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
