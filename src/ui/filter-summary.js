function clear(node) {
  if (!node) return;
  node.replaceChildren();
}

function toSortLabel(sort) {
  if (sort === "updated") return "최신순";
  if (sort === "title") return "이름순";
  return "인기순";
}

function toPlatformLabel(platform) {
  if (platform === "desktop") return "데스크톱";
  if (platform === "mobile") return "모바일";
  if (platform === "cross") return "크로스";
  return "전체";
}

export function renderFilterSummary({ textNode, chipsNode, filters, onlyFavorites }) {
  const chips = [];

  if (filters.query) chips.push(`검색: ${filters.query}`);
  if (filters.platform !== "all") chips.push(`플랫폼: ${toPlatformLabel(filters.platform)}`);
  if (filters.genre !== "all") chips.push(`장르: ${filters.genre}`);
  if (filters.category !== "all") chips.push(`카테고리: ${filters.category}`);
  if (filters.sort !== "popularity") chips.push(`정렬: ${toSortLabel(filters.sort)}`);
  if (onlyFavorites) chips.push("즐겨찾기만");

  if (!chips.length) {
    textNode.textContent = "현재 기본 보기 상태입니다.";
    clear(chipsNode);
    return 0;
  }

  textNode.textContent = `활성 필터 ${chips.length}개`;

  clear(chipsNode);
  chips.forEach((label) => {
    const chip = document.createElement("span");
    chip.className = "active-filter-chip";
    chip.textContent = label;
    chipsNode.appendChild(chip);
  });

  return chips.length;
}
