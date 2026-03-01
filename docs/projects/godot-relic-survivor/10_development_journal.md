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
- 보스 처치 직후 회복 구간(post-boss recovery) 추가
- 수동 QA 및 튜닝 이력 문서 추가
  - `11_manual_qa_protocol.md`
  - `12_balance_tuning_log.md`
- Alpha 준비 문서 추가
  - `13_alpha_readiness_report.md` (자동검증 기준 alpha-candidate)
  - `14_pr_description_alpha_candidate.md` (PR 본문 템플릿, 실사용 확정본)
  - `15_merge_handover_checklist.md` (머지/인수인계 체크리스트, 결정형)
