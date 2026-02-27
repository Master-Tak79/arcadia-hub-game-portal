# REFACTOR P1 RFC (2026-02-27)

대상: Arcadia Hub Portal / Games (v0.3.52 기준)

## 1. 목적
- 클론형 게임 증가(19종)로 인해 유지보수 비용이 급격히 상승한 문제를 완화합니다.
- 코드 복사 기반 확장에서 발생하는 회귀(미션 수치/리셋 누락/라벨 불일치)를 구조적으로 줄입니다.
- “기능 추가 속도”보다 “안정적인 반복 개발”을 우선하는 기반을 만듭니다.

---

## 2. 현재 문제 정의

### 2.1 클론 중복
- 신규 4종과 기존 게임 간 유사도 95~100% 수준.
- 작은 밸런스 수정도 다수 파일/다수 게임을 반복 편집해야 함.

### 2.2 상태 초기화 회귀 위험
- `createState`와 `resetRound`가 분산 관리됨.
- 수치 변경 시 한쪽만 수정되면 런타임 시작 상태와 재시작 상태가 달라짐.

### 2.3 포털 컨트롤러 비대화
- `src/main.js`가 이벤트/렌더/오버레이/유틸을 동시에 담당.
- 기능 추가 시 충돌 가능성 증가.

---

## 3. P1 범위 (이번 단계)

### 3.1 이번 PR에서 즉시 적용 (Done)
1) 상태 정합성 자동 점검 스크립트 추가
- `scripts/state-reset-sync-check.mjs`
- 역할
  - 각 게임의 `systems.resetRound()` 내 `state.*` 할당값과
    `state.createState()` 초기값의 리터럴 불일치 탐지
  - `missionTarget*` 키가 resetRound에 누락되었는지 탐지

2) 스모크 파이프라인 통합
- `scripts/meteor-smoke-check.sh`
  - 8단계 → 9단계
  - `[7/9] State reset sync check` 추가

3) 문서화
- 본 RFC 추가

### 3.2 다음 P1 구현(후속 PR)
A) 게임 타입별 공통 템플릿 엔진 베이스 추가
- 후보 타입
  - economy-loop (Rail/Tower/Bubble/Farm/Idle)
  - lane-runner (Mecha/Ghost/Lane/Sky)
  - lane-shooter (Void/Dungeon/Pixel 일부)

B) 게임별 차이를 `config`로 분리
- 라벨, 색상, 미션 목표, 초기 수치, 스킬 이름/쿨다운/보상

C) 템플릿 기반 2종 파일럿 마이그레이션
- 1차 권장: `rail-commander` + `tower-pulse-defense`
- 이유: 유사도 최고, 운영 루프 명확

---

## 4. 제안 아키텍처

```text
games/
  templates/
    economy-core/
      create-game.js
      renderer-core.js
      systems-core.js
      ui-core.js
    runner-core/
    shooter-core/
  presets/
    rail-commander.config.js
    tower-pulse-defense.config.js
    bubble-harbor-merge.config.js
```

### 4.1 책임 분리
- Core: 공통 게임 루프/충돌/타이머/자원 처리
- Config: 숫자/라벨/텍스트/컬러/난이도 곡선
- Entry(main): 입력 바인딩 + DOM 참조 + core/preset 결합

### 4.2 기대효과
- 숫자 패치 범위를 `config`로 제한
- 유사 버그 동시 수정 가능
- 신규 게임 추가 시 “복사” 대신 “preset 생성”으로 전환

---

## 5. 리스크 및 대응

### 리스크 1) 초기 마이그레이션 중 회귀
- 대응: 템플릿 도입 시 기존 게임을 즉시 삭제하지 않고 병행 유지
- 대응: 기존 검증 체인 + 신규 템플릿 검증 스크립트 추가

### 리스크 2) 템플릿 과도 추상화
- 대응: P1은 최소 공통만 추출(physics/loop/hud sync)
- 대응: 게임 특화 로직은 preset hooks로 주입

### 리스크 3) 문구/라벨 깨짐
- 대응: 미션/오버레이/HUD 문자열을 preset 단일 소스로 이동

---

## 6. 완료 기준 (P1)
- [x] 상태 정합성 자동 점검 스크립트 도입
- [x] 스모크 파이프라인 통합
- [ ] 템플릿 코어 1종(economy-core) 추가
- [ ] 파일럿 게임 2종(rail/tower) 템플릿 기반 전환
- [ ] 기능/QA/CI 동일 수준 유지 확인

---

## 7. 즉시 다음 액션
1. `economy-core` 프로토타입 생성
2. `rail-commander` 마이그레이션
3. `tower-pulse-defense` 마이그레이션
4. 기존과 동등한 UI/미션/리셋 동작 자동검증 추가
