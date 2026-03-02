extends Node

const EnemyGrunt := preload("res://scripts/entities/enemy_grunt.gd")
const EnemyDasher := preload("res://scripts/entities/enemy_dasher.gd")
const EnemyEliteGrunt := preload("res://scripts/entities/enemy_elite_grunt.gd")
const EnemyEliteDasher := preload("res://scripts/entities/enemy_elite_dasher.gd")

var _balance: RefCounted
var _state: RefCounted
var _player: Node2D
var _enemy_container: Node2D
var _miniboss_director: Node

var _elapsed: float = 0.0
var _next_spawn_in: float = 1.0
var _elite_test_mode: bool = false
var _elite_cycle_index: int = 0

func setup(balance: RefCounted, state: RefCounted, player: Node2D, enemy_container: Node2D) -> void:
	_balance = balance
	_state = state
	_player = player
	_enemy_container = enemy_container
	_miniboss_director = null
	reset_runtime()
	randomize()

func set_miniboss_director(director: Node) -> void:
	_miniboss_director = director

func set_elite_test_mode(enabled: bool) -> void:
	_elite_test_mode = enabled

func reset_runtime() -> void:
	_elapsed = 0.0
	_next_spawn_in = float(_balance.SPAWN_INTERVAL_BASE)
	_elite_cycle_index = 0
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
		var hard_over: int = active_count - int(_balance.ACTIVE_ENEMY_HARD_CAP)
		_next_spawn_in = float(_balance.HARD_CAP_BACKOFF_BASE) + min(0.24, float(hard_over) * 0.012)
		return
	if active_count >= int(_balance.ACTIVE_ENEMY_SOFT_CAP):
		var soft_over: int = active_count - int(_balance.ACTIVE_ENEMY_SOFT_CAP)
		_next_spawn_in = float(_balance.SOFT_CAP_BACKOFF_BASE) + min(0.14, float(soft_over) * 0.008)
		return

	_spawn_enemy()

	_next_spawn_in = _get_phase_spawn_interval()

func get_active_enemy_count() -> int:
	if _enemy_container == null:
		return 0
	return _enemy_container.get_child_count()

func _spawn_enemy() -> void:
	var enemy: Node2D = _make_enemy()
	enemy.position = _pick_spawn_position_with_safety()
	_enemy_container.add_child(enemy)

func _pick_spawn_position_with_safety() -> Vector2:
	var safe_radius: float = float(_balance.SPAWN_PLAYER_SAFE_RADIUS)
	var attempts: int = max(1, int(_balance.SPAWN_SAFE_ATTEMPTS))

	var fallback: Vector2 = _random_edge_position()
	var fallback_dist: float = _player.position.distance_to(fallback)
	for _i in range(attempts):
		var candidate: Vector2 = _random_edge_position()
		var dist: float = _player.position.distance_to(candidate)
		if dist > fallback_dist:
			fallback = candidate
			fallback_dist = dist
		if dist >= safe_radius:
			return candidate

	return fallback

func _make_enemy() -> Node2D:
	var elite_kind: String = _roll_elite_kind()
	if elite_kind == "elite_grunt":
		print("ELITE_SPAWNED:elite_grunt")
		return _make_elite_grunt()
	if elite_kind == "elite_dasher":
		print("ELITE_SPAWNED:elite_dasher")
		return _make_elite_dasher()

	var dasher_chance: float = _get_phase_dasher_chance()
	if randf() < dasher_chance:
		return _make_dasher()

	return _make_grunt()

func _make_grunt() -> Node2D:
	var grunt := Node2D.new()
	grunt.set_script(EnemyGrunt)
	grunt.setup(
		_player,
		float(_balance.ENEMY_GRUNT_SPEED),
		int(_balance.ENEMY_GRUNT_HP),
		float(_balance.ENEMY_GRUNT_HIT_RADIUS)
	)
	return grunt

func _make_dasher() -> Node2D:
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

func _make_elite_grunt() -> Node2D:
	var enemy := Node2D.new()
	enemy.set_script(EnemyEliteGrunt)
	enemy.setup(
		_player,
		float(_balance.ELITE_GRUNT_SPEED),
		int(_balance.ELITE_GRUNT_HP),
		float(_balance.ELITE_GRUNT_HIT_RADIUS),
		int(_balance.ELITE_GRUNT_CONTACT_DAMAGE),
		int(_balance.ELITE_GRUNT_EXP_REWARD),
		float(_balance.ELITE_GRUNT_BURST_SPEED_MULT),
		float(_balance.ELITE_GRUNT_BURST_INTERVAL),
		float(_balance.ELITE_GRUNT_BURST_DURATION)
	)
	return enemy

func _make_elite_dasher() -> Node2D:
	var enemy := Node2D.new()
	enemy.set_script(EnemyEliteDasher)
	enemy.setup(
		_player,
		float(_balance.ELITE_DASHER_SPEED),
		int(_balance.ELITE_DASHER_HP),
		float(_balance.ELITE_DASHER_HIT_RADIUS),
		int(_balance.ELITE_DASHER_CONTACT_DAMAGE),
		int(_balance.ELITE_DASHER_EXP_REWARD),
		float(_balance.ELITE_DASHER_DASH_SPEED),
		float(_balance.ELITE_DASHER_DASH_INTERVAL),
		float(_balance.ELITE_DASHER_DASH_DURATION),
		float(_balance.ELITE_DASHER_DASH_CHAIN_GAP),
		int(_balance.ELITE_DASHER_DASH_CHAIN_COUNT)
	)
	return enemy

func _roll_elite_kind() -> String:
	if _elite_test_mode and _elapsed >= float(_balance.ELITE_TEST_START):
		var forced: String = "elite_grunt" if (_elite_cycle_index % 2) == 0 else "elite_dasher"
		_elite_cycle_index += 1
		return forced

	if _elapsed < float(_balance.ELITE_PHASE_START):
		return ""

	var grunt_chance: float = float(_balance.ELITE_GRUNT_CHANCE_BASE) + (_elapsed * float(_balance.ELITE_GRUNT_CHANCE_RAMP))
	var dasher_chance: float = float(_balance.ELITE_DASHER_CHANCE_BASE) + (_elapsed * float(_balance.ELITE_DASHER_CHANCE_RAMP))

	if _is_boss_active():
		grunt_chance *= 0.70
		dasher_chance *= 0.70
	elif _is_post_boss_recovery():
		grunt_chance *= 0.82
		dasher_chance *= 0.82

	var total: float = grunt_chance + dasher_chance
	var cap: float = float(_balance.ELITE_TOTAL_CHANCE_CAP)
	if total > cap and total > 0.0:
		var scale: float = cap / total
		grunt_chance *= scale
		dasher_chance *= scale
		total = cap

	var roll: float = randf()
	if roll >= total:
		return ""

	if roll < grunt_chance:
		return "elite_grunt"
	return "elite_dasher"

func _get_phase_spawn_interval() -> float:
	var ramp: float = float(_balance.SPAWN_INTERVAL_BASE) - _elapsed * float(_balance.SPAWN_RAMP_PER_SEC)
	var interval: float = max(float(_balance.SPAWN_INTERVAL_MIN), ramp)

	# Phase shaping: early = gentler, mid = normal, late = controlled pressure
	if _elapsed < 120.0:
		interval += 0.08
	elif _elapsed > 360.0:
		interval = max(float(_balance.SPAWN_INTERVAL_MIN), interval - 0.03)

	if _elapsed >= float(_balance.LATE_PHASE_START):
		interval += float(_balance.LATE_PHASE_INTERVAL_BONUS)

	# Boss phase guardrail: keep reads manageable while boss is active
	if _is_boss_active():
		interval += float(_balance.BOSS_PHASE_SPAWN_INTERVAL_BONUS)
	elif _is_post_boss_recovery():
		interval += float(_balance.POST_BOSS_SPAWN_INTERVAL_BONUS)

	return interval

func _get_phase_dasher_chance() -> float:
	var base_chance: float = float(_balance.SPAWN_DASHER_CHANCE_BASE) + _elapsed * float(_balance.SPAWN_DASHER_CHANCE_RAMP)
	var chance: float = base_chance

	# Phase shaping: early reduce spike deaths, late recover pressure
	if _elapsed < 120.0:
		chance *= 0.62
	elif _elapsed > 360.0:
		chance += 0.04

	if _elapsed >= float(_balance.LATE_PHASE_START):
		chance += float(_balance.LATE_PHASE_DASHER_BONUS)

	# Boss phase guardrail: reduce bursty dash pressure while boss is active
	if _is_boss_active():
		chance *= float(_balance.BOSS_PHASE_DASHER_CHANCE_MULT)
	elif _is_post_boss_recovery():
		chance *= float(_balance.POST_BOSS_DASHER_CHANCE_MULT)

	return clampf(chance, 0.0, 0.65)

func _is_boss_active() -> bool:
	if _miniboss_director == null:
		return false
	if _miniboss_director.has_method("is_boss_alive"):
		return bool(_miniboss_director.is_boss_alive())
	return false

func _is_post_boss_recovery() -> bool:
	if _miniboss_director == null:
		return false
	if not _miniboss_director.has_method("was_boss_defeated"):
		return false
	if not bool(_miniboss_director.was_boss_defeated()):
		return false
	if not _miniboss_director.has_method("get_spawn_time"):
		return false

	var spawn_time: float = float(_miniboss_director.get_spawn_time())
	var recovery_end: float = spawn_time + float(_balance.POST_BOSS_RECOVERY_DURATION)
	return _elapsed <= recovery_end

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
