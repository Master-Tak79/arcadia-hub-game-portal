# Arcadia Hub (Game Portal Foundation)

마스터 요청으로 만든 **확장형 웹게임 포털 베이스**입니다.
CrazyGames 스타일을 참고하되, 앞으로 기능 추가가 쉬운 구조로 분리해 두었습니다.

## 실행

```bash
cd /path/to/arcadia-hub-game-portal
python3 -m http.server 8790
```

브라우저 접속:
- 포털: `http://127.0.0.1:8790`
- 관리자: `http://127.0.0.1:8790/admin.html`

---

## 현재 구현 기능 (0.3.47)

- 게임 카드형 목록 UI
- 검색 / 장르 필터 / 카테고리 탭 / 플랫폼 필터 / 정렬
- Featured 섹션 + 최근 업데이트 리스트
- 구현된 플레이 가능 게임(`./games/*`) 우선 정렬
- 즐겨찾기(localStorage)
- URL 해시 라우팅 기반 상세 패널
  - `#/game/{id}`
- 상세 패널 내 메타/태그/조작법/상세설명
- 무한 스크롤(점진 로드)
- 관리자 등록/수정/삭제 페이지(localStorage 기반)
  - 미리보기 이미지/스크린샷 경로 입력 지원
  - 미디어 입력 정규화/중복 제거 및 인기도(0~100) 보정
- 데이터 새로고침
- 모바일 반응형 레이아웃 (모바일 2열 카드 최적화)
  - 최근 업데이트 섹션 컴팩트 모드(모바일 4개 표시)
- 카드/상세에 게임 미리보기(프리뷰 이미지/스크린샷) 표시 지원
  - 현재 시드 게임 전체에 프리뷰/스크린샷 1차 적용 완료
- 내장 플레이 가능 게임 15종
  - **Meteor Dodge** (`./games/meteor-dodge/index.html`)
    - 조작: 키보드(←/→, A/D) + 하단 좌/우 버튼(모바일 터치)
    - 난이도 프리셋 2종(`Normal`/`Hard`) + 난이도별 카운트다운/보호구간/목숨 차등
    - 운석 패턴 2종(직진형 / 가속형) 적용
    - 세션 미션: 60초 생존 + 미션 보너스 점수
    - 아이템 시스템: 코인(+30), 쉴드(+2.6s), 슬로우(+2.2s), 자석(+3.2s), 더블점수(+2.8s), 오버드라이브(+보너스+리스크)
    - 결과 카드: 최근 점수/최고점/플레이 시간 표시
    - 설정 오버레이: 효과음/배경음/진동 토글 + SFX 볼륨 슬라이더 + 도움말
    - 라이브러리: Howler.js 기반 SFX + CDN 실패 시 HTMLAudio 폴백
    - 데이터: 난이도별 최고점/최고점 타임스탬프/최근 10개 점수 이력(localStorage)
    - 구조: `main/state/input/renderer/systems` 모듈 분리 + 자동 스모크 체크 스크립트
  - **Lane Switch: Neon Run** (`./games/lane-switch/index.html`)
    - 조작: 키보드(←/→, A/D) + 하단 버튼 + 스와이프
    - 레인 전환 기반 회피 + 코인 수집 점수 어택
    - 39초 생존 미션 + 쉴드 아이템 + 설정 패널(효과/진동/도움말)
    - 초반 완화/중반 가속형 난이도 곡선 + 최고점 저장(localStorage)
    - 구조: `main/state/input/renderer/systems` 모듈 분리
  - **추가 내장 게임 13종**
    - Sky Drift Nitro / Neon Brick Breaker / Orbit Survivor
    - Block Sage / Mini Empire Grid / Pixel Clash Arena / Idle Foundry / Dash to Core / Farm Harbor / Mecha Sprint / Maze Signal / Void Raiders / Rail Commander
    - 공통: 사운드/BGM/효과음 볼륨 저장 + 일시정지(`P`) UX + QA 체크리스트 적용

---

## 구조(확장 전제)

```text
arcadia-hub-game-portal/
  index.html
  admin.html
  assets/
    previews/
      *.png                     # 포털 카드/상세 미리보기 이미지
  games/
    meteor-dodge/
      index.html                # 내장 플레이 게임 (회피형 아케이드)
      main.js                   # 게임 엔트리/오케스트레이션
      state.js                  # 상태/스토리지 계층
      input.js                  # 키보드/터치 입력 바인딩
      renderer.js               # 캔버스 렌더링 계층
      systems.js                # 게임 로직(스폰/충돌/미션/아이템)
      difficulty.js             # 난이도/패턴 파라미터
      sfx.js                    # 오디오 모듈(Howler + 폴백)
      assets/
        sfx/
          *.wav                 # 효과음/배경음 에셋
      tests/
        QA_CHECKLIST.md         # 수동 QA 체크리스트
    lane-switch/
      index.html                # 레인 전환형 아케이드 러너
      main.js                   # 게임 엔트리/오케스트레이션
      state.js                  # 상태/스토리지 계층
      input.js                  # 키보드/터치/스와이프 입력 바인딩
      renderer.js               # 캔버스 렌더링 계층
      systems.js                # 게임 로직(스폰/충돌/점수/난이도)
  scripts/
    meteor-smoke-check.sh       # 기본 자동 스모크 체크
  styles/
    main.css
  src/
    main.js                     # 포털 엔트리, 이벤트 바인딩
    admin.js                    # 관리자 페이지 로직
    data/
      games.seed.js             # 초기 게임 데이터
      admin.storage.js          # 관리자 저장소(localStorage)
      game.repository.js        # 데이터 공급 계층(추후 API 교체 포인트)
    state/
      store.js                  # 필터/즐겨찾기/무한스크롤 상태
      router.js                 # 상세 라우팅(#/game/{id})
    ui/
      renderers.js              # 목록/카드/리스트/카테고리 렌더링
      detail-panel.js           # 상세 패널 렌더링
    utils/
      format.js                 # 표시 포맷 유틸
```

---

## 버전 정책

- 포털 현재 버전: **`0.3.47`**
- 기본 게임 버전: **`0.1.0`**
- 버전 형식: `MAJOR.MINOR.PATCH` (semver)
- 게임 등록/수정 시 관리자 페이지에서 `게임 버전` 입력 가능
- 입력이 semver 형식이 아니면 기본값(`0.1.0`)으로 보정

권장 규칙:
- PATCH: 오타/작은 UI 수정
- MINOR: 기능 추가(필터, 상세정보, 카드 속성 등)
- MAJOR: 구조 변경/호환성 깨짐

## 다음 확장 추천

1. **서버 API 연결**
   - `game.repository.js`를 `/api/games`로 교체
2. **관리자 인증**
   - 관리자 페이지 접근 권한 분리
3. **유저 기능**
   - 최근 플레이, 평점, 댓글
4. **랭킹 시스템**
   - 주간 인기/신규 급상승
5. **상세 고도화**
   - 스크린샷 갤러리, 관련 게임 추천, 플레이 이력
