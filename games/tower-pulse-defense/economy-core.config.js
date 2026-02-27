const THREAT_NOTICE = {
  cargo: "🧱 서측 압박 급증",
  passenger: "🎯 중앙 압박 급증",
  mail: "⚙️ 동측 압박 급증",
};

const THREAT_SHORT = {
  normal: "일반",
  cargo: "서측",
  passenger: "중앙",
  mail: "동측",
};

export const economyCoreConfig = {
  introOverlayTitle: "Tower Pulse Defense",
  introOverlayText:
    "타워를 업그레이드하고 방어를 최적화하세요.\n100초 안에 방어 24회 달성이 목표입니다.\n연속 방어 체인과 압박 급증 타이밍을 활용하면 점수가 크게 상승합니다.",
  roundSummaryActionLabel: "방어",
  upgradeLabels: {
    north: "서측 타워",
    central: "중앙 타워",
    south: "동측 타워",
  },
  formatUpgradeNotice: (label, level) => `🛠️ ${label} Lv${level}`,
  formatDispatchSuccessNotice: (creditGain, result) => {
    const chain = result?.streak > 1 ? ` · 체인 x${result.streak}` : "";
    const threat = result?.threatType && result.threatType !== "normal" ? ` · ${THREAT_SHORT[result.threatType]} 보너스` : "";
    return `🛡️ 방어 성공 +${creditGain}₡${chain}${threat}`;
  },
  formatDispatchFailureNotice: (result) => {
    const missing = result?.missing?.length ? ` (${result.missing.join("/")})` : "";
    return `방어 자원이 부족합니다${missing}`;
  },
  overdriveSuccessNotice: "⚡ PULSE",
  overdriveCooldownNotice: "펄스 쿨다운 중",
  formatOverdriveCooldownNotice: (state) => `펄스 ${(state.overdriveCooldownMs / 1000).toFixed(1)}s`,
  formatDemandStartNotice: (demandType) => THREAT_NOTICE[demandType] ?? "압박 급증 발생",
  demandEndNotice: "압박 급증 종료",
  formatStreakDropNotice: () => "체인 종료",
};
