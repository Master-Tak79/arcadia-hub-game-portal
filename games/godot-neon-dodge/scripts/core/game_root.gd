extends Node2D

const GameState := preload("res://scripts/core/game_state.gd")
const SignalBus := preload("res://scripts/core/signal_bus.gd")
const Balance := preload("res://scripts/data/balance.gd")
const Spawner := preload("res://scripts/systems/spawner.gd")
const ScoreSystem := preload("res://scripts/systems/score_system.gd")

@onready var _player: Node2D = $Player
@onready var _enemy_container: Node2D = $EnemyContainer
@onready var _hud: CanvasLayer = $HUD

var _state: RefCounted
var _signal_bus: RefCounted
var _balance: RefCounted

func _ready() -> void:
	_state = GameState.new()
	_signal_bus = SignalBus.new()
	_balance = Balance.new()

	_player.setup(_balance)
	_hud.setup(_signal_bus, _state)

	_signal_bus.player_damaged.connect(_on_player_hit)

	var spawner := Spawner.new()
	add_child(spawner)
	spawner.setup(_player, _enemy_container, _balance, _signal_bus)

	var score_system := ScoreSystem.new()
	add_child(score_system)
	score_system.setup(_state, _signal_bus)

	print("NEON_DODGE_BOOT_OK")

func _process(delta: float) -> void:
	if _state.is_game_over:
		return
	_state.elapsed += delta
	_player.position.x = clamp(_player.position.x, 0.0, _balance.ARENA_SIZE.x)
	_player.position.y = clamp(_player.position.y, 0.0, _balance.ARENA_SIZE.y)

func _on_player_hit(delta_hp: int) -> void:
	if _state.is_game_over:
		return
	_state.hp = max(0, _state.hp + delta_hp)
	_signal_bus.emit_signal("hp_changed", _state.hp)
	if _state.hp <= 0:
		_state.is_game_over = true
		_signal_bus.emit_signal("game_over", _state.score)
