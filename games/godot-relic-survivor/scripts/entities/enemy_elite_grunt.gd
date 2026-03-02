extends Node2D

var target: Node2D
var speed: float = 136.0
var hp: int = 6
var hit_radius: float = 17.0
var contact_damage: int = 2
var exp_reward: int = 9

var burst_speed_mult: float = 1.85
var burst_interval: float = 2.4
var burst_duration: float = 0.24

var _burst_cooldown_left: float = 0.0
var _burst_time_left: float = 0.0

func setup(
	target_node: Node2D,
	base_speed: float,
	base_hp: int,
	base_hit_radius: float,
	base_contact_damage: int,
	base_exp_reward: int,
	base_burst_speed_mult: float,
	base_burst_interval: float,
	base_burst_duration: float
) -> void:
	target = target_node
	speed = base_speed
	hp = base_hp
	hit_radius = base_hit_radius
	contact_damage = base_contact_damage
	exp_reward = base_exp_reward

	burst_speed_mult = max(1.1, base_burst_speed_mult)
	burst_interval = max(0.4, base_burst_interval)
	burst_duration = max(0.06, base_burst_duration)

	_burst_cooldown_left = randf_range(0.4, burst_interval)
	_burst_time_left = 0.0
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

func get_exp_reward() -> int:
	return exp_reward

func get_contact_damage() -> int:
	return contact_damage

func get_enemy_kind() -> String:
	return "elite_grunt"

func is_bursting() -> bool:
	return _burst_time_left > 0.0

func _process(delta: float) -> void:
	if target == null:
		return

	var to_target: Vector2 = target.position - position
	if to_target.length() > 0.001:
		rotation = to_target.angle()

	if _burst_time_left > 0.0:
		_burst_time_left -= delta
		position += to_target.normalized() * speed * burst_speed_mult * delta
		queue_redraw()
		return

	_burst_cooldown_left -= delta
	if _burst_cooldown_left <= 0.0 and to_target.length() > hit_radius * 2.1:
		_burst_time_left = burst_duration
		_burst_cooldown_left = burst_interval
		queue_redraw()
		return

	if to_target.length() > 0.001:
		position += to_target.normalized() * speed * delta

	queue_redraw()

func _draw() -> void:
	draw_circle(Vector2.ZERO, hit_radius - 1.5, Color("#B91C1C"))
	draw_arc(Vector2.ZERO, hit_radius + 2.0, 0.0, TAU, 24, Color("#FCA5A5"), 2.2)

	if _burst_time_left > 0.0:
		draw_arc(Vector2.ZERO, hit_radius + 7.5, 0.0, TAU, 30, Color("#FDE68A"), 2.4)
		draw_line(Vector2.ZERO, Vector2.RIGHT.rotated(rotation) * (hit_radius + 12.0), Color("#FDBA74"), 3.0)
