# 15_merge_handover_checklist

## Current decision snapshot
- 권장 경로: **`v0.1.0-alpha-candidate`로 선머지 후 수동 QA 완료 시 `v0.1.0-alpha` 확정 태깅**
- 사유: 자동검증/문서/가드레일은 완료, 수동 체감 QA와 GUI FPS 실측은 보류 상태

## Pre-merge
- [x] 자동 검증 로그 확보 (스모크/보스/재시작/장시간)
- [x] 원클릭 게이트 스크립트 확보 (`tools/qa/headless-alpha-gate.sh`)
- [x] warning/leak 심화 추적 스크립트 확보 (`tools/qa/trace-objectdb-leak.sh`)
- [x] 수동 QA 전 readiness 스크립트 확보 (`tools/qa/pre-manual-qa-check.sh`)
- [x] 체크포인트 리포트 스크립트 확보 (`tools/qa/checkpoint-report.sh`)
- [x] 개발문서 동기화 (`04`, `05`, `06`, `10`, `13`, `14`, `16`)
- [x] 밸런스 변경 이력 기록 (`12_balance_tuning_log.md`)
- [x] PR 오픈 완료: https://github.com/Master-Tak79/arcadia-hub-game-portal/pull/74
- [ ] 수동 QA 3회 완료
- [ ] GUI FPS 실측 완료

## Merge decision
- [x] `v0.1.0-alpha-candidate`로 merge 준비 완료
- [ ] 수동 QA 후 `v0.1.0-alpha`로 확정 merge/tag

## Merge command notes (manual)
1. PR 생성/갱신 시 본문: `14_pr_description_alpha_candidate.md` 사용
2. merge 전 최신 자동검증 실행:
   - `cd games/godot-relic-survivor && ./tools/qa/headless-alpha-gate.sh`
   - (포함 시나리오: `boss_pattern`)
3. 필요 시 leak 추적:
   - `./tools/qa/trace-objectdb-leak.sh`
4. 수동 QA 직전 준비 체크:
   - `./tools/qa/pre-manual-qa-check.sh`
5. 체크포인트 리포트 생성(핸드오프 첨부용):
   - `./tools/qa/checkpoint-report.sh`
6. merge 후 릴리즈 노트에 `alpha-candidate` 상태 유지 명시

## Post-merge
- [ ] 태그/릴리즈 노트 갱신 (`alpha-candidate` 또는 `alpha`)
- [ ] 다음 마일스톤(M3 polish) 작업 브랜치 분기
- [ ] 잔여 리스크(연출 폴리싱/체감 난이도 미세조정) 이관
- [ ] 수동 QA 결과 문서 반영 (`04`, `05`, `06`, `13`)
