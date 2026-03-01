# Docs Workspace

앞으로 게임 개발 문서는 이 폴더에서 통합 관리합니다.

## 원칙

- 모든 게임은 문서 먼저(설계) → 구현 → 검증 → 회고 순서로 진행
- 문서 없는 기능 개발 금지
- 한 파일에 모든 기능을 넣지 않고 기능 단위로 분리
- 확장성과 유지보수성을 기본 전제로 설계

## 권장 구조

```text
docs/
  README.md
  policies/
    GAME_DEV_STANDARDS.md
  templates/
    GAME_BLUEPRINT_TEMPLATE.md
    GDD_TEMPLATE.md
    DEVELOPMENT_PLAN_TEMPLATE.md
    ROADMAP_TEMPLATE.md
    DEVLOG_TEMPLATE.md
    QA_CHECKLIST_TEMPLATE.md
  projects/
    _index.md
    <project-slug>/
      00_game_blueprint.md
      01_gdd.md
      02_development_plan.md
      03_roadmap.md
      04_devlog.md
      05_qa_checklist.md
      06_release_notes.md
```

## 최소 필수 문서 (게임 1개 기준)

1. 청사진(Blueprint)
2. 기획서(GDD)
3. 진행계획서(Development Plan)
4. 로드맵(Roadmap)
5. 개발일지(Devlog)
6. QA 체크리스트
7. 릴리즈 노트
