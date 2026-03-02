# 18_content_expansion_checklist

## 공통 체크리스트 (각 Step 공통)
- [ ] 구현 범위 코드 반영
- [ ] 관련 데이터 테이블 업데이트
- [ ] HUD/피드백/UI 가독성 점검
- [ ] `headless-alpha-gate.sh` PASS
- [ ] `trace-objectdb-leak.sh` PASS
- [ ] `pre-manual-qa-check.sh` PASS
- [ ] `checkpoint-report.sh` 생성/갱신 확인
- [ ] 문서 동기화(04/05/06/10/12/13/README)
- [ ] 커밋 메시지에 Step 번호/핵심 변경 명시

---

## Step 1 — Elite Pack 01
- [ ] Elite Grunt 구현
- [ ] Elite Dasher 구현
- [ ] 스폰 테이블 반영
- [ ] elite 구분 HUD/로그 반영
- [ ] 밸런스 로그 기록(12)

## Step 2 — Relic System 01 (12종)
- [ ] 유물 데이터 구조 추가
- [ ] 유물 획득/적용 시스템 추가
- [ ] 유물 UI(획득/효과 요약) 추가
- [ ] 유물 12종 효과 구현
- [ ] OP 조합 완화 규칙 반영

## Step 3 — Stage Event Pack 01 (3종)
- [ ] 안개 이벤트
- [ ] 감속지대 이벤트
- [ ] 전류지대 이벤트
- [ ] 이벤트 텔레그래프/안전장치 반영
- [ ] death recap 이벤트 원인 구분 반영

## Step 4 — Boss Phase 2 Upgrade
- [ ] 페이즈 전환 조건/상태 구현
- [ ] 전환 연출/안전구간 반영
- [ ] 페이즈2 패턴 2종 이상 반영
- [ ] boss-pattern 게이트 확장
- [ ] 수동 QA 런시트에 phase2 항목 추가

---

## 결과 기록 템플릿
- Step:
- 구현 커밋:
- 자동검증 결과:
- 리스크/이슈:
- 다음 Step 진행 승인:
