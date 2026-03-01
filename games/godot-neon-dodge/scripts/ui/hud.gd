extends CanvasLayer

var _signal_bus: RefCounted
var _game_state: RefCounted
var _label: Label

func setup(signal_bus: RefCounted, game_state: RefCounted) -> void:
	_signal_bus = signal_bus
	_game_state = game_state
	_build_ui()
	_signal_bus.score_changed.connect(_on_score_changed)
	_signal_bus.hp_changed.connect(_on_hp_changed)
	_signal_bus.game_over.connect(_on_game_over)
	_refresh()

func _build_ui() -> void:
	_label = Label.new()
	_label.position = Vector2(16, 16)
	add_child(_label)

func _refresh(extra: String = "") -> void:
	if _label == null:
		return
	var text := "HP: %d\nTIME: %.1f\nSCORE: %d" % [_game_state.hp, _game_state.elapsed, _game_state.score]
	if extra != "":
		text += "\n" + extra
	_label.text = text

func _process(_delta: float) -> void:
	if _game_state:
		_refresh()

func _on_score_changed(_value: int) -> void:
	_refresh()

func _on_hp_changed(_value: int) -> void:
	_refresh()

func _on_game_over(final_score: int) -> void:
	_refresh("GAME OVER - FINAL: %d" % final_score)
