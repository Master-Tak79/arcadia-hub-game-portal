extends RefCounted

const EventData := preload("res://scripts/data/events.gd")

var _balance: RefCounted
var _state: RefCounted
var _signal_bus: RefCounted
var _player: Node2D
var _event_banner: CanvasLayer
var _overlay: Node2D

var _defs: Array = []
var _next_event_at: float = 0.0
var _event_count: int = 0

var _active_def: Dictionary = {}
var _active_id: String = ""
var _active_label: String = ""
var _phase: String = "idle" # idle|telegraph|active
var _time_left: float = 0.0

var _zone_center: Vector2 = Vector2.ZERO
var _zone_radius: float = 0.0

var _shock_tick_left: float = 0.0
var _shock_hit_cd: float = 0.0

var _test_mode: bool = false
var _test_cycle_index: int = 0
var _last_event_id: String = ""
var _event_repeat_streak: int = 0

func setup(
	balance: RefCounted,
	state: RefCounted,
	signal_bus: RefCounted,
	player: Node2D,
	event_banner: CanvasLayer,
	overlay: Node2D,
	test_mode: bool = false
) -> void:
	_balance = balance
	_state = state
	_signal_bus = signal_bus
	_player = player
	_event_banner = event_banner
	_overlay = overlay
	_test_mode = test_mode
	_defs = EventData.new().build_event_defs(_balance)
	reset_runtime()

func reset_runtime() -> void:
	_event_count = 0
	_active_def = {}
	_active_id = ""
	_active_label = ""
	_phase = "idle"
	_time_left = 0.0
	_zone_center = Vector2.ZERO
	_zone_radius = 0.0
	_shock_tick_left = 0.0
	_shock_hit_cd = 0.0
	_test_cycle_index = 0
	_last_event_id = ""
	_event_repeat_streak = 0

	_state.event_move_speed_mult = 1.0
	_state.event_attack_range_mult = 1.0
	_state.active_event_id = ""
	_state.active_event_label = ""
	_state.active_event_phase = ""
	_state.active_event_time_left = 0.0

	if _overlay and _overlay.has_method("clear_snapshot"):
		_overlay.clear_snapshot()

	if _test_mode:
		_next_event_at = float(_balance.EVENT_TEST_FIRST_TIME)
	else:
		_next_event_at = float(_balance.EVENT_FIRST_TIME)

func process(delta: float) -> void:
	if _state == null:
		return
	if _state.is_game_over:
		return
	if _state.is_paused:
		return

	_state.event_move_speed_mult = 1.0
	_state.event_attack_range_mult = 1.0

	if _shock_hit_cd > 0.0:
		_shock_hit_cd -= delta

	match _phase:
		"idle":
			if float(_state.elapsed) >= _next_event_at:
				_start_next_event()
		"telegraph":
			_time_left -= delta
			_sync_state_and_overlay()
			if _time_left <= 0.0:
				_activate_event()
		"active":
			_time_left -= delta
			_apply_active_effect(delta)
			_sync_state_and_overlay()
			if _time_left <= 0.0:
				_end_event()
		_:
			_phase = "idle"

func _start_next_event() -> void:
	_active_def = _pick_event_def()
	_active_id = String(_active_def.get("id", ""))
	_active_label = String(_active_def.get("title", _active_id))
	if _active_id == "":
		_next_event_at = float(_state.elapsed) + 8.0
		return

	_zone_radius = float(_active_def.get("radius", 0.0))
	if bool(_active_def.get("needs_zone", false)):
		_zone_center = _pick_zone_center(_zone_radius)
	else:
		_zone_center = Vector2.ZERO

	var telegraph: float = float(_active_def.get("telegraph", 0.0))
	if _test_mode:
		telegraph *= float(_balance.EVENT_TEST_TELEGRAPH_MULT)

	if telegraph > 0.01:
		_phase = "telegraph"
		_time_left = telegraph
		print("EVENT_TELEGRAPH:%s" % _active_id)
		if _event_banner:
			_event_banner.show_message("🌐 EVENT 예고: %s" % _active_label, 1.05, _event_color(_active_id, true))
		_sync_state_and_overlay()
	else:
		_activate_event()

func _activate_event() -> void:
	_phase = "active"
	_time_left = float(_active_def.get("duration", 8.0))
	if _test_mode:
		_time_left *= float(_balance.EVENT_TEST_DURATION_MULT)

	if _active_id == "shock_zone":
		_shock_tick_left = 0.25
	else:
		_shock_tick_left = 0.0

	print("EVENT_START:%s" % _active_id)
	if _signal_bus:
		_signal_bus.emit_signal("stage_event_started", _active_id, _active_label)
	if _event_banner:
		_event_banner.show_message("🌐 EVENT 시작: %s" % _active_label, 1.2, _event_color(_active_id, false))
	_sync_state_and_overlay()

func _apply_active_effect(delta: float) -> void:
	if _active_id == "fog":
		_state.event_attack_range_mult = float(_balance.FOG_ATTACK_RANGE_MULT)
		return

	if _active_id == "slow_zone":
		if _player.position.distance_to(_zone_center) <= _zone_radius:
			_state.event_move_speed_mult = float(_balance.SLOW_ZONE_MOVE_MULT)
		return

	if _active_id == "shock_zone":
		_shock_tick_left -= delta
		if _shock_tick_left > 0.0:
			return

		_shock_tick_left = float(_balance.SHOCK_ZONE_TICK_INTERVAL)
		if _player.position.distance_to(_zone_center) > _zone_radius:
			return
		if _shock_hit_cd > 0.0:
			return

		var damage: int = int(_balance.SHOCK_ZONE_DAMAGE)
		_state.hp = max(0, _state.hp - damage)
		_shock_hit_cd = float(_balance.SHOCK_ZONE_HIT_COOLDOWN)
		print("EVENT_SHOCK_HIT")
		if _signal_bus:
			_signal_bus.emit_signal("hp_changed", _state.hp)

		if _state.hp <= 0:
			_state.is_game_over = true
			_state.death_reason = "전류지대 감전 피해"
			_state.death_context = "이벤트 %s · 압박도 %s(%.2f)" % [
				_active_label,
				String(_state.pressure_band).to_upper(),
				float(_state.pressure_hint),
			]
			if _player and _player.has_method("set_enabled"):
				_player.set_enabled(false)

func _end_event() -> void:
	print("EVENT_END:%s" % _active_id)
	if _signal_bus:
		_signal_bus.emit_signal("stage_event_ended", _active_id)
	if _event_banner:
		_event_banner.show_message("EVENT 종료: %s" % _active_label, 0.9, Color("#0B1220"))

	_event_count += 1
	if _active_id == _last_event_id:
		_event_repeat_streak += 1
	else:
		_event_repeat_streak = 0
	_last_event_id = _active_id
	_active_def = {}
	_active_id = ""
	_active_label = ""
	_phase = "idle"
	_time_left = 0.0
	_zone_center = Vector2.ZERO
	_zone_radius = 0.0
	_shock_tick_left = 0.0

	_state.event_move_speed_mult = 1.0
	_state.event_attack_range_mult = 1.0
	_state.active_event_id = ""
	_state.active_event_label = ""
	_state.active_event_phase = ""
	_state.active_event_time_left = 0.0

	if _overlay and _overlay.has_method("clear_snapshot"):
		_overlay.clear_snapshot()

	if _test_mode:
		_next_event_at = float(_state.elapsed) + float(_balance.EVENT_TEST_INTERVAL)
	else:
		var interval: float = float(_balance.EVENT_INTERVAL) - float(_event_count) * float(_balance.EVENT_INTERVAL_RAMP)
		interval = max(float(_balance.EVENT_INTERVAL_MIN), interval)
		_next_event_at = float(_state.elapsed) + interval

func _sync_state_and_overlay() -> void:
	_state.active_event_id = _active_id
	_state.active_event_label = _active_label
	_state.active_event_phase = _phase
	_state.active_event_time_left = max(0.0, _time_left)

	if _overlay and _overlay.has_method("set_snapshot"):
		_overlay.set_snapshot({
			"event_id": _active_id,
			"phase": _phase,
			"time_left": max(0.0, _time_left),
			"zone_center": _zone_center,
			"zone_radius": _zone_radius,
		})

func _pick_event_def() -> Dictionary:
	if _defs.is_empty():
		return {}

	if _test_mode:
		var picked: Dictionary = _defs[_test_cycle_index % _defs.size()]
		_test_cycle_index += 1
		return picked

	var weighted_pool: Array = []
	var total: float = 0.0
	for raw in _defs:
		var def: Dictionary = raw
		var entry: Dictionary = def.duplicate(true)
		var w: float = _effective_event_weight(def)
		entry["effective_weight"] = w
		weighted_pool.append(entry)
		total += w

	if total <= 0.0:
		return weighted_pool[0]

	var roll: float = randf() * total
	var acc: float = 0.0
	for raw in weighted_pool:
		var e: Dictionary = raw
		acc += float(e.get("effective_weight", 1.0))
		if roll <= acc:
			return e
	return weighted_pool[weighted_pool.size() - 1]

func _effective_event_weight(def: Dictionary) -> float:
	var id: String = String(def.get("id", ""))
	var weight: float = max(0.01, float(def.get("weight", 1.0)))
	var elapsed: float = float(_state.elapsed)
	var pressure: float = float(_state.pressure_hint)
	var hp_ratio: float = float(_state.hp) / max(1.0, float(_state.max_hp))

	# prevent repetitive same-event streaks
	if id == _last_event_id:
		weight *= 0.32
		if _event_repeat_streak >= 1:
			weight *= 0.65

	# early game fairness: less shock, more fog/slow guidance
	if elapsed < 120.0:
		if id == "shock_zone":
			weight *= 0.62
		elif id == "fog" or id == "slow_zone":
			weight *= 1.12

	# high pressure / low hp safety shaping
	if pressure >= 0.98 or hp_ratio <= 0.35:
		if id == "shock_zone":
			weight *= 0.68
		elif id == "fog":
			weight *= 1.18
		elif id == "slow_zone":
			weight *= 1.08

	# late phase raises shock relevance back
	if elapsed >= 260.0 and id == "shock_zone":
		weight *= 1.16

	return max(0.01, weight)

func _pick_zone_center(radius: float) -> Vector2:
	var arena_w: float = float(_balance.ARENA_SIZE.x)
	var arena_h: float = float(_balance.ARENA_SIZE.y)
	var margin: float = radius + 28.0
	var fallback: Vector2 = Vector2(arena_w * 0.5, arena_h * 0.5)
	var fallback_dist: float = _player.position.distance_to(fallback)

	for _i in range(12):
		var candidate := Vector2(
			randf_range(margin, arena_w - margin),
			randf_range(margin, arena_h - margin)
		)
		var dist: float = _player.position.distance_to(candidate)
		if dist > fallback_dist:
			fallback = candidate
			fallback_dist = dist
		if dist >= radius * 1.15:
			return candidate

	return fallback

func _event_color(event_id: String, telegraph: bool) -> Color:
	match event_id:
		"fog":
			return Color("#475569") if telegraph else Color("#334155")
		"slow_zone":
			return Color("#1D4ED8") if telegraph else Color("#1E40AF")
		"shock_zone":
			return Color("#65A30D") if telegraph else Color("#4D7C0F")
		_:
			return Color("#0B1220")
