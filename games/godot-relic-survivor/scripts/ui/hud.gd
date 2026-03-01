extends CanvasLayer

var _state: RefCounted
var _label: Label

func setup(state: RefCounted) -> void:
	_state = state
	_label = Label.new()
	_label.position = Vector2(16, 16)
	add_child(_label)
	_refresh()

func _process(_delta: float) -> void:
	_refresh()

func _refresh() -> void:
	if _label == null or _state == null:
		return
	var text := "HP: %d\nLV: %d\nTIME: %.1f\nKILLS: %d" % [_state.hp, _state.level, _state.elapsed, _state.kills]
	if _state.is_game_over:
		text += "\nGAME OVER\nPress [R] to Restart"
	_label.text = text
