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

## 2026-03-01 (5차 미세 튜닝)

### 변경 요약
- Boss-phase 추가 완화
  - `BOSS_PHASE_SPAWN_INTERVAL_BONUS`: 0.10 → 0.12
  - `BOSS_PHASE_DASHER_CHANCE_MULT`: 0.82 → 0.78
- Post-boss recovery window 도입
  - `POST_BOSS_RECOVERY_DURATION`: 45s
  - `POST_BOSS_SPAWN_INTERVAL_BONUS`: +0.06
  - `POST_BOSS_DASHER_CHANCE_MULT`: x0.86
- SpawnDirector에 post-boss 회복 구간 로직 추가
  - 보스 처치 직후 일정 시간 웨이브 압박 완화

### 자동 검증 결과
- 스모크 통과
- 보스 루프 QA 통과
- 회귀 5분 루프 통과

### 기대 효과
- 보스 처치 직후 급격한 재압박 완화
- 페이즈 전환 체감 개선

## 2026-03-01 (Audio Mix Finalization)

### 변경 요약
- SFX 슬롯 최종값 고정(기본 믹스)
  - warning: -10.5 dB
  - spawn: -8.0 dB
  - defeat: -6.5 dB
- SFX 프리셋 옵션화
  - `default`, `quiet`, `hype`
  - 런타임 인자: `--sfx-preset=<preset>`
- SFX 타이밍 미세 조정
  - warning delay: 0.03s
  - spawn delay: 0.00s
  - defeat delay: 0.05s
- warning/spawn/defeat SFX v2 재생성 및 주입

### 자동 검증 결과
- `--sfx-preset=quiet` / `--sfx-preset=hype` 실행 통과
- 보스 루프에서 이벤트 훅 + SFX 슬롯 정상 동작
- `SFX_SLOT_UNASSIGNED` 미출력

### 기대 효과
- 보스 이벤트의 청각적 구분 강화
- 상황별(조용/강조) 운용 유연성 확보

## 2026-03-01 (6차 미세 튜닝 — Late Wave Lock)

### 변경 요약
- Spawn ramp 계수 재조정
  - `SPAWN_RAMP_PER_SEC`: 0.017 → 0.0018
  - `SPAWN_DASHER_CHANCE_RAMP`: 0.0045 → 0.00125
- Saturation backoff 세분화
  - `SOFT_CAP_BACKOFF_BASE`: 0.24
  - `HARD_CAP_BACKOFF_BASE`: 0.40
  - 초과 개체 수에 비례한 backoff 시간 추가
- Late-phase shaping 파라미터 추가
  - `LATE_PHASE_START`: 480s
  - `LATE_PHASE_INTERVAL_BONUS`: +0.02
  - `LATE_PHASE_DASHER_BONUS`: +0.035
- Boss/recovery guardrail 유지
  - 보스 활성/처치 직후 구간에서 웨이브 압박 완화 유지

### 자동 검증 결과
- 스모크 통과
- 보스 루프 QA 통과
- 5분 회귀 루프 통과 (`--sfx-preset=quiet` 포함)

### 기대 효과
- 후반 웨이브 곡선의 급격한 경사 완화
- 적 포화 구간에서 난이도 스파이크 억제
- alpha-candidate 기준선 안정화

## 2026-03-01 (Upgrade Offer Weight Tuning)

### 변경 요약
- 업그레이드 제안 가중치 시스템 도입
  - `upgrades.gd` 각 업그레이드에 `weight` 부여
  - 강력 복합 효과/핵심 DPS 업그레이드의 과잉 노출 빈도 완화
- `upgrade_system.gd` 선택지 롤링 개선
  - 균등 랜덤 → 가중치 랜덤(중복 제거 유지)

### 자동 검증 결과
- 스모크 통과
- 보스 루프 통과
- 5분 회귀 통과

### 기대 효과
- 성장 곡선의 편차 완화
- 빌드 다양성 유지 + 특정 OP 조합 조기 고정 완화

## 2026-03-02 (Pre-manual Freeze Baseline)

### 변경 요약
- Boss pattern pacing final(수동 QA 전 1차 고정)
  - `MINIBOSS_COMBO_DASH_CHANCE`: 0.34 → 0.29
  - `MINIBOSS_SUMMON_WINDUP`: 0.55 → 0.62
  - `MINIBOSS_SUMMON_WALL_CHANCE`: 0.45 → 0.40
  - 소환 패턴 선택에 HP/거리 기반 보정 추가(근접 공정성 강화)
- Pressure threshold final(추천 로직 기준선)
  - `pressure_band low`: `< 0.50`
  - `pressure_band mid`: `< 0.95`
  - `pressure_band high`: `>= 0.95`

### 자동 검증 결과
- `headless-alpha-gate.sh` PASS (`boss_pattern` 포함)
- `pre-manual-qa-check.sh` PASS
- `balance-freeze-check.sh` PASS

### 운영 메모
- 본 값들은 수동 QA/FPS 실측 전까지 freeze 기준으로 유지
- 추가 조정이 필요하면 `16_alpha_candidate_quality_lock.md` exception 규칙에 따라 기록 후 변경

## 2026-03-02 (Review-driven Stability Patch)

### 변경 요약
- Spawn fairness
  - `SPAWN_PLAYER_SAFE_RADIUS = 110.0` 추가
  - `SPAWN_SAFE_ATTEMPTS = 8` 추가
  - 일반 웨이브 스폰 시 플레이어 근접 스폰 회피 로직 적용
- Boss pattern QA reliability
  - `--boss-pattern-test`에서 소환 패턴을 RING/WALL 교차 순환하도록 고정
  - 게이트에서 RING/WALL 최소 1회 출현 검증 추가
- Growth/QA consistency
  - auto-levelup 선택 점수 로직을 multi-effect 기준으로 보강
  - 압박도(high) 구간에서 생존/기동 선호가 반영되도록 선택 편향 보정

### 자동 검증 결과
- `headless-alpha-gate.sh` PASS (`boss_pattern` 다양성 포함)
- `pre-manual-qa-check.sh` PASS
- `trace-objectdb-leak.sh` PASS

### 기대 효과
- 자동 QA 결과와 실플레이 체감 간 괴리 축소
- 스폰 억울사 감소
- 보스 패턴 회귀 검증의 flaky 리스크 감소

## 2026-03-02 (Elite Pack 01)

### 변경 요약
- 신규 엘리트 적 2종 추가
  - Elite Grunt: 버스트 돌진형 근접 압박
  - Elite Dasher: 연속 돌진 체인형 압박
- 엘리트 스폰 파라미터 추가
  - `ELITE_PHASE_START = 210.0`
  - `ELITE_GRUNT_CHANCE_BASE/RAMP = 0.03 / 0.00028`
  - `ELITE_DASHER_CHANCE_BASE/RAMP = 0.015 / 0.00022`
  - `ELITE_TOTAL_CHANCE_CAP = 0.24`
- 엘리트 테스트 모드 추가
  - `--elite-test` (QA에서 엘리트 스폰 검증 용도)

### 자동 검증 결과
- `headless-alpha-gate.sh` PASS
  - `elite_loop`에서 `ELITE_SPAWNED:elite_grunt`, `ELITE_SPAWNED:elite_dasher` 확인
- `pre-manual-qa-check.sh` PASS
- `trace-objectdb-leak.sh` PASS

### 기대 효과
- 중반(약 3~10분) 난이도 브릿지 강화
- 기본 grunt/dasher만 반복되는 패턴 피로도 완화

## 2026-03-02 (Relic System 01)

### 변경 요약
- 유물 12종 데이터 추가 (`scripts/data/relics.gd`)
  - 공격4 / 기동3 / 생존3 / 혼합2
- 런타임 유물 획득 루프 추가 (`scripts/systems/relic_system.gd`)
  - 일반 모드: `RELIC_FIRST_TIME` 이후 주기 획득
  - 테스트 모드: `--relic-test` 빠른 주기 획득
- 유물 가중치 보정
  - 체력/압박도 기반으로 role(attack/mobility/survival/hybrid) 가중치 조정

### 자동 검증 결과
- `headless-alpha-gate.sh` PASS (`relic_loop` 포함)
  - `RELIC_GRANTED:*` 최소 2회 검증 통과
- `pre-manual-qa-check.sh` PASS
- `trace-objectdb-leak.sh` PASS

### 기대 효과
- 런별 빌드 분기 확대로 리플레이 동기 강화
- auto-levelup/압박도 시스템과의 시너지로 중반 이후 전략성 향상

## 2026-03-02 (Stage Event Pack 01)

### 변경 요약
- Stage Event 3종 추가
  - `fog`: 사거리 배수 디버프 (`event_attack_range_mult`)
  - `slow_zone`: 지대 내부 이동속도 배수 디버프 (`event_move_speed_mult`)
  - `shock_zone`: 지대 내부 주기 피해 + 사망 원인 연동
- 이벤트 스케줄링
  - 일반: `EVENT_FIRST_TIME`, `EVENT_INTERVAL`, `EVENT_INTERVAL_MIN/RAMP`
  - 테스트: `EVENT_TEST_FIRST_TIME`, `EVENT_TEST_INTERVAL`, `EVENT_TEST_*_MULT`
- 이벤트 가시화
  - `stage_event_overlay.gd`로 텔레그래프/지대 렌더링
  - HUD 이벤트 상태(이름/phase/time) 출력

### 자동 검증 결과
- `headless-alpha-gate.sh` PASS
  - `event_loop`: `EVENT_START:fog/slow_zone/shock_zone` 검증 통과
- `pre-manual-qa-check.sh` PASS
- `trace-objectdb-leak.sh` PASS

### 기대 효과
- 런 중 환경 변주로 반복 플레이 피로도 감소
- 위험 예고 기반 회피 의사결정 강화

## 2026-03-02 (Boss Phase 2 Upgrade)

### 변경 요약
- 보스 페이즈 전환 기준 추가
  - `MINIBOSS_PHASE2_HP_RATIO = 0.52`
  - `MINIBOSS_PHASE2_TRANSITION = 1.15`
- 페이즈2 강화 파라미터 적용
  - 이동/대시 속도 상승, 대시 간격/윈드업 단축
  - 콤보 대시 보너스 + 소환 간격 단축 + WALL 가중치 상승
- HUD/배너/QA 연동
  - PHASE/PHASE SHIFT 상태 노출
  - `--boss-phase2-test` + 게이트 `boss_phase2` 케이스 추가

### 자동 검증 결과
- `headless-alpha-gate.sh` PASS
  - `boss_phase2`: `MINIBOSS_PHASE2_TRANSITION`, `MINIBOSS_PHASE2_ACTIVE` 확인
- `pre-manual-qa-check.sh` PASS
- `trace-objectdb-leak.sh` PASS

### 기대 효과
- 보스전 후반 체감 고조 + 전환 가독성 확보
- 페이즈 전환 회귀 검증 신뢰도 향상

## 2026-03-02 (Meta Growth 01)

### 변경 요약
- 런 종료 보상 규칙 추가
  - 기본 1 Shard + 처치 수 기반 보정(+floor(kills/25))
  - 보스 처치 시 추가 보너스(+3)
- 영구 특성 3종 추가
  - vitality: 시작 최대 체력 +1/rank
  - celerity: 시작 이동속도 +10/rank
  - focus: 시작 공격 간격 감소 +0.015/rank
- 저장 프로파일 `user://meta_profile.json` 로드/세이브 및 자동 해금 로직 반영

### 자동 검증 결과
- `headless-alpha-gate.sh` PASS (`meta_loop` 포함)
  - `META_PROFILE_LOADED`, `META_RUN_REWARD` 토큰 확인
- `pre-manual-qa-check.sh` PASS
- `trace-objectdb-leak.sh` PASS

### 기대 효과
- 런 간 지속 동기(성장 축) 확보
- 반복 플레이 시 초반 진입 피로 완화

## 2026-03-02 (Character Pack 01)

### 변경 요약
- 캐릭터 시작 프로파일 추가
  - Ranger: `max_hp -1`, `move_speed +52`, `attack_interval_reduction +0.05`, `dash_cooldown_reduction +0.10`
  - Warden: `max_hp +3`, `move_speed -20`, `player_invuln_bonus +0.14`
- 런타임 선택 플래그
  - `--character=ranger|warden`
  - QA용 `--character-test`

### 자동 검증 결과
- `headless-alpha-gate.sh` PASS
  - `character_ranger`, `character_warden` 케이스에서 `CHARACTER_SELECTED:*` 확인
- `pre-manual-qa-check.sh` PASS
- `trace-objectdb-leak.sh` PASS

### 기대 효과
- 시작 체감 다양화로 반복 플레이 선택 동기 강화
- 메타 성장과 결합된 초반 플레이 템포 차별화 기반 확보

## 2026-03-02 (Weapon Archetype Pack 01)

### 변경 요약
- 무기 계열 3종 프로파일 추가
  - pierce: 관통 2회, 피해 계수 보정(연사/선형 압박형)
  - dot: 직격 피해 낮추고 DoT 누적 부여
  - aoe: 광역 파편 피해(스플래시 반경/계수)
- 런타임 선택 플래그
  - `--weapon=pierce|dot|aoe`

### 자동 검증 결과
- `headless-alpha-gate.sh` PASS
  - `weapon_pierce`, `weapon_dot`, `weapon_aoe` 케이스에서 토큰 확인
- `pre-manual-qa-check.sh` PASS
- `trace-objectdb-leak.sh` PASS

### 기대 효과
- 플레이 스타일 분기(관통/지속/광역)로 빌드 선택 폭 확대
- 캐릭터/메타와 결합 시 반복 플레이 다양성 상승

## 2026-03-02 (Active Skill Pack 01)

### 변경 요약
- Ranger 액티브: `Windstep Burst`
  - 지속 3.5s, 이동/연사 버프, 쿨다운 16s
- Warden 액티브: `Bulwark Pulse`
  - 근거리 파동 피해 + 방어 버프, 쿨다운 18s
- 입력/상태
  - `active_skill`(Q) 액션 추가
  - HUD `SKILL` 상태 표시

### 자동 검증 결과
- `headless-alpha-gate.sh` PASS
  - `active_ranger`, `active_warden`에서 `ACTIVE_SKILL_USED:*` 확인
- `pre-manual-qa-check.sh` PASS
- `trace-objectdb-leak.sh` PASS

### 기대 효과
- 캐릭터 정체성 강화(수동 개입 순간 창출)
- 보스/엘리트 구간에서 리듬감 있는 의사결정 추가

## 2026-03-03 (Character/Weapon Tree Runtime 01)

### 변경 요약
- 트리 정책 런타임 반영
  - 재화: `meta_shards` 공유
  - 비용: T1=1, T2=2, T3=3
  - 적용: 해금 즉시 저장, 효과는 다음 라운드 적용
- 트리 효과 반영 항목
  - 공격 간격/이동속도/관통/무기 피해 계수
  - 접촉 피해 감소/피격 무적 보정
  - 액티브 스킬 쿨다운/펄스 반경/guardian echo

### 자동 검증 결과
- `headless-alpha-gate.sh` PASS (`tree_ranger`, `tree_warden` 포함)
  - `TREE_PROFILE_LOADED`, `TREE_NODE_UNLOCKED:*`, `TREE_APPLIED:*` 확인
- `pre-manual-qa-check.sh` PASS
- `trace-objectdb-leak.sh` PASS

### 기대 효과
- 캐릭터 장기 성장 축이 실제 전투 체감으로 연결
- 트리 해금 검증 경로가 자동 QA에 편입되어 회귀 리스크 감소
