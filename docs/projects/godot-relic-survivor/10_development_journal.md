# 10_development_journal — Godot Relic Survivor

> 본 문서는 의사결정 중심 요약 일지입니다.
> 세부 작업 로그는 `04_devlog.md`를 기준으로 관리합니다.

## 2026-03-01

### 방향 결정
- 기존 `Godot Neon Dodge`는 아카이브로 전환
- 신규 프로젝트 `Godot Relic Survivor` 착수
- 장르 확정: 탑다운 로그라이크 생존 액션

### 품질/운영 원칙
- 15년차 베테랑 수준 품질 기준 준수
- 문서 우선 개발(설계→구현→검증→회고)
- 에셋은 D 드라이브 우선 보관/활용

### 구현 진척
- 코어 전투 루프 1차 구축(자동공격/발사체/적2종)
- EXP/레벨업 3지선다 + 업그레이드 12종 데이터 모델 구축
- 미니 보스 1종 + 10분 페이즈 경고/등장/격파 루프 구축
- 미니보스 추가 패턴(소환) 반영
- 보스 처치 UX 1차(배너/보상/슬로우모션) 반영
- 헤드리스 스모크 + 장시간 시뮬레이션 통과

### 리뷰 결과(보완 필요)
- 실수동 조작감 QA 3회는 아직 미진행
- 보스 패턴 체감 난이도 2차 튜닝 필요

### 리뷰 후 보완 완료
- `game_root` 책임 분리 1차 완료
  - `runtime_options`, `qa_runtime`, `boss_reward_runtime` 분리
- 밸런스 2차 튜닝 완료(적 압박/스폰 곡선/보스 패턴 완화)
- 밸런스 3차 미세 튜닝(페이즈 기반 스폰/Dasher 확률 보정)
- 스폰 캡(soft/hard) 도입으로 장시간 안정성 보강
- 보스 루프/재시작 루프/장시간 루프 회귀 검증 재통과
- 이벤트 배너 2차 폴리싱 완료
- 카메라 FX(경고/등장/처치 임팩트) 추가
- 보스 페이즈 스폰 가드레일 추가
- 사운드 슬롯 구조(`audio/sfx_slots.gd`) 및 보스 이벤트 훅 연결
- 보스 SFX 3종 generated 자산 주입 완료(Warning/Spawn/Defeat, v2 튜닝)
- SFX 프리셋 옵션화(default/quiet/hype) + 이벤트 타이밍 딜레이 적용
- 보스 처치 직후 회복 구간(post-boss recovery) 추가
- 후반 웨이브 6차 미세 튜닝(곡선 잠금)
- `16_alpha_candidate_quality_lock.md`로 품질 잠금 기준 문서화
- 업그레이드 16종 확장(복합 효과 4종 포함)
- 수동 QA 및 튜닝 이력 문서 추가
  - `11_manual_qa_protocol.md`
  - `12_balance_tuning_log.md`
- Alpha 준비 문서 추가
  - `13_alpha_readiness_report.md` (자동검증 기준 alpha-candidate)
  - `14_pr_description_alpha_candidate.md` (PR 본문 템플릿, 실사용 확정본)
  - `15_merge_handover_checklist.md` (머지/인수인계 체크리스트, 결정형)

## 2026-03-01 (Upgrade Offer Stabilization)

### 반영
- 업그레이드 제안 로직을 가중치 기반으로 전환
- 복합 효과 업그레이드의 조기 과다 노출을 완화

### 검증
- 스모크/보스 루프/5분 회귀 통과

## 2026-03-02 (Headless Gate Automation)

### 반영
- 헤드리스 검증 신뢰도 강화를 위해 원클릭 게이트 스크립트 추가
  - `games/godot-relic-survivor/tools/qa/headless-alpha-gate.sh`
  - 시나리오: smoke → boss_loop → restart_loop → long_sim
  - 토큰 검증: `RELIC_SURVIVOR_BOOT_OK`, `MINIBOSS_*`, `BOSS_CLEAR_REWARD_APPLIED`, `QA_FORCE_*`
- 실행 로그 보관 규칙 추가
  - `.qa/headless/<timestamp>/*.log`

### 검증
- `./tools/qa/headless-alpha-gate.sh` 통과
- 수동 QA/FPS 실측 보류 상태는 유지(알파 확정 조건 미충족)

### 메모
- 장시간 종료 시 `ObjectDB instances leaked at exit` 경고가 간헐 노출되어 추적 후보로 등록

## 2026-03-02 (Leak Trace + Pre-Manual QA Readiness)

### 반영
- `ObjectDB instances leaked at exit` 경고 추적 수행
  - `tools/qa/trace-objectdb-leak.sh` 추가(Verbose long sim + leak summary 추출)
- headless 환경 오디오 안전모드 적용
  - `scripts/audio/sfx_slots.gd`에서 headless 시 스트림 로드/재생 비활성화
  - 런타임 로그 `SFX_HEADLESS_MODE_ON` 추가
- 수동 QA 직전 점검 자동화
  - `tools/qa/pre-manual-qa-check.sh` 추가(문서/도구/최근 게이트 상태 확인)

### 검증
- `./tools/qa/headless-alpha-gate.sh` 재실행 통과
  - warnings=0, leak_lines=0
- `./tools/qa/trace-objectdb-leak.sh` 실행
  - leak-summary 기준 `Leaked instance` 미검출
- `./tools/qa/pre-manual-qa-check.sh` 통과

### 결정
- 실측 전까지는 headless 기준선 안정화 유지
- 알파 확정 게이트는 기존과 동일(수동 QA 3회 + GUI FPS 실측)

## 2026-03-02 (Merge Package Refresh)

### 반영
- `14_pr_description_alpha_candidate.md`를 최신 기준으로 재작성
  - QA 도구(게이트/누수추적/readiness)와 최근 커밋/검증 항목 반영
- `15_merge_handover_checklist.md`를 실무 체크리스트 형태로 정리
  - merge 전 자동검증/추적/준비 점검 단계 명시

### 검증
- 문서 참조/명령 경로 일치 확인

### 결정
- 실측 전까지는 `alpha-candidate` 병합 전략 유지

## 2026-03-02 (Boss Telegraph + Upgrade Readability Pass)

### 반영
- 미니보스 체감 폴리싱 2차
  - 대시 예고(windup) 단계 도입 + 텔레그래프 선/링 렌더링
  - 보스 등장 직후 짧은 안전구간 적용(접촉 피해 0)
  - 근거리 즉시대시 제한으로 억울사 완화
  - HUD/배너에 대시 예고 상태 노출
- 레벨업 선택지 가독성 강화
  - 역할 태그(공격/기동/생존/혼합), 효과 요약, 상황별 추천 문구 추가
  - 현재/다음 스택 진행도를 명시
- QA 시나리오 확장
  - headless gate에 `MINIBOSS_DASH_TELEGRAPH_ON`, `MINIBOSS_DASH_START` 검증 추가

### 검증
- `./tools/qa/headless-alpha-gate.sh` 통과
- `./tools/qa/trace-objectdb-leak.sh` 통과
- `./tools/qa/pre-manual-qa-check.sh` 통과

### 결정
- 수동 QA 전까지는 자동검증 기준 alpha-candidate 품질 잠금 유지

## 2026-03-02 (Core Game Progression Pass 2)

### 반영
- 보스 패턴 다양화
  - 미니보스 콤보 대시 패턴(확률형) 추가
  - 체감 억울사 완화를 위한 최소 대시거리/스폰 안전구간 유지
- 성장 시스템 튜닝
  - 업그레이드 제안 로직에 동적 가중치 반영(체력, 레벨, 과중첩)
  - 저체력 구간에서 생존/혼합 선택지 우선도 강화
- QA 운영 강화
  - `tools/qa/checkpoint-report.sh` 추가(게이트/누수 추적 결과를 핸드오프 리포트로 생성)

### 검증
- `./tools/qa/headless-alpha-gate.sh` 통과
- `./tools/qa/trace-objectdb-leak.sh` 통과
- `./tools/qa/pre-manual-qa-check.sh` 통과
- `./tools/qa/checkpoint-report.sh` 리포트 생성 확인

### 결정
- 실측 전까지 alpha-candidate 기준선 유지, 수동 QA 재개 시 체감 항목 우선 검증

## 2026-03-02 (Pattern Coverage Completion)

### 반영
- 보스 패턴 요구사항 보강
  - 비대시 소환 패턴(WALL) + 소환 텔레그래프 상태 추가
  - `--boss-pattern-test` 런타임 옵션으로 패턴 검증 분리
- 레벨업 UI 예측 지표 반영
  - 선택 후 예상 DPS/생존 지표 프리뷰 계산 노출
- 체크포인트 리포트 고도화
  - 최신 3회 게이트 추세(warnings/leaks) 포함

### 검증
- `headless-alpha-gate.sh`에서 `boss_pattern` 시나리오 PASS
- `MINIBOSS_SUMMON_TELEGRAPH_ON`, `MINIBOSS_SUMMON_CAST` 토큰 검증 PASS

## 2026-03-02 (Pressure-aware Upgrade Steering)

### 반영
- 웨이브/보스 압박도를 수치화(`pressure_hint`)하여 업그레이드 제안 가중치에 반영
- HUD에 PRESSURE 상태를 노출해 추천 로직 근거를 시각적으로 확인 가능하게 정리
- 체크포인트 리포트를 고정 템플릿(게이트 상태 표 + latest 포인터)로 표준화

### 검증
- headless gate / readiness / checkpoint-report 모두 통과

## 2026-03-02 (Balance Closeout Pass 1)

### 반영
- 보스 패턴 출현비/전환 타이밍 1차 미세조정(가독성·공정성 우선)
- 압박도 신호(`pressure_hint`, `pressure_band`)를 추천 로직 및 HUD에 연동
- 체크포인트 리포트를 고정 템플릿 + latest 포인터 방식으로 표준화

### 검증
- headless gate(`boss_pattern` 포함), readiness, leak trace 모두 통과

## 2026-03-02 (Pre-manual Freeze Documentation)

### 반영
- `12_balance_tuning_log.md`에 pre-manual freeze baseline 섹션 추가
- `16_alpha_candidate_quality_lock.md`에 freeze 검사 기준(`balance-freeze-check.sh`) 명시
- 머지/PR 문서(`14/15`)에 balance freeze 체크 단계 추가

### 검증
- `pre-manual-qa-check.sh` 내 freeze check 단계 통과 확인

## 2026-03-02 (Comprehensive Review Follow-up)

### 반영
- QA auto-levelup 선택 품질 개선(multi-effect 평가)
- 스폰 공정성 개선(플레이어 근접 스폰 회피)
- 충돌 판정 후보 인덱스 도입(성능 준비)
- death recap(사망 원인/상황) HUD 노출
- boss_pattern 다양성 검증(RING/WALL 최소 1회) 게이트 편입

### 검증
- headless gate / readiness / checkpoint / leak trace 전체 통과

## 2026-03-02 (Content Expansion Planning Lock)

### 반영
- 사용자 승인에 따라 차기 콘텐츠를 순차 실행 계획으로 고정
- GDD/개발계획/로드맵을 확장 마일스톤(M4~M7) 기준으로 정렬
- 실행계획 + 체크리스트 전용 문서(`17`, `18`) 신설

### 결과
- 구현 순서/완료기준/공수/QA 절차가 문서 기준선으로 확정됨

## 2026-03-02 (Step 1 Complete — Elite Pack 01)

### 반영
- Elite Grunt / Elite Dasher 구현 및 일반 웨이브 연동
- `--elite-test` 런타임 플래그 + `elite_loop` 자동 검증 추가
- 자동 선택/스폰 공정성/전투 성능 준비/사망 리포트/패턴 다양성 검증까지 리뷰 항목 일괄 반영

### 검증
- headless gate(`boss_pattern`, `elite_loop` 포함) 통과
- readiness/checkpoint/leak trace 통과

### 상태
- 콘텐츠 확장 Step 1 완료
- 다음 착수: Step 2 (Relic System 01)

## 2026-03-02 (Step 2 Complete — Relic System 01)

### 반영
- 유물 12종 데이터/적용기/획득 루프 구현
- 압박도/체력 기반 유물 가중치 보정 적용
- HUD/배너에 유물 획득 및 현재 세트 요약 노출
- QA 게이트에 `relic_loop` 시나리오 추가

### 검증
- headless gate(`relic_loop` 포함), readiness, checkpoint, leak trace 통과

### 상태
- 콘텐츠 확장 Step 2 완료
- 다음 착수: Step 3 (Stage Event Pack 01)

## 2026-03-02 (Step 3 Complete — Stage Event Pack 01)

### 반영
- 이벤트 시스템(안개/감속지대/전류지대) 구현 및 HUD/오버레이 연동
- `event_test` 시나리오 및 event_loop 자동검증 추가
- 이벤트 피해가 death recap에 원인으로 반영되도록 연결

### 검증
- headless gate(`event_loop` 포함), readiness, checkpoint, leak trace 통과

### 상태
- 콘텐츠 확장 Step 3 완료
- 다음 착수: Step 4 (Boss Phase 2 Upgrade)

## 2026-03-02 (Step 4 Complete — Boss Phase 2 Upgrade)

### 반영
- 미니보스 HP 구간 기반 phase shift 도입
- phase2에서 대시/소환 패턴 템포 강화 및 HUD 상태 노출
- `boss_phase2` 자동검증 시나리오 추가

### 검증
- headless gate(`boss_phase2` 포함), readiness, checkpoint, leak trace 통과

### 상태
- 콘텐츠 확장 Step 4 완료
- 확장 1차(M4~M7) 구현/자동검증 라인 완료

## 2026-03-02 (Step 5 Complete — Meta Growth 01)

### 반영
- 런 종료 보상(Shards) + 영구 특성 3종(vitality/celerity/focus) 도입
- `user://meta_profile.json` 기반 프로파일 로드/세이브 연동
- 런 시작 시 영구 보정 자동 적용 + HUD META 상태 노출
- `--meta-test` / `meta_loop` 자동검증 시나리오 추가

### 검증
- headless gate(`meta_loop` 포함), readiness, checkpoint, leak trace 통과

### 상태
- 콘텐츠 확장 Step 5 완료
- 다음 착수: 캐릭터/무기 계열 확장 설계

## 2026-03-02 (Step 6 Complete — Character Pack 01)

### 반영
- 캐릭터 2종(Ranger/Warden) 시작 프로파일 도입
- `--character=<id>` 런타임 선택 + HUD `CHAR` 상태 노출
- 게이트에 `character_ranger`, `character_warden` 자동검증 루프 추가

### 검증
- headless gate(캐릭터 루프 포함), readiness, checkpoint, leak trace 통과

### 상태
- 콘텐츠 확장 Step 6 완료
- 다음 착수: 무기 계열 분화(관통/도트/광역) 설계

## 2026-03-02 (Step 7 Complete — Weapon Archetype Pack 01)

### 반영
- 무기 계열 3종(pierce/dot/aoe) 도입
- `--weapon=<id>` 런타임 선택 + HUD `WEAPON` 상태 노출
- 게이트에 `weapon_pierce`, `weapon_dot`, `weapon_aoe` 자동검증 루프 추가

### 검증
- headless gate(weapon loop 포함), readiness, checkpoint, leak trace 통과

### 상태
- 콘텐츠 확장 Step 7 완료
- 다음 착수: 캐릭터 전용 액티브 스킬/무기 트리 설계

## 2026-03-02 (Step 8 Complete — Active Skill Pack 01)

### 반영
- 캐릭터 전용 액티브 스킬 2종(Ranger/Warden) 도입
- 입력 `Q` 기반 수동 발동 + HUD `SKILL` 상태 노출
- 게이트에 `active_ranger`, `active_warden` 자동검증 루프 추가

### 검증
- headless gate(active loop 포함), readiness, checkpoint, leak trace 통과

### 상태
- 콘텐츠 확장 Step 8 완료
- 다음 착수: 캐릭터/무기 트리 고도화 설계

## 2026-03-03 (Step 9 Started — Character/Weapon Tree Design 01)

### 반영
- 캐릭터 전용 스킬/무기 트리 설계 문서 Draft 01 작성
- 트리 노드 구조, 저장 모델, QA 토큰 설계 방향 고정

### 상태
- 설계 진행 중(정책 확정 대기)
- 다음 액션: 재화/해금 단가/적용 시점 확정 후 구현 단계 전환

## 2026-03-03 (Step 9 Complete — Character/Weapon Tree Design 01)

### 반영
- 트리 설계 Draft 01 정책 확정(재화/단가/적용 시점)
- 데이터 스키마/QA 토큰 명세 고정

### 상태
- Step 9 설계 완료
- 다음 착수: 트리 런타임 구현(`character_trees.gd`, `tree_progression.gd`, `tree_*_loop`)

## 2026-03-03 (Step 10 Complete — Character/Weapon Tree Runtime 01)

### 반영
- 트리 데이터(`character_trees.gd`) + 적용기(`tree_progression.gd`) 구현
- 메타 프로파일 트리 필드(`tree_unlocks`, `tree_last_spent`) 연동
- 트리 효과를 전투/액티브/HUD 경로에 연결
- `--tree-test`, `tree_ranger`, `tree_warden` 자동검증 루프 추가

### 검증
- headless gate(tree loop 포함), readiness, checkpoint, leak trace 통과

### 상태
- Step 10 완료
- 다음 착수: 트리 실해금 UI/UX(메타 화면) 구현

## 2026-03-03 (Step 11 Complete — Tree UI/UX Pack 01)

### 반영
- 트리 패널 UI/입력 흐름(`T`, `1/2/3`) 구현
- `--tree-ui-test` 및 `tree_ui` 자동검증 루프 추가

### 검증
- headless gate(tree_ui 포함), readiness, checkpoint, leak trace 통과

### 상태
- Step 11 완료
- 다음 착수: 트리 UI 고도화(스크롤/노드 상세/실해금 메타 화면)

## 2026-03-03 (Step 12 Complete — Visual Upgrade Pack 01)

### 반영
- CC0 에셋 기반 핵심 오브젝트 스프라이트 교체
- 배경 텍스처 레이어 적용으로 화면 완성도 상향
- 에셋 라이선스/출처 문서화 완료

### 검증
- headless gate/readiness/checkpoint/leak trace 통과

### 상태
- Step 12 완료
- 다음 착수: 그래픽 2차 폴리싱(VFX/애니메이션/UI 테마)

## 2026-03-03 (Step 13 Complete — Quality+Feature Upgrade Pack 01)

### 반영
- 히트/킬 VFX + 투사체 트레일 반영
- 웨이브 미션 시스템 추가
- 엘리트 변형 패턴(각 2종) 추가
- `feel_loop`, `mission_loop`, `elite_variant_loop` 자동검증 편입

### 검증
- headless gate(신규 루프 포함), readiness, checkpoint, leak trace 통과

### 상태
- Step 13 완료
- 다음 착수: VFX/애니메이션 2차 폴리싱

## 2026-03-03 (Step 14 Fast Follow — Feedback/Runtime Polish)

### 변경
- TextureRuntime 글로벌 캐시 도입
- 미션 스트릭 보너스/리셋 로직 추가
- HUD 미션 스트릭 표시 추가
- impact FX 연출 강화(스포크 추가)

### 검증
- headless gate / readiness / checkpoint / leak trace 통과

## 2026-03-03 (Step 15 — Core Runtime Refactor Pack 01)

### 변경
- 압박도 계산 로직을 `pressure_runtime.gd`로 이관
- auto-levelup 선택 점수화를 `levelup_advisor.gd`로 이관
- game_root는 오케스트레이션 중심으로 정리
- balance-freeze-check가 신규 구조를 확인하도록 업데이트

### 검증
- headless gate / readiness / checkpoint / leak trace / balance-freeze 통과

## 2026-03-03 (Step 16 — Interface Boundary Cleanup Pack 01)

### 변경
- game_root 내부 `has_method` 가드 제거 및 호출 경계 정리
- 런타임 동적 분기 축소(직접 제어 객체 기준)

### 검증
- headless gate / pre-manual / checkpoint / leak trace / balance-freeze 통과

## 2026-03-03 (Step 17 — Interface Boundary Cleanup Pack 02)

### 변경
- HUD/Boss runtime의 동적 인터페이스 분기(`has_method`) 제거
- 보스 상태 표기/연출 호출 경계 단순화

### 검증
- headless gate / pre-manual / checkpoint / leak trace / balance-freeze 통과

## 2026-03-03 (Step 18 — VFX/Animation Polish Pack 01)

### 변경
- impact FX 2차 폴리싱(레이어/파편/스포크)
- 이벤트 배너 진입 애니메이션(슬라이드 + 페이드)
- 레벨업 패널 등장 애니메이션(오프셋 + 이징)

### 검증
- headless gate / pre-manual / checkpoint / leak trace / balance-freeze 통과

## 2026-03-03 (Step 18 Fast Follow — LevelUp Card UI Polish)

### 변경
- 레벨업 UI를 텍스트 블록형에서 카드형 3선택으로 리디자인
- 역할별 컬러/요약 텍스트/추천 노트로 정보 구조 단순화
- 카드 등장 스태거 애니메이션 추가

### 검증
- headless gate / pre-manual / checkpoint / leak trace / balance-freeze 통과

## 2026-03-03 (Step 18 Fast Follow — UX Input/History)

### 변경
- 레벨업 카드 마우스 상호작용(hover/좌클릭) 지원
- 업그레이드 선택 히스토리 패널(H 키) 추가
- 선택 카드 히스토리 상태 저장 및 표시 연동

### 검증
- headless gate / pre-manual / checkpoint / leak trace / balance-freeze 통과

## 2026-03-03 (Step 19 — UI/Graphics Overhaul Pack 01)

### 변경
- HUD를 텍스트 덤프형에서 패널형 정보 계층 구조로 전환
- 배경 레이어링/비네트/글로우로 전투 집중도 향상
- 수동 QA 프로토콜에 마우스 카드 선택 + H 히스토리 확인 항목 추가

### 검증
- headless gate / pre-manual / checkpoint / leak trace / balance-freeze 통과

## 2026-03-04 (Step 20-B — Level Design / Fun Curve Pack 01)

### 변경
- 웨이브 스폰 페이싱을 단계별(early/mid/surge/climax)로 재설계
- 브리더 윈도우를 도입해 압박 완급을 명확화
- 미션 실패 누적 시 Recover 난이도 완화로 복구성 강화

### 검증
- headless gate / pre-manual / checkpoint / leak trace / balance-freeze 통과

## 2026-03-04 (Step 20-C — Combat Feel Polish Pack 01)

### 변경
- 히트/킬/피격 순간의 카메라 반응을 분리해 타격감 강화
- 카메라 임팩트 쿨다운으로 과도 흔들림 억제

### 검증
- headless gate / pre-manual / checkpoint / leak trace / balance-freeze 통과

## 2026-03-04 (Step 21-A — Title/Menu Framework Pack 01)

### 변경
- 부트 타이틀 메뉴 및 인게임 ESC 메뉴 흐름 구축
- 자동 QA/헤드리스 실행에서는 메뉴 자동 스킵

### 검증
- headless gate / pre-manual / checkpoint / leak trace / balance-freeze 통과

## 2026-03-04 (Step 21-B — Options/Settings Pack 01)

### 변경
- 타이틀 메뉴에서 OPTIONS 패널 진입 및 설정 변경 구현
- 설정 저장/복원(`user://settings.cfg`) 구현
- 카메라 임팩트 강도 설정과 전투 카메라 피드백 연동

### 검증
- headless gate / pre-manual / checkpoint / leak trace / balance-freeze 통과

## 2026-03-05 (Step 22-A — Content/Fun Expansion Pack 01)

### 변경
- 보스 소환 패턴에 CROSS 변주 추가
- 이벤트 선택 로직을 상황형 가중치(압박/체력/반복도) 기반으로 개선
- 유물 세트 보너스로 빌드 시너지 강화

### 검증
- headless gate / pre-manual / checkpoint / leak trace / balance-freeze 통과

## 2026-03-05 (Step 22-B — Boss Rhythm/Fairness Pack 02)

### 변경
- 보스 소환 패턴 반복 억제(repeat penalty)
- 보스 소환 후 recovery window 도입
- CROSS 패턴 텔레그래프 가독성 강화

### 검증
- headless gate / pre-manual / checkpoint / leak trace / balance-freeze 통과

## 2026-03-05 (Step 23 — Alpha Manual QA Handoff Packet)

### 변경
- 수동 QA 핸드오프 패킷 문서 신규 작성
- 머지 체크리스트/리드니스/릴리즈노트/QA체크리스트 동기화

### 검증
- pre-manual-qa-check PASS
- checkpoint-report 최신화

## 2026-03-05 (Step 23-HF1 — GUI Boot Path Hotfix)

### 변경
- `game_root.gd` 런타임 옵션 키 불일치 수정(`boss_test_boost`)
- non-headless 부팅 시 SCRIPT ERROR 제거

### 검증
- GUI quick smoke 통과
- headless gate / pre-manual / checkpoint 통과

## 2026-03-05 (Step 24-A — QA/Automation Guard Pack 01)

### 변경
- boss_pattern 자동게이트를 RING/WALL/CROSS 강제 검증으로 강화
- 자동화 모드 판별 로직 단일화(`runtime_options.is_automation_mode`)
- summon recovery HUD/텔레그래프 피드백 강화

### 검증
- headless gate / pre-manual / checkpoint / leak trace / balance-freeze 통과

## 2026-03-05 (Step 24-B — FPS Probe/Manual QA Assist Pack 01)

### 변경
- `--fps-probe` 옵션/로그 샘플링 추가
- 수동 QA 문서에 FPS 실측 보조 절차 반영

### 검증
- headless gate / pre-manual / checkpoint / leak trace / balance-freeze 통과

## 2026-03-05 (Step 24-C — Manual QA Ops Pack 01)

### 변경
- 수동 QA 실행/기록 보조 스크립트 및 run sheet 템플릿 추가
- 수동 QA 핸드오프 문서와 실행 절차 통합

## 2026-03-05 (Manual QA session note)

### 관측
- runbook + fps-probe 세션 1회 실행
- 로그: `.qa/manual/20260305-201519/fps-probe.log`
- FPS 요약: avg 6.2 / min 1.0 / max 9.0

### 상태
- TITLE_MENU_OPEN 상태 유지로 플레이 루프(Run A/B/C) 데이터는 수집되지 않음
- 수동 QA 본실행 재수행 필요

## 2026-03-05 (Manual QA session retry note)

### 관측
- runbook+fps-probe 2차 세션 실행
- 로그: `.qa/manual/20260305-212529/fps-probe.log`
- FPS 요약: avg 6.3 / min 1.0 / max 8.0

### 상태
- 이번에도 TITLE_MENU_OPEN 상태 유지, 플레이 토큰 미검출
- Run A/B/C 본실행 재시도 필요

## 2026-03-05 (Step 25-A — Quality/Fairness Polish Pack 01)

### 변경
- 보스 구간 이벤트 과부하 완화를 위해 defer 로직 추가
- summon recovery 피드백(배너/카메라) 강화
- HUD에 세트 시너지 진행도/활성 상태 노출

### 검증
- headless gate / pre-manual / checkpoint / leak trace / balance-freeze 통과

## 2026-03-05 (Step 25-B — Combat Feel/SFX Mix Polish Pack 02)

### 변경
- hit cadence 기반 카메라 임팩트 리듬 튜닝
- 플레이어 피격 임팩트 스케일링 강화
- 보스 SFX 믹스/강조 보정

### 검증
- headless gate / pre-manual / checkpoint / leak trace / balance-freeze 통과

## 2026-03-05 (Step 25-C — Pattern Fairness/Manual QA Start Assist Pack 03)

### 변경
- 미니보스 combo dash 연속 패턴 soft-cap 적용
- elite spawn 안전 보정(저체력/dash_drill/shock_zone)
- manual runbook Start 누락 리마인더/세션 상태 출력 추가

### 검증
- headless gate / pre-manual / checkpoint / leak trace / balance-freeze 통과
