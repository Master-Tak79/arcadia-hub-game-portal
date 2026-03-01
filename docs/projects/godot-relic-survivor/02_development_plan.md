# 02_development_plan — Godot Relic Survivor

## 목표
- v0.1.0-dev: 10분 플레이 가능한 코어 루프 구축

## 작업 분해(WBS)
- [x] 프로젝트/문서 초기화
- [ ] 코어 루프(이동/자동공격/피격)
- [ ] 적 2종 + 스폰 디렉터
- [ ] EXP/레벨업 3지선다
- [ ] 미니 보스 1종
- [ ] HUD/일시정지/게임오버
- [ ] 밸런스 1차 + QA 3회

## 코드 구조 계획
- `scripts/core/`: 게임 루프/상태/시그널/모드
- `scripts/entities/`: Player/Enemy/Projectile/Boss
- `scripts/systems/`: Spawn/Combat/Experience/Upgrade/Wave
- `scripts/ui/`: HUD/LevelUpPanel/PausePanel/GameOverPanel
- `scripts/data/`: 밸런스 및 업그레이드 데이터

## 일정(초안)
- D1: 베이스 구조 + 플레이어/공격/기본 적
- D2: 레벨업 선택 + 웨이브 + HUD
- D3: 보스 + 밸런스 + QA

## 검증 계획
- 자동: headless 스모크 + 10분 fixed-fps 시뮬레이션
- 수동: 3회 플레이(초반/중반/보스 페이즈 체감 기록)

## 보고 계획
- 단계별 중간 보고 + 완료 보고
- 주요 결정/변경 즉시 문서 및 메모 반영
