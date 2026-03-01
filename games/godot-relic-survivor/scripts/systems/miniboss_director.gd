extends Node

const EnemyMiniBoss := preload("res://scripts/entities/enemy_miniboss.gd")

var _balance: RefCounted
var _state: RefCounted
var _player: Node2D
var _enemy_container: Node2D

var _spawn_time: float = 600.0
var _warning_duration: float = 3.0

var _warning_started: bool = false
var _warning_active: bool = false
var _warning_ends_at: float = 0.0

var _spawned: bool = false
var _boss_alive: bool = false
var _boss_ref: Node2D

func setup(balance: RefCounted, state: RefCounted, player: Node2D, enemy_container: Node2D, spawn_time_override: float = -1.0) -> void:
	_balance = balance
	_state = state
	_player = player
	_enemy_container = enemy_container

	_spawn_time = float(_balance.MINIBOSS_SPAWN_TIME)
	_warning_duration = float(_balance.MINIBOSS_WARNING_DURATION)
	if spawn_time_override > 0.0:
		_spawn_time = spawn_time_override

	reset_runtime()

func reset_runtime() -> void:
	_warning_started = false
	_warning_active = false
	_warning_ends_at = 0.0
	_spawned = false
	_boss_alive = false
	_boss_ref = null

func _process(_delta: float) -> void:
	if _state == null or _state.is_game_over:
		return
	if _state.is_paused:
		return
	if _enemy_container == null or _player == null:
		return

	var now: float = _state.elapsed

	if not _warning_started and now >= (_spawn_time - _warning_duration):
		_warning_started = true
		_warning_active = true
		_warning_ends_at = _spawn_time
		print("MINIBOSS_WARNING_ON")

	if _warning_active and now >= _warning_ends_at:
		_warning_active = false

	if not _spawned and now >= _spawn_time:
		_spawn_miniboss()

	if _spawned and _boss_alive:
		if _boss_ref == null or _boss_ref.is_queued_for_deletion():
			_boss_alive = false
			print("MINIBOSS_DEFEATED")

func is_warning_active() -> bool:
	return _warning_active

func get_warning_remaining() -> float:
	if not _warning_active:
		return 0.0
	return max(0.0, _warning_ends_at - float(_state.elapsed))

func is_boss_alive() -> bool:
	return _boss_alive

func has_spawned() -> bool:
	return _spawned

func get_spawn_time() -> float:
	return _spawn_time

func _spawn_miniboss() -> void:
	if _spawned:
		return
	var boss := Node2D.new()
	boss.set_script(EnemyMiniBoss)
	boss.setup(
		_player,
		float(_balance.MINIBOSS_SPEED),
		int(_balance.MINIBOSS_HP),
		float(_balance.MINIBOSS_HIT_RADIUS),
		float(_balance.MINIBOSS_DASH_SPEED),
		float(_balance.MINIBOSS_DASH_INTERVAL),
		float(_balance.MINIBOSS_DASH_DURATION),
		int(_balance.MINIBOSS_CONTACT_DAMAGE),
		int(_balance.MINIBOSS_EXP_REWARD)
	)
	boss.position = Vector2(float(_balance.ARENA_SIZE.x) * 0.5, -60.0)
	_enemy_container.add_child(boss)
	_boss_ref = boss
	_spawned = true
	_boss_alive = true
	print("MINIBOSS_SPAWNED")
