extends CanvasLayer

var _state: RefCounted
var _player: Node2D
var _enemy_container: Node2D
var _projectile_container: Node2D
var _label: Label

func setup(state: RefCounted, player: Node2D, enemy_container: Node2D, projectile_container: Node2D) -> void:
	_state = state
	_player = player
	_enemy_container = enemy_container
	_projectile_container = projectile_container
	_label = Label.new()
	_label.position = Vector2(16, 16)
	add_child(_label)
	_refresh()

func _process(_delta: float) -> void:
	_refresh()

func _refresh() -> void:
	if _label == null or _state == null:
		return

	var enemies := _enemy_container.get_child_count() if _enemy_container else 0
	var projectiles := _projectile_container.get_child_count() if _projectile_container else 0

	var text := "HP: %d\nLV: %d\nTIME: %.1f\nKILLS: %d\nENEMIES: %d\nSHOTS: %d" % [
		_state.hp,
		_state.level,
		_state.elapsed,
		_state.kills,
		enemies,
		projectiles
	]
	if _state.is_game_over:
		text += "\nGAME OVER\nPress [R] to Restart"
	_label.text = text
