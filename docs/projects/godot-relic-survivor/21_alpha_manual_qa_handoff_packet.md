# 21_alpha_manual_qa_handoff_packet

## 목적
- `v0.1.0-alpha-candidate` 상태에서 **수동 QA 3회 + GUI FPS 실측**을 빠르게 수행하기 위한 핸드오프 패킷.
- 자동검증 완료 산출물과 수동 검증 체크포인트를 한 문서로 고정.

## 기준 버전/브랜치
- 게임 버전: `v0.1.33-dev`
- 브랜치: `feat/relic-survivor-bootstrap`
- PR: https://github.com/Master-Tak79/arcadia-hub-game-portal/pull/74

## 자동검증 최신 증적 (Step 22-B 이후)
- Headless gate PASS:
  - `.qa/headless/20260305-214726`
  - `warnings=0`, `leak_lines=0`
  - warning summary: `.qa/headless/20260305-214726/warnings-summary.txt`
- Checkpoint report:
  - `.qa/reports/checkpoint-20260305-214930.md`
- Leak trace summary:
  - `.qa/leak-trace/20260305-214930/leak-summary.txt`
- Balance freeze:
  - `./tools/qa/balance-freeze-check.sh` PASS

## 수동 QA 실행 커맨드
```bash
cd /mnt/c/TAK_Projects/Game/godot-relic-survivor/games/godot-relic-survivor
./tools/qa/pre-manual-qa-check.sh
../../scripts/godotw --path .
# FPS 측정 보조
../../scripts/godotw --path . -- --fps-probe
# 또는 runbook 사용
./tools/qa/manual-qa-runbook.sh --fps-probe
./tools/qa/manual-fps-summary.sh .qa/manual/<timestamp>/fps-probe.log
```

## 수동 QA 실행 순서 (필수)
1. Run A — 조작감 중심 (0~5분)
2. Run B — 성장/웨이브 중심 (0~10분)
3. Run C — 보스 페이즈 중심 (10분)

상세 체크 항목은 `11_manual_qa_protocol.md` 기준.

## 이번 라운드에서 반드시 확인할 신규 항목 (Step 22-A/22-B)
- 보스 CROSS 소환 패턴 가독성/회피 가능성
- 보스 소환 패턴 연속 반복 완화 체감(repeat penalty)
- 보스 소환 직후 recovery window 공정성 체감
- 유물 세트 보너스 발동 체감(`RELIC_SET_BONUS:*`)
- 이벤트 반복 완화 체감(동일 이벤트 연속 빈도)

## 기록 템플릿 (실행자 작성)
- Run A 결과:
  - 조작감 점수(1~5):
  - 문제/재현 스텝:
- Run B 결과:
  - 성장/웨이브 리듬 점수(1~5):
  - 문제/재현 스텝:
- Run C 결과:
  - 보스 패턴 공정성 점수(1~5):
  - 문제/재현 스텝:
- FPS 실측:
  - 평균 FPS:
  - 최저 FPS:
  - 적 최대 동시 수(대략):

## 스크린샷/증적 파일 권장 경로
- 폴더(권장):
  - `docs/projects/godot-relic-survivor/manual-qa/2026-03-05/`
- 파일명 예시:
  - `runA-controls.png`
  - `runB-levelup-history.png`
  - `runC-boss-cross-telegraph.png`
  - `runC-boss-recovery-window.png`
  - `options-persistence.png`

- 최근 수집 세션:
  - 1차: `.qa/manual/20260305-201519/fps-probe.log` (menu idle, 플레이 구간 미포함)
  - 2차: `.qa/manual/20260305-212529/fps-probe.log` (menu idle, 플레이 구간 미포함)

## Alpha 확정 게이트
아래 조건 충족 시 `v0.1.0-alpha` 확정 태깅:
1. 수동 QA 3회 완료
2. GUI FPS 실측 완료
3. `05/06/13/15` 문서 최종 동기화

## 비차단 노이즈(참고)
- 환경별 입력 매핑 경고(`Unrecognized output string "misc2"`)는 기존과 동일하게 비차단.
