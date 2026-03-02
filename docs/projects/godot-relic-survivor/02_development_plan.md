# 02_development_plan — Godot Relic Survivor

## 목표
- 단기: `v0.1.0-alpha` 확정(수동 QA + GUI FPS 실측)
- 병행: 다음 콘텐츠 확장 라인(M4~M8) 사전 설계/작업 분해

## 작업 분해(WBS)

### A. 현재 알파 기준선(완료/대기)
- [x] 프로젝트/문서 초기화
- [x] 코어 루프(이동/자동공격/피격)
- [x] 적 2종 + 스폰 디렉터
- [x] EXP/레벨업 3지선다
- [x] 업그레이드 확장(16종 + 복합 효과 적용기)
- [x] 미니 보스 1종 (경고/등장/패턴/보상 연동)
- [x] QA 자동화(게이트/누수추적/리드니스/프리즈 체크)
- [ ] 수동 QA 3회
- [ ] GUI FPS 실측

### B. 콘텐츠 확장 1차(요청 반영, 순차 진행)
- [x] **Step 1 — Elite Pack 01**
  - [x] Elite Grunt 설계/구현
  - [x] Elite Dasher 설계/구현
  - [x] 스폰 확률/구간 테이블 반영
  - [x] QA 시나리오/문서 업데이트
- [x] **Step 2 — Relic System 01 (12종)**
  - [x] 유물 데이터 구조/런타임 적용기 추가
  - [x] 유물 획득 UX(표시/설명/상태) 추가
  - [x] 유물-업그레이드 시너지 규칙 반영
  - [x] QA/밸런스 로그 업데이트
- [x] **Step 3 — Stage Event Pack 01 (3종)**
  - [x] 안개/감속지대/전류지대 구현
  - [x] 이벤트 텔레그래프 및 안전장치 적용
  - [x] 이벤트별 실패 원인/피드백 정리
  - [x] QA 시나리오 확장
- [x] **Step 4 — Boss Phase 2 Upgrade**
  - [x] 페이즈 전환 규칙(HP 구간 기반) 구현
  - [x] 전환 연출/안전구간 반영
  - [x] 페이즈2 패턴 2종 이상 반영
  - [x] boss-pattern 게이트 확장
  - [x] 수동 QA 런시트에 phase2 항목 추가
  - [x] 릴리즈/체크리스트/저널 반영
- [x] **Step 5 — Meta Growth 01**
  - [x] 런 종료 보상(Shards) + 영구 특성 3종 구현
  - [x] 저장 프로파일(user://meta_profile.json) 로드/세이브 연동
  - [x] 런 시작 시 영구 보정 적용 + HUD META 상태 노출
  - [x] `--meta-test` + `meta_loop` 게이트 확장
  - [x] 릴리즈/체크리스트/저널 반영

## 코드 구조 계획
- `scripts/core/`: 게임 루프/상태/시그널/모드
- `scripts/entities/`: Player/Enemy/Projectile/Boss/Elite
- `scripts/systems/`: Spawn/Combat/Upgrade/QA/Event/Relic
- `scripts/ui/`: HUD/LevelUpPanel/EventBanner/GameOver/Recap
- `scripts/data/`: 밸런스/업그레이드/유물/이벤트 테이블

## 공수 추정(콘텐츠 확장)
- Step 1 Elite Pack 01: **1.0 ~ 1.5일**
- Step 2 Relic 12종: **2.0 ~ 3.0일**
- Step 3 Stage Event 3종: **1.5 ~ 2.5일**
- Step 4 Boss Phase 2: **1.0 ~ 2.0일**
- Step 5 Meta Growth 01: **1.0 ~ 1.5일**
- 총합(문서/QA 포함): **6.5 ~ 10.5일**

## 검증 계획
- 자동:
  - `headless-alpha-gate.sh`
  - `trace-objectdb-leak.sh`
  - `pre-manual-qa-check.sh`
  - `balance-freeze-check.sh`
- 수동:
  - 패턴 가독성/억울사/피드백 체감 중심 3회 플레이

## 보고 계획
- 단계 완료 시 중간 보고(체크리스트 + 위험요인 + 다음 단계)
- 주요 결정/변경 즉시 문서 및 메모 반영
