# Godot Neon Dodge (v0.1.0-dev)

모듈형 구조를 기준으로 구축된 Godot 2D 탑다운 회피 프로젝트입니다.

## 구조

- `scenes/Main.tscn` — 메인 씬
- `scripts/core/` — 루프/상태/시그널
- `scripts/entities/` — 플레이어/적 엔티티
- `scripts/systems/` — 스폰/스코어 시스템
- `scripts/ui/` — HUD
- `scripts/data/` — 밸런스 상수

## 조작

- 이동: `WASD` 또는 방향키
- 대시: `Space`
- 재시작(게임오버 후): `R`

## 실행

```bash
# 프로젝트 폴더에서
../../scripts/godotw --path .

# 헤드리스 스모크
../../scripts/godotw --headless --path . --quit-after 360
```

## 현재 상태

- v0.1.0-dev 플레이어블 루프 1차 연결 완료
- 다음 단계: 수동 플레이테스트 기반 난이도/피격 체감 밸런싱
