# 11_manual_qa_protocol — Godot Relic Survivor

## 목적

실수동 플레이 3회 기준으로 조작감/난이도 체감/보스 페이즈 완성도를 검증합니다.

## 실행 준비

```bash
cd /home/tak/.openclaw/workspace-coder/games/godot-relic-survivor
../../scripts/godotw --path .
```

## 수동 QA 시나리오 (3회)

### Run A — 조작감 중심 (0~5분)
- 체크:
  - 이동 응답성 (WASD/방향키)
  - 대시 타이밍/쿨다운 체감
  - 피격 판정 억울함 여부
  - 캐릭터 시작 체감 차이(Ranger vs Warden)
  - 액티브 스킬(Q) 입력 반응/쿨다운 피드백 확인

### Run B — 성장/웨이브 중심 (0~10분)
- 체크:
  - 레벨업 3지선다 체감
  - 업그레이드 선택 의미(딜/생존/기동)
  - META 상태(HUD 샤드/특성 랭크) 가독성
  - WEAPON 상태(HUD 무기 계열) 가독성
  - TREE 해금 후 다음 라운드 반영 체감(정상 적용 여부)
  - TREE 패널(`T`) 열기/선택/닫기 UX 확인
  - 중반 웨이브 과도 압박 여부

### Run C — 보스 페이즈 중심 (10분)
- 체크:
  - 보스 경고 인지성
  - 보스 등장 전후 난이도 곡선
  - Phase2 전환 텔레그래프 인지성(`PHASE SHIFT` 배너/HUD)
  - Phase2 전환 안전구간(무피해 윈도우) 공정성
  - Phase2 진입 후 패턴 템포 상승 체감(대시/소환)
  - 보스 처치 보상 체감(+EXP/+HP)

## FPS 실측(수동)

- 실행 중 Godot Debug/Profiler(또는 외부 FPS 오버레이)로 평균 FPS 확인
- 기록 항목:
  - 평균 FPS
  - 최저 FPS
  - 적 최대 동시 수 대략값

## 기록 포맷

아래 내용을 `04_devlog.md`와 `05_qa_checklist.md`에 반영:

- Run A/B/C 결과 요약
- 문제점 Top 3
- 조정한 밸런스 값
- 재검증 결과
