extends Node2D

const GRUNT_TEXTURE := preload("res://assets/sprites/kenney/enemies/grunt.png")

var target: Node2D
var speed: float = 130.0
var hp: int = 2
var hit_radius: float = 14.0
var exp_reward: int = 3
var contact_damage: int = 1

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

func get_exp_reward() -> int:
	return exp_reward

func get_contact_damage() -> int:
	return contact_damage

func get_enemy_kind() -> String:
	return "grunt"

func _process(delta: float) -> void:
	if target == null:
		return
	var to_target := target.position - position
	if to_target.length() > 0.001:
		position += to_target.normalized() * speed * delta
		rotation = to_target.angle()
	queue_redraw()

func _draw() -> void:
	if GRUNT_TEXTURE:
		var tex_size: Vector2 = GRUNT_TEXTURE.get_size()
		var scale: float = (hit_radius * 2.5) / max(1.0, max(tex_size.x, tex_size.y))
		var draw_size: Vector2 = tex_size * scale
		draw_texture_rect(GRUNT_TEXTURE, Rect2(-draw_size * 0.5, draw_size), false, Color.WHITE)
	else:
		draw_circle(Vector2.ZERO, hit_radius - 1.0, Color("#EF4444"))

	draw_arc(Vector2.ZERO, hit_radius + 1.5, 0.0, TAU, 18, Color("#FCA5A5"), 2.0)
	draw_line(Vector2.ZERO, Vector2(hit_radius + 5.0, 0), Color("#FDE68A"), 2.0)
