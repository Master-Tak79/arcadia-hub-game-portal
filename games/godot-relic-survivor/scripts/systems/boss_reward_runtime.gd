extends RefCounted

var _balance: RefCounted
var _state: RefCounted
var _signal_bus: RefCounted
var _miniboss_director: Node
var _event_banner: CanvasLayer
var _camera_fx: Camera2D

var _last_warning_active: bool = false
var _last_boss_alive: bool = false
var _boss_reward_applied: bool = false
var _slowmo_time_left: float = 0.0

func setup(
	balance: RefCounted,
	state: RefCounted,
	signal_bus: RefCounted,
	miniboss_director: Node,
	event_banner: CanvasLayer,
	camera_fx: Camera2D
) -> void:
	_balance = balance
	_state = state
	_signal_bus = signal_bus
	_miniboss_director = miniboss_director
	_event_banner = event_banner
	_camera_fx = camera_fx
	reset_round()

func reset_round() -> void:
	_last_warning_active = false
	_last_boss_alive = false
	_boss_reward_applied = false
	_slowmo_time_left = 0.0
	Engine.time_scale = 1.0

func process(delta: float) -> void:
	_update_slowmo(delta)
	_process_miniboss_state_transitions()

func _process_miniboss_state_transitions() -> void:
	if _miniboss_director == null:
		return

	var warning_active: bool = false
	if _miniboss_director.has_method("is_warning_active"):
		warning_active = bool(_miniboss_director.is_warning_active())

	var boss_alive: bool = false
	if _miniboss_director.has_method("is_boss_alive"):
		boss_alive = bool(_miniboss_director.is_boss_alive())

	if warning_active and not _last_warning_active:
		if _event_banner:
			_event_banner.show_message("⚠ WARNING: MINIBOSS APPROACHING", 1.6, Color("#7C2D12"))
		if _camera_fx and _camera_fx.has_method("play_warning_pulse"):
			_camera_fx.play_warning_pulse()

	if boss_alive and not _last_boss_alive:
		if _event_banner:
			_event_banner.show_message("⚠ MINIBOSS HAS ENTERED THE ARENA", 1.9, Color("#7C2D12"))
		if _camera_fx and _camera_fx.has_method("play_boss_spawn_impact"):
			_camera_fx.play_boss_spawn_impact()

	if not boss_alive and _last_boss_alive and not _boss_reward_applied:
		_apply_boss_clear_reward()

	_last_warning_active = warning_active
	_last_boss_alive = boss_alive

func _apply_boss_clear_reward() -> void:
	_boss_reward_applied = true

	var reward_exp: int = int(_balance.MINIBOSS_EXP_REWARD)
	var heal: int = 2
	_state.gain_exp(reward_exp)
	_state.hp = min(_state.max_hp, _state.hp + heal)

	if _event_banner:
		_event_banner.show_message("✅ PHASE CLEAR: MINIBOSS DEFEATED\n+%d EXP  +%d HP" % [reward_exp, heal], 2.7, Color("#14532D"))
	_signal_bus.emit_signal("hp_changed", _state.hp)
	_signal_bus.emit_signal("exp_changed", _state.exp, _state.exp_to_next)
	print("BOSS_CLEAR_REWARD_APPLIED")

	if _camera_fx and _camera_fx.has_method("play_boss_defeat_impact"):
		_camera_fx.play_boss_defeat_impact()

	_slowmo_time_left = 0.6
	Engine.time_scale = 0.4

func _update_slowmo(delta: float) -> void:
	if _slowmo_time_left <= 0.0:
		return
	_slowmo_time_left -= delta
	if _slowmo_time_left <= 0.0:
		Engine.time_scale = 1.0
