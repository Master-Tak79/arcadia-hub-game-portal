extends Node

const EnemyGrunt := preload("res://scripts/entities/enemy_grunt.gd")
const EnemyDasher := preload("res://scripts/entities/enemy_dasher.gd")

var _balance: RefCounted
var _state: RefCounted
var _player: Node2D
var _enemy_container: Node2D

var _elapsed: float = 0.0
var _next_spawn_in: float = 1.0

func setup(balance: RefCounted, state: RefCounted, player: Node2D, enemy_container: Node2D) -> void:
	_balance = balance
	_state = state
	_player = player
	_enemy_container = enemy_container
	reset_runtime()
	randomize()

func reset_runtime() -> void:
	_elapsed = 0.0
	_next_spawn_in = float(_balance.SPAWN_INTERVAL_BASE)
	if _enemy_container:
		for enemy in _enemy_container.get_children():
			enemy.queue_free()

func _process(delta: float) -> void:
	if _state == null or _state.is_game_over or _state.is_paused:
		return
	if _player == null or _enemy_container == null:
		return

	_elapsed += delta
	_next_spawn_in -= delta
	if _next_spawn_in > 0.0:
		return

	var active_count: int = get_active_enemy_count()
	if active_count >= int(_balance.ACTIVE_ENEMY_HARD_CAP):
		_next_spawn_in = 0.35
		return
	if active_count >= int(_balance.ACTIVE_ENEMY_SOFT_CAP):
		_next_spawn_in = 0.22
		return

	_spawn_enemy()

	var ramp: float = float(_balance.SPAWN_INTERVAL_BASE) - _elapsed * float(_balance.SPAWN_RAMP_PER_SEC)
	_next_spawn_in = max(float(_balance.SPAWN_INTERVAL_MIN), ramp)

func get_active_enemy_count() -> int:
	if _enemy_container == null:
		return 0
	return _enemy_container.get_child_count()

func _spawn_enemy() -> void:
	var enemy: Node2D = _make_enemy()
	enemy.position = _random_edge_position()
	_enemy_container.add_child(enemy)

func _make_enemy() -> Node2D:
	var dasher_chance: float = clampf(float(_balance.SPAWN_DASHER_CHANCE_BASE) + _elapsed * float(_balance.SPAWN_DASHER_CHANCE_RAMP), 0.0, 0.65)
	if randf() < dasher_chance:
		var dasher := Node2D.new()
		dasher.set_script(EnemyDasher)
		dasher.setup(
			_player,
			float(_balance.ENEMY_DASHER_SPEED),
			int(_balance.ENEMY_DASHER_HP),
			float(_balance.ENEMY_DASHER_HIT_RADIUS),
			float(_balance.ENEMY_DASHER_DASH_SPEED),
			float(_balance.ENEMY_DASHER_DASH_INTERVAL),
			float(_balance.ENEMY_DASHER_DASH_DURATION)
		)
		return dasher

	var grunt := Node2D.new()
	grunt.set_script(EnemyGrunt)
	grunt.setup(
		_player,
		float(_balance.ENEMY_GRUNT_SPEED),
		int(_balance.ENEMY_GRUNT_HP),
		float(_balance.ENEMY_GRUNT_HIT_RADIUS)
	)
	return grunt

func _random_edge_position() -> Vector2:
	var w := float(_balance.ARENA_SIZE.x)
	var h := float(_balance.ARENA_SIZE.y)
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
