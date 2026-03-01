# 04_devlog — Godot Neon Dodge

## 2026-03-01 12:55 KST
### 오늘 목표
- 문서 세트 구축 + 모듈형 코드 베이스 초기화

### 진행 내용
- 프로젝트 청사진/GDD/계획/로드맵 작성
- Godot 프로젝트 모듈 구조 생성(core/entities/systems/ui/data)
- headless 실행 스모크 검증

### 이슈/해결
- 이슈: Godot CLI 기본 PATH 미등록
- 해결: `scripts/godotw` 래퍼 및 MCP 브리지 경로 고정

### 검증 결과
- headless 실행 정상, 초기 로그 출력 확인

### 다음 액션
- Player 이동/대시 및 Spawner 동작 구현

## 2026-03-01 13:18 KST
### 오늘 목표
- 플레이어블 루프(v0.1) 핵심 기능 연결

### 진행 내용
- 입력 액션 모듈 분리(`input_actions.gd`): 이동(WASD/방향키), 대시(Space), 재시작(R)
- Player 개선: 대시 쿨다운 상태 노출/활성 제어/런타임 초기화
- GameRoot 개선: 피해 무적시간(히트 쿨다운), 게임오버 시 입력 잠금, R 재시작 루프
- Spawner 개선: 게임오버 상태에서는 스폰 중단 + 런타임 리셋 지원
- HUD 개선: DASH 상태 및 재시작 안내 표시

### 이슈/해결
- 이슈: 게임오버 이후에도 적 스폰이 지속될 수 있는 구조
- 해결: Spawner에서 `game_state.is_game_over` 체크 후 스폰 중단

### 검증 결과
- `./scripts/godotw --headless --path ./games/godot-neon-dodge --quit-after 360` 통과
- `mcporter call godot-local.godot_run_headless ...` 통과

### 다음 액션
- 수동 플레이테스트(3회)로 난이도 곡선/피격 억울사 체감 검증
- 밸런스 파라미터 1차 튜닝
