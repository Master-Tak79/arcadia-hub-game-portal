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

## 2) 트리 구조(확정안 v1)

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

## 3) 포인트/해금 규칙(확정)
- 재화: **`meta_shards` 공유**(트리 전용 별도 재화 미도입)
- 노드 해금 단가: **티어별 상승 고정**
  - T1: 1 shard
  - T2: 2 shards
  - T3: 3 shards
- Tier 진입 조건:
  - T2: T1 누적 1노드 이상
  - T3: T2 누적 1노드 이상
- 적용 시점: **해금은 즉시 저장, 효과 적용은 다음 라운드 시작 시 반영**
- 시즌/리셋 없는 영구 저장(`user://meta_profile.json` 확장)

---

## 4) 데이터 모델 확정(v1)
- 신규 데이터 파일
  - `scripts/data/character_trees.gd`
- profile 확장 키
  - `tree_unlocks` (예: `{ "ranger_tree": ["swift_draw"], "warden_tree": [] }`)
  - `tree_last_spent` (예: `{ "node_id": "swift_draw", "cost": 1, "at": 1709410000 }`)
- 런타임 적용기
  - `scripts/systems/tree_progression.gd` (신규)
- node 스키마(고정)
  - `id`, `tree_id`, `tier`, `cost`, `requires`, `effects[]`

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

## 6.1) QA 명세 고정(v1)
- `tree_ranger_loop`
  - 입력: `--character=ranger --tree-test`
  - 필수 토큰: `TREE_PROFILE_LOADED`, `TREE_NODE_UNLOCKED:swift_draw`, `TREE_APPLIED:ranger`
- `tree_warden_loop`
  - 입력: `--character=warden --tree-test`
  - 필수 토큰: `TREE_PROFILE_LOADED`, `TREE_NODE_UNLOCKED:iron_frame`, `TREE_APPLIED:warden`

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

## 9) 확정 결정(2026-03-03)
- 트리 재화: `meta_shards` 공유
- 해금 단가: 티어별 상승(T1=1, T2=2, T3=3)
- 반영 시점: 해금 즉시 저장, 효과는 다음 라운드 시작 시 적용
