# 12_balance_tuning_log — Godot Relic Survivor

## 2026-03-01 (2차 튜닝)

### 변경 요약
- Player
  - `PLAYER_HIT_INVULN`: 0.45 → 0.50
  - `ATTACK_INTERVAL`: 0.45 → 0.43
- Enemies
  - `ENEMY_GRUNT_SPEED`: 130 → 124
  - `ENEMY_DASHER_SPEED`: 90 → 86
  - `ENEMY_DASHER_DASH_SPEED`: 340 → 320
  - `ENEMY_DASHER_DASH_INTERVAL`: 1.8 → 2.0
- Spawn Curve
  - `SPAWN_INTERVAL_BASE`: 1.1 → 1.2
  - `SPAWN_INTERVAL_MIN`: 0.22 → 0.28
  - `SPAWN_RAMP_PER_SEC`: 0.02 → 0.017
  - `SPAWN_DASHER_CHANCE_BASE`: 0.2 → 0.12
  - `SPAWN_DASHER_CHANCE_RAMP`: 0.005 → 0.0045
  - `ACTIVE_ENEMY_SOFT_CAP`: 70 추가
  - `ACTIVE_ENEMY_HARD_CAP`: 110 추가
- MiniBoss
  - `MINIBOSS_DASH_SPEED`: 410 → 380
  - `MINIBOSS_DASH_INTERVAL`: 2.5 → 2.8
  - `MINIBOSS_SUMMON_INTERVAL`: 6.0 → 7.0
  - `MINIBOSS_SUMMON_COUNT`: 3 → 2

### 자동 검증 결과
- 스모크/보스 루프/재시작 루프 통과
- 장시간(10분) 시뮬레이션 통과

### 남은 검증
- 실수동 플레이 3회 체감 검증
- 실GUI FPS 실측

## 2026-03-01 (3차 미세 튜닝)

### 변경 요약
- Spawn Director phase shaping 추가
  - 초반(0~120s): 스폰 간격 소폭 증가, Dasher 비중 40% 감소
  - 후반(360s~): 스폰 간격 소폭 감소, Dasher 비중 소폭 증가
- Event Banner 폴리싱
  - 배경 패널/페이드아웃/상황별 강조색(보스 등장/처치) 적용
- Boss clear 배너 문구 강화
  - `PHASE CLEAR` 강조로 리워드 인지성 개선

### 자동 검증 결과
- 스모크 통과
- 보스 루프 QA 통과 (`--boss-test --auto-levelup --qa-autopilot`)
- 장시간 5분 루프(`18000`프레임) 통과

### 기대 효과
- 초반 급사 스트레스 완화
- 중후반 긴장감 유지
- 보스 이벤트 전달력 향상

## 2026-03-01 (4차 미세 튜닝)

### 변경 요약
- Boss-phase spawn guardrail 추가
  - 보스 활성 시 스폰 간격에 보너스(`BOSS_PHASE_SPAWN_INTERVAL_BONUS`) 적용
  - 보스 활성 시 Dasher 확률 배수(`BOSS_PHASE_DASHER_CHANCE_MULT`) 적용
- Spawn Director에 miniboss director 연동
  - 보스 상태 인지 기반으로 웨이브 밀도 동적 완화

### 자동 검증 결과
- 스모크 통과
- 보스 루프 QA 통과 (`--boss-test --auto-levelup --qa-autopilot`)
- 회귀 5분 루프(`18000`) 통과

### 기대 효과
- 보스전 중 잡몹 과밀로 인한 억울사 감소
- 보스 패턴 집중도 향상
