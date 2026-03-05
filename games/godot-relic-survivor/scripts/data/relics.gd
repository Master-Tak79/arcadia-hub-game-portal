extends RefCounted

func build_relic_defs() -> Array:
	var defs: Array = []

	# Attack relics (4)
	defs.append(_def("ember_core", "Ember Core", "공격 주기 5% 단축", "attack", [{"key": "attack_interval_reduction", "value": 0.05}], 1.00))
	defs.append(_def("storm_prism", "Storm Prism", "발사체 속도 +90", "attack", [{"key": "projectile_speed_bonus", "value": 90.0}], 0.94))
	defs.append(_def("hunter_sigil", "Hunter Sigil", "발사체 피해 +1", "attack", [{"key": "projectile_damage_bonus", "value": 1}], 0.92))
	defs.append(_def("split_forge", "Split Forge", "추가 발사체 +1", "attack", [{"key": "extra_projectiles", "value": 1}], 0.70))

	# Mobility relics (3)
	defs.append(_def("wind_treads", "Wind Treads", "이동 속도 +18", "mobility", [{"key": "player_speed_bonus", "value": 18.0}], 0.95))
	defs.append(_def("phase_spindle", "Phase Spindle", "대시 쿨다운 8% 단축", "mobility", [{"key": "dash_cooldown_reduction", "value": 0.08}], 0.90))
	defs.append(_def("swift_compass", "Swift Compass", "이속 +12, 사거리 +30", "mobility", [{"key": "player_speed_bonus", "value": 12.0}, {"key": "attack_range_bonus", "value": 30.0}], 0.74))

	# Survival relics (3)
	defs.append(_def("guardian_charm", "Guardian Charm", "피격 무적시간 +0.10s", "survival", [{"key": "player_invuln_bonus", "value": 0.10}], 0.86))
	defs.append(_def("iron_heart", "Iron Heart", "최대 HP +2 및 즉시 회복 +2", "survival", [{"key": "max_hp_plus_heal", "value": 2}], 0.74))
	defs.append(_def("emergency_ampoule", "Emergency Ampoule", "즉시 HP +3 회복", "survival", [{"key": "instant_heal", "value": 3}], 0.60))

	# Hybrid relics (2)
	defs.append(_def("twin_orbit", "Twin Orbit", "공격 주기 3% 단축, 이속 +10", "hybrid", [{"key": "attack_interval_reduction", "value": 0.03}, {"key": "player_speed_bonus", "value": 10.0}], 0.62))
	defs.append(_def("bastion_trigger", "Bastion Trigger", "피해 +1, 무적 +0.06s", "hybrid", [{"key": "projectile_damage_bonus", "value": 1}, {"key": "player_invuln_bonus", "value": 0.06}], 0.62))

	return defs

func _def(id: String, title: String, desc: String, role: String, effects: Array, weight: float = 1.0) -> Dictionary:
	var data: Dictionary = {}
	data["id"] = id
	data["title"] = title
	data["desc"] = desc
	data["role"] = role
	data["effects"] = effects
	data["weight"] = max(0.01, weight)
	data["max_stacks"] = 1
	return data
