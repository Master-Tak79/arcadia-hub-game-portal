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

### 결정 사항
- 버전 체계는 SemVer(`MAJOR.MINOR.PATCH`) 사용
- 기능 개발과 문서(`CHANGELOG`/`DEVLOG`)를 병행 업데이트
- 원격 기본 브랜치(`main`)는 직접 덮어쓰지 않고 브랜치/PR로 반영
- 신규 게임은 포털 내 로컬 URL로 바로 플레이 가능하게 우선 통합

### 다음 작업
- `Meteor Dodge` 수동 플레이 테스트 후 밸런싱(속도/스폰 빈도) 미세 조정
- 브랜치 push + PR 생성 후 리뷰/병합
