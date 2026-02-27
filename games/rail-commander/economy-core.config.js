const DEMAND_NOTICE = {
  cargo: "📦 화물 수요 급등",
  passenger: "🧑 승객 수요 급등",
  mail: "✉️ 우편 수요 급등",
};

const DEMAND_SHORT = {
  normal: "일반",
  cargo: "화물",
  passenger: "승객",
  mail: "우편",
};

export const economyCoreConfig = {
  introOverlayTitle: "Rail Commander",
  introOverlayText:
    "노선을 업그레이드하고 배차를 최적화하세요.\n96초 안에 배차 22회 달성이 목표입니다.\n연속 배차 체인과 수요 급등 타이밍을 활용해 고점수를 노리세요.",
  roundSummaryActionLabel: "배차",
  upgradeLabels: {
    north: "북부선",
    central: "중앙선",
    south: "남부선",
  },
  formatUpgradeNotice: (label, level) => `🚉 ${label} Lv${level}`,
  formatDispatchSuccessNotice: (creditGain, result) => {
    const chain = result?.streak > 1 ? ` · 체인 x${result.streak}` : "";
    const demand = result?.demandType && result.demandType !== "normal" ? ` · ${DEMAND_SHORT[result.demandType]} 보너스` : "";
    return `🚆 배차 완료 +${creditGain}₡${chain}${demand}`;
  },
  formatDispatchFailureNotice: (result) => {
    const missing = result?.missing?.length ? ` (${result.missing.join("/")})` : "";
    return `배차 자원이 부족합니다${missing}`;
  },
  overdriveSuccessNotice: "🚄 OVERDRIVE",
  overdriveCooldownNotice: "오버드라이브 쿨다운 중",
  formatOverdriveCooldownNotice: (state) => `오버드라이브 ${(state.overdriveCooldownMs / 1000).toFixed(1)}s`,
  formatDemandStartNotice: (demandType) => DEMAND_NOTICE[demandType] ?? "수요 급등 발생",
  demandEndNotice: "수요 급등 종료",
  formatStreakDropNotice: () => "체인 종료",
};
