extends RefCounted

var hp: int = 5
var level: int = 1
var elapsed: float = 0.0
var kills: int = 0
var is_game_over: bool = false

func reset() -> void:
	hp = 5
	level = 1
	elapsed = 0.0
	kills = 0
	is_game_over = false
