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

## 2026-03-01 17:18 KST
### 오늘 목표
- 미니 보스 1종 + 10분 페이즈 경고/등장 로직 구현

### 진행 내용
- 미니 보스 엔티티(`enemy_miniboss.gd`) 구현
  - 고체력/대형 히트박스/강화 돌진 패턴
  - 접촉 피해 2, 처치 EXP 보상 80
- 미니 보스 디렉터(`miniboss_director.gd`) 구현
  - 기본 10분(`600s`) 페이즈 진입
  - 등장 전 경고(`MINIBOSS_WARNING_DURATION`) 활성화
  - 보스 등장/격파 상태 추적
- HUD 확장
  - 보스 경고 카운트다운 및 ACTIVE 상태 표기
- 전투 시스템 확장
  - 적 개체별 `get_contact_damage`, `get_exp_reward` 반영
- 테스트 보조 모드
  - `--boss-test` (보스 등장 시점 12초 오버라이드)
  - `--auto-levelup` (헤드리스 QA 시 자동 1번 선택)

### 이슈/해결
- 이슈: 헤드리스 장시간 테스트에서 레벨업 패널 입력 대기 시 시간 정지
- 해결: `--auto-levelup` 런타임 옵션으로 자동 선택 경로 추가

### 검증 결과
- `./scripts/godotw --headless --path ./games/godot-relic-survivor --quit-after 900` 통과
- `./scripts/godotw --headless --path ./games/godot-relic-survivor --fixed-fps 60 --quit-after 1800 -- --boss-test --auto-levelup`
  - `MINIBOSS_WARNING_ON`
  - `MINIBOSS_SPAWNED`
  확인

### 다음 액션
- 미니 보스 스킬 패턴 1종 추가(원형 탄막 또는 소환 패턴)
- 보스 처치/실패 시 연출 및 리워드 UX 보강

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

## 2026-03-01 17:31 KST
### 오늘 목표
- 미니보스 패턴 확장(추가 1종) + 보스 처치 루프 검증 완료

### 진행 내용
- 미니보스 패턴 확장:
  - 소환 패턴 추가(`enemy_miniboss.gd`)
  - 주기적으로 Grunt/Dasher 소환
- 미니보스 디렉터 강화(`miniboss_director.gd`):
  - 보스 격파 상태(`was_boss_defeated`) 추적
  - 테스트용 HP 스케일 오버라이드 지원
- 게임 루프 테스트 보강(`game_root.gd`):
  - `--boss-test`에서 QA 부스트(보스 처치 루프 재현성 강화)
  - `--auto-levelup` 자동 선택 우선순위 로직(딜 중심)
- HUD 확장:
  - 보스 격파 시 `✅ MINIBOSS DEFEATED` 표시

### 이슈/해결
- 이슈: 기본 보스 테스트에서 처치 로그가 재현되지 않음
- 해결: QA 전용 `boss-test boost` + 자동 레벨업 선택 우선순위로 처치 루프 재현

### 검증 결과
- `./scripts/godotw --headless --path ./games/godot-relic-survivor --fixed-fps 60 --quit-after 5400 -- --boss-test --auto-levelup`
  - `MINIBOSS_WARNING_ON`
  - `MINIBOSS_SPAWNED`
  - `MINIBOSS_DEFEATED`
  확인
- 기본 스모크(`--quit-after 900`) 통과

### 다음 액션
- 보스 처치 보상 UX(연출/배너) 보강
- 10분 시뮬레이션 3회 + 수동 QA 3회 진행

## 2026-03-01 18:02 KST
### 오늘 목표
- 보스 처치 UX 보강 + QA 3회 + 전체 리뷰

### 진행 내용
- 보스 처치 UX 보강
  - `event_banner.gd` 추가
  - 보스 등장/처치 배너 표시
  - 보스 처치 보상 적용: `+EXP`, `+HP`
  - 처치 순간 슬로우모션(짧은 타임스케일) 적용
- 미니보스 패턴 확장
  - 소환 패턴 주기(`MINIBOSS_SUMMON_*`) 추가
- QA 모드 고도화
  - `--qa-autopilot` (이동 자동화)
  - `--qa-force-damage`, `--qa-auto-restart` (재시작 루프 검증)
  - `--boss-test`, `--auto-levelup` 유지
- 테스트 실행
  - 10분 시뮬레이션 3회: `--auto-levelup`, `36000프레임 x3`
  - 보스 루프 QA 3회: `--boss-test --auto-levelup --qa-autopilot`, `5400프레임 x3`
  - 재시작 루프 QA: `--qa-force-damage --qa-auto-restart`

### 이슈/해결
- 이슈: 기본 보스 테스트 재현성에서 처치까지 도달하지 못하는 경우 존재
- 해결: QA 전용 보조 모드(보스 HP 스케일/자동 선택 우선순위/자동 이동)로 처치 루프 재현성 확보

### 검증 결과
- 보스 루프 로그 확인:
  - `MINIBOSS_WARNING_ON`
  - `MINIBOSS_SPAWNED`
  - `MINIBOSS_DEFEATED`
  - `BOSS_CLEAR_REWARD_APPLIED`
- 10분 시뮬레이션 3회 비정상 종료 없음
- 재시작 루프 자동 검증 반복 통과

### 전체 리뷰(미비점)
- [ ] **수동 조작감 QA 3회**(실플레이) 미완료
- [ ] **적 2종 패턴 체감 밸런스**(초/중/후반) 추가 튜닝 필요
- [ ] **보스 처치 연출 폴리싱**(시각/사운드/카메라 강조) 개선 여지
- [ ] `game_root.gd` 파일 길이 증가(300+ 라인)로 차기 리팩터링 필요

### 다음 액션
- 수동 실플레이 QA 3회(조작감/난이도 체감) 수행
- 보스 연출 폴리싱(배너/효과음/화면 연출)
- `game_root`를 라운드/QA/보스 리워드 모듈로 분리 리팩터링
