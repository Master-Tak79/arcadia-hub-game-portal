# CHANGELOG.md

이 문서는 사용자 관점의 주요 변경 사항을 기록합니다.
형식은 Keep a Changelog 스타일을 따릅니다.

## [Unreleased]
### Added
- (예정)

### Changed
- (예정)

### Fixed
- (예정)

---

## [0.3.34] - 2026-02-26
### Added
- 신규 로컬 게임 `games/block-sage/*` 추가
  - 제한 턴(40턴) 기반 라인 클리어 퍼즐 루프
  - 미션(12라인) 보너스/사운드/BGM/일시정지 UX 포함
- `games/block-sage/tests/QA_CHECKLIST.md` 추가
- `scripts/game-ui-check.mjs`에 Block Sage UI 검증 케이스 추가

### Changed
- `src/data/games.seed.js`의 `Block Sage`를 외부 placeholder에서 로컬 플레이 URL로 전환
- 통합 QA 문서(`QA_MOBILE_2DEVICES.md`, `QA_3RUN_LOG_TEMPLATE.md`, `QA_FINAL_STATUS.md`)를 6개 로컬 게임 기준으로 확장
- 스모크 체크(`scripts/meteor-smoke-check.sh`)에 Block Sage 파일/HTTP/QA 문서 검증 항목 추가
- Block Sage 버전 `0.1.0`(placeholder) → `0.3.34`
- 포털 버전 `0.3.33` → `0.3.34`

### Fixed
- 외부 링크로 남아 있던 Block Sage의 실제 플레이 불가 상태 해소

---

## [0.3.33] - 2026-02-26
### Changed
- 최근 업데이트 리스트 버튼 스타일을 모바일/인앱 브라우저 기본 버튼 테마와 분리
  - `styles/main.css`의 `.recent-item`에 버튼 리셋/텍스트 색상/호버·포커스 스타일 적용
- 포털 버전 `0.3.32` → `0.3.33`

### Fixed
- Android/Telegram in-app browser에서 최근 업데이트 항목이 흰색 기본 버튼처럼 렌더되던 스타일 깨짐 문제 수정

---

## [0.3.32] - 2026-02-26
### Changed
- 포털 메인 게임 리스트에서 Featured 섹션과의 중복 노출을 제거
  - Featured에 이미 노출된 게임은 메인 리스트에서 제외해 중복 카드 체감 완화
- 무한 스크롤/로드 상태 계산을 Featured 제외 조건과 동기화
- 포털 버전 `0.3.31` → `0.3.32`

### Fixed
- admin 커스텀 데이터와 seed 데이터 병합 시 동일 게임이 중복 타이틀로 노출될 수 있던 문제 보완
  - 게임 제목 기준 중복 제거
  - seed 기반 구현 게임의 `playUrl/featured/popularity` 우선 정책으로 상단 노출 안정화
- 구현 게임이 admin의 비구현 링크로 덮여 상단 정렬에서 밀릴 수 있던 문제 완화

---

## [0.3.31] - 2026-02-26
### Added
- Lane Switch 사운드 모듈 추가
  - `games/lane-switch/sfx.js`

### Changed
- Lane Switch 설정 패널에 `사운드/BGM/효과음 볼륨` 옵션 추가
- Lane Switch에 일시정지/재개 UX 추가 (`상단 버튼` + `P` 단축키)
- Lane Switch에 BGM 및 이벤트 SFX(시작/피격/획득/신기록/게임오버) 적용
- Lane Switch QA 체크리스트를 최신 버전(`0.3.31`) 기준으로 갱신
- 스모크 체크(`scripts/meteor-smoke-check.sh`)에 Lane Switch `sfx.js` 파일/HTTP 검증 추가
- Lane Switch 버전 `0.3.26` → `0.3.31`
- 포털 버전 `0.3.30` → `0.3.31`

### Fixed
- Lane Switch가 신규 3종 대비 사운드/일시정지 UX가 부족했던 기능 패리티 격차 해소

---

## [0.3.30] - 2026-02-26
### Added
- `scripts/game-ui-check.mjs`에 신규 3종 게임 UI 검증 케이스 추가
  - Sky Drift Nitro
  - Neon Brick Breaker
  - Orbit Survivor

### Changed
- 신규 3종 게임에 공용 사운드 런타임(`games/shared/sfx.runtime.js`) 기반 SFX/BGM 적용
- 신규 3종 게임 상단에 일시정지 버튼 및 `P` 단축키 재개/정지 UX 반영
- 신규 3종 게임 설정 패널에 `사운드/BGM/효과음 볼륨` 저장 옵션 추가
- 통합 QA 문서(`QA_MOBILE_2DEVICES.md`, `QA_3RUN_LOG_TEMPLATE.md`, `QA_FINAL_STATUS.md`)를 5개 로컬 게임 기준으로 확장
- 스모크 체크에 신규 사운드 모듈/공유 런타임 파일 검증 반영
- 신규 3종 게임 버전 `0.3.29` → `0.3.30`
- 포털 버전 `0.3.29` → `0.3.30`

### Fixed
- 신규 3종 게임에서 사운드 설정/일시정지 부재로 인한 세션 연속성 저하 문제 개선
- UI 회귀 스크립트가 기존 2종 게임 중심이던 커버리지 편중 문제 개선

---

## [0.3.29] - 2026-02-25
### Added
- 신규 3종 게임 사운드 모듈 추가
  - `games/sky-drift/sfx.js`
  - `games/neon-brick-breaker/sfx.js`
  - `games/orbit-survivor/sfx.js`
- 공유 사운드 런타임 유틸 추가
  - `games/shared/sfx.runtime.js`

### Changed
- 신규 3종 게임 설정 패널에 `사운드/BGM/효과음 볼륨` 옵션 추가
- 신규 3종 게임에 일시정지/재개 UX 추가 (`상단 버튼` + `P` 단축키)
- 신규 3종 게임에 BGM 및 이벤트 SFX(시작/피격/획득/신기록/게임오버) 적용
- 신규 3종 게임 버전 `0.3.28` → `0.3.29`
- 스모크 체크(`scripts/meteor-smoke-check.sh`)에 신규 사운드 모듈/공유 런타임 검증 항목 추가
- 포털 버전 `0.3.28` → `0.3.29`

### Fixed
- 신규 3종 게임에서 장시간 플레이 시 일시정지 부재 및 사운드 설정 부재로 인한 UX 단절 문제 개선

---

## [0.3.28] - 2026-02-25
### Added
- 신규 내장 게임 3종 구현
  - `games/sky-drift/*` (Sky Drift Nitro)
  - `games/neon-brick-breaker/*` (Neon Brick Breaker)
  - `games/orbit-survivor/*` (Orbit Survivor)
- 신규 게임별 QA 체크리스트 추가
  - `games/sky-drift/tests/QA_CHECKLIST.md`
  - `games/neon-brick-breaker/tests/QA_CHECKLIST.md`
  - `games/orbit-survivor/tests/QA_CHECKLIST.md`
- 신규 프리뷰 에셋 추가
  - `assets/previews/sky-drift-shot-1.svg`
  - `assets/previews/neon-brick-breaker-*.svg`
  - `assets/previews/orbit-survivor-*.svg`

### Changed
- `src/data/games.seed.js`에서 3개 신규 게임을 포털 내 로컬 플레이 URL로 연결
- 스모크 체크(`scripts/meteor-smoke-check.sh`)에 신규 게임 파일/프리뷰/QA 문서 존재 및 HTTP 검증 항목 확장
- 포털 버전 `0.3.27` → `0.3.28`

### Fixed
- 외부 링크 placeholder로 남아 있던 추천 후보 게임들의 즉시 플레이 불가 상태 해소

---

## [0.3.27] - 2026-02-25
### Changed
- Meteor Dodge 운석 아트를 타입/팔레트 기반 스타일로 고도화
  - 운석별 코어/림/크레이터/글로우/샤드 색상 분리
  - 스파이크 수 변형 및 가속 운석 테일 디테일 강화
- Meteor Dodge 아이템 아이콘을 단순 텍스트/이모지 중심에서 벡터 뱃지 스타일로 개선
  - 코인/쉴드/슬로우/자석/더블/오버드라이브 각각 전용 아이콘 렌더 적용
- 포털 버전 `0.3.26` → `0.3.27`

### Fixed
- Meteor Dodge 오브젝트가 반복적으로 단순해 보이던 시각 다양성 부족 문제 개선

---

## [0.3.26] - 2026-02-25
### Changed
- Lane Switch 장애물 비주얼을 단순 사각형에서 타입별 오브젝트(트럭/배리어/아머드) 스타일로 고도화
- Lane Switch 플레이어 차량 디테일(윈드실드/네온 사이드/헤드라이트/브레이크 라인/휠) 강화
- 장애물에 개별 색상/글로우/와블 애니메이션 속성을 부여해 시각적 다양성 향상
- 포털 버전 `0.3.25` → `0.3.26`

### Fixed
- Lane Switch 오브젝트가 단순하게 보여 게임 몰입감이 떨어지던 문제 개선

---

## [0.3.25] - 2026-02-25
### Added
- 그래픽 이펙트 라이브러리 `canvas-confetti` 로컬 벤더 파일 추가
  - `games/shared/vendor/confetti.browser.min.js`
  - `games/shared/confetti.fx.js`

### Changed
- 포털 카드 레이아웃을 버튼 하단 정렬 구조로 보정 (`styles/main.css`)
  - 카드 높이가 달라도 `상세 보기/게임 열기` 버튼 위치가 맞도록 정렬
- Lane Switch 밸런스/난이도 완화
  - 플레이어/장애물/아이템 크기 축소
  - 속도/스폰 곡선 완화 및 레인 이동 쿨다운 단축
  - 위험 구간 레인 점유 기반 스폰 가드 추가로 회피 불가 패턴 방지
- Meteor Dodge / Lane Switch 그래픽 업그레이드
  - 네온 글로우/배경 깊이/시각 피드백 강화
  - 미션 완료/신기록 달성 시 confetti 연출 추가
- 스모크 체크에 confetti 관련 공유 파일 존재/HTTP 검증 추가
- 포털 버전 `0.3.24` → `0.3.25`

### Fixed
- 모바일 포털 카드 내 버튼 위치가 카드마다 어긋나 보이던 UI 정렬 문제
- Lane Switch에서 오브젝트 과대/고난도 구간으로 인한 불합리 패턴 체감 문제

---

## [0.3.24] - 2026-02-25
### Added
- `QA_3RUN_LOG_TEMPLATE.md` 추가 (기기/게임별 3회·60초 정량 로그 템플릿)

### Changed
- `QA_MOBILE_2DEVICES.md`에 정량 로그 템플릿 참조 섹션 추가
- Meteor/Lane Switch QA 체크리스트에 정량 실행 로그 안내 섹션 추가
- 스모크 체크 필수 파일 목록에 `QA_FINAL_STATUS.md`, `QA_3RUN_LOG_TEMPLATE.md` 추가
- 포털 버전 `0.3.23` → `0.3.24`

### Fixed
- HOLD 항목(정량 검증) 수행 시 로그 형식 불일치로 인한 문서 누락 위험 완화

---

## [0.3.23] - 2026-02-25
### Added
- `QA_FINAL_STATUS.md` 추가 (QA 최종 상태를 PASS/HOLD로 분리한 요약 문서)

### Changed
- `QA_MOBILE_2DEVICES.md`에 현재 판정(PASS/HOLD) 섹션 추가
- Meteor/Lane Switch QA 체크리스트에 현재 판정(PASS/HOLD) 섹션 추가
- 포털 버전 `0.3.22` → `0.3.23`

### Fixed
- 실행 확인 완료와 정량 증빙 필요 항목이 혼재되던 QA 상태를 분리해 후속 작업 우선순위 명확화

---

## [0.3.22] - 2026-02-25
### Changed
- 모바일 실기기 2기종 QA 로그에 Device-B 정보 반영: `Galaxy A24 Ultra`
- Browser 실행 확인 범위를 `Chrome / Edge / Samsung Internet`으로 기록
- Meteor/Lane Switch QA 체크리스트의 Device-B 상태를 `PASS(사용자 실행)`으로 갱신
- 포털 버전 `0.3.21` → `0.3.22`

### Fixed
- Device-B가 `TBD/PENDING`으로 남아 있던 QA 기록 최신화

---

## [0.3.21] - 2026-02-25
### Added
- `games/lane-switch/tests/QA_CHECKLIST.md` 추가 (Lane Switch 수동/실기기 QA 체크리스트)
- `QA_MOBILE_2DEVICES.md` 추가 (포털+게임 2기종 실기기 QA 통합 로그)

### Changed
- `games/meteor-dodge/tests/QA_CHECKLIST.md`를 최신 버전 기준(0.3.21)으로 갱신
- 스모크 체크 필수 파일 목록에 모바일 QA 문서/체크리스트(`QA_MOBILE_2DEVICES.md`, Lane Switch QA 체크리스트) 추가
- 포털 버전 `0.3.20` → `0.3.21`

### Fixed
- 실기기 2대 검증 진행 상황을 게임별/통합 문서에서 동시에 추적할 수 있도록 QA 기록 누락 위험 완화

---

## [0.3.20] - 2026-02-25
### Added
- GitHub Actions 워크플로우 `.github/workflows/ui-regression-checks.yml` 추가

### Changed
- `main` 대상 push/PR에서 shared UI check + game UI check + smoke check 자동 실행
- 포털 버전 `0.3.19` → `0.3.20`

### Fixed
- 로컬 수동 검증에 의존하던 UI 회귀 점검 흐름을 CI로 상시화

---

## [0.3.19] - 2026-02-25
### Added
- `scripts/game-ui-check.mjs` 추가 (Meteor/Lane Switch UI 모듈 핵심 동작 단위 검증)

### Changed
- 스모크 체크(`scripts/meteor-smoke-check.sh`)에 Game UI check 단계 추가 (`[6/6]`)
- 스모크 체크 파일 존재 검증 목록에 UI 체크 스크립트 2종 추가
- 포털 버전 `0.3.18` → `0.3.19`

### Fixed
- 게임 UI 상태 텍스트/알림/설정 동기화 변경 시 회귀 누락 가능성 추가 완화

---

## [0.3.18] - 2026-02-25
### Added
- `scripts/shared-ui-common-check.mjs` 추가 (shared UI 공통 유틸 단위 검증 스크립트)

### Changed
- 스모크 체크(`scripts/meteor-smoke-check.sh`)에 shared UI 공통 유틸 검증 단계 추가
- 포털 버전 `0.3.17` → `0.3.18`

### Fixed
- 공통 UI 유틸 변경 시 수동 확인 의존도를 낮추고 회귀 누락 가능성 완화

---

## [0.3.17] - 2026-02-25
### Added
- `games/shared/ui.common.js` 추가 (멀티라인 텍스트/오버레이/시간 포맷 공통 유틸)

### Changed
- Meteor Dodge / Lane Switch UI 모듈이 공통 유틸(`games/shared/ui.common.js`)을 참조하도록 정리
- 스모크 체크에 `games/shared/ui.common.js` 파일/HTTP 검증 항목 추가
- 포털 버전 `0.3.16` → `0.3.17`

### Fixed
- 게임별 UI 모듈에 중복되어 있던 포맷/오버레이 코드 제거로 유지보수 중복 리스크 완화

---

## [0.3.16] - 2026-02-25
### Added
- `games/lane-switch/ui.js` 추가 (HUD/미션/설정/오버레이/알림 UI 동기화 유틸 분리)

### Changed
- Lane Switch `main.js`에서 UI 로직을 모듈로 분리해 게임 루프/시스템 제어 책임 중심으로 정리
- 스모크 체크에 `games/lane-switch/ui.js` 파일/HTTP 검증 항목 추가
- 포털 버전 `0.3.15` → `0.3.16`

### Fixed
- Meteor/Lane Switch 간 구조 불일치로 발생하던 유지보수 맥락 전환 비용 완화

---

## [0.3.15] - 2026-02-25
### Added
- `games/meteor-dodge/ui.js` 추가 (HUD/미션/난이도/오버레이/설정 UI 동기화 유틸 분리)

### Changed
- Meteor Dodge `main.js`에서 UI 렌더/포맷 로직을 모듈로 분리해 메인 루프 책임 경량화
- 스모크 체크에 `games/meteor-dodge/ui.js` 파일/HTTP 검증 항목 추가
- 포털 버전 `0.3.14` → `0.3.15`

### Fixed
- 단일 파일 집중으로 발생하던 유지보수 복잡도를 완화해 후속 튜닝/패치 충돌 가능성 축소

---

## [0.3.14] - 2026-02-25
### Changed
- 포털/관리자/게임 런타임의 DOM 초기화에서 `innerHTML = ""` 대신 `replaceChildren()` 사용
- 게임 오버/안내 오버레이 문구 렌더를 줄바꿈 기반 텍스트 노드 방식으로 통일
- 포털 버전 `0.3.13` → `0.3.14`

### Fixed
- 텍스트 렌더 구간의 `innerHTML` 의존으로 남아 있던 잠재 XSS 표면 제거

---

## [0.3.13] - 2026-02-25
### Changed
- 구현 게임 판별 로직을 `./games/*` 고정 기준에서 확장해 `/games/.../index.html` 형태 URL도 구현 게임으로 인식
- `raw.githack` 같은 배포 URL(`.../games/<id>/index.html?v=...`)도 구현 게임 우선 정렬 규칙에 포함
- 포털 버전 `0.3.12` → `0.3.13`

### Fixed
- Featured/목록 정렬에서 배포 URL을 사용하는 구현 게임이 미구현 카드 뒤로 밀리던 문제 수정

---

## [0.3.12] - 2026-02-25
### Changed
- 포털 목록 정렬에서 구현된 게임(`playUrl`이 `./games/` 경로) 우선 노출
- 정렬 옵션(`인기순/업데이트순/제목순`) 모두에 구현 게임 우선 규칙 적용
- 최근 업데이트 리스트도 구현된 게임 우선 정렬 적용
- 포털 버전 `0.3.11` → `0.3.12`

### Fixed
- 포털 상단에서 미구현 게임이 먼저 보여 실제 플레이 가능한 게임 접근이 늦어지던 문제 완화

---

## [0.3.11] - 2026-02-25
### Changed
- Lane Switch 밸런스 1차 튜닝
  - 미션 목표 시간: 45초 → 42초
  - 초반 난이도 완화(속도/장애물 스폰 곡선 완만화)
  - 중반 이후 난이도 재가속 곡선 적용
  - 쉴드 출현 주기 조정(더 일찍, 더 자주 등장)
  - 레인 전환 쿨다운 미세 조정(90ms → 80ms)
- 포털 버전 `0.3.10` → `0.3.11`

### Fixed
- 초반 구간 난이도 급상승으로 인한 체감 진입 장벽 완화

---

## [0.3.10] - 2026-02-25
### Added
- Lane Switch 확장 기능 추가
  - 45초 생존 미션(+120 보너스)
  - 쉴드 아이템(충돌 1회 무효화)
  - 설정 패널(효과 표시/진동 토글 + 도움말)
- Lane Switch 런타임 상태에 미션/쉴드 타이머 표시 강화

### Changed
- Lane Switch 게임 루프에 미션/쉴드 스폰/충돌 처리 통합
- Lane Switch HUD/배너/힌트 텍스트를 확장 기능에 맞춰 갱신
- 포털 버전 `0.3.9` → `0.3.10`

---

## [0.3.9] - 2026-02-25
### Added
- Lane Switch 모듈 파일 추가
  - `main.js`, `state.js`, `input.js`, `renderer.js`, `systems.js`

### Changed
- Lane Switch 런타임 스크립트를 `index.html` 인라인에서 모듈 구조로 분리
- 스모크 체크 스크립트에 Lane Switch 모듈 존재/HTTP 검증 항목 추가
- 포털 버전 `0.3.8` → `0.3.9`

### Fixed
- 단일 인라인 스크립트 유지보수 부담을 낮추고 향후 기능 확장 충돌 가능성 완화

---

## [0.3.8] - 2026-02-25
### Added
- 신규 내장 게임 **Lane Switch: Neon Run** 추가 (`./games/lane-switch/index.html`)
- Lane Switch 프리뷰/스크린샷 에셋 추가 (`assets/previews/lane-switch-*.png`)

### Changed
- 포털 시드 데이터에 Lane Switch 카드/상세/미디어 정보 연동
- 스모크 체크 스크립트에 Lane Switch 경로/에셋 검증 항목 추가
- 포털 버전 `0.3.7` → `0.3.8`

---

## [0.3.7] - 2026-02-25
### Added
- 아이템 확장 3종 추가
  - `magnet`: 코인 흡수 효과(3.2s)
  - `double`: 점수 2배 효과(2.8s)
  - `overdrive`: 점수 보너스 + 고위험 가속 효과(3.6s)
- 아이템 상태 UI 강화(자석/더블/오버드라이브 타이머 표시)

### Changed
- 아이템 스폰 로직을 점수 기반 가중치 모델로 확장
- 점수 계산에 더블/오버드라이브 배율 반영
- 도움말/힌트 텍스트를 확장 아이템 기준으로 업데이트
- 포털 버전 `0.3.6` → `0.3.7`

### Fixed
- 아이템 루프가 코인/쉴드/슬로우 3종에 고정되어 확장성이 낮던 구조 개선

---

## [0.3.6] - 2026-02-25
### Changed
- 모바일 기준 최근 업데이트 섹션을 컴팩트하게 조정
  - 표시 개수: 6 → 4
  - 아이템 패딩/폰트 축소
  - 메타 텍스트 축소(모바일에서 숨김)
- 모바일 초소형 화면에서 최근 업데이트 영역 높이 추가 축소
- 포털 버전 `0.3.5` → `0.3.6`

### Fixed
- 최근 업데이트 영역이 과도하게 커져 메인 게임 카드 탐색을 방해하던 문제 완화

---

## [0.3.5] - 2026-02-25
### Added
- 미디어 로드 실패 대응 안정화:
  - 카드 미리보기 이미지 로드 실패 시 자동 폴백 처리
  - 상세 스크린샷 로드 실패 시 깨진 썸네일 제거 + 빈 상태 안내

### Changed
- 관리자 미디어 입력 정규화 강화
  - `javascript:` 스킴 차단
  - 스크린샷 중복 자동 제거
  - 미리보기 비어 있을 때 첫 스크린샷을 대표 이미지로 자동 사용
- 포털 버전 `0.3.4` → `0.3.5`

### Fixed
- 관리자 입력값 편차로 카드/상세 미디어 표시가 불안정해질 수 있는 케이스 완화
- 미리보기 이미지 경로 오류 시 카드 UI가 깨져 보일 수 있는 문제 완화

---

## [0.3.4] - 2026-02-25
### Added
- 관리자 페이지에 미리보기 이미지 입력 필드 추가
- 관리자 페이지에 스크린샷 목록 입력(줄바꿈/쉼표 구분) 추가
- 관리자 게임 목록에 미디어 등록 상태(미리보기/스크린샷 수) 표시

### Changed
- 관리자 저장 시 `featured` 옵션 제어 가능하도록 개선
- 관리자 저장 시 인기도 값을 0~100으로 클램프 처리
- `game.repository`에서 미디어 필드(`previewImage`, `screenshots`) 정규화 처리 강화
- 포털 버전 `0.3.3` → `0.3.4`

### Fixed
- 관리자에서 입력한 미리보기/스크린샷 값이 일관되지 않을 때 포털 렌더가 어긋날 수 있는 문제 완화

---

## [0.3.3] - 2026-02-25
### Added
- 시드 게임 전체에 카드 미리보기 이미지(`previewImage`) 일괄 적용
- 시드 게임 전체에 상세 스크린샷 1장 기본 연결(`screenshots`) 추가
- 포털 미리보기 에셋 12종 추가 (`assets/previews/*-preview.png`)

### Changed
- 모바일에서 게임 목록 최초 표시 수를 12개로 상향
- 모바일 단일 컬럼에서 콘텐츠 패널을 필터 패널보다 먼저 표시하도록 순서 조정
- 포털 버전 `0.3.2` → `0.3.3`

### Fixed
- 모바일 첫 화면에서 필터 패널이 먼저 보여 게임 목록 접근이 늦어지던 UX 완화

---

## [0.3.2] - 2026-02-25
### Added
- 포털 카드/상세에서 게임 미리보기 스크린샷 표시 지원
- Meteor Dodge 프리뷰 이미지/스크린샷 에셋 추가 (`assets/previews/*.png`)

### Changed
- 모바일 포털 카드 레이아웃을 2열 중심으로 최적화
- 모바일 카드 컴팩트 스타일(썸네일/텍스트/액션 밀도) 개선
- 상세 패널에 스크린샷 그리드 섹션 추가
- 포털 버전 `0.3.1` → `0.3.2`

### Fixed
- 모바일에서 한 화면에 게임 카드 노출 수가 적던 UX 문제 완화

---

## [0.3.1] - 2026-02-25
### Added
- 아이템 시스템 3종 추가
  - `coin`: +30 점수
  - `shield`: +2.6s 보호(쉴드)
  - `slow`: +2.2s 감속 효과
- 설정 패널 내 `도움말` 섹션 추가
- 아이템 획득 배너 및 효과 시각화 추가
- 아이템 효과음 `item.wav` 추가

### Changed
- 게임 루프에 아이템 스폰/획득/효과 처리 통합
- 미션 스트립에 활성 효과(쉴드/슬로우) 표시 강화
- 포털 버전 `0.3.0` → `0.3.1`

### Fixed
- 후반 구간 플레이 패턴 단조로움 완화(아이템 선택지 추가)

---

## [0.3.0] - 2026-02-24
### Added
- 세션 미션 시스템 추가: `60초 생존` 목표 + 미션 완료 보너스
- 설정 오버레이 추가: 효과음/배경음/진동 토글 + SFX 볼륨 슬라이더
- 데이터 저장 확장: 최근 10개 점수 이력, 난이도별 최고점 타임스탬프
- 기본 QA 자산 추가:
  - `scripts/meteor-smoke-check.sh` (자동 스모크 체크)
  - `games/meteor-dodge/tests/QA_CHECKLIST.md` (수동 체크리스트)

### Changed
- Meteor Dodge 런타임을 모듈 구조로 분리
  - `main`, `state`, `input`, `renderer`, `systems`
- 키 체계를 `arcadia_meteor_dodge_v3_*`로 통합(이전 키 호환 로드 포함)
- 운석 패턴/난이도/미션/결과 카드 UX를 `0.3.0` 기준으로 통합 정리
- 포털 버전 `0.2.8` → `0.3.0`

### Fixed
- 재생 환경에 따라 오디오 로드가 불안정할 수 있는 경로를 폴백/쿨다운으로 보강
- 점수/최고점/최근 기록 표시의 난이도 혼동 가능성 완화

---

## [0.2.8] - 2026-02-24
### Added
- 운석 패턴 2종 적용: `straight`(직진형), `accelerating`(가속형)
- 난이도/점수에 따라 가속형 운석 비율이 증가하는 패턴 선택 로직 추가

### Changed
- 운석 생성 로직에 타입별 파라미터(크기/속도/가속도) 반영
- 가속형 운석 전용 비주얼(색상/꼬리) 렌더링 추가
- 포털 버전 `0.2.7` → `0.2.8`

### Fixed
- 후반 플레이에서 패턴 단조로움으로 인한 난이도 체감 편차를 완화

---

## [0.2.7] - 2026-02-24
### Added
- SFX 시스템에 Howler CDN 실패 시 HTMLAudio 폴백 백엔드 추가
- 난이도별 최고점 분리 저장(`best_v2_normal` / `best_v2_hard`) 적용

### Changed
- 관리/리스트 렌더링에서 `innerHTML` 템플릿을 안전한 DOM 조립 방식으로 전환
- 날짜 표기를 UTC 기반(`toISOString`)에서 로컬 날짜 기반으로 변경
- 포털 버전 `0.2.6` → `0.2.7`

### Fixed
- 외부 CDN 이슈로 오디오 모듈 로드가 실패할 때 게임 전체가 깨질 수 있는 위험 완화
- 난이도 전환 시 최고점이 섞여 보이던 UX 혼동 완화

---

## [0.2.6] - 2026-02-24
### Added
- 난이도 프리셋 2종(`Normal`/`Hard`) 선택 UI 추가
- 난이도 설정 저장(`localStorage`) 및 라운드 재시작 연동

### Changed
- 난이도 계산 모듈(`difficulty.js`)을 프리셋 기반 파라미터 구조로 확장
- 난이도별 목숨/카운트다운/보호구간 차등 적용
- 포털 버전 `0.2.5` → `0.2.6`

### Fixed
- 난이도 변경 시 기존 라운드 상태가 섞이는 문제를 방지하도록 변경 플로우 정리

---

## [0.2.5] - 2026-02-24
### Added
- Howler.js 기반 SFX 추가 (카운트다운/피격/게임오버/최고점 갱신)
- Meteor Dodge에 오디오 에셋(`games/meteor-dodge/assets/sfx/*.wav`) 추가

### Changed
- 난이도 계산 로직을 `difficulty.js` 모듈로 분리
- 오디오 처리 로직을 `sfx.js` 모듈로 분리
- 포털 버전 `0.2.4` → `0.2.5`

### Fixed
- 시작 카운트다운 구간에서 초 단위 전환 시점 피드백(틱 사운드) 누락 개선

---

## [0.2.4] - 2026-02-24
### Added
- 시작 시 3초 카운트다운 + 3초 보호구간(쉴드) 추가
- 결과 오버레이에 `NEW BEST` 배지 및 `포털로` 이동 버튼 추가

### Changed
- Meteor Dodge 난이도 곡선을 초반 완화 / 중반 이후 가속 형태로 조정
- 포털 버전 `0.2.3` → `0.2.4`

### Fixed
- 시작 직후 즉시 피격되는 체감 문제를 완화하도록 시작 흐름 개선

---

## [0.2.3] - 2026-02-24
### Added
- 모바일 조작 버튼 입력의 호환성 강화를 위해 touch/mouse 폴백 처리 추가

### Changed
- 게임 레이아웃을 `flex` 기반으로 재구성해 하단 조작 버튼 영역이 항상 보이도록 조정
- 상단 메뉴를 간소화하고 `← 포털` 버튼을 헤더 내부로 통합
- 짧은 화면 높이에서 HUD/상단 텍스트를 자동 축소하도록 반응형 규칙 개선
- 포털 버전 `0.2.2` → `0.2.3`

### Fixed
- 모바일에서 하단 버튼이 화면 밖으로 밀려 보이지 않던 문제 수정
- 버튼이 보이더라도 입력이 불안정하던 케이스를 완화

---

## [0.2.2] - 2026-02-24
### Added
- 백그라운드 전환 시 자동 일시정지(`visibilitychange`) 처리 추가
- 하단 좌/우 버튼 눌림 상태(pressed) 시각 피드백 추가

### Changed
- 점수 누적 로직을 시간 기반 누적(`scoreFloat`) 방식으로 보정
- 포털 버전 `0.2.1` → `0.2.2`

### Fixed
- 입력이 남아 이동이 지속되는 케이스를 방지하기 위해 포커스 이탈/일시정지 시 입력 상태 초기화

---

## [0.2.1] - 2026-02-24
### Changed
- Meteor Dodge 조작 안내를 하단 버튼 중심으로 정리
- 게임 상단에 `포털로 이동` 고정 버튼 추가
- 포털 버전 `0.2.0` → `0.2.1`
- README 버전 표기 최신화

### Fixed
- 터치 입력 시 플레이어가 터치 위치로 순간이동하던 문제 수정 (하단 좌/우 버튼 입력 방식으로 전환)
- 일시정지 UI 접근성 개선 (상단 버튼으로 언제든 제어 가능)

---

## [0.2.0] - 2026-02-24
### Added
- 신규 내장 게임 **Meteor Dodge** 추가 (`games/meteor-dodge/index.html`)
- 포털 게임 시드에 `meteor-dodge` 항목 추가 및 로컬 플레이 링크 연결

### Changed
- 포털 버전 `0.1.0` → `0.2.0`
- README 실행 경로 및 프로젝트 구조 문서 최신화

---

## [0.1.0] - 2026-02-24
### Added
- Arcadia Hub Game Portal 초기 공개 버전
