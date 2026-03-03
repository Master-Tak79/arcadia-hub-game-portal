# Godot Relic Survivor (v0.1.27-dev)

탑다운 로그라이크 생존 액션 신규 프로젝트입니다.
현재 코어 전투 루프(이동/대시/자동공격/적 4종+보스 스폰/피격/재시작),
레벨업 3지선다 + 업그레이드 16종(복합 효과 포함), 유물 12종 시스템까지 반영된 상태입니다.

## 최근 개선 (v0.1.27-dev)
- Elite Pack 01 추가
  - `Elite Grunt`: 탱키 + 버스트 돌진
  - `Elite Dasher`: 연속 돌진 체인 패턴
  - 일반 웨이브에 엘리트 스폰 구간/확률 반영
- Relic System 01 추가 (12종)
  - 공격4 / 기동3 / 생존3 / 혼합2 유물 구현
  - 런타임 유물 획득 루프 + HUD 요약 + 획득 배너 연동
  - `--relic-test` QA 루프 및 게이트 검증 추가
- Stage Event Pack 01 추가 (3종)
  - 안개(Fog): 사거리 저하 이벤트
  - 감속지대(Slow Zone): 지대 내부 이동속도 저하
  - 전류지대(Shock Zone): 주기 피해 지대
  - 텔레그래프/종료 로그 + `--event-test` QA 루프 및 게이트 검증 추가
- 미니보스 패턴 다양화 + 텔레그래프 강화
  - 대시 예고(windup) 시각화 + HUD 텍스트 + 이벤트 배너 추가
  - 콤보 대시 패턴(확률형) 도입으로 보스 패턴 다양화
  - 비대시형 소환 패턴(차단열 WALL) 도입 + 소환 텔레그래프 추가
  - 소환 패턴 출현비/대시 연계 타이밍 1차 미세조정(가독성 우선)
  - 보스 등장 직후 짧은 안전구간(접촉 피해 없음) + 근거리 즉시대시 제한 적용
- Boss Phase 2 Upgrade
  - HP 구간 기반 페이즈 전환 + 전환 연출/안전구간 추가
  - 페이즈2에서 대시/소환 템포 강화 및 HUD PHASE 상태 노출
  - `--boss-phase2-test` QA 루프 및 게이트 검증 추가
- Meta Growth 01
  - 런 종료 보상(Shards) + 영구 특성 3종(vitality/celerity/focus) 추가
  - 런 시작 시 영구 보정 자동 적용 + HUD META 상태 노출
  - `--meta-test` QA 루프 및 게이트 검증 추가
- Character Pack 01
  - 캐릭터 2종 추가: `Ranger`(기동/연사형), `Warden`(탱커형)
  - 런타임 선택 `--character=ranger|warden` + HUD `CHAR` 상태 노출
  - 게이트 `character_ranger`, `character_warden` 검증 추가
- Weapon Archetype Pack 01
  - 무기 계열 3종 추가: `pierce`, `dot`, `aoe`
  - 런타임 선택 `--weapon=pierce|dot|aoe` + HUD `WEAPON` 상태 노출
  - 게이트 `weapon_pierce`, `weapon_dot`, `weapon_aoe` 검증 추가
- Active Skill Pack 01
  - 캐릭터 전용 액티브 스킬 추가: Ranger `Windstep Burst`, Warden `Bulwark Pulse`
  - 입력 액션 `Q`(active skill) + HUD `SKILL` 상태 노출
  - 게이트 `active_ranger`, `active_warden` 검증 추가
- Character/Weapon Tree Runtime 01
  - 캐릭터 전용 트리 적용기(`tree_progression`) + 노드 데이터(`character_trees`) 추가
  - 트리 정책 반영: `meta_shards` 공유 / T1~T3 비용 1/2/3 / 다음 라운드 적용
  - 게이트 `tree_ranger`, `tree_warden` 검증 추가
- Tree UI/UX Pack 01
  - 트리 메뉴 패널(`T`) 추가: 노드 확인/해금(1/2/3) UX 제공
  - `--tree-ui-test` 자동 검증 경로 + `tree_ui` 게이트 추가
- Visual Upgrade Pack 01 (Asset Integration)
  - CC0(Kenney Space Shooter Redux) 에셋 적용(플레이어/적/투사체/배경)
  - 도형 렌더링 중심에서 스프라이트 렌더링 중심으로 1차 전환
  - 라이선스/출처 등록(`09_asset_register.md`, `docs/assets/kenney_space_shooter_redux_LICENSE.txt`)
- Quality+Feature Upgrade Pack 01
  - 전투 피드백 강화: 히트/킬 VFX + 투사체 트레일
  - 웨이브 미션 시스템: 목표 할당/진행/완료 보상
  - 엘리트 변형 패턴: Grunt(juggernaut/berserk), Dasher(phantom/bulwark)
- Step 14 Fast Follow — Feedback/Runtime Polish
  - `texture_runtime.gd` 전역 캐시 도입(엔티티/투사체 텍스처 재사용)
  - 미션 연속 성공 보너스(미션 스트릭) + HUD 스트릭 표시 추가
  - `impact_fx` 링/스포크 연출 강화로 타격 가독성 개선
- Step 15 Core Runtime Refactor Pack 01
  - `game_root.gd` 일부 책임 분리: `pressure_runtime.gd`, `levelup_advisor.gd`
  - 압박도 계산/auto-levelup 판단 로직을 시스템 모듈로 이동
  - 밸런스 프리즈 체크 스크립트가 신규 구조를 인식하도록 보강
- Step 16 Interface Boundary Cleanup Pack 01
  - `game_root.gd` 내부 `has_method` 가드 제거(0건) 및 오케스트레이션 경계 정리
  - 직접 관리 객체 호출 경로를 명시화해 런타임 동적 분기 복잡도 축소
  - 전체 headless/누수/프리즈 게이트 재통과 확인
- Step 17 Interface Boundary Cleanup Pack 02
  - `hud.gd`, `boss_reward_runtime.gd`의 `has_method` 분기 제거(직접 제어 객체 기준)
  - 보스 경고/페이즈/텔레그래프 HUD 표기 및 보스 연출 런타임 호출 경계 단순화
  - 전체 headless/누수/프리즈 게이트 재통과 확인
- Step 18 VFX/Animation Polish Pack 01
  - `impact_fx.gd` 2차 연출 강화(이중 링/오비탈 파편/스포크 보강)
  - `event_banner.gd` 슬라이드-인/페이드 진입 애니메이션 추가
  - `level_up_panel.gd` 등장 모션(패널 오프셋/알파 이징) 추가
  - 전체 headless/누수/프리즈 게이트 재통과 확인
- Step 18 UI Readability Fast Follow
  - `level_up_panel.gd`를 텍스트 블록형에서 카드형 3선택 레이아웃으로 전환
  - 역할별 컬러 카드/키 헤더/효과 요약/간이 지표/추천 노트 구성 적용
  - 카드 등장 스태거(지연) 애니메이션으로 선택 가독성 강화
- Step 18 UX Input/History Fast Follow
  - 레벨업 카드 마우스 hover/좌클릭 선택 지원(숫자키 선택 유지)
  - `H` 키 업그레이드 선택 히스토리 패널 추가(최근 선택 카드/효과 확인)
- 레벨업 선택지 가독성/시너지 개선
  - 역할 태그(공격/기동/생존/혼합) + 효과 요약 + 상황별 추천 문구 노출
  - 선택지별 예상 지표(예상 DPS/생존 지표, 간이 추정) 표시
  - 업그레이드 제안 가중치에 컨텍스트(체력/레벨/과중첩/현재 압박도) 반영
  - QA auto-levelup 선택 로직도 multi-effect 선택지를 반영하도록 개선
- 압박도(Pressure) 신호 추가
  - 실시간 압박도(low/mid/high)를 상태로 계산해 HUD/추천 로직에 반영
- 전투/스폰 안정화
  - 일반 적 스폰에 플레이어 안전 반경 적용
  - 전투 판정에 공간 인덱스(셀 기반 후보 추출) 적용으로 병목 완화 준비
  - 게임오버 시 사망 원인/상황(death recap) 표시
- QA 시나리오/리포트 확장
  - headless gate에 `boss_pattern` 케이스 추가(소환/대시 텔레그래프 검증)
  - boss_pattern 다양성 검증(RING/WALL 최소 1회) 추가
  - 체크포인트 리포트 스크립트(`checkpoint-report.sh`) 추가
  - 밸런스 프리즈 검증 스크립트(`balance-freeze-check.sh`) 추가

## 조작
- 이동: `WASD` 또는 방향키
- 대시: `Shift`
- 액티브 스킬: `Q`
- 트리 메뉴: `T`
- 재시작: `R`
- 레벨업/트리 선택: `1 / 2 / 3`

## 실행
```bash
../../scripts/godotw --path .
../../scripts/godotw --headless --path . --quit-after 360

# 보스 테스트 모드(경고/등장/처치 검증)
../../scripts/godotw --headless --path . --fixed-fps 60 --quit-after 5400 -- --boss-test --auto-levelup --qa-autopilot

# 보스 패턴 테스트 모드(소환/대시 텔레그래프 검증)
../../scripts/godotw --headless --path . --fixed-fps 60 --quit-after 5400 -- --boss-pattern-test --auto-levelup --qa-autopilot

# 보스 페이즈2 테스트 모드
../../scripts/godotw --headless --path . --fixed-fps 60 --quit-after 4200 -- --boss-phase2-test --auto-levelup --qa-autopilot

# 엘리트 스폰 테스트 모드
../../scripts/godotw --headless --path . --fixed-fps 60 --quit-after 2400 -- --elite-test --auto-levelup --qa-autopilot

# 유물 획득 테스트 모드
../../scripts/godotw --headless --path . --fixed-fps 60 --quit-after 1800 -- --relic-test --auto-levelup --qa-autopilot

# 이벤트 테스트 모드(안개/감속/전류)
../../scripts/godotw --headless --path . --fixed-fps 60 --quit-after 2400 -- --event-test --auto-levelup --qa-autopilot

# 메타 성장 테스트 모드(보상/영구특성)
../../scripts/godotw --headless --path . --fixed-fps 60 --quit-after 2400 -- --meta-test --qa-force-damage --qa-auto-restart --auto-levelup

# 캐릭터 테스트 모드(기동형/탱커형)
../../scripts/godotw --headless --path . --fixed-fps 60 --quit-after 1800 -- --character=ranger --auto-levelup --qa-autopilot
../../scripts/godotw --headless --path . --fixed-fps 60 --quit-after 1800 -- --character=warden --auto-levelup --qa-autopilot

# 캐릭터 액티브 스킬 테스트 모드
../../scripts/godotw --headless --path . --fixed-fps 60 --quit-after 1800 -- --character=ranger --character-test --auto-levelup --qa-autopilot
../../scripts/godotw --headless --path . --fixed-fps 60 --quit-after 1800 -- --character=warden --character-test --auto-levelup --qa-autopilot

# 트리 적용 테스트 모드
../../scripts/godotw --headless --path . --fixed-fps 60 --quit-after 1800 -- --character=ranger --tree-test --auto-levelup --qa-autopilot
../../scripts/godotw --headless --path . --fixed-fps 60 --quit-after 1800 -- --character=warden --tree-test --auto-levelup --qa-autopilot

# 트리 UI 테스트 모드(패널 열기/해금 UX)
../../scripts/godotw --headless --path . --fixed-fps 60 --quit-after 1800 -- --character=ranger --tree-ui-test --auto-levelup --qa-autopilot

# 감성(피드백) 테스트 모드(VFX/트레일)
../../scripts/godotw --headless --path . --fixed-fps 60 --quit-after 1800 -- --feel-test --auto-levelup --qa-autopilot

# 미션 테스트 모드
../../scripts/godotw --headless --path . --fixed-fps 60 --quit-after 2400 -- --mission-test --elite-test --auto-levelup --qa-autopilot

# 엘리트 변형 테스트 모드
../../scripts/godotw --headless --path . --fixed-fps 60 --quit-after 2400 -- --elite-test --elite-variant-test --auto-levelup --qa-autopilot

# 무기 계열 테스트 모드(관통/도트/광역)
../../scripts/godotw --headless --path . --fixed-fps 60 --quit-after 1800 -- --weapon=pierce --auto-levelup --qa-autopilot
../../scripts/godotw --headless --path . --fixed-fps 60 --quit-after 1800 -- --weapon=dot --auto-levelup --qa-autopilot
../../scripts/godotw --headless --path . --fixed-fps 60 --quit-after 1800 -- --weapon=aoe --auto-levelup --qa-autopilot

# SFX 프리셋 옵션
# --sfx-preset=default | quiet | hype
../../scripts/godotw --headless --path . --quit-after 900 -- --sfx-preset=quiet
../../scripts/godotw --headless --path . --fixed-fps 60 --quit-after 5400 -- --boss-test --auto-levelup --qa-autopilot --sfx-preset=hype

# 10분 안정성 시뮬레이션
../../scripts/godotw --headless --path . --fixed-fps 60 --quit-after 36000 -- --auto-levelup

# 재시작 루프 QA
../../scripts/godotw --headless --path . --fixed-fps 60 --quit-after 3000 -- --qa-force-damage --qa-auto-restart --qa-autopilot --auto-levelup

# 원클릭 헤드리스 Alpha Gate (스모크/보스/재시작/장시간)
./tools/qa/headless-alpha-gate.sh
# 로그 출력 위치: ./.qa/headless/<timestamp>/*.log

# ObjectDB/Warning 심화 추적(Verbose long sim)
./tools/qa/trace-objectdb-leak.sh
# 요약: ./.qa/leak-trace/<timestamp>/leak-summary.txt

# 수동 QA 전 준비상태 점검
./tools/qa/pre-manual-qa-check.sh

# 체크포인트 리포트 생성(핸드오프용)
./tools/qa/checkpoint-report.sh
# 산출: ./.qa/reports/checkpoint-<timestamp>.md

# 수치 프리즈 검증(수동 QA 전 최종 확인)
./tools/qa/balance-freeze-check.sh
```


## 구조
- `scenes/` 메인 씬
- `scripts/core/` 상태/루프/입력
- `scripts/entities/` 플레이어/적/투사체
- `scripts/systems/` 스폰/전투/성장 시스템
- `scripts/ui/` HUD/패널/카메라 FX
- `scripts/audio/` SFX 슬롯 런타임
- `scripts/data/` 밸런스 데이터

## 오디오 슬롯(보스 이벤트)
- 기본 슬롯:
  - `res://assets/audio/boss_warning.ogg`
  - `res://assets/audio/boss_spawn.ogg`
  - `res://assets/audio/boss_defeat.ogg`
- 현재 프로젝트에는 임시 generated SFX가 주입되어 있습니다.
- 파일이 없으면 게임은 정상 동작하며, 슬롯 미할당 로그만 1회 출력됩니다.

## 프로젝트 문서
- `docs/projects/godot-relic-survivor/00_game_blueprint.md`
- `docs/projects/godot-relic-survivor/01_gdd.md`
- `docs/projects/godot-relic-survivor/02_development_plan.md`
- `docs/projects/godot-relic-survivor/03_roadmap.md`
- `docs/projects/godot-relic-survivor/04_devlog.md`
- `docs/projects/godot-relic-survivor/05_qa_checklist.md`
- `docs/projects/godot-relic-survivor/06_release_notes.md`
- `docs/projects/godot-relic-survivor/07_dev_guidelines.md`
- `docs/projects/godot-relic-survivor/08_update_guidelines.md`
- `docs/projects/godot-relic-survivor/09_asset_register.md`
- `docs/projects/godot-relic-survivor/10_development_journal.md`
- `docs/projects/godot-relic-survivor/11_manual_qa_protocol.md`
- `docs/projects/godot-relic-survivor/12_balance_tuning_log.md`
- `docs/projects/godot-relic-survivor/13_alpha_readiness_report.md`
- `docs/projects/godot-relic-survivor/14_pr_description_alpha_candidate.md`
- `docs/projects/godot-relic-survivor/15_merge_handover_checklist.md`
- `docs/projects/godot-relic-survivor/16_alpha_candidate_quality_lock.md`
- `docs/projects/godot-relic-survivor/17_content_expansion_execution_plan.md`
- `docs/projects/godot-relic-survivor/18_content_expansion_checklist.md`
- `docs/projects/godot-relic-survivor/19_character_weapon_tree_design.md`
- `docs/projects/godot-relic-survivor/20_quality_upgrade_review.md`
