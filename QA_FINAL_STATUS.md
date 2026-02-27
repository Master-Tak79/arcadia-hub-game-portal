# QA Final Status (2026-02-27)

대상: Arcadia Hub Portal v0.3.46 기준

## ✅ PASS (확인 완료)
- 자동 검증 체인
  - `scripts/shared-ui-common-check.mjs` 통과
  - `scripts/game-ui-check.mjs` 통과
  - `scripts/meteor-smoke-check.sh` 통과
  - GitHub Actions `ui-regression` (PR / main push) 성공
- 실기기 실행 확인
  - Device A: Galaxy (Telegram in-app browser) 실행 PASS(사용자 보고)
  - Device B: Galaxy A24 Ultra (Chrome / Edge / Samsung Internet) 실행 PASS(사용자 실행)
- 포털/게임 구조 안정성
  - 구현 게임 우선 정렬 정책 반영 상태 유지
  - UI 공통 유틸(shared) + 게임별 UI 체크 스크립트 적용 완료
  - 신규 3종 + Lane Switch + Block Sage + Mini Empire Grid + Pixel Clash + Idle Foundry + Dash to Core + Farm Harbor + Mecha Sprint + Maze Signal + Void Raiders + Rail Commander까지 사운드/BGM/일시정지 UX 1차 반영 완료
  - 로컬 15종 공통 밸런스 1차 패스(진입 완화 + 중반 가속 강화) 반영 완료

## ⏸ HOLD (추가 확인 필요)
아래는 "실행 확인"은 되었지만, 체크리스트의 정량 조건(예: 3회×60초)까지는 아직 증빙이 부족한 항목입니다.

- 모바일 2기종 정량 검증
  - 기기 A/B 각각 3회 플레이(각 60초 이상) 기록
  - 포털 2열 카드 가독성/오터치 재현 로그
  - 1차 채움 시트(`QA_3RUN_LOG_2026-02-27_STAGE1.md`) 생성 완료, 실기기 실측값 입력 필요
- 게임별 세부 수동 항목
  - Meteor Dodge: 아이템 6종 효과/Howler 폴백/관리자 미디어 입력 흐름 등
  - Lane Switch: 39초 미션 달성, 레인 전환 쿨다운(64ms) 체감, 쉴드 소모 시점 체감, 사운드/BGM/일시정지 재개 등
  - Sky Drift Nitro: 니트로 발동 타이밍/충돌 판정/사운드-BGM-볼륨 저장/일시정지 재개
  - Neon Brick Breaker: 반사각 안정성/레벨3 미션/사운드-BGM-볼륨 저장/일시정지 재개
  - Orbit Survivor: 회전-대시 판정/자동사격 가독성/사운드-BGM-볼륨 저장/일시정지 재개
  - Block Sage: 회전/즉시낙하/턴제한 판정, 11라인 미션, 사운드-BGM-볼륨 저장/일시정지 재개
  - Mini Empire Grid: 건설/턴종료/자원수급 판정, 번영 170 미션, 사운드-BGM-볼륨 저장/일시정지 재개
  - Pixel Clash Arena: 4방향 입력/자동사격/대시 무적 판정, 점수 240 미션, 사운드-BGM-볼륨 저장/일시정지 재개
  - Idle Foundry: 자동 생산 주기/업그레이드/오버클럭 판정, 처리량 340 미션, 사운드-BGM-볼륨 저장/일시정지 재개
  - Dash to Core: 비트 타이밍/SYNC 판정/레인 충돌 판정, 코어 1800m 미션, 사운드-BGM-볼륨 저장/일시정지 재개
  - Farm Harbor: 생산/포장/선적 루프 판정, 번영 320 미션, 사운드-BGM-볼륨 저장/일시정지 재개
  - Mecha Sprint: 레인 이동/장애물-아이템 충돌/BOOST 판정, 체크포인트 16 미션, 사운드-BGM-볼륨 저장/일시정지 재개
  - Maze Signal: 타일 회전/경로 판정/스캔-재배열 판정, 링크 4회 미션, 사운드-BGM-볼륨 저장/일시정지 재개
  - Void Raiders: 레인 이동/자동사격/NOVA 판정, 격추 36 미션, 사운드-BGM-볼륨 저장/일시정지 재개
  - Rail Commander: 노선 업그레이드/배차/오버드라이브 판정, 배차 22 미션, 사운드-BGM-볼륨 저장/일시정지 재개

## 다음 액션(권장)
1. `QA_3RUN_LOG_TEMPLATE.md`로 Device A/B 각각 3회 플레이 로그(시간/점수/이상 여부) 작성
2. HOLD 항목 체크 후 `QA_MOBILE_2DEVICES.md` 및 15개 게임 QA 체크리스트 체크박스 최종 마감
3. 신규 3종 + Lane Switch + Block Sage + Mini Empire Grid + Pixel Clash + Idle Foundry + Dash to Core + Farm Harbor + Mecha Sprint + Maze Signal + Void Raiders + Rail Commander 사운드/BGM/일시정지 UX 실기기 검증 로그 반영
4. 완료 시 QA 상태를 `READY_FOR_FINAL_QA`로 전환
