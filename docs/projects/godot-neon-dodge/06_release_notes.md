# 06_release_notes — Godot Neon Dodge

## Version
- version: v0.1.0-dev
- date: 2026-03-01

## Added
- 프로젝트 문서 세트(청사진/GDD/개발계획/로드맵/개발일지/QA/릴리즈노트)
- Godot 모듈형 코드베이스 초기 구조
- 입력 액션 모듈(`move/dash/restart`) 및 런타임 바인딩
- 스포너/스코어/HUD/게임오버/재시작 핵심 루프 연결

## Changed
- Player: 대시 쿨다운 상태 노출, 활성 제어, 런타임 리셋 지원
- GameRoot: 피해 무적시간(히트 쿨다운), 게임오버 상태 처리 강화
- Spawner: 게임오버 시 스폰 중단 및 라운드 리셋 지원

## Fixed
- 없음

## Verification
- headless 실행 스모크 통과

## Known Issues
- 실제 플레이 루프 기능 구현 진행 중
