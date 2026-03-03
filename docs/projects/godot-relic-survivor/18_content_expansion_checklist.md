# 18_content_expansion_checklist

## 공통 체크리스트 (각 Step 공통)
- [ ] 구현 범위 코드 반영
- [ ] 관련 데이터 테이블 업데이트
- [ ] HUD/피드백/UI 가독성 점검
- [ ] `headless-alpha-gate.sh` PASS
- [ ] `trace-objectdb-leak.sh` PASS
- [ ] `pre-manual-qa-check.sh` PASS
- [ ] `checkpoint-report.sh` 생성/갱신 확인
- [ ] 문서 동기화(04/05/06/10/12/13/README)
- [ ] 커밋 메시지에 Step 번호/핵심 변경 명시

---

## Step 1 — Elite Pack 01
- [x] Elite Grunt 구현
- [x] Elite Dasher 구현
- [x] 스폰 테이블 반영
- [x] elite 구분 HUD/로그 반영
- [x] 밸런스 로그 기록(12)
- [x] 게이트에 elite_loop 추가 및 토큰 검증 반영

## Step 2 — Relic System 01 (12종)
- [x] 유물 데이터 구조 추가
- [x] 유물 획득/적용 시스템 추가
- [x] 유물 UI(획득/효과 요약) 추가
- [x] 유물 12종 효과 구현
- [x] OP 조합 완화 규칙 반영
- [x] relic_loop QA 케이스 및 토큰 검증 반영

## Step 3 — Stage Event Pack 01 (3종)
- [x] 안개 이벤트
- [x] 감속지대 이벤트
- [x] 전류지대 이벤트
- [x] 이벤트 텔레그래프/안전장치 반영
- [x] death recap 이벤트 원인 구분 반영
- [x] event_loop QA 케이스 및 토큰 검증 반영

## Step 4 — Boss Phase 2 Upgrade
- [x] 페이즈 전환 조건/상태 구현
- [x] 전환 연출/안전구간 반영
- [x] 페이즈2 패턴 2종 이상 반영
- [x] boss-pattern 게이트 확장
- [x] 수동 QA 런시트에 phase2 항목 추가

## Step 5 — Meta Growth 01
- [x] 런 종료 보상(Shards) 시스템 구현
- [x] 영구 특성 3종(vitality/celerity/focus) 구현
- [x] 저장 프로파일 로드/세이브(user://) 반영
- [x] HUD META 상태 표시(샤드/런수/특성 랭크)
- [x] `meta_loop` QA 케이스 및 토큰 검증 반영

## Step 6 — Character Pack 01
- [x] 캐릭터 2종(Ranger/Warden) 프로파일 구현
- [x] 런타임 선택(`--character=<id>`) 인터페이스 추가
- [x] HUD CHAR 상태 표시 반영
- [x] `character_ranger`, `character_warden` QA 케이스 및 토큰 검증 반영
- [x] 수동 QA 런시트에 캐릭터 체감 항목 반영

## Step 7 — Weapon Archetype Pack 01
- [x] 무기 계열 3종(pierce/dot/aoe) 프로파일 구현
- [x] 런타임 선택(`--weapon=<id>`) 인터페이스 추가
- [x] HUD WEAPON 상태 표시 반영
- [x] `weapon_pierce`, `weapon_dot`, `weapon_aoe` QA 케이스 및 토큰 검증 반영
- [x] 수동 QA 런시트에 무기 체감 항목 반영

## Step 8 — Active Skill Pack 01
- [x] 캐릭터 전용 액티브 스킬 2종(Ranger/Warden) 구현
- [x] 입력 액션(`active_skill`) 및 HUD SKILL 상태 반영
- [x] `active_ranger`, `active_warden` QA 케이스 및 토큰 검증 반영
- [x] 수동 QA 런시트에 액티브 스킬 체감 항목 반영
- [x] 캐릭터/무기/메타 동시 경로에서 회귀 없음 확인

## Step 9 — Character/Weapon Tree Design 01
- [x] 설계 문서 Draft 01 작성 (`19_character_weapon_tree_design.md`)
- [x] 트리 재화 정책 확정(공유/분리)
- [x] 트리 노드 해금 단가 규칙 확정
- [x] 런 적용 시점(즉시/다음 라운드) 확정
- [x] `tree_*_loop` QA 토큰 명세 확정

## Step 10 — Character/Weapon Tree Runtime 01
- [x] 트리 데이터(`character_trees.gd`) 구현
- [x] 트리 런타임(`tree_progression.gd`) 구현
- [x] 메타 프로파일 트리 필드(`tree_unlocks`, `tree_last_spent`) 연동
- [x] `--tree-test` + `tree_ranger`, `tree_warden` QA 케이스 및 토큰 검증 반영
- [x] HUD `TREE` 상태 표시 및 문서 동기화 반영

## Step 11 — Tree UI/UX Pack 01
- [x] 트리 패널(`tree_panel.gd`) UI 구현
- [x] 수동 해금 입력(`T`, `1/2/3`) 흐름 구현
- [x] `--tree-ui-test` + `tree_ui` QA 케이스 및 토큰 검증 반영
- [x] 트리 패널/해금 피드백 UX 반영
- [x] 문서/릴리즈/저널 동기화 반영

## Step 12 — Visual Upgrade Pack 01
- [x] CC0 에셋(플레이어/적/투사체/배경) 1차 적용
- [x] 스프라이트 렌더링 경로 + 폴백 경로 유지
- [x] 배경 텍스처 레이어 적용 및 가독성 유지 조정
- [x] 자산 출처/라이선스 등록(`09_asset_register.md`)
- [x] 문서/릴리즈/저널 동기화 반영

## Step 13 — Quality+Feature Upgrade Pack 01
- [x] 히트/킬 VFX + 투사체 트레일 강화
- [x] 웨이브 미션 시스템 구현(할당/진행/완료)
- [x] 엘리트 변형 패턴(Grunt/Dasher 각 2종) 구현
- [x] `feel_loop`, `mission_loop`, `elite_variant_loop` 게이트 및 토큰 검증 반영
- [x] 문서/릴리즈/저널 동기화 반영

## Step 14 — Feedback/Runtime Polish Fast Follow
- [x] `texture_runtime.gd` 전역 캐시 도입
- [x] 미션 스트릭 보너스/리셋 로직 반영
- [x] HUD 미션 스트릭 상태 표시 반영
- [x] `impact_fx` 연출 폴리싱(링+스포크)
- [x] 자동검증 재통과 + 문서 동기화 반영

## Step 15 — Core Runtime Refactor Pack 01
- [x] `pressure_runtime.gd`(압박도 계산) 분리
- [x] `levelup_advisor.gd`(auto-levelup 점수화) 분리
- [x] `game_root.gd` 위임 구조 적용
- [x] `balance-freeze-check.sh` 신규 구조 대응
- [x] 자동검증 재통과 + 문서 동기화 반영

## Step 16 — Interface Boundary Cleanup Pack 01
- [x] `game_root.gd` 내부 `has_method` 가드 제거(0건)
- [x] 직접 제어 객체 호출 경계 명시화
- [x] `headless-alpha-gate.sh` / `pre-manual-qa-check.sh` / `trace-objectdb-leak.sh` / `balance-freeze-check.sh` 재통과
- [x] 문서/릴리즈/저널 동기화 반영

## Step 17 — Interface Boundary Cleanup Pack 02
- [x] `hud.gd`, `boss_reward_runtime.gd` 내부 `has_method` 가드 제거(0건)
- [x] 보스 경고/페이즈/텔레그래프 HUD 및 연출 호출 경계 단순화
- [x] `headless-alpha-gate.sh` / `pre-manual-qa-check.sh` / `trace-objectdb-leak.sh` / `balance-freeze-check.sh` 재통과
- [x] 문서/릴리즈/저널 동기화 반영

## Step 18 — VFX/Animation Polish Pack 01
- [x] `impact_fx.gd` 2차 연출 보강(이중 링/오비탈/스포크)
- [x] `event_banner.gd` 슬라이드-인/페이드 진입 모션 추가
- [x] `level_up_panel.gd` 등장 이징/알파 애니메이션 추가
- [x] `headless-alpha-gate.sh` / `pre-manual-qa-check.sh` / `trace-objectdb-leak.sh` / `balance-freeze-check.sh` 재통과
- [x] 문서/릴리즈/저널 동기화 반영

---

## 결과 기록 템플릿
- Step:
- 구현 커밋:
- 자동검증 결과:
- 리스크/이슈:
- 다음 Step 진행 승인:

### Step 1 결과 기록
- Step: Elite Pack 01
- 구현 커밋: `338cece` (review pass 기반), `9303bf6`(docs plan), 이번 단계 코드/문서 일괄 커밋 예정
- 자동검증 결과: headless gate PASS (`elite_loop` 포함), pre-manual PASS, leak trace PASS
- 리스크/이슈: elite long_sim 로그량 증가(정보성), 추후 로그 압축 필요 가능
- 다음 Step 진행 승인: 대기 중

### Step 2 결과 기록
- Step: Relic System 01 (12종)
- 구현 커밋: 이번 단계 코드/문서 일괄 커밋 예정
- 자동검증 결과: headless gate PASS (`relic_loop` 포함), pre-manual PASS, leak trace PASS
- 리스크/이슈: long_sim 로그량 증가(유물/엘리트 토큰 다수 출력), 추후 로그 레벨 옵션 검토 필요
- 다음 Step 진행 승인: 대기 중

### Step 3 결과 기록
- Step: Stage Event Pack 01 (3종)
- 구현 커밋: 이번 단계 코드/문서 일괄 커밋 예정
- 자동검증 결과: headless gate PASS (`event_loop` 포함), pre-manual PASS, leak trace PASS
- 리스크/이슈: long_sim에서 이벤트 로그량 증가(정보성)
- 다음 Step 진행 승인: 대기 중

### Step 4 결과 기록
- Step: Boss Phase 2 Upgrade
- 구현 커밋: `bc3cfc0` (boss phase2 + gate/docs sync)
- 자동검증 결과: headless gate PASS (`boss_phase2` 포함), pre-manual PASS, leak trace PASS
- 리스크/이슈: phase2 전환 직후 체감 난도 스파이크 수동 QA에서 추가 확인 필요
- 다음 Step 진행 승인: 콘텐츠 확장 1차 완료

### Step 5 결과 기록
- Step: Meta Growth 01
- 구현 커밋: `836b40a` (meta growth + meta_loop gate + docs sync)
- 자동검증 결과: headless gate PASS (`meta_loop` 포함), pre-manual PASS, leak trace PASS
- 리스크/이슈: 영구 보정 누적으로 장기 난이도 곡선 재점검 필요
- 다음 Step 진행 승인: 콘텐츠 확장 2차 설계 대기

### Step 6 결과 기록
- Step: Character Pack 01
- 구현 커밋: `46d2d8b` (character pack + character_loop gate + docs sync)
- 자동검증 결과: headless gate PASS (`character_ranger`, `character_warden` 포함), pre-manual PASS, leak trace PASS
- 리스크/이슈: 캐릭터+메타 누적 보정으로 장기 밸런스 재점검 필요
- 다음 Step 진행 승인: 무기 계열 분화 설계 대기

### Step 7 결과 기록
- Step: Weapon Archetype Pack 01
- 구현 커밋: `0576aa0` (weapon archetype pack + weapon_loop gate + docs sync)
- 자동검증 결과: headless gate PASS (`weapon_pierce`, `weapon_dot`, `weapon_aoe` 포함), pre-manual PASS, leak trace PASS
- 리스크/이슈: 캐릭터+메타+무기 조합별 난이도 편차 수동 QA에서 추가 확인 필요
- 다음 Step 진행 승인: 캐릭터 전용 액티브 스킬/무기 트리 설계 대기

### Step 8 결과 기록
- Step: Active Skill Pack 01
- 구현 커밋: `7072b7f` (active skill pack + active_loop gate + docs sync)
- 자동검증 결과: headless gate PASS (`active_ranger`, `active_warden` 포함), pre-manual PASS, leak trace PASS
- 리스크/이슈: 수동 입력(Q) 타이밍 체감은 사용자 수동 QA에서 추가 확인 필요
- 다음 Step 진행 승인: 캐릭터/무기 트리 고도화 설계 대기

### Step 9 진행 기록
- Step: Character/Weapon Tree Design 01
- 현재 상태: 설계 확정 완료
- 핵심 산출물: `19_character_weapon_tree_design.md`
- 확정 정책: `meta_shards` 공유 / 티어 단가(1,2,3) / 다음 라운드 적용
- 다음 Step 진행 승인: 트리 구현 단계 진입

### Step 10 결과 기록
- Step: Character/Weapon Tree Runtime 01
- 구현 커밋: `8ca4a88` (tree runtime + tree_loop gate + docs sync)
- 자동검증 결과: headless gate PASS (`tree_ranger`, `tree_warden` 포함), pre-manual PASS, leak trace PASS
- 리스크/이슈: 트리 누적 해금에 따른 장기 난이도 편차 수동 QA에서 추가 확인 필요
- 다음 Step 진행 승인: 트리 UX 고도화/실해금 UI 단계 대기

### Step 11 결과 기록
- Step: Tree UI/UX Pack 01
- 구현 커밋: `238263e` (tree UI panel + tree_ui gate + docs sync)
- 자동검증 결과: headless gate PASS (`tree_ui` 포함), pre-manual PASS, leak trace PASS
- 리스크/이슈: 트리 노드 증가 시 패널 선택지(3개) UX 확장 필요
- 다음 Step 진행 승인: 트리 고도화(UI 스크롤/노드 상세) 단계 대기

### Step 12 결과 기록
- Step: Visual Upgrade Pack 01
- 구현 커밋: `e3d3d2e` (CC0 asset integration + visual upgrade docs sync)
- 자동검증 결과: headless gate PASS (asset 반영 상태), pre-manual PASS, leak trace PASS
- 리스크/이슈: 애니메이션/VFX 미반영으로 동적 완성도는 후속 단계 필요
- 다음 Step 진행 승인: 그래픽 2차 폴리싱(UI/VFX/애니메이션) 단계 대기

### Step 13 결과 기록
- Step: Quality+Feature Upgrade Pack 01
- 구현 커밋: `a385afc` (VFX/미션/엘리트 변형 + 게이트 확장 + 문서 동기화)
- 자동검증 결과: headless gate PASS (`feel_loop`, `mission_loop`, `elite_variant_loop` 포함), pre-manual PASS, leak trace PASS
- 리스크/이슈: 미션 목표 난도와 엘리트 변형 빈도의 체감 밸런스 수동 QA 필요
- 다음 Step 진행 승인: VFX/애니메이션 2차 폴리싱 단계 대기

### Step 14 결과 기록
- Step: Feedback/Runtime Polish Fast Follow
- 구현 커밋: `ef23837` (mission streak + texture cache + impact FX polish + docs sync)
- 자동검증 결과: headless gate PASS (`.qa/headless/20260303-125502`), pre-manual PASS, leak trace PASS
- 리스크/이슈: 미션 스트릭 보너스에 따른 체감 난이도 하락 여부 수동 QA 필요
- 다음 Step 진행 승인: 리팩토링 R2(game_root 분리) 또는 애니메이션 2차 폴리싱 대기

### Step 15 결과 기록
- Step: Core Runtime Refactor Pack 01
- 구현 커밋: `1366b5c` (pressure/advisor 분리 + gate/freeze 대응 + docs sync)
- 자동검증 결과: headless gate PASS (`.qa/headless/20260303-130909`), pre-manual PASS, leak trace PASS, balance-freeze PASS
- 리스크/이슈: 리팩토링 후 인터페이스 경계(`has_method`) 추가 축소는 후속 R3에서 진행 필요
- 다음 Step 진행 승인: R3(interface 정리) 또는 애니메이션 2차 폴리싱 대기

### Step 16 결과 기록
- Step: Interface Boundary Cleanup Pack 01
- 구현 커밋: `a683183` (game_root has_method 경계 정리 + docs sync)
- 자동검증 결과: headless gate PASS (`.qa/headless/20260303-131905`), pre-manual PASS, leak trace PASS, balance-freeze PASS
- 리스크/이슈: `game_root` 외 영역(HUD/Boss runtime)의 `has_method` 정리는 후속 단계에서 점진 적용 필요
- 다음 Step 진행 승인: R4(HUD/Boss interface 정리) 또는 애니메이션 2차 폴리싱 대기

### Step 17 결과 기록
- Step: Interface Boundary Cleanup Pack 02
- 구현 커밋: `e69f9a2` (hud/boss runtime has_method 경계 정리 + docs sync)
- 자동검증 결과: headless gate PASS (`.qa/headless/20260303-133108`), pre-manual PASS, leak trace PASS, balance-freeze PASS
- 리스크/이슈: `miniboss_director` 내부 boss_ref 인터페이스 정리는 후속 단계에서 점진 적용 필요
- 다음 Step 진행 승인: Step18(VFX/애니메이션 2차 폴리싱) 또는 Step19(트리 고도화) 대기

### Step 18 결과 기록
- Step: VFX/Animation Polish Pack 01
- 구현 커밋: `a8d43ce` (impact_fx/event_banner/level_up_panel polish + docs sync)
- 자동검증 결과: headless gate PASS (`.qa/headless/20260303-201449`), pre-manual PASS, leak trace PASS, balance-freeze PASS
- 리스크/이슈: UI/이펙트 미세 애니메이션 체감 평가는 GUI 수동 QA로 최종 확인 필요
- 다음 Step 진행 승인: Step19(트리 고도화) 또는 Step20(알파 확정 수동 QA) 대기
