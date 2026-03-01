# 08_update_guidelines — Godot Relic Survivor

## 목적

업데이트(기능 추가/수정/패치) 시 버전, 문서, 검증, 보고를 일관되게 유지하기 위한 운영 지침입니다.

## 1) 버전 정책

- `v0.1.0-dev` : 개발 중 기능 통합 단계
- `v0.1.0-alpha` : 핵심 루프 플레이 가능 + 기본 QA 통과
- `v0.1.0-beta` : 콘텐츠/밸런스 확장 + 성능/회귀 안정화
- `v0.1.0` : 릴리즈 후보 기준 충족

## 2) 업데이트 단위

각 업데이트는 아래 4가지를 1세트로 처리:
1. 코드 반영
2. 검증 실행
3. 문서 갱신
4. 커밋 메시지 표준화

## 3) 문서 갱신 체크

업데이트마다 최소 아래 문서 동기화:
- `04_devlog.md` (무엇을/왜/어떻게 반영했는지)
- `05_qa_checklist.md` (체크 결과)
- `06_release_notes.md` (Added/Changed/Fixed/Verification)

설계 영향이 있으면 추가로:
- `01_gdd.md`
- `02_development_plan.md`
- `03_roadmap.md`

## 4) 검증 프로토콜

- 필수:
  - `godotw --headless --path ./games/godot-relic-survivor --quit-after <n>`
- 주요 전투/스폰 변경 시:
  - `--fixed-fps 60 --quit-after <long-run>`
- 캡처 필요 시:
  - GUI `--write-movie`로 프레임 확보(필요하면 콜라주 보고)

## 5) 커밋/브랜치 가이드

- 브랜치: `feat/<scope>` 또는 `fix/<scope>`
- 커밋 예시:
  - `feat: add level-up choice panel and upgrade data model`
  - `fix: resolve projectile collision edge-case at arena bounds`
  - `docs: update roadmap and qa checklist after wave tuning`

## 6) 보고 포맷

- 중간 보고:
  - 완료 항목(✅)
  - 진행 중 항목
  - 리스크/이슈
  - 다음 액션
- 완료 보고:
  - 반영 요약
  - 검증 결과
  - 문서 반영 내역
  - 커밋/브랜치

## 7) 업데이트 금지 사항

- 검증/문서 미반영 상태로 완료 처리 금지
- 단일 파일 과대화(거대 스크립트) 금지
- 라이선스 출처 미기록 에셋 반입 금지
