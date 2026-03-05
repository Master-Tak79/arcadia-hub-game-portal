# 16_alpha_candidate_quality_lock

## 목적

`v0.1.0-alpha-candidate` 기준선을 고정하여, 수동 QA 재개 전까지 품질 드리프트를 방지합니다.

## Lock Scope (고정 대상)

### 1) 코어 루프
- 이동/대시/자동공격/레벨업/보스/재시작 루프 구조
- QA 런타임 옵션(`--auto-levelup`, `--qa-*`, `--boss-test`, `--boss-pattern-test`, `--boss-phase2-test`, `--elite-test`, `--relic-test`, `--event-test`, `--meta-test`, `--character=<id>`, `--character-test`, `--weapon=<id>`, `--tree-test`, `--tree-ui-test`, `--feel-test`, `--mission-test`, `--elite-variant-test`) 인터페이스

### 2) 전투/웨이브 곡선
- `balance.gd` 6차 튜닝값
- `spawn_director.gd` phase shaping + soft/hard cap + boss/recovery guardrail

### 3) 보스 이벤트 연출
- 배너/카메라/SFX 훅 순서
- 보스 warning/spawn/defeat 이벤트 트리거 지점

### 4) 문서 기준
- `06_release_notes.md`
- `12_balance_tuning_log.md`
- `13_alpha_readiness_report.md`
- `15_merge_handover_checklist.md`

### 5) Freeze 검사 기준
- `tools/qa/balance-freeze-check.sh` PASS
- `tools/qa/pre-manual-qa-check.sh`에서 freeze check 통과

## Allowed Changes (허용)

- 크래시/컴파일 오류 수정
- QA 자동화 신뢰도 향상
- 에셋 교체(동일 슬롯/동일 인터페이스 유지)
- 문서 보강
- 사용자 명시 승인 하의 제한 해제성 변경(변경 이력/근거 문서화 필수)

## Restricted Changes (제한)

아래 변경은 수동 QA 재개 전 임의 변경 금지:
- 밸런스 상수 대규모 변경
- 업그레이드 데이터 구조 변경
- 보스 패턴 구조 변경
- 입력/조작 체감에 직접 영향 주는 시스템 변경

## Unlock Conditions

다음 조건 충족 시 lock 해제 가능:
1. 수동 QA 3회 완료 (`11_manual_qa_protocol.md`)
2. GUI FPS 실측 완료
3. 결과를 `04/05/06/13`에 반영

## Change Control Exceptions

- 2026-03-01: 사용자 진행 승인("응")에 따라 콘텐츠 확장성 보강 작업(업그레이드 12→16, multi-effect 적용기) 반영.
- 2026-03-01: 사용자 진행 승인("응")에 따라 업그레이드 제안 가중치 로직(weighted roll) 반영.
- 2026-03-02: 사용자 진행 승인("응 순서대로 진행해")에 따라 본게임 체감 개선 반영.
  - 미니보스 대시 텔레그래프(windup/recovery) + 스폰 안전구간
  - 레벨업 선택지 가독성 개선(역할 태그/효과 요약/추천 문구)
  - headless gate 보스 대시 텔레그래프 검증 토큰 추가
- 2026-03-02: 사용자 진행 승인("진행해")에 따라 본게임 개발 2차 반영.
  - 미니보스 콤보 대시 + 비대시 소환 패턴(WALL) 추가
  - 업그레이드 제안 동적 가중치(체력/레벨/과중첩/압박도) 반영
  - 레벨업 선택 후 예상 지표(DPS/생존) 프리뷰 추가
  - 체크포인트 리포트 자동화(`tools/qa/checkpoint-report.sh`) 추가
- 2026-03-02: 사용자 진행 승인("응 진행해. 그리고 나머지도 순서대로 진행")에 따른 리뷰 반영 패치.
  - auto-levelup 선택 로직 multi-effect 반영
  - 일반 스폰 안전 반경 적용
  - 전투 판정 후보 인덱스(셀 기반) 도입
  - death recap(사망 원인/상황) 표시 추가
  - boss_pattern 다양성 검증(RING/WALL 최소 1회) 게이트 편입
- 2026-03-02: 사용자 진행 승인("응 차례대로 진행해")에 따른 콘텐츠 확장 Step 1 반영.
  - Elite Pack 01(Elite Grunt / Elite Dasher) 구현
  - `--elite-test` 런타임 옵션 + `elite_loop` 자동 검증 케이스 편입
- 2026-03-02: 사용자 연속 승인("응")에 따른 콘텐츠 확장 Step 2 반영.
  - Relic System 01(유물 12종) 구현
  - `--relic-test` 런타임 옵션 + `relic_loop` 자동 검증 케이스 편입
- 2026-03-02: 사용자 연속 승인("응")에 따른 콘텐츠 확장 Step 3 반영.
  - Stage Event Pack 01(안개/감속지대/전류지대) 구현
  - `--event-test` 런타임 옵션 + `event_loop` 자동 검증 케이스 편입
- 2026-03-02: 사용자 연속 승인("응")에 따른 콘텐츠 확장 Step 4 반영.
  - Boss Phase 2 전환 로직/연출/안전구간 구현
  - `--boss-phase2-test` 런타임 옵션 + `boss_phase2` 자동 검증 케이스 편입
- 2026-03-02: 사용자 연속 승인("응")에 따른 콘텐츠 확장 Step 5 반영.
  - Meta Growth 01(Shard 보상/영구 특성 3종/저장 프로파일) 구현
  - `--meta-test` 런타임 옵션 + `meta_loop` 자동 검증 케이스 편입
- 2026-03-02: 사용자 연속 승인("응")에 따른 콘텐츠 확장 Step 6 반영.
  - Character Pack 01(Ranger/Warden) 구현
  - `--character=<id>` 런타임 옵션 + `character_ranger`/`character_warden` 자동 검증 케이스 편입
- 2026-03-02: 사용자 연속 승인("응")에 따른 콘텐츠 확장 Step 7 반영.
  - Weapon Archetype Pack 01(pierce/dot/aoe) 구현
  - `--weapon=<id>` 런타임 옵션 + `weapon_pierce`/`weapon_dot`/`weapon_aoe` 자동 검증 케이스 편입
- 2026-03-02: 사용자 연속 승인("응")에 따른 콘텐츠 확장 Step 8 반영.
  - Active Skill Pack 01(Ranger/Warden 전용 액티브 스킬) 구현
  - `active_ranger`/`active_warden` 자동 검증 케이스 편입
- 2026-03-03: 사용자 연속 승인("응")에 따른 콘텐츠 확장 Step 10 반영.
  - Character/Weapon Tree Runtime 01(`character_trees`, `tree_progression`) 구현
  - `--tree-test` 런타임 옵션 + `tree_ranger`/`tree_warden` 자동 검증 케이스 편입
- 2026-03-03: 사용자 연속 승인("응")에 따른 콘텐츠 확장 Step 11 반영.
  - Tree UI/UX Pack 01(`tree_panel`, 수동 해금 UX) 구현
  - `--tree-ui-test` 런타임 옵션 + `tree_ui` 자동 검증 케이스 편입
- 2026-03-03: 사용자 연속 승인("응")에 따른 콘텐츠 확장 Step 12 반영.
  - Visual Upgrade Pack 01(CC0 에셋 통합) 구현
  - 플레이어/적/투사체/배경 스프라이트 렌더링 경로 반영 + 자산 출처/라이선스 등록
- 2026-03-03: 사용자 연속 승인("응")에 따른 콘텐츠 확장 Step 13 반영.
  - Quality+Feature Upgrade Pack 01(히트/킬 VFX + 미션 시스템 + 엘리트 변형) 구현
  - `--feel-test`, `--mission-test`, `--elite-variant-test` 런타임 옵션 + 대응 게이트 케이스 편입
- 2026-03-03: 사용자 연속 승인("응")에 따른 콘텐츠 확장 Step 14 Fast Follow 반영.
  - `texture_runtime.gd` 전역 캐시 도입 + `impact_fx` 연출 폴리싱
  - 미션 스트릭 보너스(`MISSION_STREAK:*`) 및 HUD 표시 반영
- 2026-03-03: 사용자 연속 승인("응")에 따른 콘텐츠 확장 Step 15 반영.
  - `game_root.gd` 책임 일부를 `pressure_runtime.gd`, `levelup_advisor.gd`로 분리
  - `balance-freeze-check.sh`가 신규 구조를 인식하도록 보강
- 2026-03-03: 사용자 연속 승인("응")에 따른 콘텐츠 확장 Step 16 반영.
  - `game_root.gd` 내부 `has_method` 인터페이스 분기 제거(직접 제어 객체 경계 정리)
  - 전체 자동 검증 루프(headless/leak/freeze) 재통과 확인
- 2026-03-03: 사용자 연속 승인("차례대로 깊이 생각해서 진행")에 따른 콘텐츠 확장 Step 17 반영.
  - `hud.gd`, `boss_reward_runtime.gd` 내부 `has_method` 분기 제거(직접 제어 객체 기준)
  - 전체 자동 검증 루프(headless/leak/freeze) 재통과 확인
- 2026-03-03: 사용자 연속 승인("응 진행해")에 따른 콘텐츠 확장 Step 18 반영.
  - `impact_fx`, `event_banner`, `level_up_panel` VFX/애니메이션 2차 폴리싱 적용
  - 전체 자동 검증 루프(headless/leak/freeze) 재통과 확인
- 2026-03-03: 사용자 연속 승인("응")에 따른 UX Fast Follow 반영.
  - 레벨업 카드 마우스 선택 + H 히스토리 패널 도입
  - 자동 검증 루프(headless/leak/freeze) 재통과 확인
- 2026-03-03: 사용자 연속 승인("응")에 따른 콘텐츠 확장 Step 19 반영.
  - HUD 패널형 재설계 + 배경 연출 강화 + UX 수동 체크 항목 확장
  - 자동 검증 루프(headless/leak/freeze) 재통과 확인
- 2026-03-04: 사용자 승인("응 진행해")에 따른 Step 20-B 반영.
  - 레벨디자인/재미 곡선(스폰 페이싱/미션 완화) 개선
  - 자동 검증 루프(headless/leak/freeze) 재통과 확인
- 2026-03-04: 사용자 승인("응 진행해")에 따른 Step 20-C 반영.
  - 전투 카메라 임팩트(light/heavy/player-hit) 연동 및 품질 상향
  - 자동 검증 루프(headless/leak/freeze) 재통과 확인
- 2026-03-04: 사용자 승인("다음 진행")에 따른 Step 21-A 반영.
  - 타이틀/메뉴 기본 흐름 구현(부트/ESC 메뉴)
  - 자동 검증 루프(headless/leak/freeze) 재통과 확인
- 2026-03-04: 사용자 승인("다음 진행")에 따른 Step 21-B 반영.
  - 옵션/설정 메뉴(SFX/카메라 임팩트/창 모드) + 설정 저장/복원 구현
  - 자동 검증 루프(headless/leak/freeze) 재통과 확인
- 2026-03-05: 사용자 승인("다음 진행")에 따른 Step 22-A 반영.
  - 보스 패턴/이벤트 가중치/유물 시너지 확장
  - 자동 검증 루프(headless/leak/freeze) 재통과 확인
- 처리 원칙:
  - 자동 회귀 검증 통과 필수
  - 설계/릴리즈/개발일지 즉시 동기화
  - 이후 상태는 다시 LOCKED로 복귀

## Current Status

- 상태: **LOCKED (alpha-candidate stabilization, exception 반영 후 재잠금)**
- 해제 예정: 수동 QA 재개 시
