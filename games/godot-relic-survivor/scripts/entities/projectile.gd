extends Node2D

var direction: Vector2 = Vector2.RIGHT
var speed: float = 720.0
var damage: int = 1
var lifetime: float = 1.2
var radius: float = 6.0

func setup(start_position: Vector2, dir: Vector2, projectile_speed: float, projectile_damage: int, projectile_lifetime: float, projectile_radius: float) -> void:
	position = start_position
	direction = dir.normalized() if dir.length() > 0.001 else Vector2.RIGHT
	speed = projectile_speed
	damage = projectile_damage
	lifetime = projectile_lifetime
	radius = projectile_radius
	rotation = direction.angle()
	queue_redraw()

func _process(delta: float) -> void:
	position += direction * speed * delta
	lifetime -= delta
	if lifetime <= 0.0:
		queue_free()
		return
	queue_redraw()

func _draw() -> void:
	draw_circle(Vector2.ZERO, radius, Color("#FCD34D"))
	draw_arc(Vector2.ZERO, radius + 2.0, 0.0, TAU, 16, Color("#F59E0B"), 2.0)
