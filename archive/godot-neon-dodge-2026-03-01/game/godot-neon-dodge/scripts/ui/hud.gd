extends CanvasLayer

var _signal_bus: RefCounted
var _game_state: RefCounted
var _player: Node2D
var _enemy_container: Node2D
var _label: Label

func setup(signal_bus: RefCounted, game_state: RefCounted, player: Node2D, enemy_container: Node2D) -> void:
	_signal_bus = signal_bus
	_game_state = game_state
	_player = player
	_enemy_container = enemy_container
	_build_ui()
	_signal_bus.score_changed.connect(_on_score_changed)
	_signal_bus.hp_changed.connect(_on_hp_changed)
	_signal_bus.game_over.connect(_on_game_over)
	_refresh()

func _build_ui() -> void:
	_label = Label.new()
	_label.position = Vector2(16, 16)
	_label.size = Vector2(460, 140)
	add_child(_label)

func _refresh(extra: String = "") -> void:
	if _label == null or _game_state == null:
		return

	var dash_text := "-"
	if _player and _player.has_method("get_dash_cooldown_left"):
		var cooldown_left: float = _player.get_dash_cooldown_left()
		dash_text = "READY" if cooldown_left <= 0.01 else "%.2fs" % cooldown_left

	var enemy_count := 0
	if _enemy_container:
		enemy_count = _enemy_container.get_child_count()

	var text := "HP: %d\nTIME: %.1f\nSCORE: %d\nDASH: %s\nENEMIES: %d" % [_game_state.hp, _game_state.elapsed, _game_state.score, dash_text, enemy_count]
	if extra != "":
		text += "\n" + extra
	if _game_state.is_game_over:
		text += "\nPress [R] to Restart"
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
