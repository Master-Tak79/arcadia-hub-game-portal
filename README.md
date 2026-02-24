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

## 현재 구현 기능 (3차)

- 게임 카드형 목록 UI
- 검색 / 장르 필터 / 카테고리 탭 / 플랫폼 필터 / 정렬
- Featured 섹션 + 최근 업데이트 리스트
- 즐겨찾기(localStorage)
- URL 해시 라우팅 기반 상세 패널
  - `#/game/{id}`
- 상세 패널 내 메타/태그/조작법/상세설명
- 무한 스크롤(점진 로드)
- 관리자 등록/수정/삭제 페이지(localStorage 기반)
- 데이터 새로고침
- 모바일 반응형 레이아웃
- 내장 플레이 가능 게임 1종: **Meteor Dodge** (`./games/meteor-dodge/index.html`)
  - 조작: 키보드(←/→, A/D) + 하단 좌/우 버튼(모바일 터치)
  - UX: 앱 전환 시 자동 일시정지, 버튼 눌림 피드백 제공
  - 모바일 화면에서 상단 메뉴 간소화 + 하단 좌/우 버튼 영역 고정
  - 난이도 프리셋 2종(`Normal`/`Hard`) + 난이도별 카운트다운/보호구간/목숨 차등
  - 시작 3초 카운트다운 + 3초 보호구간, 결과 화면 강화(재시작/포털 이동/NEW BEST)
  - 라이브러리: Howler.js 기반 효과음(SFX) + 일부 로직 모듈 리팩토링
  - 안정화: Howler 로드 실패 시 Audio 폴백, 난이도별 최고점 분리 저장

---

## 구조(확장 전제)

```text
arcadia-hub-game-portal/
  index.html
  admin.html
  games/
    meteor-dodge/
      index.html                # 내장 플레이 게임 (회피형 아케이드)
      difficulty.js             # 난이도 곡선 계산 모듈(리팩토링)
      sfx.js                    # 오디오 모듈(Howler.js)
      assets/
        sfx/
          *.wav                 # 효과음 에셋
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

- 포털 현재 버전: **`0.2.7`**
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
