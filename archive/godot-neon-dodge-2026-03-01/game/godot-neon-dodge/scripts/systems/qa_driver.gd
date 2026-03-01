extends Node

signal force_damage(delta_hp: int)
signal request_restart(restart_count: int)

var _enabled: bool = false
var _player: Node2D
var _balance: RefCounted
var _game_state: RefCounted

var _time: float = 0.0
var _next_damage_in: float = 1.4
var _restart_delay: float = 0.8
var _game_over_elapsed: float = 0.0
var _restart_count: int = 0

func setup(player: Node2D, balance: RefCounted, game_state: RefCounted, enabled: bool) -> void:
	_player = player
	_balance = balance
	_game_state = game_state
	_enabled = enabled
	_time = 0.0
	_next_damage_in = 1.4
	_game_over_elapsed = 0.0
	_restart_count = 0

func _process(delta: float) -> void:
	if not _enabled or _player == null or _balance == null or _game_state == null:
		return

	_time += delta

	if _game_state.is_game_over:
		_game_over_elapsed += delta
		if _game_over_elapsed >= _restart_delay:
			_restart_count += 1
			emit_signal("request_restart", _restart_count)
			_game_over_elapsed = 0.0
		return

	_game_over_elapsed = 0.0

	var center := Vector2(float(_balance.ARENA_SIZE.x) * 0.5, float(_balance.ARENA_SIZE.y) * 0.5)
	var radius := Vector2(280.0, 180.0)
	var target := center + Vector2(cos(_time * 1.15), sin(_time * 1.75)) * radius
	_player.position = target

	_next_damage_in -= delta
	if _next_damage_in <= 0.0:
		emit_signal("force_damage", -1)
		_next_damage_in = 1.4
