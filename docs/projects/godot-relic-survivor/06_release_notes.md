# 06_release_notes — Godot Relic Survivor

## Version
- version: v0.1.0-dev
- date: 2026-03-01

## Added
- 신규 프로젝트 문서 세트(청사진/GDD/개발계획/로드맵/개발일지/QA/릴리즈노트)
- 기존 `Godot Neon Dodge` 아카이브 전환

## Changed
- `docs/projects/_index.md` 상태 갱신(archived + in-progress)

## Fixed
- 없음

## Verification
- 문서/경로 구조 반영 확인
- `godotw --headless` 스모크 실행 통과 (`RELIC_SURVIVOR_BOOT_OK`)
- `mcporter call godot-local.godot_run_headless` 실행 통과

## Known Issues
- 코어 플레이 루프 구현 전
