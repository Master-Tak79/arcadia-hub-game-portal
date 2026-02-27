export const economyCoreConfig = {
  introOverlayTitle: "Tower Pulse Defense",
  introOverlayText: "타워를 업그레이드하고 방어를 최적화하세요.\n100초 안에 방어 24회 달성이 목표입니다.",
  roundSummaryActionLabel: "방어",
  upgradeLabels: {
    north: "서측 타워",
    central: "중앙 타워",
    south: "동측 타워",
  },
  formatUpgradeNotice: (label, level) => `🛠️ ${label} Lv${level}`,
  formatDispatchSuccessNotice: (creditGain) => `🛡️ 방어 성공 +${creditGain}₡`,
  dispatchFailureNotice: "방어 자원이 부족합니다",
  overdriveSuccessNotice: "⚡ PULSE",
  overdriveCooldownNotice: "펄스 쿨다운 중",
};
