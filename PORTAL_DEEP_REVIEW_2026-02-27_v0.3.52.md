# Portal Deep Review Report (v0.3.52)

작성일: 2026-02-27 (KST)

## 0) 리뷰 범위 / 방법
- 범위
  - 포털: 데이터 병합/노출 정책/UI 흐름/오버레이 동작
  - 게임: 19개 로컬 게임 구조/미션 동기화/밸런스/공통 UX
  - 품질: 자동 검증 체인 + 코드 구조(중복/리팩토링 포인트)
- 실행 검증
  - `shared-ui-common-check` PASS
  - `mission-index-sync-check` PASS
  - `game-ui-check` PASS
  - `longpress-guard-check` PASS
  - `meteor-smoke-check` PASS
- 배포 검증
  - 포털/관리자/신규 4개 게임 URL HTTP 200
  - 배포 HTML: `updateNoticeBtn`, `updateOverlay` 존재 / `recentList` 제거 확인
  - 배포 seed: 19개 게임, 전부 `v0.3.52` 확인

---

## 1) 포털 리뷰 (상세)

### 1-1. 정보 구조(IA)
- 메인 동선
  - Featured → All Games (카테고리 탭/필터/정렬)
  - 업데이트 정보는 우측 상단 `공지 · 업데이트` 버튼으로 일원화
- 장점
  - 목록 영역 집중도가 올라감(최근 업데이트 섹션 제거 효과)
  - 업데이트는 “필요 시 열람” 패턴으로 분리되어 카드 탐색 방해 감소
- 리스크
  - 업데이트 버튼 텍스트가 길어질 수 있어 모바일에서 줄바꿈 가능성 존재(현재 CSS로 대응 중)

### 1-2. 데이터 정책 / 노출 정책
- 변경 사항
  - `game.repository.js`에서 seed 기반 게임만 노출
  - admin에서 추가된 비-seed 게임은 목록에서 제외
- 장점
  - “우리 게임만 포털 노출” 요구사항 충족
  - 운영 중 외부/테스트 게임 혼입 리스크 제거
- 리스크
  - admin으로 신규 게임을 추가해도 seed 미등록이면 사용자 화면에 안 나옴(의도된 제약)

### 1-3. 상태/렌더링 구조
- 현재 구조
  - `src/main.js` (컨트롤러 역할) + `store` + `renderers`
  - 상세 패널/업데이트 패널 모두 오버레이 기반
- 점검 결과
  - 다중 오버레이 상태에서 body scroll lock 충돌 보정 완료
  - ESC 처리: 업데이트 패널 우선 닫기 → 상세 패널 닫기 순서 정상

### 1-4. 포털 코드 품질
- 강점
  - DOM API 기반 렌더링으로 XSS/innerHTML 리스크 낮음
  - 데이터-UI 분리(store/renderers) 기본 구조 안정
- 개선 필요
  - `src/main.js`가 320줄로 비대(이벤트/오버레이/렌더/유틸 혼재)
  - URL 판별 로직 유사 중복(repository/store/renderers)

---

## 2) 게임 리뷰 (전체 19종)

### 2-1. 공통 구조 품질
- 19개 게임 모두 모듈 구조 유지
  - `index/main/state/systems/renderer/input/ui/sfx`
- 공통 UX
  - 설정 저장(효과/진동/사운드/BGM/볼륨)
  - 일시정지 UX(P + 버튼)
  - 롱프레스 텍스트 선택/복사 방지 가드
- 검증 체인
  - 미션 문구 동기화, UI 기대값, 롱프레스 가드, 스모크 모두 자동화

### 2-2. 신규 4종 밸런스 패치 리뷰

#### A) Tower Pulse Defense
- 패치
  - 초기자원 상향(14/9/7/108)
  - 라운드 96초→100초
  - 업그레이드/펄스 비용 완화
  - dispatch 자원요구 완화 + 보상 소폭 상향
- 영향
  - 초반 운영 실패율 감소
  - 미션 24회 달성 안정성 상승

#### B) Ghost Kart Duel
- 패치
  - 초반 속도/장애물 스폰 완화
  - DRIFT 지속↑ / 쿨다운↓
  - 피격 후 무적 시간 상향
- 영향
  - 초반 억까 충돌 체감 완화
  - 회복 루프(재진입) 개선

#### C) Bubble Harbor Merge
- 패치
  - 시작 자원 상향 + Day 32→34
  - 생산/포장/출항 수익 상향
  - MERGE RUSH 비용↓ / 쿨다운↓ / 지속↑
- 영향
  - 미션 360 달성까지의 성장 곡선 부드러워짐
  - “자원 막힘” 구간 완화

#### D) Dungeon Dice Survivor
- 패치
  - HP 4→5
  - 발사 주기 개선 / 적 스폰 템포 완화
  - BURST 쿨다운 완화
  - 레벨 상승 곡선 완화(킬 8→9)
- 영향
  - 피격 연쇄로 즉시 종료되는 빈도 감소
  - 스킬 의존 구간 난도 완화

---

## 3) 리팩토링 필요성 진단

### 결론: **리팩토링 필요 (강함)**
- 기능은 안정적이지만, 게임 수 증가로 유지보수 비용이 급증 중
- 특히 신규 4종이 기존 게임과 고유 코드보다 “테마 치환형”에 가까워 중복도가 매우 높음

### 3-1. 정량 근거 (중복도)
- `tower-pulse-defense` vs `rail-commander`
  - main 99.3%, renderer 99.2%, input 100%, ui 99.7%, index 99.0%
- `ghost-kart-duel` vs `mecha-sprint`
  - main 99.7%, renderer 100%, input 100%, index 99.2%
- `bubble-harbor-merge` vs `farm-harbor`
  - main 99.6%, systems 96.3%, input 100%, ui 99.7%
- `dungeon-dice-survivor` vs `void-raiders`
  - main 99.4%, systems 97.6%, input 100%, ui 99.6%

### 3-2. 우선순위별 리팩토링 제안

#### [P1] 게임 템플릿/프리셋 엔진화 (필수)
- 목표
  - 클론형 게임을 “코드 복사”가 아니라 “프리셋 구성”으로 전환
- 방법
  - `games/templates/`에 공통 루프(경제형/레이싱형/슈팅형) 엔진
  - 게임별 차이는 `config`(라벨/밸런스/컬러/메시지)로 분리
- 기대효과
  - 밸런스 패치 1회 수정으로 파생 게임 동시 반영
  - 버그 재발 포인트 대폭 감소

#### [P1] 상태 초기화 정합성 체크 스크립트 추가 (필수)
- 목표
  - `createState` vs `resetRound` 값 불일치 자동 감지
- 기대효과
  - 숫자 튜닝 시 초기값/리셋값 누락 방지

#### [P2] 포털 컨트롤러 분리 (권장)
- `src/main.js` 분리안
  - `controllers/filters.controller.js`
  - `controllers/detail-overlay.controller.js`
  - `controllers/update-overlay.controller.js`
- 기대효과
  - 기능 추가 시 충돌 감소, 테스트 작성 용이

#### [P2] URL 분류 유틸 단일화 (권장)
- 중복 로직
  - repository/store/renderers의 local/implemented 판별 함수
- 개선
  - `src/utils/game-url.js`로 단일화

#### [P3] 용어 정리 리팩토링 (선택)
- 예: Tower 내부 `dispatch/overdrive`, Dungeon 내부 `nova` 명칭
- 현재 기능 문제는 없으나, 도메인 용어 일관성 저하

---

## 4) 종합 판정
- 현재 상태: **배포 품질 관점 PASS**
  - 자동검증/CI/배포 상태 정상
  - 요청한 UI/노출 정책/밸런스 반영 완료
- 다음 핵심 과제: **리팩토링 P1 착수**
  - 게임 템플릿화 + 상태정합성 스크립트부터 시작 권장
