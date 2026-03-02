extends Node

const RelicData := preload("res://scripts/data/relics.gd")

var _balance: RefCounted
var _state: RefCounted
var _signal_bus: RefCounted
var _event_banner: CanvasLayer

var _relic_defs: Array = []
var _next_relic_at: float = 0.0
var _granted_count: int = 0
var _relic_test_mode: bool = false

func setup(balance: RefCounted, state: RefCounted, signal_bus: RefCounted, event_banner: CanvasLayer, relic_test_mode: bool = false) -> void:
	_balance = balance
	_state = state
	_signal_bus = signal_bus
	_event_banner = event_banner
	_relic_test_mode = relic_test_mode
	_relic_defs = RelicData.new().build_relic_defs()
	reset_runtime()

func reset_runtime() -> void:
	_granted_count = 0
	if _relic_test_mode:
		_next_relic_at = float(_balance.RELIC_TEST_FIRST_TIME)
	else:
		_next_relic_at = float(_balance.RELIC_FIRST_TIME)

func _process(_delta: float) -> void:
	if _state == null:
		return
	if _state.is_game_over or _state.is_paused:
		return

	if float(_state.elapsed) < _next_relic_at:
		return

	if _grant_random_relic():
		_granted_count += 1
		_schedule_next_relic()
	else:
		# pool exhausted
		_next_relic_at = INF

func _schedule_next_relic() -> void:
	if _relic_test_mode:
		_next_relic_at = float(_state.elapsed) + float(_balance.RELIC_TEST_INTERVAL)
		return

	var interval: float = float(_balance.RELIC_INTERVAL) - float(_granted_count) * float(_balance.RELIC_INTERVAL_RAMP)
	interval = max(float(_balance.RELIC_INTERVAL_MIN), interval)
	_next_relic_at = float(_state.elapsed) + interval

func _grant_random_relic() -> bool:
	var pool: Array = []
	for raw in _relic_defs:
		var def: Dictionary = raw
		var id: String = String(def.get("id", ""))
		var current_stack: int = int(_state.relic_stacks.get(id, 0))
		var max_stacks: int = int(def.get("max_stacks", 1))
		if current_stack >= max_stacks:
			continue
		var candidate: Dictionary = def.duplicate(true)
		candidate["effective_weight"] = _compute_effective_weight(def)
		pool.append(candidate)

	if pool.is_empty():
		return false

	var picked: Dictionary = _pick_weighted(pool)
	_apply_relic(picked)
	return true

func _compute_effective_weight(def: Dictionary) -> float:
	var weight: float = max(0.01, float(def.get("weight", 1.0)))
	var role: String = String(def.get("role", ""))
	var hp_ratio: float = float(_state.hp) / max(1.0, float(_state.max_hp))
	var pressure: float = float(_state.pressure_hint)

	if hp_ratio <= 0.45:
		if role == "survival":
			weight *= 1.55
		elif role == "attack":
			weight *= 0.82

	if pressure >= 0.95:
		if role == "survival":
			weight *= 1.32
		if role == "mobility":
			weight *= 1.25
		if role == "attack":
			weight *= 0.86
	elif pressure <= 0.40 and hp_ratio >= 0.75:
		if role == "attack":
			weight *= 1.16

	if _has_effect(def, "instant_heal") and hp_ratio >= 0.9:
		weight *= 0.35

	return max(0.01, weight)

func _pick_weighted(pool: Array) -> Dictionary:
	var total: float = 0.0
	for raw in pool:
		total += float(raw.get("effective_weight", 1.0))

	if total <= 0.0:
		return pool[0]

	var roll: float = randf() * total
	var acc: float = 0.0
	for raw in pool:
		acc += float(raw.get("effective_weight", 1.0))
		if roll <= acc:
			return raw
	return pool[pool.size() - 1]

func _apply_relic(def: Dictionary) -> void:
	var id: String = String(def.get("id", ""))
	var title: String = String(def.get("title", id))
	var desc: String = String(def.get("desc", ""))
	var role: String = String(def.get("role", ""))

	var stack: int = int(_state.relic_stacks.get(id, 0)) + 1
	_state.relic_stacks[id] = stack
	_state.relic_titles[id] = title
	if not _state.relic_order.has(id):
		_state.relic_order.append(id)
	_state.relic_obtained_count += 1
	_state.relic_last_title = title
	_state.relic_last_desc = desc

	for raw_effect in Array(def.get("effects", [])):
		var effect: Dictionary = raw_effect
		_apply_effect(String(effect.get("key", "")), effect.get("value", 0))

	if _signal_bus:
		_signal_bus.emit_signal("relic_obtained", id, title, stack)
	_signal_bus.emit_signal("hp_changed", _state.hp)

	if _event_banner:
		var role_tag: String = _role_tag(role)
		_event_banner.show_message("%s RELIC 획득: %s\n%s" % [role_tag, title, desc], 1.9, _role_color(role))

	print("RELIC_GRANTED:%s" % id)

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
			var hp_gain: int = int(effect_value)
			_state.max_hp += hp_gain
			_state.hp = min(_state.max_hp, _state.hp + hp_gain)
		"instant_heal":
			_state.hp = min(_state.max_hp, _state.hp + int(effect_value))
		_:
			pass

func _has_effect(def: Dictionary, key: String) -> bool:
	for raw in Array(def.get("effects", [])):
		var effect: Dictionary = raw
		if String(effect.get("key", "")) == key:
			return true
	return false

func _role_tag(role: String) -> String:
	match role:
		"attack":
			return "🟥"
		"mobility":
			return "🟦"
		"survival":
			return "🟩"
		"hybrid":
			return "🟪"
		_:
			return "⬜"

func _role_color(role: String) -> Color:
	match role:
		"attack":
			return Color("#7F1D1D")
		"mobility":
			return Color("#1E3A8A")
		"survival":
			return Color("#14532D")
		"hybrid":
			return Color("#4C1D95")
		_:
			return Color("#0B1220")
