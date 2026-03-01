extends Node

var _balance: RefCounted
var _state: RefCounted
var _elapsed: float = 0.0
var _next_spawn_in: float = 1.0

func setup(balance: RefCounted, state: RefCounted) -> void:
	_balance = balance
	_state = state
	reset_runtime()

func reset_runtime() -> void:
	_elapsed = 0.0
	_next_spawn_in = float(_balance.SPAWN_INTERVAL_BASE)

func _process(delta: float) -> void:
	if _state == null or _state.is_game_over:
		return
	_elapsed += delta
	_next_spawn_in -= delta
	if _next_spawn_in <= 0.0:
		_state.kills += 1
		_next_spawn_in = max(float(_balance.SPAWN_INTERVAL_MIN), float(_balance.SPAWN_INTERVAL_BASE) - _elapsed * float(_balance.SPAWN_RAMP_PER_SEC))
