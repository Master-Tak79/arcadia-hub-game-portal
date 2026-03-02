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
- [x] Elite Grunt 구현
- [x] Elite Dasher 구현
- [x] 스폰 테이블 반영
- [x] elite 구분 HUD/로그 반영
- [x] 밸런스 로그 기록(12)
- [x] 게이트에 elite_loop 추가 및 토큰 검증 반영

## Step 2 — Relic System 01 (12종)
- [x] 유물 데이터 구조 추가
- [x] 유물 획득/적용 시스템 추가
- [x] 유물 UI(획득/효과 요약) 추가
- [x] 유물 12종 효과 구현
- [x] OP 조합 완화 규칙 반영
- [x] relic_loop QA 케이스 및 토큰 검증 반영

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

### Step 1 결과 기록
- Step: Elite Pack 01
- 구현 커밋: `338cece` (review pass 기반), `9303bf6`(docs plan), 이번 단계 코드/문서 일괄 커밋 예정
- 자동검증 결과: headless gate PASS (`elite_loop` 포함), pre-manual PASS, leak trace PASS
- 리스크/이슈: elite long_sim 로그량 증가(정보성), 추후 로그 압축 필요 가능
- 다음 Step 진행 승인: 대기 중

### Step 2 결과 기록
- Step: Relic System 01 (12종)
- 구현 커밋: 이번 단계 코드/문서 일괄 커밋 예정
- 자동검증 결과: headless gate PASS (`relic_loop` 포함), pre-manual PASS, leak trace PASS
- 리스크/이슈: long_sim 로그량 증가(유물/엘리트 토큰 다수 출력), 추후 로그 레벨 옵션 검토 필요
- 다음 Step 진행 승인: 대기 중
