# Meteor Dodge QA Checklist (0.3.0)

## 자동 점검
- [ ] `./scripts/meteor-smoke-check.sh` 통과

## 수동 기능 점검
- [ ] 게임 시작/일시정지/재개/재시작 정상 동작
- [ ] 난이도 변경 시 라운드 리셋 + 난이도별 최고점 분리 표시
- [ ] 운석 패턴 2종(직진/가속) 시각적으로 구분 가능
- [ ] 60초 생존 미션 완료 시 배너/보너스 점수 반영
- [ ] 게임오버에 최근 점수/최고점/플레이시간 표시
- [ ] 설정 패널(효과음/진동/볼륨) 변경값 유지(localStorage)
- [ ] Howler 차단 환경에서도 효과음(HTMLAudio 폴백) 동작

## 모바일 실기기 점검 기록
| Date | Device | Browser | Result | Notes |
| --- | --- | --- | --- | --- |
| 2026-02-24 | Galaxy (사용자 실기기) | Telegram in-app browser | PASS | 하단 버튼 노출/조작 정상 사용자 확인 |
| 2026-02-24 | TBD (2nd device) | TBD | PENDING | 실기기 1대 추가 확인 필요 |
