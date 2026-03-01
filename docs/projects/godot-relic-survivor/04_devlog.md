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

## 2026-03-01 16:16 KST
### 오늘 목표
- 코어 전투 루프 1차 구현 (자동공격 + 적 2종)

### 진행 내용
- `ProjectileContainer` 추가 및 발사체 엔티티(`projectile.gd`) 구현
- 자동공격 시스템(`auto_attack_system.gd`) 구현
  - 최근접 적 탐색
  - 사거리/공격속도 기반 발사체 자동 발사
- 전투 시스템(`combat_system.gd`) 구현
  - 발사체-적 충돌 판정/피해/처치 카운트
  - 적-플레이어 충돌 판정/무적시간/사망 처리
- 적 2종 구현
  - `enemy_grunt.gd`: 추적형
  - `enemy_dasher.gd`: 주기 돌진형
- 스폰 디렉터 고도화(`spawn_director.gd`)
  - 시간 경과 기반 스폰 주기 감소
  - 대셔 스폰 확률 점진 증가
- HUD 확장: ENEMIES/SHOTS 실시간 노출

### 이슈/해결
- 이슈: GDScript 타입 추론 경고가 에러로 처리되어 컴파일 실패
- 해결: `spawn_director.gd`의 확률 변수 타입을 명시(`float` + `clampf`)

### 검증 결과
- `./scripts/godotw --headless --path ./games/godot-relic-survivor --quit-after 600` 통과
- `./scripts/godotw --headless --path ./games/godot-relic-survivor --fixed-fps 60 --quit-after 9000` 통과
- `mcporter call godot-local.godot_run_headless ... quitAfter:900` 통과

### 다음 액션
- EXP/레벨업 3지선다 시스템 구현
- 업그레이드 데이터 구조(12종) 및 UI 패널 추가
