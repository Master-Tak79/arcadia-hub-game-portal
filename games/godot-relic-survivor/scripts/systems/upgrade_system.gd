extends Node

const UpgradeData := preload("res://scripts/data/upgrades.gd")

var _state: RefCounted
var _upgrade_defs: Array = []

func setup(state: RefCounted) -> void:
	_state = state
	_upgrade_defs = UpgradeData.new().build_upgrade_defs()

func roll_choices(count: int = 3) -> Array:
	var pool: Array = []
	for raw_def in _upgrade_defs:
		var def: Dictionary = raw_def
		var id: String = String(def.get("id", ""))
		var max_stacks: int = int(def.get("max_stacks", 1))
		var current: int = _state.get_upgrade_stack(id)
		if current < max_stacks:
			var candidate: Dictionary = def.duplicate(true)
			candidate["effective_weight"] = _compute_effective_weight(def)
			pool.append(candidate)

	if pool.is_empty():
		return []

	var choices: Array = []
	while choices.size() < count and not pool.is_empty():
		var idx: int = _pick_weighted_index(pool)
		choices.append(pool[idx])
		pool.remove_at(idx)

	while choices.size() < count:
		choices.append(choices[choices.size() - 1])

	return choices

func _pick_weighted_index(pool: Array) -> int:
	var total: float = 0.0
	for raw_def in pool:
		var def: Dictionary = raw_def
		total += max(0.01, float(def.get("effective_weight", def.get("weight", 1.0))))

	if total <= 0.0:
		return int(randi() % pool.size())

	var roll: float = randf() * total
	var acc: float = 0.0
	for i in range(pool.size()):
		var def: Dictionary = pool[i]
		acc += max(0.01, float(def.get("effective_weight", def.get("weight", 1.0))))
		if roll <= acc:
			return i

	return pool.size() - 1

func _compute_effective_weight(def: Dictionary) -> float:
	var weight: float = max(0.01, float(def.get("weight", 1.0)))
	var hp_ratio: float = float(_state.hp) / max(1.0, float(_state.max_hp))
	var level: int = int(_state.level)
	var pressure: float = clampf(float(_state.pressure_hint), 0.0, 2.0)
	var pressure_band: String = String(_state.pressure_band)

	var effects: Array = _extract_effects(def)
	var roles: Dictionary = {}
	for raw_effect in effects:
		var effect: Dictionary = raw_effect
		roles[_effect_role(String(effect.get("key", "")))] = true

	var is_offense: bool = bool(roles.get("offense", false))
	var is_mobility: bool = bool(roles.get("mobility", false))
	var is_survival: bool = bool(roles.get("survival", false))
	var is_hybrid: bool = roles.size() >= 2

	# Survival priority when HP is low
	if hp_ratio <= 0.42:
		if is_survival:
			weight *= 1.7
		elif is_offense and not is_hybrid:
			weight *= 0.8
	elif hp_ratio >= 0.82 and _has_effect(def, "instant_heal"):
		weight *= 0.45

	# Pressure-aware steering (wave congestion / boss phase)
	if pressure >= 1.15 or pressure_band == "high":
		if is_survival:
			weight *= 1.28
		if is_mobility:
			weight *= 1.22
		if is_offense and not is_hybrid:
			weight *= 0.84
	elif pressure <= 0.45 and pressure_band == "low" and hp_ratio >= 0.72:
		if is_offense:
			weight *= 1.16
		if is_survival and not is_hybrid:
			weight *= 0.82

	# Early game favors readability and core growth
	if level <= 3 and _has_effect(def, "extra_projectiles"):
		weight *= 0.9

	# Mid game encourages hybrid build options
	if level >= 6 and is_hybrid:
		weight *= 1.18

	# Anti-overstack nudges
	var atk_speed_stack: int = _state.get_upgrade_stack("rapid_trigger")
	if atk_speed_stack >= 4 and _has_effect(def, "attack_interval_reduction"):
		weight *= 0.72

	var multi_shot_stack: int = _state.get_upgrade_stack("multi_cast")
	if multi_shot_stack >= 1 and _has_effect(def, "extra_projectiles"):
		weight *= 0.42

	var mobility_stack: int = _state.get_upgrade_stack("fleet_step") + _state.get_upgrade_stack("tactical_dash")
	if mobility_stack >= 8 and is_mobility and not is_hybrid:
		weight *= 0.74

	# Reward recovery-oriented hybrid when low HP
	if hp_ratio <= 0.50 and is_hybrid and is_survival:
		weight *= 1.22

	# Emergency safety boost under extreme pressure
	if pressure >= 1.35 and (_has_effect(def, "instant_heal") or _has_effect(def, "player_invuln_bonus") or _has_effect(def, "max_hp_plus_heal")):
		weight *= 1.28

	return max(0.01, weight)

func _extract_effects(def: Dictionary) -> Array:
	if def.has("effects"):
		return Array(def.get("effects", []))
	return [{"key": String(def.get("effect_key", "")), "value": def.get("effect_value", 0)}]

func _has_effect(def: Dictionary, key: String) -> bool:
	for raw_effect in _extract_effects(def):
		var effect: Dictionary = raw_effect
		if String(effect.get("key", "")) == key:
			return true
	return false

func _effect_role(effect_key: String) -> String:
	match effect_key:
		"attack_interval_reduction", "projectile_damage_bonus", "projectile_speed_bonus", "projectile_radius_bonus", "projectile_lifetime_bonus", "attack_range_bonus", "extra_projectiles":
			return "offense"
		"player_speed_bonus", "dash_cooldown_reduction":
			return "mobility"
		"player_invuln_bonus", "max_hp_plus_heal", "instant_heal":
			return "survival"
		_:
			return "utility"

func apply_upgrade(choice: Dictionary) -> Dictionary:
	var id: String = String(choice.get("id", ""))
	var new_stack: int = _state.add_upgrade_stack(id)

	if choice.has("effects"):
		for raw_effect in Array(choice.get("effects", [])):
			var effect: Dictionary = raw_effect
			_apply_effect(String(effect.get("key", "")), effect.get("value", 0))
	else:
		var effect_key: String = String(choice.get("effect_key", ""))
		var effect_value: Variant = choice.get("effect_value", 0)
		_apply_effect(effect_key, effect_value)

	var result: Dictionary = {}
	result["id"] = id
	result["stack"] = new_stack
	result["title"] = String(choice.get("title", id))
	return result

func _apply_effect(effect_key: String, effect_value: Variant) -> void:
	match effect_key:
		"attack_interval_reduction":
			_state.attack_interval_reduction = min(0.75, _state.attack_interval_reduction + float(effect_value))
		"projectile_damage_bonus":
			_state.projectile_damage_bonus += int(effect_value)
		"projectile_speed_bonus":
			_state.projectile_speed_bonus += float(effect_value)
		"projectile_radius_bonus":
			_state.projectile_radius_bonus += float(effect_value)
		"projectile_lifetime_bonus":
			_state.projectile_lifetime_bonus += float(effect_value)
		"attack_range_bonus":
			_state.attack_range_bonus += float(effect_value)
		"extra_projectiles":
			_state.extra_projectiles += int(effect_value)
		"player_speed_bonus":
			_state.player_speed_bonus += float(effect_value)
		"dash_cooldown_reduction":
			_state.dash_cooldown_reduction = min(0.75, _state.dash_cooldown_reduction + float(effect_value))
		"player_invuln_bonus":
			_state.player_invuln_bonus += float(effect_value)
		"max_hp_plus_heal":
			var value_hp: int = int(effect_value)
			_state.max_hp += value_hp
			_state.hp = min(_state.max_hp, _state.hp + value_hp)
		"instant_heal":
			_state.hp = min(_state.max_hp, _state.hp + int(effect_value))
		_:
			pass
