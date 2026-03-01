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
			pool.append(def)

	if pool.is_empty():
		return []

	var choices: Array = []
	while choices.size() < count and not pool.is_empty():
		var idx: int = randi() % pool.size()
		choices.append(pool[idx])
		pool.remove_at(idx)

	while choices.size() < count:
		choices.append(choices[choices.size() - 1])

	return choices

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
