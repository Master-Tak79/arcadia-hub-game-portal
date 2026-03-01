extends Node

var _balance: RefCounted
var _state: RefCounted
var _player: Node2D
var _enemy_container: Node2D
var _projectile_container: Node2D

var _player_damage_cooldown_left: float = 0.0

func setup(balance: RefCounted, state: RefCounted, player: Node2D, enemy_container: Node2D, projectile_container: Node2D) -> void:
	_balance = balance
	_state = state
	_player = player
	_enemy_container = enemy_container
	_projectile_container = projectile_container
	reset_runtime()

func reset_runtime() -> void:
	_player_damage_cooldown_left = 0.0

func _process(delta: float) -> void:
	if _state == null or _state.is_game_over:
		return
	if _player == null or _enemy_container == null or _projectile_container == null:
		return

	if _player_damage_cooldown_left > 0.0:
		_player_damage_cooldown_left -= delta

	_process_projectile_hits()
	_process_player_hits()

func _process_projectile_hits() -> void:
	for projectile in _projectile_container.get_children():
		if not (projectile is Node2D):
			continue
		if not projectile.has_method("get"):
			continue

		var projectile_radius: float = float(projectile.radius)
		for enemy in _enemy_container.get_children():
			if not (enemy is Node2D):
				continue
			if enemy.is_queued_for_deletion():
				continue
			if not enemy.has_method("get_hit_radius"):
				continue

			var enemy_radius: float = float(enemy.get_hit_radius())
			if projectile.position.distance_to(enemy.position) <= projectile_radius + enemy_radius:
				var damage: int = int(projectile.damage)
				var killed := false
				if enemy.has_method("apply_damage"):
					killed = bool(enemy.apply_damage(damage))
				if killed:
					_state.kills += 1
				projectile.queue_free()
				break

func _process_player_hits() -> void:
	if _player_damage_cooldown_left > 0.0:
		return

	var player_hit_radius: float = float(_balance.PLAYER_HIT_RADIUS)
	for enemy in _enemy_container.get_children():
		if not (enemy is Node2D):
			continue
		if enemy.is_queued_for_deletion():
			continue
		if not enemy.has_method("get_hit_radius"):
			continue

		var enemy_radius: float = float(enemy.get_hit_radius())
		if _player.position.distance_to(enemy.position) <= player_hit_radius + enemy_radius:
			_state.hp = max(0, _state.hp - 1)
			_player_damage_cooldown_left = float(_balance.PLAYER_HIT_INVULN)
			if _state.hp <= 0:
				_state.is_game_over = true
				_player.set_enabled(false)
			return
