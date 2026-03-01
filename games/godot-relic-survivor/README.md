# Godot Relic Survivor (v0.1.0-dev)

탑다운 로그라이크 생존 액션 신규 프로젝트입니다.
현재 코어 전투 루프(이동/대시/자동공격/적 2종 스폰/피격/재시작) 1차 구현 상태입니다.

## 조작
- 이동: `WASD` 또는 방향키
- 대시: `Shift`
- 재시작: `R`
- 레벨업 선택: `1 / 2 / 3`

## 실행
```bash
../../scripts/godotw --path .
../../scripts/godotw --headless --path . --quit-after 360

# 보스 테스트 모드(경고/등장/처치 검증)
../../scripts/godotw --headless --path . --fixed-fps 60 --quit-after 5400 -- --boss-test --auto-levelup --qa-autopilot

# 10분 안정성 시뮬레이션
../../scripts/godotw --headless --path . --fixed-fps 60 --quit-after 36000 -- --auto-levelup

# 재시작 루프 QA
../../scripts/godotw --headless --path . --fixed-fps 60 --quit-after 3000 -- --qa-force-damage --qa-auto-restart
```

## 구조
- `scenes/` 메인 씬
- `scripts/core/` 상태/루프/입력
- `scripts/entities/` 플레이어/적/투사체
- `scripts/systems/` 스폰/전투/성장 시스템
- `scripts/ui/` HUD/패널
- `scripts/data/` 밸런스 데이터

## 프로젝트 문서
- `docs/projects/godot-relic-survivor/00_game_blueprint.md`
- `docs/projects/godot-relic-survivor/01_gdd.md`
- `docs/projects/godot-relic-survivor/02_development_plan.md`
- `docs/projects/godot-relic-survivor/03_roadmap.md`
- `docs/projects/godot-relic-survivor/04_devlog.md`
- `docs/projects/godot-relic-survivor/05_qa_checklist.md`
- `docs/projects/godot-relic-survivor/06_release_notes.md`
- `docs/projects/godot-relic-survivor/07_dev_guidelines.md`
- `docs/projects/godot-relic-survivor/08_update_guidelines.md`
- `docs/projects/godot-relic-survivor/09_asset_register.md`
- `docs/projects/godot-relic-survivor/10_development_journal.md`
- `docs/projects/godot-relic-survivor/11_manual_qa_protocol.md`
- `docs/projects/godot-relic-survivor/12_balance_tuning_log.md`
