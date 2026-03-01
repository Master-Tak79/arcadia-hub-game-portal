extends Node

var _game_state: RefCounted
var _signal_bus: RefCounted

func setup(game_state: RefCounted, signal_bus: RefCounted) -> void:
	_game_state = game_state
	_signal_bus = signal_bus

func _process(_delta: float) -> void:
	if _game_state == null or _game_state.is_game_over:
		return
	_game_state.score = int(_game_state.elapsed * 10.0)
	_signal_bus.emit_signal("score_changed", _game_state.score)
