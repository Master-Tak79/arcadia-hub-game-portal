extends Node

const CELL_SIZE: float = 96.0

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
	if _state == null or _state.is_game_over or _state.is_paused:
		return
	if _player == null or _enemy_container == null or _projectile_container == null:
		return

	if _player_damage_cooldown_left > 0.0:
		_player_damage_cooldown_left -= delta

	var enemy_index: Dictionary = _build_enemy_spatial_index()
	_process_projectile_hits(enemy_index)
	_process_player_hits(enemy_index)

func _process_projectile_hits(enemy_index: Dictionary) -> void:
	for projectile in _projectile_container.get_children():
		if not (projectile is Node2D):
			continue
		if not projectile.has_method("get"):
			continue

		var projectile_radius: float = float(projectile.radius)
		var candidates: Array = _gather_candidate_enemies(enemy_index, projectile.position, 1)
		for enemy in candidates:
			if not (enemy is Node2D):
				continue
			if enemy.is_queued_for_deletion():
				continue
			if not enemy.has_method("get_hit_radius"):
				continue

			var enemy_radius: float = float(enemy.get_hit_radius())
			if projectile.position.distance_to(enemy.position) <= projectile_radius + enemy_radius:
				var damage: int = int(projectile.damage)
				var killed: bool = false
				if enemy.has_method("apply_damage"):
					killed = bool(enemy.apply_damage(damage))
				if killed:
					_state.kills += 1
					var exp_reward: int = int(_balance.EXP_PER_KILL)
					if enemy.has_method("get_exp_reward"):
						exp_reward = int(enemy.get_exp_reward())
					_state.gain_exp(exp_reward)
				projectile.queue_free()
				break

func _process_player_hits(enemy_index: Dictionary) -> void:
	if _player_damage_cooldown_left > 0.0:
		return

	var player_hit_radius: float = float(_balance.PLAYER_HIT_RADIUS)
	var candidates: Array = _gather_candidate_enemies(enemy_index, _player.position, 1)
	for enemy in candidates:
		if not (enemy is Node2D):
			continue
		if enemy.is_queued_for_deletion():
			continue
		if not enemy.has_method("get_hit_radius"):
			continue

		var enemy_radius: float = float(enemy.get_hit_radius())
		if _player.position.distance_to(enemy.position) <= player_hit_radius + enemy_radius:
			var damage: int = 1
			if enemy.has_method("get_contact_damage"):
				damage = max(1, int(enemy.get_contact_damage()))
			_state.hp = max(0, _state.hp - damage)
			_player_damage_cooldown_left = float(_balance.PLAYER_HIT_INVULN) + float(_state.player_invuln_bonus)
			if _state.hp <= 0:
				_state.is_game_over = true
				_state.is_paused = false
				_player.set_enabled(false)
				_set_death_recap(enemy)
			return

func _set_death_recap(enemy: Node2D) -> void:
	var reason: String = "적 접촉 피해"
	var kind: String = "enemy"
	if enemy.has_method("get_enemy_kind"):
		kind = String(enemy.get_enemy_kind())

	match kind:
		"miniboss":
			var phase: int = 1
			if enemy.has_method("get_phase"):
				phase = int(enemy.get_phase())
			if enemy.has_method("is_phase_transitioning") and bool(enemy.is_phase_transitioning()):
				reason = "미니보스 페이즈 전환 압박"
			elif enemy.has_method("is_dashing") and bool(enemy.is_dashing()):
				reason = "미니보스 대시 직격"
				if phase >= 2:
					reason = "미니보스 PHASE2 대시 직격"
			elif enemy.has_method("is_dash_telegraphing") and bool(enemy.is_dash_telegraphing()):
				reason = "미니보스 대시 예고 구간 접촉"
			elif enemy.has_method("is_summon_telegraphing") and bool(enemy.is_summon_telegraphing()):
				reason = "미니보스 소환 시전 구간 접촉"
			else:
				reason = "미니보스 접촉 피해"
				if phase >= 2:
					reason = "미니보스 PHASE2 접촉 피해"
		"dasher":
			if enemy.has_method("is_dashing") and bool(enemy.is_dashing()):
				reason = "대셔 돌진 접촉"
			else:
				reason = "대셔 접촉 피해"
		"elite_dasher":
			if enemy.has_method("is_dashing") and bool(enemy.is_dashing()):
				reason = "엘리트 대셔 연속 돌진 직격"
			else:
				reason = "엘리트 대셔 접촉 피해"
		"grunt":
			reason = "그런트 접촉 피해"
		"elite_grunt":
			if enemy.has_method("is_bursting") and bool(enemy.is_bursting()):
				reason = "엘리트 그런트 돌진 직격"
			else:
				reason = "엘리트 그런트 접촉 피해"
		_:
			reason = "적 접촉 피해"

	_state.death_reason = reason
	_state.death_context = "압박도 %s(%.2f) · 활성 적 %d" % [
		String(_state.pressure_band).to_upper(),
		float(_state.pressure_hint),
		int(_enemy_container.get_child_count())
	]

func _build_enemy_spatial_index() -> Dictionary:
	var index: Dictionary = {}
	for enemy in _enemy_container.get_children():
		if not (enemy is Node2D):
			continue
		if enemy.is_queued_for_deletion():
			continue
		if not enemy.has_method("get_hit_radius"):
			continue

		var ix: int = int(floor(enemy.position.x / CELL_SIZE))
		var iy: int = int(floor(enemy.position.y / CELL_SIZE))
		var key: String = _cell_key(ix, iy)
		if not index.has(key):
			index[key] = []
		var bucket: Array = index[key]
		bucket.append(enemy)
		index[key] = bucket
	return index

func _gather_candidate_enemies(enemy_index: Dictionary, origin: Vector2, radius_cells: int = 1) -> Array:
	var out: Array = []
	var ix: int = int(floor(origin.x / CELL_SIZE))
	var iy: int = int(floor(origin.y / CELL_SIZE))

	for y in range(iy - radius_cells, iy + radius_cells + 1):
		for x in range(ix - radius_cells, ix + radius_cells + 1):
			var key: String = _cell_key(x, y)
			if not enemy_index.has(key):
				continue
			for enemy in Array(enemy_index[key]):
				out.append(enemy)
	return out

func _cell_key(x: int, y: int) -> String:
	return "%d:%d" % [x, y]
