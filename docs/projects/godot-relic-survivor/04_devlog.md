# 04_devlog — Godot Relic Survivor

## 2026-03-01 15:53 KST
### 오늘 목표
- 기존 프로토타입 아카이브 후 신규 프로젝트 재시작

### 진행 내용
- `Godot Neon Dodge`를 사용자 요청에 따라 archive로 이동 보관
- 신규 프로젝트 `Godot Relic Survivor` 문서 세트 생성
- 프로젝트 인덱스 갱신(archived + in-progress)

### 이슈/해결
- 없음

### 검증 결과
- 문서 경로/인덱스 반영 확인

### 다음 액션
- Godot 프로젝트 모듈형 베이스 생성
- headless 스모크 검증

## 2026-03-01 16:02 KST
### 오늘 목표
- 신규 프로젝트 코어 베이스 + 실행 검증

### 진행 내용
- 모듈형 구조 초기화:
  - `scripts/core`: `game_root`, `game_state`, `signal_bus`, `input_actions`
  - `scripts/entities`: `player`
  - `scripts/systems`: `spawn_director`
  - `scripts/ui`: `arena_background`, `hud`
  - `scripts/data`: `balance`
- 최소 플레이 루프(이동/대시/킬 카운트 증가/재시작) 베이스 연결

### 이슈/해결
- 없음

### 검증 결과
- `./scripts/godotw --headless --path ./games/godot-relic-survivor --quit-after 360` 통과
- `mcporter call godot-local.godot_run_headless projectPath=games/godot-relic-survivor quitAfter:360` 통과

### 다음 액션
- 자동공격 + 발사체 충돌 시스템 추가
- 적 2종(기본/돌진) 실체 구현
