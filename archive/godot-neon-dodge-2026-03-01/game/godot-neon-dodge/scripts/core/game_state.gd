extends RefCounted

var hp: int = 3
var elapsed: float = 0.0
var score: int = 0
var is_game_over: bool = false

func reset() -> void:
	hp = 3
	elapsed = 0.0
	score = 0
	is_game_over = false
