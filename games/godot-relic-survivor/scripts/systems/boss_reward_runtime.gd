extends RefCounted

var _balance: RefCounted
var _state: RefCounted
var _signal_bus: RefCounted
var _miniboss_director: Node
var _event_banner: CanvasLayer

var _last_boss_alive: bool = false
var _boss_reward_applied: bool = false
var _slowmo_time_left: float = 0.0

func setup(
	balance: RefCounted,
	state: RefCounted,
	signal_bus: RefCounted,
	miniboss_director: Node,
	event_banner: CanvasLayer
) -> void:
	_balance = balance
	_state = state
	_signal_bus = signal_bus
	_miniboss_director = miniboss_director
	_event_banner = event_banner
	reset_round()

func reset_round() -> void:
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

	var boss_alive: bool = false
	if _miniboss_director.has_method("is_boss_alive"):
		boss_alive = bool(_miniboss_director.is_boss_alive())

	if boss_alive and not _last_boss_alive and _event_banner:
		_event_banner.show_message("⚠ MINIBOSS HAS ENTERED THE ARENA", 1.8)

	if not boss_alive and _last_boss_alive and not _boss_reward_applied:
		_apply_boss_clear_reward()

	_last_boss_alive = boss_alive

func _apply_boss_clear_reward() -> void:
	_boss_reward_applied = true

	var reward_exp: int = int(_balance.MINIBOSS_EXP_REWARD)
	var heal: int = 2
	_state.gain_exp(reward_exp)
	_state.hp = min(_state.max_hp, _state.hp + heal)

	if _event_banner:
		_event_banner.show_message("✅ MINIBOSS DEFEATED\n+%d EXP  +%d HP" % [reward_exp, heal], 2.5)
	_signal_bus.emit_signal("hp_changed", _state.hp)
	_signal_bus.emit_signal("exp_changed", _state.exp, _state.exp_to_next)
	print("BOSS_CLEAR_REWARD_APPLIED")

	_slowmo_time_left = 0.6
	Engine.time_scale = 0.4

func _update_slowmo(delta: float) -> void:
	if _slowmo_time_left <= 0.0:
		return
	_slowmo_time_left -= delta
	if _slowmo_time_left <= 0.0:
		Engine.time_scale = 1.0
