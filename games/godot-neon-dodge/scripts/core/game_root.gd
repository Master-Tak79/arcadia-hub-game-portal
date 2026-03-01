extends Node2D

const GameState := preload("res://scripts/core/game_state.gd")
const SignalBus := preload("res://scripts/core/signal_bus.gd")
const Balance := preload("res://scripts/data/balance.gd")
const InputActions := preload("res://scripts/core/input_actions.gd")
const Spawner := preload("res://scripts/systems/spawner.gd")
const ScoreSystem := preload("res://scripts/systems/score_system.gd")

@onready var _player: Node2D = $Player
@onready var _enemy_container: Node2D = $EnemyContainer
@onready var _hud: CanvasLayer = $HUD

var _state: RefCounted
var _signal_bus: RefCounted
var _balance: RefCounted
var _input_actions: RefCounted

var _spawner: Node
var _score_system: Node
var _damage_cooldown_left: float = 0.0

func _ready() -> void:
	_state = GameState.new()
	_signal_bus = SignalBus.new()
	_balance = Balance.new()
	_input_actions = InputActions.new()
	_input_actions.ensure_default_bindings()

	_player.setup(_balance)
	_hud.setup(_signal_bus, _state, _player)

	_signal_bus.player_damaged.connect(_on_player_hit)

	_spawner = Spawner.new()
	add_child(_spawner)
	_spawner.setup(_player, _enemy_container, _balance, _signal_bus, _state)

	_score_system = ScoreSystem.new()
	add_child(_score_system)
	_score_system.setup(_state, _signal_bus)

	_start_round()
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

func _clear_enemies() -> void:
	for node in _enemy_container.get_children():
		node.queue_free()
