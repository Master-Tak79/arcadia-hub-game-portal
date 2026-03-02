# 19_character_weapon_tree_design

## 목적
Character Pack + Weapon Archetype + Active Skill 기반 위에,
**캐릭터 전용 스킬/무기 트리**를 얹어 중장기 빌드 아이덴티티를 강화한다.

---

## 1) 설계 원칙
1. **캐릭터 정체성 고정**
   - Ranger: 기동/연사/선형 관통 강화
   - Warden: 방어/근거리 제어/광역 안정성 강화
2. **트리 선택은 강화, 강제는 금지**
   - 필수 노드 최소화, 분기 선택 비중 확대
3. **메타 과팽창 방지**
   - 곱연산 최소화, 대부분 가산/상한 캡 적용
4. **QA 토큰 우선**
   - 노드 적용/해금/리셋 경로를 로그 토큰으로 검증 가능해야 함

---

## 2) 트리 구조(초안)

### Ranger Tree (코드명: `ranger_tree`)
- T1
  - `swift_draw`: 공격 간격 -4%
  - `trail_step`: 이동속도 +18
- T2 (T1 1개 이상 필요)
  - `pierce_tuning`: 관통 +1, 직격 피해 -6%
  - `burst_battery`: Windstep Burst 쿨다운 -2.0s
- T3 (T2 1개 이상 필요)
  - `phantom_lane`: 대시 후 1.2s 공격속도 보너스 +8%

### Warden Tree (코드명: `warden_tree`)
- T1
  - `iron_frame`: 최대 HP +2
  - `anchor_step`: 피격 무적 +0.06s
- T2 (T1 1개 이상 필요)
  - `pulse_relay`: Bulwark Pulse 반경 +18
  - `fortress_plate`: 받는 접촉 피해 -1(최소 1 보장)
- T3 (T2 1개 이상 필요)
  - `guardian_echo`: Bulwark Pulse 사용 시 1회 보호막(짧은 무적 0.45s)

---

## 3) 포인트/해금 규칙(초안)
- 재화: 기존 `meta_shards`와 분리된 `tree_points` 도입 검토
- 1 노드 해금 = 1 포인트(기본)
- Tier 진입 조건:
  - T2: T1 누적 1포인트
  - T3: T2 누적 1포인트
- 시즌/리셋 없는 영구 저장(`user://meta_profile.json` 확장)

---

## 4) 데이터 모델 제안
- 신규 데이터 파일
  - `scripts/data/character_trees.gd`
- profile 확장 키
  - `tree_points`
  - `tree_unlocks` (예: `{ "ranger_tree": ["swift_draw"], "warden_tree": [] }`)
- 런타임 적용기
  - `scripts/systems/tree_progression.gd` (신규)

---

## 5) UI/UX 제안
- 메타 화면(초안)
  - 탭: `Meta / Character Tree`
  - 캐릭터별 트리 노드 카드 + 선행조건/현재 랭크 표시
- 인게임 HUD
  - 상세 트리 노출 대신 핵심 요약만 표시(정보 과밀 방지)

---

## 6) QA/검증 설계
- 예정 토큰
  - `TREE_PROFILE_LOADED`
  - `TREE_NODE_UNLOCKED:<node_id>`
  - `TREE_APPLIED:<character_id>`
- 예정 시나리오
  - `tree_ranger_loop`
  - `tree_warden_loop`

---

## 7) 구현 순서 제안 (Step 9)
1. 데이터 구조/저장 확장 (`character_trees.gd`, profile 키)
2. 런타임 적용기(`tree_progression.gd`) + 토큰
3. headless 게이트 `tree_*_loop` 추가
4. UI 1차(간단 목록형) 반영
5. 밸런스 캡/튜닝 + 문서/체크리스트 동기화

---

## 8) 리스크
- 메타/캐릭터/무기/액티브 보정이 누적되어 체감 급상승 가능
- 트리 UI 추가 시 정보 과밀 위험
- 노드 의존성 설계 복잡도 증가

## 9) 결정 필요 항목
- 트리 재화를 `meta_shards`와 공유할지 분리할지
- 노드 해금 단가(고정 1 vs 티어별 상승)
- 런 중 즉시 반영 여부(즉시/다음 라운드)
