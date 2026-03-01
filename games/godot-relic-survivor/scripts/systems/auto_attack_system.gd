extends Node

const ProjectileScript := preload("res://scripts/entities/projectile.gd")

var _balance: RefCounted
var _state: RefCounted
var _player: Node2D
var _enemy_container: Node2D
var _projectile_container: Node2D

var _attack_cooldown_left: float = 0.0

func setup(balance: RefCounted, state: RefCounted, player: Node2D, enemy_container: Node2D, projectile_container: Node2D) -> void:
	_balance = balance
	_state = state
	_player = player
	_enemy_container = enemy_container
	_projectile_container = projectile_container
	reset_runtime()

func reset_runtime() -> void:
	_attack_cooldown_left = 0.0

func _process(delta: float) -> void:
	if _state == null or _state.is_game_over or _state.is_paused:
		return
	if _player == null or _enemy_container == null or _projectile_container == null:
		return

	_attack_cooldown_left -= delta
	if _attack_cooldown_left > 0.0:
		return

	var target := _find_nearest_enemy()
	if target == null:
		return

	var to_target: Vector2 = target.position - _player.position
	var attack_range: float = float(_balance.ATTACK_RANGE) + float(_state.attack_range_bonus)
	if to_target.length() > attack_range:
		return

	_fire_projectiles(to_target)

	var interval_mult: float = clampf(1.0 - float(_state.attack_interval_reduction), 0.2, 1.0)
	_attack_cooldown_left = float(_balance.ATTACK_INTERVAL) * interval_mult

func _find_nearest_enemy() -> Node2D:
	var best: Node2D = null
	var best_dist: float = INF
	for enemy in _enemy_container.get_children():
		if not (enemy is Node2D):
			continue
		var dist: float = _player.position.distance_squared_to(enemy.position)
		if dist < best_dist:
			best_dist = dist
			best = enemy
	return best

func _fire_projectiles(direction: Vector2) -> void:
	var shot_count: int = 1 + int(_state.extra_projectiles)
	var center_index: float = (float(shot_count) - 1.0) * 0.5
	for i in range(shot_count):
		var offset: float = float(i) - center_index
		var spread_radians: float = deg_to_rad(offset * 8.0)
		var dir: Vector2 = direction.rotated(spread_radians)
		_fire_single_projectile(dir)

func _fire_single_projectile(direction: Vector2) -> void:
	var projectile := Node2D.new()
	projectile.set_script(ProjectileScript)
	projectile.setup(
		_player.position,
		direction,
		float(_balance.PROJECTILE_SPEED) + float(_state.projectile_speed_bonus),
		int(_balance.PROJECTILE_DAMAGE) + int(_state.projectile_damage_bonus),
		float(_balance.PROJECTILE_LIFETIME) + float(_state.projectile_lifetime_bonus),
		float(_balance.PROJECTILE_RADIUS) + float(_state.projectile_radius_bonus)
	)
	_projectile_container.add_child(projectile)
