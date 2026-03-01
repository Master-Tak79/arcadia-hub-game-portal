extends Node

const ENEMY_SCRIPT := preload("res://scripts/entities/enemy_chaser.gd")

var _player: Node2D
var _enemy_container: Node2D
var _balance: RefCounted
var _signal_bus: RefCounted
var _game_state: RefCounted
var _elapsed: float = 0.0
var _next_spawn_in: float = 1.0

func setup(player: Node2D, enemy_container: Node2D, balance: RefCounted, signal_bus: RefCounted, game_state: RefCounted) -> void:
	_player = player
	_enemy_container = enemy_container
	_balance = balance
	_signal_bus = signal_bus
	_game_state = game_state
	reset_runtime()
	randomize()

func reset_runtime() -> void:
	_elapsed = 0.0
	_next_spawn_in = float(_balance.SPAWN_INTERVAL_BASE)

func _process(delta: float) -> void:
	if _player == null or _enemy_container == null or _game_state == null:
		return
	if _game_state.is_game_over:
		return

	_elapsed += delta
	_next_spawn_in -= delta
	if _next_spawn_in > 0.0:
		return

	_spawn_enemy()

	var ramp: float = float(_balance.SPAWN_INTERVAL_BASE) - (_elapsed * float(_balance.SPAWN_RAMP_PER_SEC))
	_next_spawn_in = max(float(_balance.SPAWN_INTERVAL_MIN), ramp)

func _spawn_enemy() -> void:
	var enemy := Node2D.new()
	enemy.set_script(ENEMY_SCRIPT)
	enemy.setup(_player, float(_balance.ENEMY_SPEED_BASE) + randf() * 35.0, float(_balance.ENEMY_HIT_RADIUS), _signal_bus)
	enemy.position = _random_edge_position()
	_enemy_container.add_child(enemy)

func _random_edge_position() -> Vector2:
	var w: float = float(_balance.ARENA_SIZE.x)
	var h: float = float(_balance.ARENA_SIZE.y)
	var side: int = randi() % 4
	match side:
		0:
			return Vector2(randf() * w, 0)
		1:
			return Vector2(randf() * w, h)
		2:
			return Vector2(0, randf() * h)
		_:
			return Vector2(w, randf() * h)
