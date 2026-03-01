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
	if _state == null or _state.is_game_over:
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
	if to_target.length() > float(_balance.ATTACK_RANGE):
		return

	_fire_projectile(to_target)
	_attack_cooldown_left = float(_balance.ATTACK_INTERVAL)

func _find_nearest_enemy() -> Node2D:
	var best: Node2D = null
	var best_dist := INF
	for enemy in _enemy_container.get_children():
		if not (enemy is Node2D):
			continue
		var dist := _player.position.distance_squared_to(enemy.position)
		if dist < best_dist:
			best_dist = dist
			best = enemy
	return best

func _fire_projectile(direction: Vector2) -> void:
	var projectile := Node2D.new()
	projectile.set_script(ProjectileScript)
	projectile.setup(
		_player.position,
		direction,
		float(_balance.PROJECTILE_SPEED),
		int(_balance.PROJECTILE_DAMAGE),
		float(_balance.PROJECTILE_LIFETIME),
		float(_balance.PROJECTILE_RADIUS)
	)
	_projectile_container.add_child(projectile)
