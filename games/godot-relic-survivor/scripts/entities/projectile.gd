extends Node2D

var direction: Vector2 = Vector2.RIGHT
var speed: float = 720.0
var damage: int = 1
var lifetime: float = 1.2
var radius: float = 6.0

var pierce_left: int = 0
var dot_damage: int = 0
var dot_duration: float = 0.0
var dot_tick: float = 0.0
var aoe_radius: float = 0.0
var aoe_mult: float = 0.0
var hit_registry: Dictionary = {}

var _fill_color: Color = Color("#FCD34D")
var _stroke_color: Color = Color("#F59E0B")

func setup(
	start_position: Vector2,
	dir: Vector2,
	projectile_speed: float,
	projectile_damage: int,
	projectile_lifetime: float,
	projectile_radius: float,
	weapon_profile: Dictionary = {}
) -> void:
	position = start_position
	direction = dir.normalized() if dir.length() > 0.001 else Vector2.RIGHT
	speed = projectile_speed
	damage = projectile_damage
	lifetime = projectile_lifetime
	radius = projectile_radius
	pierce_left = max(0, int(weapon_profile.get("pierce", 0)))
	dot_damage = max(0, int(weapon_profile.get("dot_damage", 0)))
	dot_duration = max(0.0, float(weapon_profile.get("dot_duration", 0.0)))
	dot_tick = max(0.0, float(weapon_profile.get("dot_tick", 0.0)))
	aoe_radius = max(0.0, float(weapon_profile.get("aoe_radius", 0.0)))
	aoe_mult = max(0.0, float(weapon_profile.get("aoe_mult", 0.0)))
	hit_registry = {}

	var base_color: String = String(weapon_profile.get("color", "#FCD34D"))
	_fill_color = Color(base_color)
	_stroke_color = _fill_color.lightened(0.18)

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
	draw_circle(Vector2.ZERO, radius, _fill_color)
	draw_arc(Vector2.ZERO, radius + 2.0, 0.0, TAU, 16, _stroke_color, 2.0)
	if pierce_left > 0:
		draw_arc(Vector2.ZERO, radius + 5.0, 0.0, TAU, 20, Color("#22D3EE"), 1.6)
	if aoe_radius > 0.0:
		draw_arc(Vector2.ZERO, radius + 7.0, 0.0, TAU, 20, Color("#C4B5FD"), 1.4)
	if dot_damage > 0:
		draw_arc(Vector2.ZERO, radius + 5.0, 0.0, TAU, 20, Color("#FB923C"), 1.4)
