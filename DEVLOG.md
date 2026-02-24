# DEVLOG.md

작업 중 의사결정, 시도/실패, 다음 액션을 기록하는 개발 일지입니다.

## 2026-02-24
### 오늘 목표
- 문서 기반 개발 운영 체계 추가

### 진행 내용
- `VERSIONING.md` 작성 (SemVer 및 릴리스 체크리스트)
- `CHANGELOG.md` 작성 (Keep a Changelog 기반)
- `DEVLOG.md` 작성 (개발 일지 템플릿)
- 기존 원격 저장소(`main`)를 기준으로 안전한 브랜치 전략 수립
- `.gitignore` 추가로 로컬 OpenClaw 운영 파일을 Git 추적에서 제외
- 신규 브랜치 `feat/meteor-dodge-mvp`에서 캔버스 기반 게임 `Meteor Dodge` 구현
- 게임 시드(`games.seed.js`)에 로컬 플레이 가능한 `meteor-dodge` 등록
- 포털 버전 `0.2.0` 업데이트 및 README 구조 최신화
- `fix/meteor-touch-controls-and-ui` 브랜치에서 터치 조작 로직 개선
- 캔버스 터치 순간이동 입력 제거, 하단 좌/우 버튼 기반 이동으로 전환
- 상단 고정 `포털로 이동` 버튼 및 상단 일시정지 버튼 추가
- 포털 버전 `0.2.1`로 패치 업데이트
- `feat/meteor-ux-polish-0.2.2` 브랜치에서 Meteor Dodge UX 보완
- 앱 백그라운드 전환 시 자동 일시정지(`visibilitychange`) 추가
- 하단 좌/우 버튼 pressed 시각 피드백 및 입력 해제 안정화 처리
- 점수 계산을 시간 기반 누적(`scoreFloat`)으로 보정
- 포털 버전 `0.2.2`로 패치 업데이트

### 결정 사항
- 버전 체계는 SemVer(`MAJOR.MINOR.PATCH`) 사용
- 기능 개발과 문서(`CHANGELOG`/`DEVLOG`)를 병행 업데이트
- 원격 기본 브랜치(`main`)는 직접 덮어쓰지 않고 브랜치/PR로 반영
- 신규 게임은 포털 내 로컬 URL로 바로 플레이 가능하게 우선 통합
- 모바일 조작 입력은 예측 가능성이 높은 버튼 기반 방식을 우선 채택

### 다음 작업
- 모바일 실기기 기준 조작감(버튼 간격/크기) 추가 점검
- 난이도 커브(초반/중반 스폰 속도) 미세 조정
- WebAudio 기반 짧은 SFX(피격/게임오버) 도입 검토
