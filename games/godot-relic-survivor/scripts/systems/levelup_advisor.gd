extends RefCounted

var _state: RefCounted

func setup(state: RefCounted) -> void:
	_state = state

func pick_best_choice_index(choices: Array) -> int:
	if choices.is_empty():
		return 0

	var best_idx: int = 0
	var best_score: int = -9999
	for i in range(choices.size()):
		var choice: Dictionary = choices[i]
		var score: int = _score_choice(choice)
		if score > best_score:
			best_score = score
			best_idx = i
	return best_idx

func _score_choice(choice: Dictionary) -> int:
	var priorities := {
		"extra_projectiles": 100,
		"projectile_damage_bonus": 95,
		"attack_interval_reduction": 92,
		"projectile_speed_bonus": 80,
		"attack_range_bonus": 72,
		"max_hp_plus_heal": 68,
		"instant_heal": 62,
		"player_speed_bonus": 42,
		"dash_cooldown_reduction": 38,
		"player_invuln_bonus": 36,
		"projectile_radius_bonus": 28,
		"projectile_lifetime_bonus": 26
	}

	var effects: Array = []
	if choice.has("effects"):
		effects = Array(choice.get("effects", []))
	else:
		effects = [{"key": String(choice.get("effect_key", "")), "value": choice.get("effect_value", 0)}]

	var score: int = 0
	var hp_ratio: float = 1.0
	var pressure: float = 0.0
	if _state:
		hp_ratio = float(_state.hp) / max(1.0, float(_state.max_hp))
		pressure = float(_state.pressure_hint)

	for raw_effect in effects:
		var effect: Dictionary = raw_effect
		var key: String = String(effect.get("key", ""))
		score += int(priorities.get(key, 0))

		if hp_ratio <= 0.42 and (key == "instant_heal" or key == "max_hp_plus_heal" or key == "player_invuln_bonus"):
			score += 32
		if pressure >= 0.95 and (key == "player_speed_bonus" or key == "dash_cooldown_reduction" or key == "player_invuln_bonus"):
			score += 18
		if pressure >= 0.95 and (key == "extra_projectiles" or key == "attack_interval_reduction"):
			score -= 8

	if effects.size() >= 2:
		score += 12

	if _state:
		var id: String = String(choice.get("id", ""))
		var current_stack: int = int(_state.get_upgrade_stack(id))
		var max_stacks: int = max(1, int(choice.get("max_stacks", 1)))
		if current_stack >= max_stacks - 1:
			score -= 10

	return score
