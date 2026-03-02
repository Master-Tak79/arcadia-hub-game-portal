# 13_alpha_readiness_report — Godot Relic Survivor

## 기준 시점
- 2026-03-02
- 브랜치: `feat/relic-survivor-bootstrap`

## Alpha Gate 요약

### A. 코어 루프
- 상태: **통과**
- 근거:
  - 이동/대시/자동공격/적 스폰/성장/보스/재시작 루프 연결 완료

### B. 자동 안정성 검증
- 상태: **통과**
- 근거:
  - headless 스모크 통과
  - 10분 fixed-fps 장시간 시뮬레이션 통과
  - 보스 경고/등장/대시텔레그래프(콤보 포함)/소환텔레그래프/처치/보상 로그 검증 통과
  - 재시작 루프 반복 검증 통과
  - 원클릭 게이트(`tools/qa/headless-alpha-gate.sh`) 통과 (`boss_pattern`, `boss_phase2`, `elite_loop`, `relic_loop`, `event_loop`, `character_ranger`, `character_warden`, `weapon_pierce`, `weapon_dot`, `weapon_aoe`, `meta_loop` 포함)
  - boss_pattern 다양성 체크(RING/WALL 최소 1회) 통과
  - boss_phase2 체크(`MINIBOSS_PHASE2_TRANSITION`, `MINIBOSS_PHASE2_ACTIVE`) 통과
  - elite loop 체크(Elite Grunt/Elite Dasher 최소 1회) 통과
  - relic loop 체크(RELIC_GRANTED 2회 이상) 통과
  - event loop 체크(EVENT_START:fog/slow_zone/shock_zone) 통과
  - character loop 체크(`CHARACTER_SELECTED:ranger`, `CHARACTER_SELECTED:warden`) 통과
  - weapon loop 체크(`WEAPON_PIERCE_HIT`, `WEAPON_DOT_APPLIED`, `WEAPON_AOE_HIT`) 통과
  - meta loop 체크(`META_PROFILE_LOADED`, `META_RUN_REWARD`) 통과
  - warning/leak summary 기준 `warnings=0`, `leak_lines=0`
  - balance freeze check(`tools/qa/balance-freeze-check.sh`) 통과

### C. 문서화/운영
- 상태: **통과**
- 근거:
  - 청사진/GDD/개발계획/로드맵/개발일지/체크리스트/릴리즈노트 유지
  - 개발지침/업데이트지침/에셋대장/튜닝로그/수동QA프로토콜 반영

### D. 수동 플레이 체감 QA
- 상태: **보류**
- 사유:
  - 사용자 요청으로 실제 키 입력 기반 QA를 후순위로 이월

### E. GUI FPS 실측
- 상태: **보류**
- 사유:
  - 수동 QA 재개 시 동시 진행 예정

## 판정
- 현재 판정: **v0.1.0-alpha-candidate (자동검증 기준)**
- 병합 권장안: alpha-candidate로 선머지 후 수동 QA 완료 시 alpha 확정 태깅
- 상태 관리: `16_alpha_candidate_quality_lock.md` 기준으로 품질 잠금 적용
- 최종 alpha 확정 조건:
  1) 수동 QA 3회 완료
  2) GUI FPS 실측 체크 완료

## 다음 액션
1. 수동 QA 재개 직전 `tools/qa/pre-manual-qa-check.sh` 실행
2. 수동 QA 재개 시 `11_manual_qa_protocol.md` 기준으로 3회 실행
3. 체크리스트/릴리즈노트 최종 갱신
4. `16_alpha_candidate_quality_lock.md` unlock 조건 확인
5. `v0.1.0-alpha` 확정 태깅
