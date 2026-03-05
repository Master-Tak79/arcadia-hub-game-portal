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

## 2026-03-01 13:43 KST
### 오늘 목표
- Stage 3: 가시성/피드백 강화 + 자동 캡처 기반 진행 화면 공유

### 진행 내용
- Arena 배경 렌더러(`arena_background.gd`) 추가: 어두운 톤 + 그리드
- Player 렌더 피드백 강화: 본체/외곽 링/대시 링/피격 플래시
- Enemy 렌더 피드백 강화: 본체/외곽 링/진행 방향 라인
- HUD 개선: ENEMIES 카운트 노출
- 밸런스 1차 조정:
  - `ENEMY_SPEED_BASE 120 -> 135`
  - `SPAWN_INTERVAL_BASE 1.2 -> 1.0`
  - `SPAWN_RAMP_PER_SEC 0.015 -> 0.018`
  - `ENEMY_HIT_RADIUS 24 -> 22`
- 진행 캡처 생성:
  - `stage3_capture00000000.png` (초기)
  - `stage3_capture00000119.png` (~2초)
  - `stage3_capture00000239.png` (~4초)
  - `stage3_capture00000299.png` (~5초, 피격 반영 HP 2)

### 이슈/해결
- 이슈: `--headless + --write-movie` 조합에서 Godot 4.6.1 크래시 발생
- 해결: 캡처는 GUI 실행 + `--write-movie` 방식으로 전환

### 검증 결과
- `./scripts/godotw --headless --path ./games/godot-neon-dodge --quit-after 240` 통과
- `./scripts/godotw --path ./games/godot-neon-dodge --write-movie ... --quit-after 300` 통과

### 다음 액션
- 수동 플레이 3회로 이동/대시/재시작 품질 체크 완료
- 체크리스트 업데이트 후 v0.1.0-alpha 기준선 확정

## 2026-03-01 13:51 KST
### 오늘 목표
- Stage 3 후 안정성 검증 및 중간 결과 공유

### 진행 내용
- 장시간 안정성 검증: headless fixed-fps 5분 시뮬레이션(18000프레임) 3회 수행
- 결과 공유용 캡처 4장 추출 및 전달 준비

### 이슈/해결
- 특이 크래시 없음(3회 모두 정상 종료)

### 검증 결과
- RUN#1/2/3 모두 `NEON_DODGE_BOOT_OK` 확인
- 5분 시뮬레이션 중 프로세스 비정상 종료 없음

### 다음 액션
- 수동 플레이 QA 3회(조작감/재시작 UX) 수행
- v0.1.0-alpha 기준선 확정

## 2026-03-01 14:02 KST
### 오늘 목표
- 재시작 루프 가시화 + 자동 QA 보조 체계 추가

### 진행 내용
- `qa_driver.gd` 추가: `-- --qa-autoplay` 실행 시 자동 이동/주기 데미지/자동 재시작 시퀀스 수행
- `game_root.gd`에 QA 모드 플래그 감지 및 QA 시그널 연결
- QA 캡처 추가:
  - `qa_auto00000239.png` (게임오버 직후)
  - `qa_auto00000259.png` (게임오버 UI 유지)
  - `qa_auto00000299.png` (자동 재시작 후 새 라운드)

### 이슈/해결
- 캡처 시 사용자 입력이 없어서 재시작 검증이 어려움
- QA 자동 모드(옵트인)로 재시작 루프를 재현 가능한 형태로 고정

### 검증 결과
- `--qa-autoplay` headless 3600프레임에서 `QA_RESTART_1..12` 로그 확인
- GUI write-movie 450프레임 캡처에서 게임오버→재시작 프레임 확인

### 다음 액션
- 수동 입력 기반 QA(이동/대시 체감) 3회
- v0.1.0-alpha 기준선 확정
