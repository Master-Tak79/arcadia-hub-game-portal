# game_project_template

## 목적
새 게임 프로젝트 시작 시, 기획→구현→검증→문서 동기화를 일관된 품질로 재사용하기 위한 템플릿입니다.

---

## 0) 프로젝트 초기화 체크
- [ ] `docs/projects/<project-name>/` 폴더 생성
- [ ] 기본 문서 생성
  - `00_game_blueprint.md`
  - `01_gdd.md`
  - `02_development_plan.md`
  - `03_roadmap.md`
  - `04_devlog.md`
  - `05_qa_checklist.md`
  - `06_release_notes.md`
  - `07_dev_guidelines.md`
  - `10_development_journal.md`
- [ ] `docs/projects/_index.md`에 프로젝트 1줄 추가
- [ ] 버전 초기값 선언 (`v0.1.0-dev` 등)

---

## 1) 순차 실행 템플릿 (Step 기반)
각 Step은 아래 형식을 고정합니다.

### Step N — <이름>
- 목표:
- 구현 범위:
  - [ ] 코드
  - [ ] 데이터 테이블
  - [ ] UI/HUD/피드백
- 자동 검증 기준:
  - [ ] headless 스모크
  - [ ] 기능별 전용 QA 케이스
  - [ ] 장시간 안정성/누수 확인
- 완료 기준(Definition of Done):
  - [ ] 필수 토큰/로그 확인
  - [ ] 회귀 없음
  - [ ] 문서 동기화 완료

---

## 2) QA 게이트 템플릿
### 공통 명령
```bash
./tools/qa/headless-alpha-gate.sh
./tools/qa/pre-manual-qa-check.sh
./tools/qa/checkpoint-report.sh
./tools/qa/trace-objectdb-leak.sh
```

### 기능 추가 시 규칙
- 새 기능마다 **전용 테스트 플래그** 1개 이상 추가 (예: `--<feature>-test`)
- 게이트 스크립트에 새 루프 케이스 추가
- assert 토큰을 최소 2개 이상 고정
- long_sim에서 `SCRIPT ERROR`, `ERROR:`, `CRASH` 미검출 확인

### 결과 기록 템플릿
- run id:
- warnings:
- leak lines:
- 핵심 토큰 확인:
- 회귀 여부:

---

## 3) 문서 동기화 템플릿
코드 변경 시 아래 문서를 같은 묶음으로 갱신합니다.

- 필수:
  - `02_development_plan.md`
  - `04_devlog.md`
  - `05_qa_checklist.md`
  - `06_release_notes.md`
  - `10_development_journal.md`
- 상황별:
  - `03_roadmap.md` (마일스톤 상태 변경)
  - `12_balance_tuning_log.md` (수치 변경)
  - `13_alpha_readiness_report.md` (게이트/품질 판정 변경)
  - `14_pr_description_*.md` (PR 본문 동기화)
  - `15_merge_handover_checklist.md` (인수인계 기준 업데이트)
  - `16_*_quality_lock.md` (락/예외 변경 시)

---

## 4) 버전/릴리즈 템플릿
- Step 완료 시 patch/minor dev 버전 증가 (예: `v0.1.11-dev` → `v0.1.12-dev`)
- release notes에 다음 3가지를 반드시 기록
  1. 기능 요약
  2. QA 실행/통과 결과
  3. 리스크/후속 확인 포인트

---

## 5) 품질 락(LOCK) 운영 템플릿
- LOCK 기간에는 아래만 허용
  - 컴파일/크래시/치명 회귀 수정
  - QA 신뢰도 개선
  - 문서 보강
- 밸런스/체감 큰 변경은 사용자 승인 + 자동 회귀 + 문서 동기화 후 반영

---

## 6) 최종 핸드오프 템플릿
- [ ] 최신 게이트 PASS 로그 경로 첨부
- [ ] 체크포인트 리포트 최신본 첨부
- [ ] 현재 버전/브랜치 상태 기록
- [ ] 수동 QA 필요 항목 명시
- [ ] 다음 작업 제안 1~2개만 제시

---

## 7) 복붙용 최소 시작 세트
```text
1) 프로젝트 목표/장르/핵심 루프 3줄 정의
2) Step 1~4를 순차형 체크리스트로 먼저 고정
3) QA 게이트에 smoke + feature loop + long sim 넣기
4) 기능마다 test flag와 검증 토큰 만들기
5) 코드/문서/버전/체크포인트를 한 커밋 흐름으로 묶기
```
