# Godot Relic Survivor (v0.1.0-dev)

탑다운 로그라이크 생존 액션 신규 프로젝트입니다.
현재 코어 전투 루프(이동/대시/자동공격/적 2종 스폰/피격/재시작) 1차 구현 상태입니다.

## 조작
- 이동: `WASD` 또는 방향키
- 대시: `Shift`
- 재시작: `R`

## 실행
```bash
../../scripts/godotw --path .
../../scripts/godotw --headless --path . --quit-after 360
```

## 구조
- `scenes/` 메인 씬
- `scripts/core/` 상태/루프/입력
- `scripts/entities/` 플레이어/적/투사체
- `scripts/systems/` 스폰/전투/성장 시스템
- `scripts/ui/` HUD/패널
- `scripts/data/` 밸런스 데이터
