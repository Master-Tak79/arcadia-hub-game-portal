extends Node

const ImpactFx := preload("res://scripts/entities/impact_fx.gd")
const CELL_SIZE: float = 96.0

var _balance: RefCounted
var _state: RefCounted
var _player: Node2D
var _enemy_container: Node2D
var _projectile_container: Node2D
var _camera_fx: Node

var _player_damage_cooldown_left: float = 0.0
var _camera_hit_cooldown_left: float = 0.0
var _camera_kill_cooldown_left: float = 0.0
var _camera_player_hit_cooldown_left: float = 0.0
var _dot_effects: Dictionary = {}

var _printed_weapon_pierce: bool = false
var _printed_weapon_dot: bool = false
var _printed_weapon_aoe: bool = false
var _printed_hit_fx: bool = false
var _printed_kill_fx: bool = false

func setup(balance: RefCounted, state: RefCounted, player: Node2D, enemy_container: Node2D, projectile_container: Node2D, camera_fx: Node = null) -> void:
	_balance = balance
	_state = state
	_player = player
	_enemy_container = enemy_container
	_projectile_container = projectile_container
	_camera_fx = camera_fx
	reset_runtime()

func reset_runtime() -> void:
	_player_damage_cooldown_left = 0.0
	_camera_hit_cooldown_left = 0.0
	_camera_kill_cooldown_left = 0.0
	_camera_player_hit_cooldown_left = 0.0
	_dot_effects = {}
	_printed_weapon_pierce = false
	_printed_weapon_dot = false
	_printed_weapon_aoe = false
	_printed_hit_fx = false
	_printed_kill_fx = false

func _process(delta: float) -> void:
	if _state == null or _state.is_game_over or _state.is_paused:
		return
	if _player == null or _enemy_container == null or _projectile_container == null:
		return

	if _player_damage_cooldown_left > 0.0:
		_player_damage_cooldown_left -= delta
	if _camera_hit_cooldown_left > 0.0:
		_camera_hit_cooldown_left -= delta
	if _camera_kill_cooldown_left > 0.0:
		_camera_kill_cooldown_left -= delta
	if _camera_player_hit_cooldown_left > 0.0:
		_camera_player_hit_cooldown_left -= delta

	var enemy_index: Dictionary = _build_enemy_spatial_index()
	_process_projectile_hits(enemy_index)
	_process_dot_effects(delta)
	_process_player_hits(enemy_index)

func _process_projectile_hits(enemy_index: Dictionary) -> void:
	for projectile in _projectile_container.get_children():
		if not (projectile is Node2D):
			continue
		if not projectile.has_method("get"):
			continue
		if projectile.get("radius") == null or projectile.get("damage") == null:
			continue
		if projectile.get("hit_registry") == null:
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

			var enemy_id: int = int(enemy.get_instance_id())
			var hit_registry: Dictionary = Dictionary(projectile.hit_registry)
			if hit_registry.has(enemy_id):
				continue

			var enemy_radius: float = float(enemy.get_hit_radius())
			if projectile.position.distance_to(enemy.position) <= projectile_radius + enemy_radius:
				hit_registry[enemy_id] = true
				projectile.hit_registry = hit_registry

				var direct_damage: int = int(projectile.damage)
				_spawn_hit_fx(enemy.position)
				var primary_killed: bool = _apply_damage_to_enemy(enemy, direct_damage)
				if primary_killed:
					_spawn_kill_fx(enemy.position)
					_register_enemy_kill(enemy)

				if int(projectile.dot_damage) > 0 and float(projectile.dot_duration) > 0.0 and float(projectile.dot_tick) > 0.0:
					_apply_dot_effect(enemy, int(projectile.dot_damage), float(projectile.dot_duration), float(projectile.dot_tick))
					if not _printed_weapon_dot:
						print("WEAPON_DOT_APPLIED")
						_printed_weapon_dot = true

				if float(projectile.aoe_radius) > 0.0 and float(projectile.aoe_mult) > 0.0:
					_apply_aoe_damage(enemy_index, projectile.position, enemy, direct_damage, float(projectile.aoe_radius), float(projectile.aoe_mult))
					if not _printed_weapon_aoe:
						print("WEAPON_AOE_HIT")
						_printed_weapon_aoe = true

				if int(projectile.pierce_left) > 0:
					projectile.pierce_left = int(projectile.pierce_left) - 1
					if not _printed_weapon_pierce:
						print("WEAPON_PIERCE_HIT")
						_printed_weapon_pierce = true
					continue

				projectile.queue_free()
				break

func _apply_damage_to_enemy(enemy: Node2D, damage: int) -> bool:
	var killed: bool = false
	if enemy.has_method("apply_damage"):
		killed = bool(enemy.apply_damage(max(1, damage)))
	return killed

func _register_enemy_kill(enemy: Node2D) -> void:
	_state.kills += 1
	if enemy and enemy.has_method("get_enemy_kind"):
		var kind: String = String(enemy.get_enemy_kind())
		if kind.begins_with("elite"):
			_state.elite_kills += 1
	var exp_reward: int = int(_balance.EXP_PER_KILL)
	if enemy.has_method("get_exp_reward"):
		exp_reward = int(enemy.get_exp_reward())
	_state.gain_exp(exp_reward)

func _spawn_hit_fx(world_pos: Vector2) -> void:
	if _enemy_container == null:
		return
	var fx := Node2D.new()
	fx.set_script(ImpactFx)
	fx.setup(world_pos, Color("#67E8F9"), 11.0, 2.0, 0.12)
	_enemy_container.add_child(fx)
	_trigger_hit_camera_impact()
	if not _printed_hit_fx:
		print("HIT_FX_ON")
		_printed_hit_fx = true

func _spawn_kill_fx(world_pos: Vector2) -> void:
	if _enemy_container == null:
		return
	var fx := Node2D.new()
	fx.set_script(ImpactFx)
	fx.setup(world_pos, Color("#FCA5A5"), 17.0, 2.6, 0.22)
	_enemy_container.add_child(fx)
	_trigger_kill_camera_impact()
	if not _printed_kill_fx:
		print("KILL_FX_ON")
		_printed_kill_fx = true


func _trigger_hit_camera_impact() -> void:
	if _camera_fx == null:
		return
	if _camera_hit_cooldown_left > 0.0:
		return
	_camera_hit_cooldown_left = 0.045
	if _camera_fx.has_method("play_combat_hit_light"):
		_camera_fx.play_combat_hit_light()

func _trigger_kill_camera_impact() -> void:
	if _camera_fx == null:
		return
	if _camera_kill_cooldown_left > 0.0:
		return
	_camera_kill_cooldown_left = 0.10
	if _camera_fx.has_method("play_combat_hit_heavy"):
		_camera_fx.play_combat_hit_heavy()

func _trigger_player_hit_camera_impact() -> void:
	if _camera_fx == null:
		return
	if _camera_player_hit_cooldown_left > 0.0:
		return
	_camera_player_hit_cooldown_left = 0.14
	if _camera_fx.has_method("play_player_damage_impact"):
		_camera_fx.play_player_damage_impact()

func _apply_dot_effect(enemy: Node2D, damage: int, duration: float, tick_interval: float) -> void:
	var enemy_id: int = int(enemy.get_instance_id())
	_dot_effects[enemy_id] = {
		"enemy": enemy,
		"damage": max(1, damage),
		"duration": max(0.05, duration),
		"tick": max(0.05, tick_interval),
		"tick_left": max(0.05, tick_interval)
	}

func _apply_aoe_damage(enemy_index: Dictionary, center: Vector2, primary_enemy: Node2D, base_damage: int, aoe_radius: float, aoe_mult: float) -> int:
	var aoe_damage: int = max(1, int(round(float(base_damage) * clampf(aoe_mult, 0.1, 1.0))))
	var hit_count: int = 0
	var candidates: Array = _gather_candidate_enemies(enemy_index, center, 2)
	for enemy in candidates:
		if not (enemy is Node2D):
			continue
		if enemy == primary_enemy:
			continue
		if enemy.is_queued_for_deletion():
			continue
		if not enemy.has_method("get_hit_radius"):
			continue
		var enemy_radius: float = float(enemy.get_hit_radius())
		if center.distance_to(enemy.position) > aoe_radius + enemy_radius:
			continue
		_spawn_hit_fx(enemy.position)
		var killed: bool = _apply_damage_to_enemy(enemy, aoe_damage)
		if killed:
			_spawn_kill_fx(enemy.position)
			_register_enemy_kill(enemy)
		hit_count += 1
	return hit_count

func _process_dot_effects(delta: float) -> void:
	if _dot_effects.is_empty():
		return

	var remove_ids: Array = []
	for raw_id in _dot_effects.keys():
		var enemy_id: int = int(raw_id)
		var data: Dictionary = Dictionary(_dot_effects.get(enemy_id, {}))
		if data.is_empty():
			remove_ids.append(enemy_id)
			continue

		var enemy = data.get("enemy")
		if enemy == null or enemy.is_queued_for_deletion():
			remove_ids.append(enemy_id)
			continue

		var duration_left: float = float(data.get("duration", 0.0)) - delta
		var tick_left: float = float(data.get("tick_left", 0.0)) - delta
		var tick_interval: float = float(data.get("tick", 0.5))
		var dot_damage: int = int(data.get("damage", 1))

		if tick_left <= 0.0:
			tick_left += tick_interval
			_spawn_hit_fx(enemy.position)
			var killed: bool = _apply_damage_to_enemy(enemy, dot_damage)
			if killed:
				_spawn_kill_fx(enemy.position)
				_register_enemy_kill(enemy)
				remove_ids.append(enemy_id)
				if not _printed_weapon_dot:
					print("WEAPON_DOT_TICK")
					_printed_weapon_dot = true
				continue
			if not _printed_weapon_dot:
				print("WEAPON_DOT_TICK")
				_printed_weapon_dot = true

		if duration_left <= 0.0:
			remove_ids.append(enemy_id)
			continue

		data["duration"] = duration_left
		data["tick_left"] = tick_left
		_dot_effects[enemy_id] = data

	for enemy_id in remove_ids:
		_dot_effects.erase(enemy_id)

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
			damage = max(1, damage - int(_state.contact_damage_reduction))
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
