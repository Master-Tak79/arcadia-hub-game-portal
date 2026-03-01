extends RefCounted

var _options: RefCounted
var _balance: RefCounted
var _state: RefCounted
var _player: Node2D

var _restart_time_left: float = 0.0
var _force_damage_time_left: float = 0.0
var _autopilot_time: float = 0.0

func setup(options: RefCounted, balance: RefCounted, state: RefCounted, player: Node2D) -> void:
	_options = options
	_balance = balance
	_state = state
	_player = player
	reset_round()

func reset_round() -> void:
	_restart_time_left = float(_options.qa_restart_delay)
	_force_damage_time_left = float(_options.qa_force_damage_interval)
	_autopilot_time = 0.0

func on_game_over_entered() -> void:
	_restart_time_left = float(_options.qa_restart_delay)

func process_game_over(delta: float) -> bool:
	if not bool(_options.qa_auto_restart):
		return false
	_restart_time_left -= delta
	if _restart_time_left <= 0.0:
		return true
	return false

func process_active(delta: float) -> void:
	_process_force_damage(delta)
	_process_autopilot(delta)

func _process_force_damage(delta: float) -> void:
	if not bool(_options.qa_force_damage):
		return
	if _state.is_game_over or _state.is_paused:
		return

	_force_damage_time_left -= delta
	if _force_damage_time_left > 0.0:
		return

	_force_damage_time_left = float(_options.qa_force_damage_interval)
	_state.hp = max(0, _state.hp - 1)
	if _state.hp <= 0:
		_state.is_game_over = true
		_player.set_enabled(false)
		print("QA_FORCE_DEATH")

func _process_autopilot(delta: float) -> void:
	if not bool(_options.qa_autopilot):
		return
	if _state.is_game_over or _state.is_paused:
		return

	_autopilot_time += delta
	var center := Vector2(float(_balance.ARENA_SIZE.x) * 0.5, float(_balance.ARENA_SIZE.y) * 0.5)
	var radius := Vector2(280.0, 190.0)
	var target := center + Vector2(cos(_autopilot_time * 1.13), sin(_autopilot_time * 1.71)) * radius
	_player.position = target
