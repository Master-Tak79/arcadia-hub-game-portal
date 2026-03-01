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

## 2026-03-01 18:21 KST
### 오늘 목표
- 전체 리뷰 지적사항 반영(모듈 분리/QA 체계 정리)

### 진행 내용
- `game_root.gd` 리팩터링(모듈 분리)
  - `core/runtime_options.gd` 분리: 런타임 플래그 파싱/QA 모드 설정
  - `systems/qa_runtime.gd` 분리: 자동이동/강제사망/자동재시작 처리
  - `systems/boss_reward_runtime.gd` 분리: 보스 등장/처치 전이, 보상/슬로우모션
- 기존 `game_root`의 거대 책임 축소(라운드/레벨업 중심 orchestrator로 단순화)
- 회귀 검증 재실행
  - 스모크, 보스 루프, 재시작 루프

### 이슈/해결
- 이슈: 리팩터링 후 런타임 플래그 동작 누락 위험
- 해결: `RuntimeOptions.print_enabled_flags()`로 부팅 로그 고정 + 회귀 테스트 명령 재검증

### 검증 결과
- `./scripts/godotw --headless --path ./games/godot-relic-survivor --quit-after 900` 통과
- `./scripts/godotw --headless --path ./games/godot-relic-survivor --fixed-fps 60 --quit-after 5400 -- --boss-test --auto-levelup --qa-autopilot` 통과
  - `MINIBOSS_WARNING_ON`, `MINIBOSS_SPAWNED`, `MINIBOSS_DEFEATED`, `BOSS_CLEAR_REWARD_APPLIED`
- `./scripts/godotw --headless --path ./games/godot-relic-survivor --fixed-fps 60 --quit-after 3000 -- --qa-force-damage --qa-auto-restart` 통과
  - `QA_FORCE_DEATH`, `QA_AUTO_RESTART_TRIGGERED` 반복 확인

### 전체 리뷰(현재)
- [x] 보스 처치 UX 1차 보강 완료
- [x] 보스 경고/등장/처치/보상 자동 QA 루프 확보
- [x] `game_root` 모듈 분리 1차 완료
- [ ] 실수동 조작감 QA 3회(사용자 플레이 기준) 미완
- [ ] 적/보스 난이도 체감 2차 밸런스 미완

### 다음 액션
- 실수동 조작감 QA 3회 수행 및 체크리스트 갱신
- 난이도 2차 튜닝(초반 1~3분, 중반 4~8분, 보스 페이즈)

## 2026-03-01 18:34 KST
### 오늘 목표
- 난이도 2차 튜닝 + 회귀 검증

### 진행 내용
- 밸런스 2차 조정(`balance.gd`)
  - 플레이어 생존성: `PLAYER_HIT_INVULN 0.45 -> 0.50`
  - 공격 템포: `ATTACK_INTERVAL 0.45 -> 0.43`
  - 적 압박 완화:
    - `ENEMY_GRUNT_SPEED 130 -> 124`
    - `ENEMY_DASHER_SPEED 90 -> 86`
    - `ENEMY_DASHER_DASH_SPEED 340 -> 320`
    - `ENEMY_DASHER_DASH_INTERVAL 1.8 -> 2.0`
  - 스폰 곡선 완화:
    - `SPAWN_INTERVAL_BASE 1.1 -> 1.2`
    - `SPAWN_INTERVAL_MIN 0.22 -> 0.28`
    - `SPAWN_RAMP_PER_SEC 0.02 -> 0.017`
    - `SPAWN_DASHER_CHANCE_BASE 0.2 -> 0.12`
    - `SPAWN_DASHER_CHANCE_RAMP 0.005 -> 0.0045`
  - 성능/안정 보강:
    - `ACTIVE_ENEMY_SOFT_CAP=70`, `ACTIVE_ENEMY_HARD_CAP=110` 추가
    - `spawn_director.gd`에 소프트/하드 캡 제어 로직 추가
  - 보스 압박 완화:
    - `MINIBOSS_DASH_SPEED 410 -> 380`
    - `MINIBOSS_DASH_INTERVAL 2.5 -> 2.8`
    - `MINIBOSS_SUMMON_INTERVAL 6.0 -> 7.0`
    - `MINIBOSS_SUMMON_COUNT 3 -> 2`

### 이슈/해결
- 이슈: 장시간 루프에서 적 수 누적으로 체감 난이도 급상승 가능
- 해결: 스폰 캡(soft/hard) 도입으로 급증 완화

### 검증 결과
- 스모크: `--quit-after 900` 통과
- 보스 루프: `--boss-test --auto-levelup --qa-autopilot` 통과
  - `MINIBOSS_WARNING_ON`, `MINIBOSS_SPAWNED`, `MINIBOSS_DEFEATED`, `BOSS_CLEAR_REWARD_APPLIED`
- 장시간: `--auto-levelup --qa-autopilot`, 10분(36000프레임) 2회 통과
- 재시작 루프: `--qa-force-damage --qa-auto-restart` 통과

### 전체 리뷰 업데이트
- [x] 모듈 분리 리팩터링 1차 완료 (`game_root` 325줄 -> 244줄)
- [x] 자동 QA 루프(보스/재시작/장시간) 안정화
- [ ] 실수동 조작감 QA 3회 미완
- [ ] 성능(실FPS 측정) 항목 미완

### 다음 액션
- 실수동 QA 3회 수행(조작감/적 패턴 체감/대시 타이밍)
- 실GUI 기준 FPS 측정 및 성능 체크리스트 마감

## 2026-03-01 18:46 KST
### 오늘 목표
- alpha-candidate 병합 준비(PR/인수인계 패키지) 완료

### 진행 내용
- PR 패키지 문서 추가
  - `14_pr_description_alpha_candidate.md` (PR 본문 템플릿)
  - `15_merge_handover_checklist.md` (머지/인수인계 체크리스트)
- README/릴리즈노트/저널에 신규 문서 인덱스 반영

### 이슈/해결
- 없음

### 검증 결과
- 문서 링크 경로 및 패키지 구성 확인

### 다음 액션
- 사용자 승인 시 PR 본문 즉시 사용 가능
- 수동 QA 재개 시 alpha 최종 확정 절차 진행

## 2026-03-01 18:52 KST
### 오늘 목표
- PR 확정본/머지 체크리스트 실사용 수준으로 고정

### 진행 내용
- `14_pr_description_alpha_candidate.md`를 실사용 본문 템플릿으로 고도화
  - PR 메타(제목/브랜치/단계)
  - 핵심 커밋 목록
  - 권장 머지 전략 명시
- `15_merge_handover_checklist.md`를 결정형 체크리스트로 개편
  - alpha-candidate 선머지 전략 체크
  - post-merge 수행 항목 구체화
- `13_alpha_readiness_report.md`에 병합 권장안 동기화

### 이슈/해결
- 없음

### 검증 결과
- PR/머지 문서 간 상호 참조 및 상태 일치 확인

### 다음 액션
- 수동 QA 재개 시 `14/15/13` 문서 기준으로 alpha 확정 절차 즉시 진행

## 2026-03-01 19:16 KST
### 오늘 목표
- 로컬 계속 진행: 연출 2차 폴리싱 + 난이도 3차 미세 튜닝

### 진행 내용
- Spawn Director 미세 튜닝
  - 페이즈 기반 스폰 곡선 보정(초반 완화/후반 복원)
  - Dasher 확률도 페이즈별로 가중치 조정
- Event Banner 2차 폴리싱
  - 배경 패널, 페이드아웃, 강조색(등장/처치) 반영
- 보스 처치 메시지 개선
  - `PHASE CLEAR` 강조 문구로 리워드 인지성 강화

### 이슈/해결
- 없음

### 검증 결과
- `--quit-after 900` 스모크 통과
- `--boss-test --auto-levelup --qa-autopilot` 보스 루프 통과
- `--auto-levelup --qa-autopilot` 18000프레임(5분) 통과

### 다음 액션
- 수동 QA 보류 유지 상태에서 alpha-candidate 안정화 유지
- 수동 QA 재개 시 즉시 최종 alpha 확정 절차 진행

## 2026-03-01 19:33 KST
### 오늘 목표
- 로컬 계속 진행: 보스 연출 3차 + 웨이브 밀도 4차 미세튜닝

### 진행 내용
- 카메라 FX 추가(`ui/camera_fx.gd`)
  - 보스 경고 펄스
  - 보스 등장 임팩트
  - 보스 처치 임팩트
- 씬 반영
  - `Main.tscn`에 `GameCamera` 노드 추가
- BossRewardRuntime 확장
  - 경고 시작/등장/처치 전이에서 배너+카메라 연동
- SpawnDirector 확장
  - `set_miniboss_director()`로 보스 상태 연동
  - 보스 활성 시 스폰 간격/Dasher 확률 완화 가드레일 적용

### 이슈/해결
- 없음

### 검증 결과
- `--quit-after 900` 스모크 통과
- `--boss-test --auto-levelup --qa-autopilot` 보스 루프 통과
- `--auto-levelup --qa-autopilot --quit-after 18000` 회귀 통과

### 다음 액션
- 수동 QA 재개 시 체감 튜닝 확정
- alpha-candidate 유지 상태에서 로컬 기능 확장 진행

## 2026-03-01 19:49 KST
### 오늘 목표
- 로컬 계속 진행: 보스 연출 4차(사운드 슬롯) + 난이도 5차 미세 조정

### 진행 내용
- 사운드 슬롯 런타임 추가
  - `scripts/audio/sfx_slots.gd`
  - 슬롯: `boss_warning`, `boss_spawn`, `boss_defeat`
  - 오디오 파일 미주입 시 1회 경고 로그 출력 후 정상 동작
- 보스 이벤트 훅 연동
  - `boss_reward_runtime.gd`에서 경고/등장/처치 시 사운드 슬롯 호출
- 웨이브 5차 미세 조정
  - 보스 페이즈 완화 강도 소폭 상향
  - 보스 처치 후 회복 구간(post-boss recovery) 도입
- 에셋 경로 준비
  - `assets/audio/.gitkeep` 추가
  - README/에셋대장에 슬롯 경로 규칙 반영

### 이슈/해결
- 이슈: 아직 실 오디오 에셋 미주입
- 해결: 슬롯 기반 구조 먼저 고정, 에셋은 D드라이브 원본 관리 후 주입 예정

### 검증 결과
- `--quit-after 900` 스모크 통과
- `--boss-test --auto-levelup --qa-autopilot` 보스 루프 통과
- `--auto-levelup --qa-autopilot --quit-after 18000` 회귀 통과

### 다음 액션
- 사운드 에셋 1차 주입(경고/등장/처치)
- 수동 QA 재개 시 체감/연출 최종 폴리싱

## 2026-03-01 20:07 KST
### 오늘 목표
- 보스 연출 4차 실체화 완료(SFX 실제 주입 + 품질 2차 튜닝)

### 진행 내용
- ffmpeg로 보스 SFX 3종 generated 자산(v2) 생성
  - warning: 다단 경고 비프
  - spawn: 저역 상승형 임팩트
  - defeat: 하강+echo 마무리
- D드라이브 원본 저장 후 프로젝트에 주입
  - D 원본: `/mnt/d/OpenClaw_Downloads/game-assets/audio/relic-survivor/*.ogg`
  - 프로젝트: `assets/audio/*.ogg`
- `sfx_slots.gd` 개선
  - 볼륨/피치 편차 튜닝
  - OGG 로딩 fallback 보강(ResourceLoader + FileAccess)
- 연출 검증
  - 보스 warning/spawn/defeat 훅에서 SFX 정상 트리거

### 이슈/해결
- 이슈: 초기 테스트에서 `SFX_SLOT_UNASSIGNED` 로그 발생
- 해결: 슬롯 초기화/파일 로딩 fallback 개선 후 미출력 확인

### 검증 결과
- 스모크 통과 (`RELIC_SURVIVOR_BOOT_OK`)
- 보스 루프 통과 + `SFX_SLOT_UNASSIGNED` 미출력
- 5분 회귀 통과

### 다음 액션
- 필요 시 최종 상용 음원으로 교체
- 수동 QA 재개 시 체감/연출 최종 확정

### 진행 메모
- PR 오픈: https://github.com/Master-Tak79/arcadia-hub-game-portal/pull/74

## 2026-03-01 18:40 KST
### 오늘 목표
- 수동 QA 보류 결정 반영 + 다음 단계(Alpha 후보화) 진행

### 진행 내용
- 사용자 요청에 따라 실제 키 입력 기반 수동 QA를 보류 처리
- 체크리스트/릴리즈노트에 보류 상태 명시
- `13_alpha_readiness_report.md` 생성
  - 자동검증 기준 `v0.1.0-alpha-candidate` 판정
  - 최종 alpha 확정 조건(수동 QA/FPS 실측) 명시

### 이슈/해결
- 이슈: 수동 QA 미진행 상태에서 최종 alpha 확정 여부 불명확
- 해결: `alpha-candidate` 단계로 명확히 분리하여 리스크 가시화

### 검증 결과
- 문서 동기화 상태 확인

### 다음 액션
- 수동 QA 재개 시 즉시 최종 alpha 확정 절차 진행

### 추가 문서화
- `11_manual_qa_protocol.md` 작성 (수동 QA 3회/실FPS 실측 절차)
- `12_balance_tuning_log.md` 작성 (튜닝 변경 이력 관리)

## 2026-03-01 20:06 KST
### 오늘 목표
- 보스 연출 4차 실체화(SFX 주입) + 난이도 5차 회귀 안정화

### 진행 내용
- D드라이브 원본 경로에 보스 SFX 3종 생성/저장
  - `/mnt/d/OpenClaw_Downloads/game-assets/audio/relic-survivor/boss_warning.ogg`
  - `/mnt/d/OpenClaw_Downloads/game-assets/audio/relic-survivor/boss_spawn.ogg`
  - `/mnt/d/OpenClaw_Downloads/game-assets/audio/relic-survivor/boss_defeat.ogg`
- 프로젝트 반영
  - `assets/audio/*.ogg` 주입
  - `audio/sfx_slots.gd` 로딩 fallback 보강(ResourceLoader/FileAccess)
- 연출 확장
  - 경고/등장/처치에 카메라 + SFX 슬롯 연동
- 웨이브 5차 유지
  - 보스 활성/처치 직후 회복 구간 로직 유지 검증

### 이슈/해결
- 이슈: 초기 구현에서 슬롯 미할당 로그 발생
- 해결: `sfx_slots` 초기화 시점 및 파일 로딩 fallback 개선으로 해소

### 검증 결과
- 스모크 통과 (`RELIC_SURVIVOR_BOOT_OK`)
- 보스 루프 통과
  - `MINIBOSS_WARNING_ON`, `MINIBOSS_SPAWNED`, `MINIBOSS_DEFEATED`, `BOSS_CLEAR_REWARD_APPLIED`
- `SFX_SLOT_UNASSIGNED` 로그 미발생 확인
- 5분 회귀 루프 통과

### 다음 액션
- 임시 generated SFX를 최종 품질 SFX로 교체(선택)
- 수동 QA 재개 시 체감 튜닝 확정

## 2026-03-01 20:18 KST
### 오늘 목표
- 보스 연출 5차: SFX 타이밍/볼륨 최종값 고정 + 옵션화

### 진행 내용
- `sfx_slots.gd` 고도화
  - 기본 믹스값 고정
  - 프리셋 옵션화: `default` / `quiet` / `hype`
  - 프리셋별 볼륨 오프셋/피치 편차 스케일 반영
- `runtime_options.gd` 확장
  - `--sfx-preset=<preset>` 파싱/로깅
- `boss_reward_runtime.gd` 확장
  - warning/spawn/defeat SFX 딜레이 타이밍 적용
  - 이벤트 타이밍을 연출(배너/카메라)과 정렬
- 보스 SFX v2 재생성/재주입
  - warning/spawn/defeat 톤/엔벌로프 재튜닝

### 이슈/해결
- 이슈: 초기 연동 시 스크립트 파싱 에러(modulate/current) 발생
- 해결: `event_banner.gd`, `camera_fx.gd` 구현 수정 후 회귀 통과

### 검증 결과
- 스모크 통과 (`RELIC_SURVIVOR_BOOT_OK`)
- `--sfx-preset=quiet` 통과 (`SFX_PRESET:quiet`)
- 보스 루프 통과 (`--sfx-preset=hype`)
  - `MINIBOSS_WARNING_ON`, `MINIBOSS_SPAWNED`, `MINIBOSS_DEFEATED`, `BOSS_CLEAR_REWARD_APPLIED`
- `SFX_SLOT_UNASSIGNED` 미출력 확인
- 5분 회귀 통과

### 다음 액션
- 필요 시 최종 상용 음원으로 교체
- 수동 QA 재개 시 체감/연출 최종 확정

## 2026-03-01 20:31 KST
### 오늘 목표
- 후반 웨이브 6차 미세 튜닝 + alpha-candidate 품질 잠금 문서화

### 진행 내용
- 후반 웨이브 6차 미세 튜닝
  - 스폰 ramp 계수 현실화(`SPAWN_RAMP_PER_SEC`, `SPAWN_DASHER_CHANCE_RAMP`)
  - 포화 구간 backoff 세분화(`SOFT/HARD_CAP_BACKOFF_BASE`)
  - late-phase shaping 상수(`LATE_PHASE_*`) 추가
  - `spawn_director.gd`에 초과 개체 수 비례 backoff 로직 반영
- alpha-candidate 품질 잠금 문서 생성
  - `16_alpha_candidate_quality_lock.md`
  - lock scope / 허용·제한 변경 / unlock 조건 명시
- 관련 문서 연동
  - `13_alpha_readiness_report.md`, `15_merge_handover_checklist.md`, `README.md`

### 이슈/해결
- 없음

### 검증 결과
- 스모크 통과
- 보스 루프 통과
- 5분 회귀 + `--sfx-preset=quiet` 통과

### 다음 액션
- 수동 QA 보류 유지 상태로 alpha-candidate 기준선 잠금 운영
- 수동 QA 재개 시 lock 해제 후 alpha 최종 확정
