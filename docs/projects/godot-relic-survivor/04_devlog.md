# 04_devlog — Godot Relic Survivor

> 보조 요약 문서: `10_development_journal.md`

## 2026-03-01 15:53 KST
### 오늘 목표
- 기존 프로토타입 아카이브 후 신규 프로젝트 재시작

### 진행 내용
- `Godot Neon Dodge`를 사용자 요청에 따라 archive로 이동 보관
- 신규 프로젝트 `Godot Relic Survivor` 문서 세트 생성
- 프로젝트 인덱스 갱신(archived + in-progress)

### 이슈/해결
- 없음

### 검증 결과
- 문서 경로/인덱스 반영 확인

### 다음 액션
- Godot 프로젝트 모듈형 베이스 생성
- headless 스모크 검증

## 2026-03-01 16:02 KST
### 오늘 목표
- 신규 프로젝트 코어 베이스 + 실행 검증

### 진행 내용
- 모듈형 구조 초기화:
  - `scripts/core`: `game_root`, `game_state`, `signal_bus`, `input_actions`
  - `scripts/entities`: `player`
  - `scripts/systems`: `spawn_director`
  - `scripts/ui`: `arena_background`, `hud`
  - `scripts/data`: `balance`
- 최소 플레이 루프(이동/대시/킬 카운트 증가/재시작) 베이스 연결

### 이슈/해결
- 없음

### 검증 결과
- `./scripts/godotw --headless --path ./games/godot-relic-survivor --quit-after 360` 통과
- `mcporter call godot-local.godot_run_headless projectPath=games/godot-relic-survivor quitAfter:360` 통과

### 다음 액션
- 자동공격 + 발사체 충돌 시스템 추가
- 적 2종(기본/돌진) 실체 구현

## 2026-03-01 16:16 KST
### 오늘 목표
- 코어 전투 루프 1차 구현 (자동공격 + 적 2종)

### 진행 내용
- `ProjectileContainer` 추가 및 발사체 엔티티(`projectile.gd`) 구현
- 자동공격 시스템(`auto_attack_system.gd`) 구현
  - 최근접 적 탐색
  - 사거리/공격속도 기반 발사체 자동 발사
- 전투 시스템(`combat_system.gd`) 구현
  - 발사체-적 충돌 판정/피해/처치 카운트
  - 적-플레이어 충돌 판정/무적시간/사망 처리
- 적 2종 구현
  - `enemy_grunt.gd`: 추적형
  - `enemy_dasher.gd`: 주기 돌진형
- 스폰 디렉터 고도화(`spawn_director.gd`)
  - 시간 경과 기반 스폰 주기 감소
  - 대셔 스폰 확률 점진 증가
- HUD 확장: ENEMIES/SHOTS 실시간 노출

### 이슈/해결
- 이슈: GDScript 타입 추론 경고가 에러로 처리되어 컴파일 실패
- 해결: `spawn_director.gd`의 확률 변수 타입을 명시(`float` + `clampf`)

### 검증 결과
- `./scripts/godotw --headless --path ./games/godot-relic-survivor --quit-after 600` 통과
- `./scripts/godotw --headless --path ./games/godot-relic-survivor --fixed-fps 60 --quit-after 9000` 통과
- `mcporter call godot-local.godot_run_headless ... quitAfter:900` 통과

### 다음 액션
- EXP/레벨업 3지선다 시스템 구현
- 업그레이드 데이터 구조(12종) 및 UI 패널 추가

## 2026-03-01 17:03 KST
### 오늘 목표
- EXP/레벨업 3지선다 + 업그레이드 데이터 모델 구현

### 진행 내용
- 상태 확장(`game_state.gd`)
  - EXP/레벨업(`exp`, `exp_to_next`, `consume_level_up`)
  - 업그레이드 스택/런타임 모디파이어 관리
- 업그레이드 데이터 정의(`data/upgrades.gd`)
  - 12종 업그레이드(공격/투사체/기동/생존 계열)
- 업그레이드 적용 시스템(`systems/upgrade_system.gd`) 추가
- 레벨업 UI 패널(`ui/level_up_panel.gd`) 추가
  - 숫자키 1/2/3 선택
- 전투 루프 연동
  - 처치 시 EXP 획득
  - 레벨업 조건 충족 시 게임 일시정지 + 선택 패널 오픈
  - 선택 적용 후 게임 재개
- 연계 수정
  - `player.gd`: 업그레이드 기반 이동/대시 쿨다운 동적 반영
  - `auto_attack_system.gd`: 공격 간격/사거리/멀티샷/투사체 스탯 반영
  - `combat_system.gd`: EXP 획득/무적시간 보정 반영
  - `spawn_director.gd`: level-up pause 상태에서 스폰 정지
  - `hud.gd`: HP/MAX_HP, EXP, DASH 상태, level-up 안내 표기

### 이슈/해결
- 없음

### 검증 결과
- `./scripts/godotw --headless --path ./games/godot-relic-survivor --quit-after 900` 통과
- `./scripts/godotw --headless --path ./games/godot-relic-survivor --fixed-fps 60 --quit-after 9000` 통과

### 다음 액션
- 미니 보스 1종 구현
- 수동 QA 3회로 레벨업 선택 체감/밸런스 점검

## 2026-03-01 16:45 KST
### 오늘 목표
- 요청 문서 가시화 및 운영 문서 체계 강화

### 진행 내용
- 사용자 요청 문서(청사진/GDD/개발계획/로드맵/체크리스트) 즉시 공유 준비
- 추가 운영 문서 생성:
  - `07_dev_guidelines.md` (개발 지침)
  - `08_update_guidelines.md` (업데이트 지침)
  - `09_asset_register.md` (에셋 등록대장)
  - `10_development_journal.md` (개발일지 요약본)
- 프로젝트 README에 문서 경로 인덱스 추가

### 이슈/해결
- 없음

### 검증 결과
- 문서 경로/파일 생성 상태 확인

### 다음 액션
- 문서 기준으로 EXP/레벨업 3지선다 구현 착수
