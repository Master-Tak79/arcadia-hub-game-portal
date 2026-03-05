extends RefCounted

func build_event_defs(balance: RefCounted) -> Array:
	return [
		{
			"id": "fog",
			"title": "안개 전개",
			"desc": "시야/사거리 감소",
			"duration": float(balance.FOG_DURATION),
			"telegraph": 0.0,
			"weight": 0.9,
			"needs_zone": false,
		},
		{
			"id": "slow_zone",
			"title": "감속 지대",
			"desc": "지대 내부 이동속도 감소",
			"duration": float(balance.SLOW_ZONE_DURATION),
			"telegraph": float(balance.SLOW_ZONE_TELEGRAPH),
			"weight": 0.82,
			"needs_zone": true,
			"radius": float(balance.SLOW_ZONE_RADIUS),
		},
		{
			"id": "shock_zone",
			"title": "전류 지대",
			"desc": "지대 내부 주기 피해",
			"duration": float(balance.SHOCK_ZONE_DURATION),
			"telegraph": float(balance.SHOCK_ZONE_TELEGRAPH),
			"weight": 0.78,
			"needs_zone": true,
			"radius": float(balance.SHOCK_ZONE_RADIUS),
		},
	]
