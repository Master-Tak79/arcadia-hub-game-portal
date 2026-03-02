extends Node2D

var target: Node2D
var speed: float = 90.0
var hp: int = 3
var hit_radius: float = 15.0
var exp_reward: int = 5
var contact_damage: int = 1

var dash_speed: float = 340.0
var dash_interval: float = 1.8
var dash_duration: float = 0.28

var _dash_cooldown_left: float = 1.2
var _dash_time_left: float = 0.0
var _dash_direction: Vector2 = Vector2.RIGHT

func setup(target_node: Node2D, base_speed: float, base_hp: int, base_hit_radius: float, base_dash_speed: float, base_dash_interval: float, base_dash_duration: float) -> void:
	target = target_node
	speed = base_speed
	hp = base_hp
	hit_radius = base_hit_radius
	dash_speed = base_dash_speed
	dash_interval = base_dash_interval
	dash_duration = base_dash_duration
	_dash_cooldown_left = randf_range(0.2, dash_interval)
	_dash_time_left = 0.0
	queue_redraw()

func apply_damage(amount: int) -> bool:
	hp -= amount
	if hp <= 0:
		queue_free()
		return true
	return false

func get_hit_radius() -> float:
	return hit_radius

func get_exp_reward() -> int:
	return exp_reward

func get_contact_damage() -> int:
	return contact_damage

func get_enemy_kind() -> String:
	return "dasher"

func is_dashing() -> bool:
	return _dash_time_left > 0.0

func _process(delta: float) -> void:
	if target == null:
		return

	var to_target := target.position - position
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
	draw_circle(Vector2.ZERO, hit_radius - 1.0, Color("#8B5CF6"))
	draw_arc(Vector2.ZERO, hit_radius + 2.0, 0.0, TAU, 20, Color("#C4B5FD"), 2.0)
	if _dash_time_left > 0.0:
		draw_arc(Vector2.ZERO, hit_radius + 6.0, 0.0, TAU, 24, Color("#E9D5FF"), 2.0)
