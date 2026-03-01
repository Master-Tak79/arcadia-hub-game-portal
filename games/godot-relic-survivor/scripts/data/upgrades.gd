extends RefCounted

func build_upgrade_defs() -> Array:
	var defs: Array = []

	defs.append(_def("rapid_trigger", "Rapid Trigger", "공격 주기 8% 단축", 6, "attack_interval_reduction", 0.08))
	defs.append(_def("heavy_round", "Heavy Round", "발사체 피해 +1", 8, "projectile_damage_bonus", 1))
	defs.append(_def("long_shot", "Long Shot", "발사체 속도 +80", 6, "projectile_speed_bonus", 80.0))
	defs.append(_def("wide_core", "Wide Core", "발사체 반경 +1.2", 6, "projectile_radius_bonus", 1.2))
	defs.append(_def("linger_shell", "Linger Shell", "발사체 수명 +0.15s", 6, "projectile_lifetime_bonus", 0.15))
	defs.append(_def("relic_scope", "Relic Scope", "자동공격 사거리 +55", 6, "attack_range_bonus", 55.0))
	defs.append(_def("multi_cast", "Multi Cast", "추가 발사체 +1", 2, "extra_projectiles", 1))

	defs.append(_def("fleet_step", "Fleet Step", "이동 속도 +16", 6, "player_speed_bonus", 16.0))
	defs.append(_def("tactical_dash", "Tactical Dash", "대시 쿨다운 9% 단축", 6, "dash_cooldown_reduction", 0.09))
	defs.append(_def("phase_skin", "Phase Skin", "피격 무적시간 +0.08s", 5, "player_invuln_bonus", 0.08))
	defs.append(_def("relic_heart", "Relic Heart", "최대 HP +1 및 즉시 회복 +1", 4, "max_hp_plus_heal", 1))
	defs.append(_def("emergency_patch", "Emergency Patch", "즉시 HP +2 회복", 99, "instant_heal", 2))

	return defs

func _def(id: String, title: String, desc: String, max_stacks: int, effect_key: String, effect_value: Variant) -> Dictionary:
	var data: Dictionary = {}
	data["id"] = id
	data["title"] = title
	data["desc"] = desc
	data["max_stacks"] = max_stacks
	data["effect_key"] = effect_key
	data["effect_value"] = effect_value
	return data
