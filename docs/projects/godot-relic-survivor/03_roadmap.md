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

## 백로그 (중기)
- 캐릭터 전용 무기/액티브 스킬 트리 고도화 구현

## 리스크 추적
- 신규 콘텐츠 누적으로 인한 성능 저하
- 빌드 시너지 과포화(특정 조합 편향)
- 이벤트/페이즈 전환에서 억울사 발생
