# 16_alpha_candidate_quality_lock

## 목적

`v0.1.0-alpha-candidate` 기준선을 고정하여, 수동 QA 재개 전까지 품질 드리프트를 방지합니다.

## Lock Scope (고정 대상)

### 1) 코어 루프
- 이동/대시/자동공격/레벨업/보스/재시작 루프 구조
- QA 런타임 옵션(`--auto-levelup`, `--qa-*`, `--boss-test`) 인터페이스

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

## Allowed Changes (허용)

- 크래시/컴파일 오류 수정
- QA 자동화 신뢰도 향상
- 에셋 교체(동일 슬롯/동일 인터페이스 유지)
- 문서 보강

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

## Current Status

- 상태: **LOCKED (alpha-candidate stabilization)**
- 해제 예정: 수동 QA 재개 시
