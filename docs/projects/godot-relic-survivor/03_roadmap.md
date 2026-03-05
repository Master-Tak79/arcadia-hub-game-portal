# 03_roadmap — Godot Relic Survivor

## M1 — Core Combat (v0.1.0-dev)
- 목표: 이동/자동공격/기본 적/피격 루프 완성
- 완료 기준: 10분 시뮬레이션 크래시 없음
- 상태: ✅ 완료

## M2 — Build Depth (v0.1.0-alpha-candidate)
- 목표: 레벨업 3지선다 + 업그레이드 16종 + 난이도 곡선 안정화
- 완료 기준: 빌드 선택 체감 확보, 자동검증 기준선 확보
- 상태: ✅ 완료 (수동 QA/FPS 실측 대기)

## M3 — Boss & Polish (v0.1.0-alpha)
- 목표: 미니보스 패턴/연출/UX polish/QA 신뢰도 강화
- 완료 기준: boss-pattern 자동검증 + 프리즈 체크 + 문서 동기화
- 상태: ✅ 완료 (alpha 확정 게이트 대기)

## M4 — Elite Pack 01 (v0.1.1-dev)
- 목표: 엘리트 몬스터 2종 추가로 중반 난이도 브릿지 확보
- 콘텐츠:
  - Elite Grunt (탱키 + 버스트 돌진)
  - Elite Dasher (연속 돌진 + 회복 윈도)
- 완료 기준:
  - 6~10분 구간 체감 난이도 계단 완화
  - 자동검증 + 수동 QA 체크리스트 항목 추가
- 상태: 🟡 구현/자동검증 완료 (수동 체감 QA 대기)

## M5 — Relic System 01 (v0.1.2-dev)
- 목표: 런 중 획득 유물 12종으로 빌드 개성 강화
- 콘텐츠:
  - 공격 4종 / 기동 3종 / 생존 3종 / 하이브리드 2종
- 완료 기준:
  - 유물 획득 루프 + UI + 밸런스 표 완성
  - OP 조합 캡/감쇠 규칙 반영
- 상태: 🟡 구현/자동검증 완료 (수동 체감 QA 대기)

## M6 — Stage Event Pack 01 (v0.1.3-dev)
- 목표: 전장 변화 이벤트 3종으로 반복 플레이 변주 강화
- 콘텐츠:
  - 안개(가시거리 제한)
  - 감속지대(위치 기반 이동 제약)
  - 전류지대(주기 피해/회피 유도)
- 완료 기준:
  - 이벤트 텔레그래프/룰/보상 구조 확립
  - QA에서 이벤트 억울사 기준 통과
- 상태: 🟡 구현/자동검증 완료 (수동 체감 QA 대기)

## M7 — Boss Phase 2 Upgrade (v0.1.4-dev)
- 목표: 미니보스 2페이즈 전환으로 하이라이트 강화
- 콘텐츠:
  - HP 구간 기반 패턴 전환(phase shift)
  - 페이즈 전환 연출 + 안전 구간 + 리워드 리듬 재조정
- 완료 기준:
  - phase 전환 가독성/공정성 확보
  - boss-pattern 자동검증 시나리오 확장 통과
- 상태: 🟡 구현/자동검증 완료 (수동 체감 QA 대기)

## M8 — Meta Growth 01 (v0.1.5-dev)
- 목표: 런 간 지속 동기를 위한 영구 성장 기초 구축
- 콘텐츠:
  - 런 종료 보상(Shards)
  - 영구 특성 3종(vitality/celerity/focus)
  - 저장 프로파일(`user://meta_profile.json`) + HUD META 상태
- 완료 기준:
  - 런 종료 보상/저장/재시작 적용 루프 정상
  - `meta_loop` 자동검증 시나리오 통과
- 상태: 🟡 구현/자동검증 완료 (수동 체감 QA 대기)

## M9 — Character Pack 01 (v0.1.6-dev)
- 목표: 시작 빌드 차별화를 위한 캐릭터 선택 축 추가
- 콘텐츠:
  - Ranger(기동/연사형), Warden(탱커형)
  - 런타임 선택(`--character=ranger|warden`) + HUD `CHAR`
  - `character_ranger`, `character_warden` 자동검증 루프
- 완료 기준:
  - 캐릭터별 시작 체감 차이 확인
  - 캐릭터 루프 자동검증 시나리오 통과
- 상태: 🟡 구현/자동검증 완료 (수동 체감 QA 대기)

## M10 — Weapon Archetype Pack 01 (v0.1.7-dev)
- 목표: 플레이 스타일 분화를 위한 무기 계열 축 추가
- 콘텐츠:
  - 무기 3종(`pierce`, `dot`, `aoe`)
  - 런타임 선택(`--weapon=<id>`) + HUD `WEAPON`
  - `weapon_pierce`, `weapon_dot`, `weapon_aoe` 자동검증 루프
- 완료 기준:
  - 무기별 타격 감각 차이 확인
  - 무기 루프 자동검증 시나리오 통과
- 상태: 🟡 구현/자동검증 완료 (수동 체감 QA 대기)

## M11 — Active Skill Pack 01 (v0.1.8-dev)
- 목표: 캐릭터 아이덴티티 강화를 위한 수동 개입 스킬 축 추가
- 콘텐츠:
  - Ranger `Windstep Burst` (기동/연사 버스트)
  - Warden `Bulwark Pulse` (방어/근거리 파동)
  - `active_ranger`, `active_warden` 자동검증 루프
- 완료 기준:
  - 캐릭터별 액티브 체감 차이 확인
  - 액티브 루프 자동검증 시나리오 통과
- 상태: 🟡 구현/자동검증 완료 (수동 체감 QA 대기)

## M12 — Character/Weapon Tree Design 01 (v0.1.9-dev)
- 목표: 캐릭터 전용 장기 성장 축(스킬/무기 트리) 설계 고정
- 콘텐츠:
  - Ranger/Warden 전용 트리 노드 구조 정의
  - 트리 포인트/해금 규칙/저장 모델 정의
  - QA 토큰/시나리오(`tree_*_loop`) 설계
- 완료 기준:
  - 설계 문서 `19_character_weapon_tree_design.md` 확정
  - 구현 순서/리스크/결정 포인트 명시
- 상태: ✅ 완료

## M13 — Character/Weapon Tree Runtime 01 (v0.1.10-dev)
- 목표: 설계 고정된 트리 시스템을 런타임/저장/QA 경로에 연결
- 콘텐츠:
  - `character_trees.gd`, `tree_progression.gd` 구현
  - `meta_profile.json` 트리 필드 연동 + HUD TREE 상태
  - `tree_ranger`, `tree_warden` 자동검증 루프
- 완료 기준:
  - 트리 해금/저장/다음 라운드 반영 루프 정상
  - 트리 루프 자동검증 시나리오 통과
- 상태: 🟡 구현/자동검증 완료 (수동 체감 QA 대기)

## M14 — Tree UI/UX Pack 01 (v0.1.11-dev)
- 목표: 트리 해금을 인게임에서 직접 수행 가능한 UX 제공
- 콘텐츠:
  - 트리 패널(`T`) 열기/닫기
  - 노드 해금 선택(`1/2/3`) 및 결과 피드백
  - `tree_ui` 자동검증 루프
- 완료 기준:
  - 트리 패널 열림/선택/해금 토큰 검증 통과
  - 트리 해금 후 다음 라운드 적용 규칙 유지
- 상태: 🟡 구현/자동검증 완료 (수동 체감 QA 대기)

## M15 — Visual Upgrade Pack 01 (v0.1.12-dev)
- 목표: 도형 기반 렌더링에서 스프라이트 기반 렌더링으로 1차 전환
- 콘텐츠:
  - CC0 에셋 적용(플레이어/적/투사체/배경)
  - 가독성 유지형 실루엣/색상 계층 정리
  - 자산 출처/라이선스 문서화
- 완료 기준:
  - 핵심 오브젝트 스프라이트 교체 완료
  - 자동검증 루프 및 누수 검증 통과
- 상태: 🟡 구현/자동검증 완료 (수동 체감 QA 대기)

## M16 — Quality+Feature Upgrade Pack 01 (v0.1.13-dev)
- 목표: 전투 손맛/다양성 강화를 위한 기능+연출 업그레이드
- 콘텐츠:
  - 히트/킬 VFX + 투사체 트레일 강화
  - 웨이브 미션 시스템(할당/진행/완료 보상)
  - 엘리트 변형 패턴(Grunt: juggernaut/berserk, Dasher: phantom/bulwark)
- 완료 기준:
  - `feel_loop`, `mission_loop`, `elite_variant_loop` 자동검증 통과
  - 전투 가독성/피드백 저하 없이 기능 동작 확인
- 상태: 🟡 구현/자동검증 완료 (수동 체감 QA 대기)

## M17 — Feedback/Runtime Polish Fast Follow (v0.1.21-dev)
- 목표: 시각 피드백과 런타임 로딩 비용을 단기 개선
- 콘텐츠:
  - `texture_runtime.gd` 전역 캐시 도입
  - 미션 스트릭 보너스/리셋 로직 + HUD 스트릭 표시
  - `impact_fx` 링/스포크 연출 강화
- 완료 기준:
  - headless gate + leak trace 재통과
  - 미션 루프에서 스트릭 토큰(`MISSION_STREAK:*`) 확인
- 상태: 🟡 구현/자동검증 완료 (수동 체감 QA 대기)

## M18 — Core Runtime Refactor Pack 01 (v0.1.22-dev)
- 목표: `game_root` 책임 분리로 유지보수성과 회귀 안전성 개선
- 콘텐츠:
  - `pressure_runtime.gd`로 압박도 계산 로직 이관
  - `levelup_advisor.gd`로 auto-levelup 점수화 로직 이관
  - `balance-freeze-check.sh`가 신규 구조를 검사하도록 확장
- 완료 기준:
  - headless gate + leak trace 재통과
  - balance freeze check PASS
- 상태: 🟡 구현/자동검증 완료 (수동 체감 QA 대기)

## M19 — Interface Boundary Cleanup Pack 01 (v0.1.23-dev)
- 목표: game_root 동적 인터페이스 분기 축소 및 경계 단순화
- 콘텐츠:
  - `game_root.gd` 내 `has_method` 가드 제거(직접 제어 객체 기준)
  - 호출 경로 명시화 및 오케스트레이션 가독성 개선
- 완료 기준:
  - headless gate + leak trace + balance freeze 재통과
- 상태: 🟡 구현/자동검증 완료 (수동 체감 QA 대기)

## M20 — Interface Boundary Cleanup Pack 02 (v0.1.24-dev)
- 목표: HUD/Boss runtime 동적 인터페이스 분기 축소
- 콘텐츠:
  - `hud.gd`의 미니보스 상태 조회 경계 단순화
  - `boss_reward_runtime.gd`의 보스 연출/SFX 호출 경계 단순화
- 완료 기준:
  - headless gate + leak trace + balance freeze 재통과
- 상태: 🟡 구현/자동검증 완료 (수동 체감 QA 대기)

## M21 — VFX/Animation Polish Pack 01 (v0.1.25-dev)
- 목표: 전투/패널 피드백의 미세 애니메이션 품질 강화
- 콘텐츠:
  - `impact_fx.gd` 이중 링/오비탈 파편/스포크 보강
  - `event_banner.gd` 슬라이드-인 + 페이드 진입 모션
  - `level_up_panel.gd` 등장 이징/알파 애니메이션
- 완료 기준:
  - headless gate + leak trace + balance freeze 재통과
- 상태: 🟡 구현/자동검증 완료 (수동 체감 QA 대기)

## M22 — UX Input/History Fast Follow (v0.1.26-dev)
- 목표: 레벨업 선택 UX 조작감과 복기 가능성 강화
- 콘텐츠:
  - 레벨업 카드 hover/마우스 클릭 선택 지원
  - `H` 키 업그레이드 히스토리 패널 제공
- 완료 기준:
  - headless gate + leak trace + balance freeze 재통과
- 상태: 🟡 구현/자동검증 완료 (수동 체감 QA 대기)

## M23 — UI/Graphics Overhaul Pack 01 (v0.1.27-dev)
- 목표: 전투 가독성과 UI 체감 품질을 상용 수준으로 1차 상향
- 콘텐츠:
  - HUD 패널형 재구성(핵심 지표 계층화)
  - 배경 연출 강화(스타 레이어/비네트/센터 글로우)
  - 레벨업 카드 클릭/H 히스토리 UX를 운영 체크리스트에 통합
- 완료 기준:
  - headless gate + leak trace + balance freeze 재통과
- 상태: 🟡 구현/자동검증 완료 (수동 체감 QA 대기)

## M24 — Level Design / Fun Curve Pack 01 (v0.1.28-dev)
- 목표: 웨이브 완급과 미션 복구성을 강화해 장기 플레이 재미 상향
- 콘텐츠:
  - 스폰 페이싱 스테이지(early/mid/surge/climax) + breather 윈도우
  - 스폰 방향 분산(동일 엣지 반복 억제)
  - 동적 미션 풀/연속 실패 완화(Recover 미션)
- 완료 기준:
  - headless gate + leak trace + balance freeze 재통과
- 상태: 🟡 구현/자동검증 완료 (수동 체감 QA 대기)

## M25 — Combat Feel Polish Pack 01 (v0.1.29-dev)
- 목표: 타격/피격 순간 체감을 강화해 전투 만족도 상향
- 콘텐츠:
  - 카메라 임팩트 API(light/heavy/player-hit)
  - 히트/킬/피격 카메라 연동 및 쿨다운 제어
- 완료 기준:
  - headless gate + leak trace + balance freeze 재통과
- 상태: 🟡 구현/자동검증 완료 (수동 체감 QA 대기)

## M26 — Title/Menu Framework Pack 01 (v0.1.30-dev)
- 목표: 런 진입/일시정지/종료 흐름을 제품형 UX로 정리
- 콘텐츠:
  - 부트 타이틀 메뉴(시작/종료)
  - ESC 인게임 메뉴(재개/재시작/종료)
  - 헤드리스/QA 실행 시 자동 스킵 분기
- 완료 기준:
  - headless gate + leak trace + balance freeze 재통과
- 상태: 🟡 구현/자동검증 완료 (GUI 수동 QA 대기)

## M27 — Options/Settings Pack 01 (v0.1.31-dev)
- 목표: 제품형 메뉴의 최소 설정 루프 구축
- 콘텐츠:
  - SFX 프리셋(default/quiet/hype)
  - 카메라 임팩트 강도(OFF/LOW/NORMAL/HIGH)
  - 창 모드(windowed/fullscreen)
  - 설정 저장/복원(`user://settings.cfg`)
- 완료 기준:
  - headless gate + leak trace + balance freeze 재통과
- 상태: 🟡 구현/자동검증 완료 (GUI 수동 QA 대기)

## M28 — Content/Fun Expansion Pack 01 (v0.1.32-dev)
- 목표: 중후반 전투 변주와 빌드 시너지를 강화해 재미 밀도 상승
- 콘텐츠:
  - 보스 소환 CROSS 패턴 추가
  - 이벤트 동적 가중치(반복 완화/안정성 보정)
  - 유물 세트 보너스(attack/mobility/survival/hybrid)
- 완료 기준:
  - headless gate + leak trace + balance freeze 재통과
- 상태: 🟡 구현/자동검증 완료 (GUI 수동 QA 대기)

## M29 — Boss Rhythm/Fairness Pack 02 (v0.1.33-dev)
- 목표: 보스 소환-대시 사이의 리듬 공정성 강화
- 콘텐츠:
  - 소환 패턴 반복 억제(repeat penalty)
  - 소환 후 recovery window 도입
  - CROSS 텔레그래프 시각 강화
- 완료 기준:
  - headless gate + leak trace + balance freeze 재통과
- 상태: 🟡 구현/자동검증 완료 (GUI 수동 QA 대기)

## M30 — Alpha Manual QA Handoff Packet (v0.1.33-dev)
- 목표: 알파 확정 전 수동 QA 실행 효율/일관성 확보
- 콘텐츠:
  - `21_alpha_manual_qa_handoff_packet.md` 신설
  - 최신 자동검증 증적/체크포인트 고정
  - 수동 QA 기록/스크린샷 규격화
- 완료 기준:
  - pre-manual check PASS + checkpoint 최신화
- 상태: 🟡 완료(수동 QA 실행 대기)

## M31 — QA/Automation Guard Pack 01 (v0.1.34-dev)
- 목표: 알파 확정 전 QA 커버리지/런타임 가드레일 보강
- 콘텐츠:
  - boss_pattern CROSS 검증 추가
  - 자동화 모드 판별 로직 단일화
  - summon recovery HUD/시각 피드백 강화
- 완료 기준:
  - headless gate + pre-manual + checkpoint + leak + freeze 재통과
- 상태: 🟡 구현/자동검증 완료

## M32 — FPS Probe/Manual QA Assist Pack 01 (v0.1.35-dev)
- 목표: 수동 QA 중 FPS 실측을 로그 기반으로 표준화
- 콘텐츠:
  - 런타임 옵션 `--fps-probe` 추가
  - `FPS_PROBE_SAMPLE:*` 주기 로그 제공
  - 수동 QA 프로토콜/핸드오프 문서에 반영
- 완료 기준:
  - GUI quick probe + headless/leak/freeze/checkpoint 재통과
- 상태: 🟡 완료

## 백로그 (중기)
- 메인 메뉴 옵션/설정 확장 2차(조작/고급 그래픽/접근성) 구현
- 캐릭터 전용 무기/액티브 스킬 트리 고도화 구현

## 리스크 추적
- 신규 콘텐츠 누적으로 인한 성능 저하
- 빌드 시너지 과포화(특정 조합 편향)
- 이벤트/페이즈 전환에서 억울사 발생
