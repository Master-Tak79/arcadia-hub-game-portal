extends Node2D

const GameState := preload("res://scripts/core/game_state.gd")
const SignalBus := preload("res://scripts/core/signal_bus.gd")
const Balance := preload("res://scripts/data/balance.gd")
const InputActions := preload("res://scripts/core/input_actions.gd")
const Spawner := preload("res://scripts/systems/spawner.gd")
const ScoreSystem := preload("res://scripts/systems/score_system.gd")
const QaDriver := preload("res://scripts/systems/qa_driver.gd")

@onready var _player: Node2D = $Player
@onready var _enemy_container: Node2D = $EnemyContainer
@onready var _hud: CanvasLayer = $HUD

var _state: RefCounted
var _signal_bus: RefCounted
var _balance: RefCounted
var _input_actions: RefCounted

var _spawner: Node
var _score_system: Node
var _qa_driver: Node
var _damage_cooldown_left: float = 0.0
var _qa_autoplay: bool = false

func _ready() -> void:
	_state = GameState.new()
	_signal_bus = SignalBus.new()
	_balance = Balance.new()
	_input_actions = InputActions.new()
	_input_actions.ensure_default_bindings()
	_detect_runtime_modes()

	_player.setup(_balance)
	_hud.setup(_signal_bus, _state, _player, _enemy_container)

	_signal_bus.player_damaged.connect(_on_player_hit)

	_spawner = Spawner.new()
	add_child(_spawner)
	_spawner.setup(_player, _enemy_container, _balance, _signal_bus, _state)

	_score_system = ScoreSystem.new()
	add_child(_score_system)
	_score_system.setup(_state, _signal_bus)

	_qa_driver = QaDriver.new()
	add_child(_qa_driver)
	_qa_driver.setup(_player, _balance, _state, _qa_autoplay)
	_qa_driver.force_damage.connect(_on_player_hit)
	_qa_driver.request_restart.connect(_on_qa_restart_requested)

	_start_round()
	if _qa_autoplay:
		print("QA_AUTOPLAY_ON")
	print("NEON_DODGE_BOOT_OK")

func _process(delta: float) -> void:
	if _damage_cooldown_left > 0.0:
		_damage_cooldown_left -= delta

	if _state.is_game_over:
		if Input.is_action_just_pressed("restart"):
			_restart_round()
		return

	_state.elapsed += delta
	_player.position.x = clamp(_player.position.x, 0.0, float(_balance.ARENA_SIZE.x))
	_player.position.y = clamp(_player.position.y, 0.0, float(_balance.ARENA_SIZE.y))

func _on_player_hit(delta_hp: int) -> void:
	if _state.is_game_over:
		return
	if _damage_cooldown_left > 0.0:
		return

	_state.hp = max(0, _state.hp + delta_hp)
	if _player and _player.has_method("on_hit"):
		_player.on_hit()
	_signal_bus.emit_signal("hp_changed", _state.hp)
	_damage_cooldown_left = float(_balance.PLAYER_INVULN_AFTER_HIT)

	if _state.hp <= 0:
		_state.is_game_over = true
		_player.set_enabled(false)
		_signal_bus.emit_signal("game_over", _state.score)

func _start_round() -> void:
	_state.reset()
	_damage_cooldown_left = 0.0
	_player.position = Vector2(float(_balance.ARENA_SIZE.x) * 0.5, float(_balance.ARENA_SIZE.y) * 0.5)
	_player.reset_runtime()
	_player.set_enabled(true)
	_clear_enemies()
	if _spawner and _spawner.has_method("reset_runtime"):
		_spawner.reset_runtime()
	_signal_bus.emit_signal("hp_changed", _state.hp)
	_signal_bus.emit_signal("score_changed", _state.score)

func _restart_round() -> void:
	_start_round()

func _on_qa_restart_requested(restart_count: int) -> void:
	_restart_round()
	print("QA_RESTART_%d" % restart_count)

func _detect_runtime_modes() -> void:
	for arg in OS.get_cmdline_user_args():
		if arg == "--qa-autoplay" or arg == "qa-autoplay":
			_qa_autoplay = true

func _clear_enemies() -> void:
	for node in _enemy_container.get_children():
		node.queue_free()
