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
