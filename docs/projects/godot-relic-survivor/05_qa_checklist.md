# 05_qa_checklist — Godot Relic Survivor

## 공통
- [x] 프로젝트 headless 실행 성공
- [x] 10분 시뮬레이션 3회에서 비정상 종료 없음 (`--auto-levelup`, 36000프레임 x3)
- [x] 게임오버/재시작 루프 정상 (`--qa-force-damage --qa-auto-restart`)
- [x] 원클릭 헤드리스 Alpha Gate 통과 (`./tools/qa/headless-alpha-gate.sh`)
- [x] leak trace 스크립트 실행 및 누수 요약 확인 (`./tools/qa/trace-objectdb-leak.sh`)
- [x] 수동 QA 전 준비상태 점검 통과 (`./tools/qa/pre-manual-qa-check.sh`)
- [x] 체크포인트 리포트 생성 확인 (`./tools/qa/checkpoint-report.sh`)
- [x] 밸런스 프리즈 검증 확인 (`./tools/qa/balance-freeze-check.sh`)

## 기능별
- [ ] 이동/대시 조작 반응성 (수동 QA 보류)
- [x] 자동공격/탄환 충돌 정상 (보스 처치 루프에서 처치/보상 확인)
- [ ] 기본 적 2종 패턴 정상 (수동 패턴 체감 QA 보류)
- [ ] 엘리트 2종 패턴 정상 (수동 패턴 체감 QA 보류)
- [x] EXP 획득/레벨업 3지선다 정상 (`--auto-levelup` + 패널 선택 루프)
- [ ] 레벨업 패널 예상 지표(DPS/생존) 가독성 확인 (수동 QA 시 확인)
- [ ] PRESSURE 표시(low/mid/high)와 실제 체감 압박 일치 여부 확인 (수동 QA 시 확인)
- [ ] 사망 원인/상황(death recap) 문구 가독성 확인 (수동 QA 시 확인)
- [x] 보스 경고/등장 루프 정상 (`--boss-test --auto-levelup` 검증)
- [x] 보스 대시 텔레그래프 루프 정상 (`MINIBOSS_DASH_TELEGRAPH_ON`, `MINIBOSS_DASH_START` 로그 확인)
- [x] 보스 콤보 대시 패턴 로그 검증 경로 확보 (`MINIBOSS_COMBO_DASH_ON`, `MINIBOSS_DASH_CHAIN_*`)
- [x] 보스 비대시 소환 패턴 로그 검증 경로 확보 (`MINIBOSS_SUMMON_TELEGRAPH_ON`, `MINIBOSS_SUMMON_CAST`, `MINIBOSS_SUMMON_PATTERN_*`)
- [x] boss_pattern 다양성 검증(RING/WALL 최소 1회) 자동 체크 통과
- [x] elite_loop 검증 통과 (`ELITE_SPAWNED:elite_grunt`, `ELITE_SPAWNED:elite_dasher`)
- [x] 보스 처치 루프 정상 (`MINIBOSS_DEFEATED` 로그 확인)

## 성능
- [ ] 60 FPS 근접 유지(기준 환경)
- [ ] 적 수 증가 시 급격한 프레임 저하 없음

## 회귀
- [x] 핵심 루프(전투-성장-재도전) 재검증 통과 (전투/보스/자동재시작 시나리오)
