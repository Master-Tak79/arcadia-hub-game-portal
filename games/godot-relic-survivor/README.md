# Godot Relic Survivor (v0.1.11-dev)

탑다운 로그라이크 생존 액션 신규 프로젝트입니다.
현재 코어 전투 루프(이동/대시/자동공격/적 4종+보스 스폰/피격/재시작),
레벨업 3지선다 + 업그레이드 16종(복합 효과 포함), 유물 12종 시스템까지 반영된 상태입니다.

## 최근 개선 (v0.1.11-dev)
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
- 재시작: `R`
- 레벨업 선택: `1 / 2 / 3`

## 실행
```bash
../../scripts/godotw --path .
../../scripts/godotw --headless --path . --quit-after 360

# 보스 테스트 모드(경고/등장/처치 검증)
../../scripts/godotw --headless --path . --fixed-fps 60 --quit-after 5400 -- --boss-test --auto-levelup --qa-autopilot

# 보스 패턴 테스트 모드(소환/대시 텔레그래프 검증)
../../scripts/godotw --headless --path . --fixed-fps 60 --quit-after 5400 -- --boss-pattern-test --auto-levelup --qa-autopilot

# 엘리트 스폰 테스트 모드
../../scripts/godotw --headless --path . --fixed-fps 60 --quit-after 2400 -- --elite-test --auto-levelup --qa-autopilot

# 유물 획득 테스트 모드
../../scripts/godotw --headless --path . --fixed-fps 60 --quit-after 1800 -- --relic-test --auto-levelup --qa-autopilot

# 이벤트 테스트 모드(안개/감속/전류)
../../scripts/godotw --headless --path . --fixed-fps 60 --quit-after 2400 -- --event-test --auto-levelup --qa-autopilot

# SFX 프리셋 옵션
# --sfx-preset=default | quiet | hype
../../scripts/godotw --headless --path . --quit-after 900 -- --sfx-preset=quiet
../../scripts/godotw --headless --path . --fixed-fps 60 --quit-after 5400 -- --boss-test --auto-levelup --qa-autopilot --sfx-preset=hype

# 10분 안정성 시뮬레이션
../../scripts/godotw --headless --path . --fixed-fps 60 --quit-after 36000 -- --auto-levelup

# 재시작 루프 QA
../../scripts/godotw --headless --path . --fixed-fps 60 --quit-after 3000 -- --qa-force-damage --qa-auto-restart

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
