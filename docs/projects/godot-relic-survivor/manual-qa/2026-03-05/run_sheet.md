# Manual QA Run Sheet (2026-03-05)

## Run A — 조작감 (0~5분)
- 조작감 점수(1~5): 미진행(타이틀 메뉴 대기 상태)
- 문제/재현 스텝: N/A
- 스크린샷:

## Run B — 성장/웨이브 (0~10분)
- 성장 리듬 점수(1~5): 미진행
- 웨이브 완급 점수(1~5): 미진행
- 문제/재현 스텝: N/A
- 스크린샷:

## Run C — 보스 (10분)
- 패턴 가독성 점수(1~5): 미진행
- 공정성 점수(1~5): 미진행
- CROSS/recovery 체감 메모: 미진행
- 문제/재현 스텝: N/A
- 스크린샷:

## FPS 실측
- 명령:
  - `tools/qa/manual-qa-runbook.sh --fps-probe`
  - `tools/qa/manual-fps-summary.sh <fps-probe.log>`
- 평균 FPS: 6.2 (menu idle probe, 1차: 20260305-201519)
- 최저 FPS: 1.0
- 최대 FPS: 9.0
- 샘플 수: 6392
- 2차 세션(20260305-212529): avg 6.3 / min 1.0 / max 8.0 / samples 2550 (menu idle probe)
- 3차 세션(20260305-223216): avg 6.2 / min 1.0 / max 10.0 / samples 15047 (menu idle probe)

## 종합
- 알파 확정 가능 여부: NO (Run A/B/C 미완료)
- 보완 필요 항목: TITLE_MENU_START 미검출 상태로 플레이 구간 로그 부재. Run A/B/C 재실행 필요
