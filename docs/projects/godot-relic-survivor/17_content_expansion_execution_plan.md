# 17_content_expansion_execution_plan

## 목적
사용자 요청에 따라 차기 콘텐츠를 **순차적으로** 구현하기 위한 실행계획을 고정한다.

## 실행 순서 (고정)
1. Elite Pack 01
2. Relic System 01 (12종)
3. Stage Event Pack 01 (3종)
4. Boss Phase 2 Upgrade
5. Meta Growth 01
6. Character Pack 01
7. Weapon Archetype Pack 01

---

## Step 1 — Elite Pack 01
- 상태: ✅ 구현/자동검증 완료 (수동 체감 QA 대기)

### 범위
- 신규 적 2종 추가
  - Elite Grunt
  - Elite Dasher
- 스폰 구간/확률 테이블 추가
- HUD/로그에 elite 식별 정보 추가

### 완료 기준
- 6~10분 구간 난이도 브릿지 체감 확보
- 자동 QA에서 크래시/누수/패턴 충돌 없음

### 리스크
- 기존 Dasher와 패턴 유사 시 차별감 부족
- 과도한 HP로 전투 템포 둔화

### 공수
- 1.0 ~ 1.5일

---

## Step 2 — Relic System 01 (12종)
- 상태: ✅ 구현/자동검증 완료 (수동 체감 QA 대기)

### 범위
- 유물 데이터/획득/적용 파이프라인
- 유물 12종 구현(공격4/기동3/생존3/혼합2)
- 유물 UI(획득 알림/현재 효과 요약)

### 완료 기준
- 런마다 빌드 방향 차이가 명확함
- 특정 OP 조합 연속 강제 편향 억제

### 리스크
- 업그레이드 시스템과 중복 보정 충돌
- 효과 누적 계산 복잡도 증가

### 공수
- 2.0 ~ 3.0일

---

## Step 3 — Stage Event Pack 01 (3종)
- 상태: ✅ 구현/자동검증 완료 (수동 체감 QA 대기)

### 범위
- 안개/감속지대/전류지대 이벤트 구현
- 이벤트 시작/종료 텔레그래프 + 보상/완화 규칙
- 이벤트별 실패 원인 분리 로깅

### 완료 기준
- 이벤트별 플레이 감각이 명확히 다름
- 억울사(불가피 피해) 리포트 비율 허용 범위

### 리스크
- 시각 가독성 저하(정보 과밀)
- 이벤트와 보스 패턴 겹침 시 난이도 스파이크

### 공수
- 1.5 ~ 2.5일

---

## Step 4 — Boss Phase 2 Upgrade
- 상태: ✅ 구현/자동검증 완료 (수동 체감 QA 대기)

### 범위
- HP 구간 기반 Phase 2 전환
- 전환 시 연출/안전구간/템포 보정
- boss-pattern QA 케이스 확장

### 완료 기준
- 페이즈 전환이 명확하고 공정함
- 게이트 + 수동 QA에서 패턴 이해 가능성 확보

### 리스크
- 전환 직후 피격 억울사
- 연출/카메라/사운드 동시 트리거 충돌

### 공수
- 1.0 ~ 2.0일

---

## Step 5 — Meta Growth 01
- 상태: ✅ 구현/자동검증 완료 (수동 체감 QA 대기)

### 범위
- 런 종료 보상(Shards) 시스템
- 영구 특성 3종(vitality/celerity/focus) + 자동 해금
- 저장 프로파일(`user://meta_profile.json`) 로드/세이브
- HUD META 상태 표시 + `meta_loop` QA 확장

### 완료 기준
- 런 종료 후 보상 획득/저장/재시작 적용이 안정적으로 반복됨
- `META_PROFILE_LOADED`, `META_RUN_REWARD` 자동검증 토큰 통과

### 리스크
- 누적 영구 보정으로 기존 QA 시나리오 난이도/속도 편차 증가
- 장기적으로는 수동 특성 선택 UX 필요

### 공수
- 1.0 ~ 1.5일

---

## Step 6 — Character Pack 01
- 상태: ✅ 구현/자동검증 완료 (수동 체감 QA 대기)

### 범위
- 캐릭터 2종(Ranger/Warden) 프로파일 데이터
- 런타임 선택(`--character=ranger|warden`) + HUD `CHAR` 상태
- 캐릭터별 시작 보정(체력/기동/연사/무적) 적용
- 게이트 `character_ranger`, `character_warden` 확장

### 완료 기준
- 캐릭터별 시작 체감 차이가 명확함
- 캐릭터 루프 자동검증 토큰 통과(`CHARACTER_SELECTED:*`)

### 리스크
- 영구 보정 + 캐릭터 보정 누적으로 후반 난이도 편차 확대
- 캐릭터별 추천 빌드 UX 부재(후속 개선 필요)

### 공수
- 1.0 ~ 1.5일

---

## Step 7 — Weapon Archetype Pack 01
- 상태: ✅ 구현/자동검증 완료 (수동 체감 QA 대기)

### 범위
- 무기 계열 3종(pierce/dot/aoe) 프로파일 데이터
- 런타임 선택(`--weapon=<id>`) + HUD `WEAPON` 상태
- 관통/도트/광역 효과 전투 적용
- 게이트 `weapon_pierce`, `weapon_dot`, `weapon_aoe` 확장

### 완료 기준
- 무기별 타격 감각 차이가 명확함
- 무기 루프 자동검증 토큰 통과(`WEAPON_PIERCE_HIT`, `WEAPON_DOT_APPLIED`, `WEAPON_AOE_HIT`)

### 리스크
- 메타/캐릭터 보정과 무기 계열 조합에서 편차 확대 가능
- DoT/AoE 중첩 시 후반 성능/체감 튜닝 필요

### 공수
- 1.0 ~ 1.5일

---

## QA/문서 운영 원칙
- 각 Step 종료 시 반드시:
  1) `headless-alpha-gate.sh` 실행
  2) `trace-objectdb-leak.sh` 실행
  3) `pre-manual-qa-check.sh` 실행
  4) `checkpoint-report.sh` 갱신
  5) 관련 문서(04/05/06/10/12/13) 동기화

## 승인 게이트
- Step 완료 보고 시 사용자 승인 후 다음 Step 진행
