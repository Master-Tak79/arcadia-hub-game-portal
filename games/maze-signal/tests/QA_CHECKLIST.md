# Maze Signal QA Checklist (0.3.44)

## 자동 점검
- [x] `./scripts/meteor-smoke-check.sh` 통과

## 수동 기능 점검
- [ ] 시작/재시작 정상 동작
- [ ] 타일 탭 회전 입력 정상
- [ ] 링크 판정(IN→OUT) 및 라운드 리셋 정상
- [ ] 스캔 발동/쿨다운/경로 하이라이트 정상
- [ ] 재배열(R) 동작 및 회전 수 차감 정상
- [ ] 회전 수 소진 시 게임오버 판정 정상
- [ ] 미션(링크 4회) 보너스(+120) 정상
- [ ] 설정 패널(효과/진동/사운드/BGM/볼륨) 저장 정상
- [ ] 일시정지/재개(P 버튼/상단 버튼) 동작 정상

## 실기기 점검 기록
| Date | Device | Browser | Result | Notes |
| --- | --- | --- | --- | --- |
| 2026-02-26 | Galaxy A24 Ultra | Chrome / Edge / Samsung Internet | PENDING | 신규 로컬 전환 게임 실기기 확인 필요 |
