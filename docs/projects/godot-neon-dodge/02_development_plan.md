# 02_development_plan — Godot Neon Dodge

## 목표
- v0.1 플레이어블(핵심 루프 + HUD + 게임오버) 완성

## 작업 분해(WBS)
- [x] 프로젝트/문서 초기화
- [x] 코어 모듈 구조 설계
- [ ] PlayerController + Dash
- [ ] EnemySpawner + ChaserAI
- [ ] Score/Timer 시스템
- [ ] HUD/게임오버 UI
- [ ] 밸런스 튜닝 + QA 체크

## 코드 구조 계획
- `scripts/core/`: 게임 루프/상태/시그널
- `scripts/entities/`: Player, Enemy
- `scripts/systems/`: 스포너, 스코어, 충돌 처리
- `scripts/ui/`: HUD, GameOverPanel
- `data/`: 밸런스 상수/설정

## 일정(초안)
- D1: 아키텍처/플레이어/스포너 뼈대
- D2: 점수/HUD/게임오버 연결
- D3: 밸런스/QA/릴리즈 정리

## 검증 계획
- 자동: headless 실행 스모크
- 수동: 3회 이상 5분 플레이, 난이도 체감 기록

## 보고 계획
- 중간 보고: 단계 완료마다 + 장기 작업 10분 간격
- 완료 보고: 반영 사항/검증 결과/리스크/다음 액션
