const platformMap = {
  desktop: "데스크톱",
  mobile: "모바일",
  cross: "크로스플랫폼",
};

export function toPlatformLabel(platform) {
  return platformMap[platform] || platform;
}

export function toUpdatedLabel(dateString) {
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return "업데이트 정보 없음";
  return `업데이트 ${date.toISOString().slice(0, 10)}`;
}

export function gradient([a, b] = ["#4e62db", "#22c3d8"]) {
  return `linear-gradient(135deg, ${a}, ${b})`;
}
