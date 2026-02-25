# QA_MOBILE_2DEVICES

목표: 모바일 실기기 2대 기준으로 포털 + 내장 게임(Meteor Dodge, Lane Switch, Sky Drift Nitro, Neon Brick Breaker, Orbit Survivor) 핵심 동작을 점검합니다.

## 기기 정보
| Slot | Device | OS | Browser/App | Owner |
| --- | --- | --- | --- | --- |
| A | Galaxy (사용자 실기기) | TBD | Telegram in-app browser | User |
| B | Galaxy A24 Ultra | Android (TBD) | Chrome / Edge / Samsung Internet | User |

## 공통 점검 항목 (기기별)
- [ ] 포털 첫 진입 로딩 3초 이내(체감 기준)
- [ ] 모바일 2열 카드 가독성(제목/메타/버튼) 문제 없음
- [ ] 카드 탭/스크롤 시 오터치/밀림 없음
- [ ] Featured / 최근 업데이트 / 게임 목록 이동 흐름 정상

## Meteor Dodge 점검 (기기별)
- [ ] 3회 플레이(각 60초 이상) 중 조작 누락 없음
- [ ] 일시정지/재개 정상
- [ ] 아이템 효과(코인/쉴드/슬로우/자석/더블/오버드라이브) 체감 동작 정상
- [ ] 게임오버 오버레이(점수/최고점/시간) 정상

## Lane Switch 점검 (기기별)
- [ ] 3회 플레이(각 60초 이상) 중 레인 전환 누락 없음
- [ ] 미션(42초) 완료 보너스 정상
- [ ] 쉴드 획득/소모 정상
- [ ] 게임오버 오버레이(점수/최고점) 정상

## Sky Drift Nitro 점검 (기기별)
- [ ] 3회 플레이(각 60초 이상) 중 조작 누락/급격한 프레임 저하 없음
- [ ] 니트로 획득/발동/쿨다운 체감 정상
- [ ] 일시정지/재개(P 버튼/상단 버튼) 정상
- [ ] 사운드/BGM/볼륨 설정 저장 정상

## Neon Brick Breaker 점검 (기기별)
- [ ] 3회 플레이(각 60초 이상) 중 반사각/충돌 판정 이상 없음
- [ ] 레벨업/미션 보상(레벨3) 정상
- [ ] 일시정지/재개(P 버튼/상단 버튼) 정상
- [ ] 사운드/BGM/볼륨 설정 저장 정상

## Orbit Survivor 점검 (기기별)
- [ ] 3회 플레이(각 60초 이상) 중 회전/대시/자동사격 판정 이상 없음
- [ ] 60초 미션 보상 정상
- [ ] 일시정지/재개(P 버튼/상단 버튼) 정상
- [ ] 사운드/BGM/볼륨 설정 저장 정상

## 실행 로그
| Date | Device Slot | Area | Result | Notes |
| --- | --- | --- | --- | --- |
| 2026-02-25 | A | Portal + Meteor + Lane | PASS(사용자 보고) | 사용자 피드백 기준 "문제 없는듯" |
| 2026-02-25 | B | Portal + Meteor + Lane | PASS(사용자 실행) | Galaxy A24 Ultra에서 Chrome/Edge/Samsung Internet 실행 확인(이슈 미보고) |
| 2026-02-25 | A/B | Sky Drift + Brick Breaker + Orbit Survivor | PENDING | 신규 3종 게임 실기기 점검 로그 수집 필요 |

## 완료 기준
- Slot A/B 모두에서 공통 + 게임별 필수 체크 PASS
- 치명 이슈 0건, 중간 이슈는 우선순위/재현 절차 기록

## 정량 로그 템플릿
- `QA_3RUN_LOG_TEMPLATE.md`를 사용해 기기별/게임별 3회(각 60초 이상) 실행 기록을 남깁니다.

## 현재 판정 (2026-02-25)
### ✅ PASS
- Slot A/B 모두 실행 확인됨
- Device-B(`Galaxy A24 Ultra`) 브라우저 3종(Chrome/Edge/Samsung Internet) 실행 확인

### ⏸ HOLD
- 체크리스트의 정량 항목(예: 기기별 3회 플레이/60초 이상) 증빙 로그 추가 필요
- 세부 체감 항목(가독성/오터치/입력 누락) 항목별 체크박스 최종 마감 필요

상세 요약은 `QA_FINAL_STATUS.md` 참조.
