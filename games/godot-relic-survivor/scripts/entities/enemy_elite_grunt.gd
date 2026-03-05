extends Node2D

const ELITE_GRUNT_TEXTURE_PATH := "res://assets/sprites/kenney/enemies/elite_grunt.png"
const TextureRuntime := preload("res://scripts/core/texture_runtime.gd")

var target: Node2D
var _elite_grunt_texture: Texture2D
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
var _variant_id: String = "standard"

func _ready() -> void:
	_elite_grunt_texture = TextureRuntime.load_texture(ELITE_GRUNT_TEXTURE_PATH)

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

func get_variant_id() -> String:
	return _variant_id

func configure_variant(variant_id: String) -> void:
	_variant_id = String(variant_id)
	match _variant_id:
		"juggernaut":
			hp += 3
			speed *= 0.86
			burst_speed_mult *= 0.94
			contact_damage += 1
			print("ELITE_VARIANT:elite_grunt:juggernaut")
		"berserk":
			hp = max(1, hp - 1)
			speed *= 1.18
			burst_interval *= 0.78
			burst_speed_mult *= 1.12
			print("ELITE_VARIANT:elite_grunt:berserk")
		_:
			_variant_id = "standard"

	queue_redraw()

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
	if _elite_grunt_texture:
		var tex_size: Vector2 = _elite_grunt_texture.get_size()
		var scale: float = (hit_radius * 2.7) / max(1.0, max(tex_size.x, tex_size.y))
		var draw_size: Vector2 = tex_size * scale
		draw_texture_rect(_elite_grunt_texture, Rect2(-draw_size * 0.5, draw_size), false, Color(1.0, 0.96, 0.96))
	else:
		draw_circle(Vector2.ZERO, hit_radius - 1.5, Color("#B91C1C"))
	draw_arc(Vector2.ZERO, hit_radius + 2.0, 0.0, TAU, 24, Color("#FCA5A5"), 2.2)

	if _burst_time_left > 0.0:
		draw_arc(Vector2.ZERO, hit_radius + 7.5, 0.0, TAU, 30, Color("#FDE68A"), 2.4)
		draw_line(Vector2.ZERO, Vector2.RIGHT.rotated(rotation) * (hit_radius + 12.0), Color("#FDBA74"), 3.0)

	if _variant_id == "juggernaut":
		draw_arc(Vector2.ZERO, hit_radius + 10.5, 0.0, TAU, 22, Color("#FBBF24"), 2.0)
	elif _variant_id == "berserk":
		draw_arc(Vector2.ZERO, hit_radius + 10.5, 0.0, TAU, 22, Color("#FB7185"), 2.0)
