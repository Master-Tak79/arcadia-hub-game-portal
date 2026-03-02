# 16_alpha_candidate_quality_lock

## 목적

`v0.1.0-alpha-candidate` 기준선을 고정하여, 수동 QA 재개 전까지 품질 드리프트를 방지합니다.

## Lock Scope (고정 대상)

### 1) 코어 루프
- 이동/대시/자동공격/레벨업/보스/재시작 루프 구조
- QA 런타임 옵션(`--auto-levelup`, `--qa-*`, `--boss-test`, `--boss-pattern-test`) 인터페이스

### 2) 전투/웨이브 곡선
- `balance.gd` 6차 튜닝값
- `spawn_director.gd` phase shaping + soft/hard cap + boss/recovery guardrail

### 3) 보스 이벤트 연출
- 배너/카메라/SFX 훅 순서
- 보스 warning/spawn/defeat 이벤트 트리거 지점

### 4) 문서 기준
- `06_release_notes.md`
- `12_balance_tuning_log.md`
- `13_alpha_readiness_report.md`
- `15_merge_handover_checklist.md`

### 5) Freeze 검사 기준
- `tools/qa/balance-freeze-check.sh` PASS
- `tools/qa/pre-manual-qa-check.sh`에서 freeze check 통과

## Allowed Changes (허용)

- 크래시/컴파일 오류 수정
- QA 자동화 신뢰도 향상
- 에셋 교체(동일 슬롯/동일 인터페이스 유지)
- 문서 보강
- 사용자 명시 승인 하의 제한 해제성 변경(변경 이력/근거 문서화 필수)

## Restricted Changes (제한)

아래 변경은 수동 QA 재개 전 임의 변경 금지:
- 밸런스 상수 대규모 변경
- 업그레이드 데이터 구조 변경
- 보스 패턴 구조 변경
- 입력/조작 체감에 직접 영향 주는 시스템 변경

## Unlock Conditions

다음 조건 충족 시 lock 해제 가능:
1. 수동 QA 3회 완료 (`11_manual_qa_protocol.md`)
2. GUI FPS 실측 완료
3. 결과를 `04/05/06/13`에 반영

## Change Control Exceptions

- 2026-03-01: 사용자 진행 승인("응")에 따라 콘텐츠 확장성 보강 작업(업그레이드 12→16, multi-effect 적용기) 반영.
- 2026-03-01: 사용자 진행 승인("응")에 따라 업그레이드 제안 가중치 로직(weighted roll) 반영.
- 2026-03-02: 사용자 진행 승인("응 순서대로 진행해")에 따라 본게임 체감 개선 반영.
  - 미니보스 대시 텔레그래프(windup/recovery) + 스폰 안전구간
  - 레벨업 선택지 가독성 개선(역할 태그/효과 요약/추천 문구)
  - headless gate 보스 대시 텔레그래프 검증 토큰 추가
- 2026-03-02: 사용자 진행 승인("진행해")에 따라 본게임 개발 2차 반영.
  - 미니보스 콤보 대시 + 비대시 소환 패턴(WALL) 추가
  - 업그레이드 제안 동적 가중치(체력/레벨/과중첩/압박도) 반영
  - 레벨업 선택 후 예상 지표(DPS/생존) 프리뷰 추가
  - 체크포인트 리포트 자동화(`tools/qa/checkpoint-report.sh`) 추가
- 2026-03-02: 사용자 진행 승인("응 진행해. 그리고 나머지도 순서대로 진행")에 따른 리뷰 반영 패치.
  - auto-levelup 선택 로직 multi-effect 반영
  - 일반 스폰 안전 반경 적용
  - 전투 판정 후보 인덱스(셀 기반) 도입
  - death recap(사망 원인/상황) 표시 추가
  - boss_pattern 다양성 검증(RING/WALL 최소 1회) 게이트 편입
- 2026-03-02: 사용자 진행 승인("응 차례대로 진행해")에 따른 콘텐츠 확장 Step 1 반영.
  - Elite Pack 01(Elite Grunt / Elite Dasher) 구현
  - `--elite-test` 런타임 옵션 + `elite_loop` 자동 검증 케이스 편입
- 2026-03-02: 사용자 연속 승인("응")에 따른 콘텐츠 확장 Step 2 반영.
  - Relic System 01(유물 12종) 구현
  - `--relic-test` 런타임 옵션 + `relic_loop` 자동 검증 케이스 편입
- 2026-03-02: 사용자 연속 승인("응")에 따른 콘텐츠 확장 Step 3 반영.
  - Stage Event Pack 01(안개/감속지대/전류지대) 구현
  - `--event-test` 런타임 옵션 + `event_loop` 자동 검증 케이스 편입
- 처리 원칙:
  - 자동 회귀 검증 통과 필수
  - 설계/릴리즈/개발일지 즉시 동기화
  - 이후 상태는 다시 LOCKED로 복귀

## Current Status

- 상태: **LOCKED (alpha-candidate stabilization, exception 반영 후 재잠금)**
- 해제 예정: 수동 QA 재개 시
