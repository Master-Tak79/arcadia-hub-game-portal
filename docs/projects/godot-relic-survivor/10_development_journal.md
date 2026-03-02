# 10_development_journal — Godot Relic Survivor

> 본 문서는 의사결정 중심 요약 일지입니다.
> 세부 작업 로그는 `04_devlog.md`를 기준으로 관리합니다.

## 2026-03-01

### 방향 결정
- 기존 `Godot Neon Dodge`는 아카이브로 전환
- 신규 프로젝트 `Godot Relic Survivor` 착수
- 장르 확정: 탑다운 로그라이크 생존 액션

### 품질/운영 원칙
- 15년차 베테랑 수준 품질 기준 준수
- 문서 우선 개발(설계→구현→검증→회고)
- 에셋은 D 드라이브 우선 보관/활용

### 구현 진척
- 코어 전투 루프 1차 구축(자동공격/발사체/적2종)
- EXP/레벨업 3지선다 + 업그레이드 12종 데이터 모델 구축
- 미니 보스 1종 + 10분 페이즈 경고/등장/격파 루프 구축
- 미니보스 추가 패턴(소환) 반영
- 보스 처치 UX 1차(배너/보상/슬로우모션) 반영
- 헤드리스 스모크 + 장시간 시뮬레이션 통과

### 리뷰 결과(보완 필요)
- 실수동 조작감 QA 3회는 아직 미진행
- 보스 패턴 체감 난이도 2차 튜닝 필요

### 리뷰 후 보완 완료
- `game_root` 책임 분리 1차 완료
  - `runtime_options`, `qa_runtime`, `boss_reward_runtime` 분리
- 밸런스 2차 튜닝 완료(적 압박/스폰 곡선/보스 패턴 완화)
- 밸런스 3차 미세 튜닝(페이즈 기반 스폰/Dasher 확률 보정)
- 스폰 캡(soft/hard) 도입으로 장시간 안정성 보강
- 보스 루프/재시작 루프/장시간 루프 회귀 검증 재통과
- 이벤트 배너 2차 폴리싱 완료
- 카메라 FX(경고/등장/처치 임팩트) 추가
- 보스 페이즈 스폰 가드레일 추가
- 사운드 슬롯 구조(`audio/sfx_slots.gd`) 및 보스 이벤트 훅 연결
- 보스 SFX 3종 generated 자산 주입 완료(Warning/Spawn/Defeat, v2 튜닝)
- SFX 프리셋 옵션화(default/quiet/hype) + 이벤트 타이밍 딜레이 적용
- 보스 처치 직후 회복 구간(post-boss recovery) 추가
- 후반 웨이브 6차 미세 튜닝(곡선 잠금)
- `16_alpha_candidate_quality_lock.md`로 품질 잠금 기준 문서화
- 업그레이드 16종 확장(복합 효과 4종 포함)
- 수동 QA 및 튜닝 이력 문서 추가
  - `11_manual_qa_protocol.md`
  - `12_balance_tuning_log.md`
- Alpha 준비 문서 추가
  - `13_alpha_readiness_report.md` (자동검증 기준 alpha-candidate)
  - `14_pr_description_alpha_candidate.md` (PR 본문 템플릿, 실사용 확정본)
  - `15_merge_handover_checklist.md` (머지/인수인계 체크리스트, 결정형)

## 2026-03-01 (Upgrade Offer Stabilization)

### 반영
- 업그레이드 제안 로직을 가중치 기반으로 전환
- 복합 효과 업그레이드의 조기 과다 노출을 완화

### 검증
- 스모크/보스 루프/5분 회귀 통과

## 2026-03-02 (Headless Gate Automation)

### 반영
- 헤드리스 검증 신뢰도 강화를 위해 원클릭 게이트 스크립트 추가
  - `games/godot-relic-survivor/tools/qa/headless-alpha-gate.sh`
  - 시나리오: smoke → boss_loop → restart_loop → long_sim
  - 토큰 검증: `RELIC_SURVIVOR_BOOT_OK`, `MINIBOSS_*`, `BOSS_CLEAR_REWARD_APPLIED`, `QA_FORCE_*`
- 실행 로그 보관 규칙 추가
  - `.qa/headless/<timestamp>/*.log`

### 검증
- `./tools/qa/headless-alpha-gate.sh` 통과
- 수동 QA/FPS 실측 보류 상태는 유지(알파 확정 조건 미충족)

### 메모
- 장시간 종료 시 `ObjectDB instances leaked at exit` 경고가 간헐 노출되어 추적 후보로 등록

## 2026-03-02 (Leak Trace + Pre-Manual QA Readiness)

### 반영
- `ObjectDB instances leaked at exit` 경고 추적 수행
  - `tools/qa/trace-objectdb-leak.sh` 추가(Verbose long sim + leak summary 추출)
- headless 환경 오디오 안전모드 적용
  - `scripts/audio/sfx_slots.gd`에서 headless 시 스트림 로드/재생 비활성화
  - 런타임 로그 `SFX_HEADLESS_MODE_ON` 추가
- 수동 QA 직전 점검 자동화
  - `tools/qa/pre-manual-qa-check.sh` 추가(문서/도구/최근 게이트 상태 확인)

### 검증
- `./tools/qa/headless-alpha-gate.sh` 재실행 통과
  - warnings=0, leak_lines=0
- `./tools/qa/trace-objectdb-leak.sh` 실행
  - leak-summary 기준 `Leaked instance` 미검출
- `./tools/qa/pre-manual-qa-check.sh` 통과

### 결정
- 실측 전까지는 headless 기준선 안정화 유지
- 알파 확정 게이트는 기존과 동일(수동 QA 3회 + GUI FPS 실측)
