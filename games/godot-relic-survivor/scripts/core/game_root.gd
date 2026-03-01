extends Node2D

const GameState := preload("res://scripts/core/game_state.gd")
const SignalBus := preload("res://scripts/core/signal_bus.gd")
const Balance := preload("res://scripts/data/balance.gd")
const InputActions := preload("res://scripts/core/input_actions.gd")
const SpawnDirector := preload("res://scripts/systems/spawn_director.gd")

@onready var _player: Node2D = $Player
@onready var _hud: CanvasLayer = $HUD

var _state: RefCounted
var _signal_bus: RefCounted
var _balance: RefCounted
var _input_actions: RefCounted
var _spawn_director: Node

func _ready() -> void:
	_state = GameState.new()
	_signal_bus = SignalBus.new()
	_balance = Balance.new()
	_input_actions = InputActions.new()
	_input_actions.ensure_default_bindings()

	_player.setup(_balance)
	_hud.setup(_state)

	_spawn_director = SpawnDirector.new()
	add_child(_spawn_director)
	_spawn_director.setup(_balance, _state)

	print("RELIC_SURVIVOR_BOOT_OK")

func _process(delta: float) -> void:
	if _state.is_game_over:
		if Input.is_action_just_pressed("restart"):
			_restart_round()
		return

	_state.elapsed += delta
	_player.position.x = clamp(_player.position.x, 0.0, float(_balance.ARENA_SIZE.x))
	_player.position.y = clamp(_player.position.y, 0.0, float(_balance.ARENA_SIZE.y))

	if _state.elapsed >= 30.0:
		_state.is_game_over = true
		_player.set_enabled(false)

func _restart_round() -> void:
	_state.reset()
	_player.position = Vector2(float(_balance.ARENA_SIZE.x) * 0.5, float(_balance.ARENA_SIZE.y) * 0.5)
	_player.reset_runtime()
	_player.set_enabled(true)
	if _spawn_director and _spawn_director.has_method("reset_runtime"):
		_spawn_director.reset_runtime()
