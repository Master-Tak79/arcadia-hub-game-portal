extends Node2D

const ELITE_DASHER_TEXTURE_PATH := "res://assets/sprites/kenney/enemies/elite_dasher.png"
const TextureRuntime := preload("res://scripts/core/texture_runtime.gd")

var target: Node2D
var _elite_dasher_texture: Texture2D
var speed: float = 98.0
var hp: int = 8
var hit_radius: float = 18.0
var contact_damage: int = 2
var exp_reward: int = 13

var dash_speed: float = 370.0
var dash_interval: float = 2.35
var dash_duration: float = 0.26
var dash_chain_gap: float = 0.14
var dash_chain_count: int = 1

var _dash_cooldown_left: float = 1.5
var _dash_time_left: float = 0.0
var _dash_gap_left: float = 0.0
var _dash_chain_left: int = 0
var _dash_direction: Vector2 = Vector2.RIGHT
var _variant_id: String = "standard"

func _ready() -> void:
	_elite_dasher_texture = TextureRuntime.load_texture(ELITE_DASHER_TEXTURE_PATH)

func setup(
	target_node: Node2D,
	base_speed: float,
	base_hp: int,
	base_hit_radius: float,
	base_contact_damage: int,
	base_exp_reward: int,
	base_dash_speed: float,
	base_dash_interval: float,
	base_dash_duration: float,
	base_dash_chain_gap: float,
	base_dash_chain_count: int
) -> void:
	target = target_node
	speed = base_speed
	hp = base_hp
	hit_radius = base_hit_radius
	contact_damage = base_contact_damage
	exp_reward = base_exp_reward
	dash_speed = base_dash_speed
	dash_interval = max(0.6, base_dash_interval)
	dash_duration = max(0.08, base_dash_duration)
	dash_chain_gap = max(0.05, base_dash_chain_gap)
	dash_chain_count = max(0, base_dash_chain_count)

	_dash_cooldown_left = randf_range(0.3, dash_interval)
	_dash_time_left = 0.0
	_dash_gap_left = 0.0
	_dash_chain_left = 0
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
	return "elite_dasher"

func get_variant_id() -> String:
	return _variant_id

func configure_variant(variant_id: String) -> void:
	_variant_id = String(variant_id)
	match _variant_id:
		"phantom":
			dash_interval *= 0.72
			dash_duration *= 0.86
			dash_chain_count += 1
			print("ELITE_VARIANT:elite_dasher:phantom")
		"bulwark":
			hp += 2
			speed *= 0.9
			dash_speed *= 0.92
			dash_chain_gap *= 0.85
			print("ELITE_VARIANT:elite_dasher:bulwark")
		_:
			_variant_id = "standard"
	queue_redraw()

func is_dashing() -> bool:
	return _dash_time_left > 0.0

func _process(delta: float) -> void:
	if target == null:
		return

	var to_target: Vector2 = target.position - position
	if to_target.length() > 0.001:
		rotation = to_target.angle()

	if _dash_time_left > 0.0:
		_dash_time_left -= delta
		position += _dash_direction * dash_speed * delta
		if _dash_time_left <= 0.0 and _dash_chain_left > 0:
			_dash_chain_left -= 1
			_dash_gap_left = dash_chain_gap
		queue_redraw()
		return

	if _dash_gap_left > 0.0:
		_dash_gap_left -= delta
		if _dash_gap_left <= 0.0 and to_target.length() > 0.001:
			_dash_direction = to_target.normalized()
			_dash_time_left = dash_duration
		queue_redraw()
		return

	_dash_cooldown_left -= delta
	if _dash_cooldown_left <= 0.0 and to_target.length() > hit_radius * 2.4:
		_dash_direction = to_target.normalized()
		_dash_time_left = dash_duration
		_dash_cooldown_left = dash_interval
		_dash_chain_left = dash_chain_count
		queue_redraw()
		return

	if to_target.length() > 0.001:
		position += to_target.normalized() * speed * delta

	queue_redraw()

func _draw() -> void:
	if _elite_dasher_texture:
		var tex_size: Vector2 = _elite_dasher_texture.get_size()
		var scale: float = (hit_radius * 2.8) / max(1.0, max(tex_size.x, tex_size.y))
		var draw_size: Vector2 = tex_size * scale
		draw_texture_rect(_elite_dasher_texture, Rect2(-draw_size * 0.5, draw_size), false, Color(0.96, 0.96, 1.0))
	else:
		draw_circle(Vector2.ZERO, hit_radius - 1.5, Color("#6D28D9"))
	draw_arc(Vector2.ZERO, hit_radius + 2.0, 0.0, TAU, 24, Color("#C4B5FD"), 2.2)

	if _dash_time_left > 0.0:
		draw_arc(Vector2.ZERO, hit_radius + 8.0, 0.0, TAU, 28, Color("#DDD6FE"), 2.8)
		draw_line(Vector2.ZERO, _dash_direction * (hit_radius + 16.0), Color("#EDE9FE"), 3.2)
	elif _dash_gap_left > 0.0:
		draw_arc(Vector2.ZERO, hit_radius + 7.0, 0.0, TAU, 24, Color("#A78BFA"), 2.2)

	if _variant_id == "phantom":
		draw_arc(Vector2.ZERO, hit_radius + 10.0, 0.0, TAU, 24, Color("#67E8F9"), 1.9)
	elif _variant_id == "bulwark":
		draw_arc(Vector2.ZERO, hit_radius + 10.0, 0.0, TAU, 24, Color("#FCD34D"), 1.9)
