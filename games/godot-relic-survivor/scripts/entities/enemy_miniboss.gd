extends Node2D

const EnemyGrunt := preload("res://scripts/entities/enemy_grunt.gd")
const EnemyDasher := preload("res://scripts/entities/enemy_dasher.gd")
const MINIBOSS_TEXTURE_PATH := "res://assets/sprites/kenney/enemies/miniboss.png"
const TextureRuntime := preload("res://scripts/core/texture_runtime.gd")

var target: Node2D
var _miniboss_texture: Texture2D

var speed: float = 95.0
var hp: int = 140
var hit_radius: float = 30.0

# Dash pattern
var dash_speed: float = 410.0
var dash_interval: float = 2.5
var dash_duration: float = 0.35
var dash_windup: float = 0.42
var dash_recovery: float = 0.24
var dash_min_distance: float = 96.0
var combo_dash_chance: float = 0.29
var combo_dash_gap: float = 0.16

# Summon pattern
var summon_windup: float = 0.62
var summon_wall_chance: float = 0.40

# Phase 2 tuning
var phase2_hp_ratio: float = 0.52
var phase2_transition: float = 1.15
var phase2_speed_mult: float = 1.12
var phase2_dash_speed_mult: float = 1.14
var phase2_dash_interval_mult: float = 0.84
var phase2_dash_windup_mult: float = 0.84
var phase2_combo_bonus: int = 1
var phase2_summon_interval_mult: float = 0.78
var phase2_summon_wall_bonus: float = 0.10
var phase2_spawn_grace: float = 0.85

var spawn_grace: float = 1.1

var exp_reward: int = 80
var contact_damage: int = 2
var _max_hp: int = 140

var _phase: int = 1
var _phase2_started: bool = false
var _phase_transition_left: float = 0.0

var _summon_interval: float = 6.0
var _summon_count: int = 3
var _summon_radius: float = 86.0
var _summon_cooldown_left: float = 4.5
var _summon_windup_left: float = 0.0
var _pending_summon_pattern: String = ""
var _force_pattern_cycle: bool = false
var _pattern_cycle_index: int = 0
var _summon_cfg: Dictionary = {}

var _dash_cooldown_left: float = 1.5
var _dash_time_left: float = 0.0
var _dash_windup_left: float = 0.0
var _dash_recovery_left: float = 0.0
var _combo_dash_left: int = 0
var _dash_direction: Vector2 = Vector2.RIGHT

var _spawn_grace_left: float = 0.0
var _last_target_dir: Vector2 = Vector2.DOWN

func _ready() -> void:
	_miniboss_texture = TextureRuntime.load_texture(MINIBOSS_TEXTURE_PATH)

func setup(
	target_node: Node2D,
	base_speed: float,
	base_hp: int,
	base_hit_radius: float,
	base_dash_speed: float,
	base_dash_interval: float,
	base_dash_duration: float,
	base_dash_windup: float,
	base_dash_recovery: float,
	base_dash_min_distance: float,
	base_combo_dash_chance: float,
	base_combo_dash_gap: float,
	base_spawn_grace: float,
	base_contact_damage: int,
	base_exp_reward: int,
	summon_interval: float,
	summon_windup_sec: float,
	summon_wall_pattern_chance: float,
	summon_count: int,
	summon_radius: float,
	summon_cfg: Dictionary,
	phase2_hp_ratio_value: float,
	phase2_transition_value: float,
	phase2_speed_mult_value: float,
	phase2_dash_speed_mult_value: float,
	phase2_dash_interval_mult_value: float,
	phase2_dash_windup_mult_value: float,
	phase2_combo_bonus_value: int,
	phase2_summon_interval_mult_value: float,
	phase2_summon_wall_bonus_value: float,
	phase2_spawn_grace_value: float,
	force_pattern_cycle: bool = false
) -> void:
	target = target_node
	speed = base_speed
	hp = base_hp
	_max_hp = max(1, base_hp)
	hit_radius = base_hit_radius

	dash_speed = base_dash_speed
	dash_interval = base_dash_interval
	dash_duration = base_dash_duration
	dash_windup = max(0.08, base_dash_windup)
	dash_recovery = max(0.05, base_dash_recovery)
	dash_min_distance = max(24.0, base_dash_min_distance)
	combo_dash_chance = clampf(base_combo_dash_chance, 0.0, 1.0)
	combo_dash_gap = max(0.06, base_combo_dash_gap)

	summon_windup = max(0.08, summon_windup_sec)
	summon_wall_chance = clampf(summon_wall_pattern_chance, 0.0, 1.0)
	spawn_grace = max(0.0, base_spawn_grace)
	contact_damage = base_contact_damage
	exp_reward = base_exp_reward

	phase2_hp_ratio = clampf(phase2_hp_ratio_value, 0.25, 0.9)
	phase2_transition = max(0.2, phase2_transition_value)
	phase2_speed_mult = max(1.0, phase2_speed_mult_value)
	phase2_dash_speed_mult = max(1.0, phase2_dash_speed_mult_value)
	phase2_dash_interval_mult = clampf(phase2_dash_interval_mult_value, 0.55, 1.0)
	phase2_dash_windup_mult = clampf(phase2_dash_windup_mult_value, 0.55, 1.0)
	phase2_combo_bonus = clampi(phase2_combo_bonus_value, 0, 2)
	phase2_summon_interval_mult = clampf(phase2_summon_interval_mult_value, 0.55, 1.0)
	phase2_summon_wall_bonus = clampf(phase2_summon_wall_bonus_value, 0.0, 0.35)
	phase2_spawn_grace = max(0.0, phase2_spawn_grace_value)

	_phase = 1
	_phase2_started = false
	_phase_transition_left = 0.0

	_summon_interval = max(1.0, summon_interval)
	_summon_count = max(1, summon_count)
	_summon_radius = max(24.0, summon_radius)
	_summon_cfg = summon_cfg.duplicate(true)
	_summon_cooldown_left = _summon_interval * 0.7
	_summon_windup_left = 0.0
	_pending_summon_pattern = ""
	_force_pattern_cycle = force_pattern_cycle
	_pattern_cycle_index = 0

	_dash_cooldown_left = randf_range(1.0, dash_interval)
	_dash_time_left = 0.0
	_dash_windup_left = 0.0
	_dash_recovery_left = 0.0
	_combo_dash_left = 0
	_spawn_grace_left = spawn_grace
	queue_redraw()

func apply_damage(amount: int) -> bool:
	hp -= amount
	if hp <= 0:
		queue_free()
		return true
	queue_redraw()
	return false

func get_hit_radius() -> float:
	return hit_radius

func get_contact_damage() -> int:
	if _spawn_grace_left > 0.0:
		return 0
	if _phase_transition_left > 0.0:
		return 0
	if _dash_windup_left > 0.0:
		return 0
	if _summon_windup_left > 0.0:
		return 0
	return contact_damage

func get_exp_reward() -> int:
	return exp_reward

func get_enemy_kind() -> String:
	return "miniboss"

func get_phase() -> int:
	return _phase

func is_phase_transitioning() -> bool:
	return _phase_transition_left > 0.0

func get_phase_transition_remaining() -> float:
	return max(0.0, _phase_transition_left)

func is_dashing() -> bool:
	return _dash_time_left > 0.0

func is_miniboss() -> bool:
	return true

func is_dash_telegraphing() -> bool:
	return _dash_windup_left > 0.0

func get_dash_telegraph_remaining() -> float:
	return max(0.0, _dash_windup_left)

func is_summon_telegraphing() -> bool:
	return _summon_windup_left > 0.0

func get_summon_telegraph_remaining() -> float:
	return max(0.0, _summon_windup_left)

func get_pending_summon_pattern() -> String:
	return _pending_summon_pattern

func get_spawn_grace_remaining() -> float:
	return max(0.0, _spawn_grace_left)

func _process(delta: float) -> void:
	if target == null:
		return

	if not _phase2_started and float(hp) <= float(_max_hp) * phase2_hp_ratio:
		_start_phase2_transition()

	if _spawn_grace_left > 0.0:
		_spawn_grace_left -= delta

	if _phase_transition_left > 0.0:
		_phase_transition_left -= delta
		if _phase_transition_left <= 0.0:
			_enter_phase2()
		queue_redraw()
		return

	_summon_cooldown_left -= delta
	if _summon_windup_left <= 0.0 and _summon_cooldown_left <= 0.0:
		_start_summon_cast()

	if _summon_windup_left > 0.0:
		_summon_windup_left -= delta
		if _summon_windup_left <= 0.0:
			_cast_summon_pattern()
		queue_redraw()
		return

	var to_target: Vector2 = target.position - position
	if to_target.length() > 0.001:
		rotation = to_target.angle()
		_last_target_dir = to_target.normalized()

	if _dash_time_left > 0.0:
		_dash_time_left -= delta
		position += _dash_direction * dash_speed * delta
		if _dash_time_left <= 0.0:
			if _combo_dash_left > 0 and to_target.length() > dash_min_distance * 0.75:
				_combo_dash_left -= 1
				_dash_direction = to_target.normalized()
				_dash_windup_left = combo_dash_gap + (dash_windup * 0.55)
				print("MINIBOSS_DASH_CHAIN_TELEGRAPH_ON")
			else:
				_dash_recovery_left = dash_recovery
		queue_redraw()
		return

	if _dash_recovery_left > 0.0:
		_dash_recovery_left -= delta
		if to_target.length() > 0.001:
			position += to_target.normalized() * speed * 0.35 * delta
		queue_redraw()
		return

	if _dash_windup_left > 0.0:
		_dash_windup_left -= delta
		if _dash_windup_left <= 0.0:
			_dash_time_left = dash_duration
			if _combo_dash_left > 0:
				print("MINIBOSS_DASH_CHAIN_START")
			else:
				print("MINIBOSS_DASH_START")
		queue_redraw()
		return

	_dash_cooldown_left -= delta
	if _dash_cooldown_left <= 0.0 and to_target.length() > dash_min_distance:
		_dash_direction = to_target.normalized()
		_dash_windup_left = dash_windup
		_dash_cooldown_left = dash_interval
		var base_combo: int = 1 if randf() < combo_dash_chance else 0
		_combo_dash_left = base_combo + (phase2_combo_bonus if _phase >= 2 else 0)
		if _combo_dash_left > 0:
			print("MINIBOSS_COMBO_DASH_ON")
		print("MINIBOSS_DASH_TELEGRAPH_ON")
		queue_redraw()
		return

	if to_target.length() > 0.001:
		position += to_target.normalized() * speed * delta

	queue_redraw()

func _start_phase2_transition() -> void:
	_phase2_started = true
	_phase_transition_left = phase2_transition
	_spawn_grace_left = max(_spawn_grace_left, phase2_spawn_grace)

	_dash_time_left = 0.0
	_dash_windup_left = 0.0
	_dash_recovery_left = 0.0
	_combo_dash_left = 0
	_summon_windup_left = 0.0
	_pending_summon_pattern = ""

	print("MINIBOSS_PHASE2_TRANSITION")

func _enter_phase2() -> void:
	_phase = 2
	_phase_transition_left = 0.0

	speed *= phase2_speed_mult
	dash_speed *= phase2_dash_speed_mult
	dash_interval = max(0.85, dash_interval * phase2_dash_interval_mult)
	dash_windup = max(0.12, dash_windup * phase2_dash_windup_mult)
	_summon_interval = max(1.2, _summon_interval * phase2_summon_interval_mult)
	summon_wall_chance = clampf(summon_wall_chance + phase2_summon_wall_bonus, 0.0, 0.95)
	_spawn_grace_left = max(_spawn_grace_left, phase2_spawn_grace)

	print("MINIBOSS_PHASE2_ACTIVE")

func _start_summon_cast() -> void:
	if _force_pattern_cycle:
		_pending_summon_pattern = "ring" if (_pattern_cycle_index % 2) == 0 else "wall"
		_pattern_cycle_index += 1
		_summon_windup_left = summon_windup
		print("MINIBOSS_SUMMON_TELEGRAPH_ON")
		return

	var wall_chance: float = summon_wall_chance
	var hp_ratio: float = clampf(float(hp) / float(_max_hp), 0.0, 1.0)
	var dist_to_target: float = 9999.0
	if target != null:
		dist_to_target = position.distance_to(target.position)

	# Low HP -> little more WALL pressure, close range -> prefer RING for fairness/readability
	if hp_ratio < 0.58:
		wall_chance += 0.12
	if dist_to_target < 190.0:
		wall_chance -= 0.16
	if _phase >= 2:
		wall_chance += 0.08

	wall_chance = clampf(wall_chance, 0.18, 0.82)
	_pending_summon_pattern = "wall" if randf() < wall_chance else "ring"
	_summon_windup_left = summon_windup
	print("MINIBOSS_SUMMON_TELEGRAPH_ON")

func _cast_summon_pattern() -> void:
	if _pending_summon_pattern == "wall":
		_summon_wall_wave()
		print("MINIBOSS_SUMMON_PATTERN_WALL")
	else:
		_summon_ring_wave()
		print("MINIBOSS_SUMMON_PATTERN_RING")

	print("MINIBOSS_SUMMON_CAST")
	_pending_summon_pattern = ""
	_summon_cooldown_left = _summon_interval

func _summon_ring_wave() -> void:
	var parent_node := get_parent()
	if parent_node == null:
		return

	for i in range(_summon_count):
		var angle: float = (TAU * float(i) / float(_summon_count)) + randf() * 0.7
		var spawn_pos := position + Vector2.RIGHT.rotated(angle) * (_summon_radius + randf() * 18.0)
		var summon: Node2D
		if randf() < 0.3:
			summon = _make_dasher()
		else:
			summon = _make_grunt()
		summon.position = spawn_pos
		parent_node.add_child(summon)

func _summon_wall_wave() -> void:
	var parent_node := get_parent()
	if parent_node == null:
		return

	var to_target: Vector2 = (target.position - position).normalized()
	if to_target.length() <= 0.001:
		to_target = Vector2.DOWN

	var center: Vector2 = position + to_target * (_summon_radius + 24.0)
	var side: Vector2 = Vector2(-to_target.y, to_target.x)
	var wall_count: int = _summon_count + 2 + (1 if _phase >= 2 else 0)
	var spacing: float = 44.0
	var half: float = (float(wall_count) - 1.0) * 0.5

	for i in range(wall_count):
		var offset: float = (float(i) - half) * spacing
		var spawn_pos: Vector2 = center + side * offset
		var grunt := _make_grunt()
		grunt.position = spawn_pos
		parent_node.add_child(grunt)

func _make_grunt() -> Node2D:
	var node := Node2D.new()
	node.set_script(EnemyGrunt)
	node.setup(
		target,
		float(_summon_cfg.get("grunt_speed", 138.0)) * (1.05 if _phase >= 2 else 1.0),
		int(_summon_cfg.get("grunt_hp", 2)),
		float(_summon_cfg.get("grunt_hit_radius", 13.0))
	)
	return node

func _make_dasher() -> Node2D:
	var node := Node2D.new()
	node.set_script(EnemyDasher)
	node.setup(
		target,
		float(_summon_cfg.get("dasher_speed", 96.0)) * (1.06 if _phase >= 2 else 1.0),
		int(_summon_cfg.get("dasher_hp", 2)),
		float(_summon_cfg.get("dasher_hit_radius", 14.0)),
		float(_summon_cfg.get("dasher_dash_speed", 320.0)),
		float(_summon_cfg.get("dasher_dash_interval", 1.65)),
		float(_summon_cfg.get("dasher_dash_duration", 0.24))
	)
	return node

func _draw() -> void:
	var hp_ratio: float = clampf(float(hp) / float(_max_hp), 0.0, 1.0)
	var body_color := Color("#F97316")
	if hp_ratio < 0.35:
		body_color = Color("#DC2626")
	if _phase >= 2:
		body_color = Color("#B91C1C")

	if _miniboss_texture:
		var tex_size: Vector2 = _miniboss_texture.get_size()
		var scale: float = ((hit_radius * 2.9) / max(1.0, max(tex_size.x, tex_size.y)))
		var draw_size: Vector2 = tex_size * scale
		draw_texture_rect(_miniboss_texture, Rect2(-draw_size * 0.5, draw_size), false, body_color.lightened(0.18))
	else:
		draw_circle(Vector2.ZERO, hit_radius - 2.0, body_color)
	draw_arc(Vector2.ZERO, hit_radius + 3.0, 0.0, TAU, 40, Color("#FDBA74"), 3.0)

	if _phase_transition_left > 0.0:
		var ratio: float = clampf(_phase_transition_left / max(0.01, phase2_transition), 0.0, 1.0)
		var pulse: float = 0.35 + (1.0 - ratio) * 0.55
		draw_arc(Vector2.ZERO, hit_radius + 28.0, 0.0, TAU, 52, Color(1.0, 0.5, 0.2, pulse), 5.0)
		draw_arc(Vector2.ZERO, hit_radius + 36.0, 0.0, TAU, 52, Color(1.0, 0.75, 0.3, pulse * 0.75), 3.0)

	if _dash_time_left > 0.0:
		draw_arc(Vector2.ZERO, hit_radius + 10.0, 0.0, TAU, 36, Color("#FCA5A5"), 3.0)
	elif _dash_windup_left > 0.0:
		var norm_windup: float = dash_windup if _combo_dash_left <= 0 else (dash_windup * 0.55 + combo_dash_gap)
		var windup_ratio: float = clampf(_dash_windup_left / max(0.01, norm_windup), 0.0, 1.0)
		var pulse_dash: float = 0.35 + (1.0 - windup_ratio) * 0.55
		var telegraph_color: Color = Color(1.0, 0.75, 0.35, pulse_dash)
		var line_color: Color = Color(1.0, 0.45, 0.35, 0.75)
		if _combo_dash_left > 0:
			telegraph_color = Color(0.95, 0.62, 1.0, pulse_dash)
			line_color = Color(0.86, 0.44, 1.0, 0.78)
		draw_arc(Vector2.ZERO, hit_radius + 12.0, 0.0, TAU, 40, telegraph_color, 4.0)
		var line_len: float = 180.0
		var tip: Vector2 = _dash_direction.normalized() * line_len
		draw_line(Vector2.ZERO, tip, line_color, 5.0)
		draw_circle(tip, 10.0, Color(line_color.r, line_color.g, line_color.b, 0.5))
		draw_arc(tip, 24.0, 0.0, TAU, 32, Color(line_color.r, line_color.g, line_color.b, 0.38), 2.4)

	if _summon_windup_left > 0.0:
		var summon_ratio: float = clampf(_summon_windup_left / max(0.01, summon_windup), 0.0, 1.0)
		var summon_pulse: float = 0.25 + (1.0 - summon_ratio) * 0.55
		var summon_color: Color = Color(0.45, 0.92, 1.0, summon_pulse)
		if _pending_summon_pattern == "wall":
			summon_color = Color(0.52, 1.0, 0.68, summon_pulse)
		draw_arc(Vector2.ZERO, hit_radius + 20.0, 0.0, TAU, 48, summon_color, 3.5)

		if _pending_summon_pattern == "wall":
			var wall_center: Vector2 = _last_target_dir * (_summon_radius + 24.0)
			var side: Vector2 = Vector2(-_last_target_dir.y, _last_target_dir.x)
			var half_len: float = float(_summon_count + 1) * 22.0
			draw_line(wall_center - side * half_len, wall_center + side * half_len, Color(summon_color.r, summon_color.g, summon_color.b, 0.42), 5.0)
		else:
			draw_arc(Vector2.ZERO, _summon_radius + 14.0, 0.0, TAU, 48, Color(summon_color.r, summon_color.g, summon_color.b, 0.42), 2.6)

	if _spawn_grace_left > 0.0:
		var grace_ratio: float = clampf(_spawn_grace_left / max(0.01, spawn_grace), 0.0, 1.0)
		draw_arc(Vector2.ZERO, hit_radius + 24.0, 0.0, TAU, 48, Color(0.9, 1.0, 0.8, 0.28 + 0.42 * grace_ratio), 3.0)

	# HP ring
	var hp_angle: float = TAU * hp_ratio
	draw_arc(Vector2.ZERO, hit_radius + 16.0, -PI * 0.5, -PI * 0.5 + hp_angle, 36, Color("#22C55E"), 4.0)

	if _phase >= 2:
		draw_arc(Vector2.ZERO, hit_radius + 32.0, 0.0, TAU, 52, Color(0.96, 0.5, 0.5, 0.45), 2.4)
