extends Node

const EnemyMiniBoss := preload("res://scripts/entities/enemy_miniboss.gd")

var _balance: RefCounted
var _state: RefCounted
var _player: Node2D
var _enemy_container: Node2D

var _spawn_time: float = 600.0
var _warning_duration: float = 3.0
var _hp_scale: float = 1.0
var _force_pattern_cycle: bool = false

var _warning_started: bool = false
var _warning_active: bool = false
var _warning_ends_at: float = 0.0

var _spawned: bool = false
var _boss_alive: bool = false
var _boss_defeated: bool = false
var _boss_ref: Node2D

func setup(
	balance: RefCounted,
	state: RefCounted,
	player: Node2D,
	enemy_container: Node2D,
	spawn_time_override: float = -1.0,
	hp_scale_override: float = 1.0,
	force_pattern_cycle: bool = false
) -> void:
	_balance = balance
	_state = state
	_player = player
	_enemy_container = enemy_container

	_spawn_time = float(_balance.MINIBOSS_SPAWN_TIME)
	_warning_duration = float(_balance.MINIBOSS_WARNING_DURATION)
	_hp_scale = max(0.1, hp_scale_override)
	_force_pattern_cycle = force_pattern_cycle
	if spawn_time_override > 0.0:
		_spawn_time = spawn_time_override

	reset_runtime()

func reset_runtime() -> void:
	_warning_started = false
	_warning_active = false
	_warning_ends_at = 0.0
	_spawned = false
	_boss_alive = false
	_boss_defeated = false
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
			_boss_defeated = true
			print("MINIBOSS_DEFEATED")

func is_warning_active() -> bool:
	return _warning_active

func get_warning_remaining() -> float:
	if not _warning_active:
		return 0.0
	return max(0.0, _warning_ends_at - float(_state.elapsed))

func is_boss_alive() -> bool:
	return _boss_alive

func is_boss_dash_telegraphing() -> bool:
	if not _boss_alive:
		return false
	if _boss_ref == null:
		return false
	if not _boss_ref.has_method("is_dash_telegraphing"):
		return false
	return bool(_boss_ref.is_dash_telegraphing())

func get_boss_dash_telegraph_remaining() -> float:
	if not _boss_alive:
		return 0.0
	if _boss_ref == null:
		return 0.0
	if not _boss_ref.has_method("get_dash_telegraph_remaining"):
		return 0.0
	return float(_boss_ref.get_dash_telegraph_remaining())

func get_boss_spawn_grace_remaining() -> float:
	if not _boss_alive:
		return 0.0
	if _boss_ref == null:
		return 0.0
	if not _boss_ref.has_method("get_spawn_grace_remaining"):
		return 0.0
	return float(_boss_ref.get_spawn_grace_remaining())

func get_boss_phase() -> int:
	if not _boss_alive:
		return 0
	if _boss_ref == null:
		return 0
	if not _boss_ref.has_method("get_phase"):
		return 0
	return int(_boss_ref.get_phase())

func is_boss_phase_transitioning() -> bool:
	if not _boss_alive:
		return false
	if _boss_ref == null:
		return false
	if not _boss_ref.has_method("is_phase_transitioning"):
		return false
	return bool(_boss_ref.is_phase_transitioning())

func get_boss_phase_transition_remaining() -> float:
	if not _boss_alive:
		return 0.0
	if _boss_ref == null:
		return 0.0
	if not _boss_ref.has_method("get_phase_transition_remaining"):
		return 0.0
	return float(_boss_ref.get_phase_transition_remaining())

func is_boss_summon_telegraphing() -> bool:
	if not _boss_alive:
		return false
	if _boss_ref == null:
		return false
	if not _boss_ref.has_method("is_summon_telegraphing"):
		return false
	return bool(_boss_ref.is_summon_telegraphing())

func get_boss_summon_telegraph_remaining() -> float:
	if not _boss_alive:
		return 0.0
	if _boss_ref == null:
		return 0.0
	if not _boss_ref.has_method("get_summon_telegraph_remaining"):
		return 0.0
	return float(_boss_ref.get_summon_telegraph_remaining())

func is_boss_summon_recovering() -> bool:
	if not _boss_alive:
		return false
	if _boss_ref == null:
		return false
	if not _boss_ref.has_method("is_summon_recovering"):
		return false
	return bool(_boss_ref.is_summon_recovering())

func get_boss_summon_recovery_remaining() -> float:
	if not _boss_alive:
		return 0.0
	if _boss_ref == null:
		return 0.0
	if not _boss_ref.has_method("get_summon_recovery_remaining"):
		return 0.0
	return float(_boss_ref.get_summon_recovery_remaining())

func get_boss_pending_summon_pattern() -> String:
	if not _boss_alive:
		return ""
	if _boss_ref == null:
		return ""
	if not _boss_ref.has_method("get_pending_summon_pattern"):
		return ""
	return String(_boss_ref.get_pending_summon_pattern())

func was_boss_defeated() -> bool:
	return _boss_defeated

func has_spawned() -> bool:
	return _spawned

func get_spawn_time() -> float:
	return _spawn_time

func _spawn_miniboss() -> void:
	if _spawned:
		return

	var summon_cfg: Dictionary = {
		"grunt_speed": float(_balance.ENEMY_GRUNT_SPEED) * 1.05,
		"grunt_hp": max(1, int(_balance.ENEMY_GRUNT_HP)),
		"grunt_hit_radius": float(_balance.ENEMY_GRUNT_HIT_RADIUS),
		"dasher_speed": float(_balance.ENEMY_DASHER_SPEED) * 1.08,
		"dasher_hp": max(1, int(_balance.ENEMY_DASHER_HP) - 1),
		"dasher_hit_radius": float(_balance.ENEMY_DASHER_HIT_RADIUS),
		"dasher_dash_speed": float(_balance.ENEMY_DASHER_DASH_SPEED) * 0.95,
		"dasher_dash_interval": float(_balance.ENEMY_DASHER_DASH_INTERVAL),
		"dasher_dash_duration": float(_balance.ENEMY_DASHER_DASH_DURATION)
	}

	var scaled_hp: int = max(20, int(round(float(_balance.MINIBOSS_HP) * _hp_scale)))
	var boss := Node2D.new()
	boss.set_script(EnemyMiniBoss)
	boss.setup(
		_player,
		float(_balance.MINIBOSS_SPEED),
		scaled_hp,
		float(_balance.MINIBOSS_HIT_RADIUS),
		float(_balance.MINIBOSS_DASH_SPEED),
		float(_balance.MINIBOSS_DASH_INTERVAL),
		float(_balance.MINIBOSS_DASH_DURATION),
		float(_balance.MINIBOSS_DASH_WINDUP),
		float(_balance.MINIBOSS_DASH_RECOVERY),
		float(_balance.MINIBOSS_DASH_MIN_DISTANCE),
		float(_balance.MINIBOSS_COMBO_DASH_CHANCE),
		float(_balance.MINIBOSS_COMBO_DASH_GAP),
		float(_balance.MINIBOSS_SPAWN_GRACE),
		int(_balance.MINIBOSS_CONTACT_DAMAGE),
		int(_balance.MINIBOSS_EXP_REWARD),
		float(_balance.MINIBOSS_SUMMON_INTERVAL),
		float(_balance.MINIBOSS_SUMMON_WINDUP),
		float(_balance.MINIBOSS_SUMMON_WALL_CHANCE),
		float(_balance.MINIBOSS_SUMMON_CROSS_CHANCE),
		int(_balance.MINIBOSS_SUMMON_COUNT),
		float(_balance.MINIBOSS_SUMMON_RADIUS),
		float(_balance.MINIBOSS_SUMMON_RECOVERY),
		float(_balance.MINIBOSS_PATTERN_REPEAT_PENALTY),
		summon_cfg,
		float(_balance.MINIBOSS_PHASE2_HP_RATIO),
		float(_balance.MINIBOSS_PHASE2_TRANSITION),
		float(_balance.MINIBOSS_PHASE2_SPEED_MULT),
		float(_balance.MINIBOSS_PHASE2_DASH_SPEED_MULT),
		float(_balance.MINIBOSS_PHASE2_DASH_INTERVAL_MULT),
		float(_balance.MINIBOSS_PHASE2_DASH_WINDUP_MULT),
		int(_balance.MINIBOSS_PHASE2_COMBO_BONUS),
		float(_balance.MINIBOSS_PHASE2_SUMMON_INTERVAL_MULT),
		float(_balance.MINIBOSS_PHASE2_SUMMON_WALL_BONUS),
		float(_balance.MINIBOSS_PHASE2_SPAWN_GRACE),
		_force_pattern_cycle
	)
	boss.position = Vector2(float(_balance.ARENA_SIZE.x) * 0.5, -60.0)
	_enemy_container.add_child(boss)
	_boss_ref = boss
	_spawned = true
	_boss_alive = true
	print("MINIBOSS_SPAWNED")
