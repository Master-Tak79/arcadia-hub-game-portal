extends Node2D

var target: Node2D
var speed: float = 130.0
var hp: int = 2
var hit_radius: float = 14.0

func setup(target_node: Node2D, base_speed: float, base_hp: int, base_hit_radius: float) -> void:
	target = target_node
	speed = base_speed
	hp = base_hp
	hit_radius = base_hit_radius
	queue_redraw()

func apply_damage(amount: int) -> bool:
	hp -= amount
	if hp <= 0:
		queue_free()
		return true
	return false

func get_hit_radius() -> float:
	return hit_radius

func _process(delta: float) -> void:
	if target == null:
		return
	var to_target := target.position - position
	if to_target.length() > 0.001:
		position += to_target.normalized() * speed * delta
		rotation = to_target.angle()
	queue_redraw()

func _draw() -> void:
	draw_circle(Vector2.ZERO, hit_radius - 1.0, Color("#EF4444"))
	draw_arc(Vector2.ZERO, hit_radius + 1.5, 0.0, TAU, 18, Color("#FCA5A5"), 2.0)
	draw_line(Vector2.ZERO, Vector2(hit_radius + 5.0, 0), Color("#FDE68A"), 2.0)
