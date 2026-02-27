export const economyCoreConfig = {
  introOverlayTitle: "Rail Commander",
  introOverlayText: "노선을 업그레이드하고 배차를 최적화하세요.\n96초 안에 배차 22회 달성이 목표입니다.",
  roundSummaryActionLabel: "배차",
  upgradeLabels: {
    north: "북부선",
    central: "중앙선",
    south: "남부선",
  },
  formatUpgradeNotice: (label, level) => `🚉 ${label} Lv${level}`,
  formatDispatchSuccessNotice: (creditGain) => `🚆 배차 완료 +${creditGain}₡`,
  dispatchFailureNotice: "배차 자원이 부족합니다",
  overdriveSuccessNotice: "🚄 OVERDRIVE",
  overdriveCooldownNotice: "오버드라이브 쿨다운 중",
};
