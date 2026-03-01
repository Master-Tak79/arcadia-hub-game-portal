extends Node

const ENEMY_SCRIPT := preload("res://scripts/entities/enemy_chaser.gd")

var _player: Node2D
var _enemy_container: Node2D
var _balance: RefCounted
var _signal_bus: RefCounted
var _elapsed := 0.0
var _next_spawn_in := 1.0

func setup(player: Node2D, enemy_container: Node2D, balance: RefCounted, signal_bus: RefCounted) -> void:
	_player = player
	_enemy_container = enemy_container
	_balance = balance
	_signal_bus = signal_bus
	_elapsed = 0.0
	_next_spawn_in = _balance.SPAWN_INTERVAL_BASE
	randomize()

func _process(delta: float) -> void:
	if _player == null or _enemy_container == null:
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
	enemy.setup(_player, _balance.ENEMY_SPEED_BASE + randf() * 35.0, _balance.ENEMY_HIT_RADIUS, _signal_bus)
	enemy.position = _random_edge_position()
	_enemy_container.add_child(enemy)

func _random_edge_position() -> Vector2:
	var w: float = float(_balance.ARENA_SIZE.x)
	var h: float = float(_balance.ARENA_SIZE.y)
	var side := randi() % 4
	match side:
		0:
			return Vector2(randf() * w, 0)
		1:
			return Vector2(randf() * w, h)
		2:
			return Vector2(0, randf() * h)
		_:
			return Vector2(w, randf() * h)
