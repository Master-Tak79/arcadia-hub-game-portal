extends Node2D

var target: Node2D

var speed: float = 95.0
var hp: int = 140
var hit_radius: float = 30.0

var dash_speed: float = 410.0
var dash_interval: float = 2.5
var dash_duration: float = 0.35

var exp_reward: int = 80
var contact_damage: int = 2
var _max_hp: int = 140

var _dash_cooldown_left: float = 1.5
var _dash_time_left: float = 0.0
var _dash_direction: Vector2 = Vector2.RIGHT

func setup(
	target_node: Node2D,
	base_speed: float,
	base_hp: int,
	base_hit_radius: float,
	base_dash_speed: float,
	base_dash_interval: float,
	base_dash_duration: float,
	base_contact_damage: int,
	base_exp_reward: int
) -> void:
	target = target_node
	speed = base_speed
	hp = base_hp
	_max_hp = max(1, base_hp)
	hit_radius = base_hit_radius
	dash_speed = base_dash_speed
	dash_interval = base_dash_interval
	dash_duration = base_dash_duration
	contact_damage = base_contact_damage
	exp_reward = base_exp_reward

	_dash_cooldown_left = randf_range(1.0, dash_interval)
	_dash_time_left = 0.0
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
	return contact_damage

func get_exp_reward() -> int:
	return exp_reward

func is_miniboss() -> bool:
	return true

func _process(delta: float) -> void:
	if target == null:
		return

	var to_target: Vector2 = target.position - position
	if to_target.length() > 0.001:
		rotation = to_target.angle()

	if _dash_time_left > 0.0:
		_dash_time_left -= delta
		position += _dash_direction * dash_speed * delta
		queue_redraw()
		return

	_dash_cooldown_left -= delta
	if _dash_cooldown_left <= 0.0 and to_target.length() > 0.001:
		_dash_direction = to_target.normalized()
		_dash_time_left = dash_duration
		_dash_cooldown_left = dash_interval
		queue_redraw()
		return

	if to_target.length() > 0.001:
		position += to_target.normalized() * speed * delta

	queue_redraw()

func _draw() -> void:
	var hp_ratio: float = clampf(float(hp) / float(_max_hp), 0.0, 1.0)
	var body_color := Color("#F97316")
	if hp_ratio < 0.35:
		body_color = Color("#DC2626")

	draw_circle(Vector2.ZERO, hit_radius - 2.0, body_color)
	draw_arc(Vector2.ZERO, hit_radius + 3.0, 0.0, TAU, 40, Color("#FDBA74"), 3.0)

	if _dash_time_left > 0.0:
		draw_arc(Vector2.ZERO, hit_radius + 10.0, 0.0, TAU, 36, Color("#FCA5A5"), 3.0)

	# HP ring
	var hp_angle: float = TAU * hp_ratio
	draw_arc(Vector2.ZERO, hit_radius + 16.0, -PI * 0.5, -PI * 0.5 + hp_angle, 36, Color("#22C55E"), 4.0)
