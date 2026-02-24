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

### 결정 사항
- 버전 체계는 SemVer(`MAJOR.MINOR.PATCH`) 사용
- 기능 개발과 문서(`CHANGELOG`/`DEVLOG`)를 병행 업데이트
- 원격 기본 브랜치(`main`)는 직접 덮어쓰지 않고 브랜치/PR로 반영

### 다음 작업
- `.gitignore` 변경을 `main`에 반영(push)
- 이후 기능 변경 시 문서(`CHANGELOG`/`DEVLOG`) 동시 업데이트
