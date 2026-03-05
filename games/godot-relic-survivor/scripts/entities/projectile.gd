extends Node2D

const PROJECTILE_DEFAULT_TEXTURE_PATH := "res://assets/sprites/kenney/projectiles/default.png"
const PROJECTILE_PIERCE_TEXTURE_PATH := "res://assets/sprites/kenney/projectiles/pierce.png"
const PROJECTILE_DOT_TEXTURE_PATH := "res://assets/sprites/kenney/projectiles/dot.png"
const PROJECTILE_AOE_TEXTURE_PATH := "res://assets/sprites/kenney/projectiles/aoe.png"
const TextureRuntime := preload("res://scripts/core/texture_runtime.gd")

static var _printed_trail_token: bool = false
static var _texture_cache: Dictionary = {}

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
var _texture: Texture2D
var _trail_world: Array = []

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

	var weapon_id: String = String(weapon_profile.get("id", "default"))
	var texture_path: String = PROJECTILE_DEFAULT_TEXTURE_PATH
	match weapon_id:
		"pierce":
			texture_path = PROJECTILE_PIERCE_TEXTURE_PATH
		"dot":
			texture_path = PROJECTILE_DOT_TEXTURE_PATH
		"aoe":
			texture_path = PROJECTILE_AOE_TEXTURE_PATH
		_:
			texture_path = PROJECTILE_DEFAULT_TEXTURE_PATH
	_texture = _get_cached_texture(texture_path)

	_trail_world = [position]
	if not _printed_trail_token:
		print("PROJECTILE_TRAIL_ON")
		_printed_trail_token = true

	rotation = direction.angle() + PI * 0.5
	queue_redraw()

func _get_cached_texture(path: String) -> Texture2D:
	if _texture_cache.has(path):
		return _texture_cache[path] as Texture2D
	var tex: Texture2D = TextureRuntime.load_texture(path)
	_texture_cache[path] = tex
	return tex

func _process(delta: float) -> void:
	position += direction * speed * delta
	_trail_world.append(position)
	if _trail_world.size() > 7:
		_trail_world.pop_front()

	lifetime -= delta
	if lifetime <= 0.0:
		queue_free()
		return
	queue_redraw()

func _draw() -> void:
	if _trail_world.size() >= 2:
		for i in range(1, _trail_world.size()):
			var from_local: Vector2 = Vector2(_trail_world[i - 1]) - position
			var to_local: Vector2 = Vector2(_trail_world[i]) - position
			var alpha: float = float(i) / float(_trail_world.size())
			draw_line(from_local, to_local, Color(_fill_color.r, _fill_color.g, _fill_color.b, 0.28 * alpha), max(1.0, radius * 0.35))

	if _texture:
		var tex_size: Vector2 = _texture.get_size()
		var draw_height: float = max(14.0, radius * 6.0)
		var scale: float = draw_height / max(1.0, tex_size.y)
		var draw_size: Vector2 = tex_size * scale
		draw_texture_rect(_texture, Rect2(-draw_size * 0.5, draw_size), false, _fill_color)
	else:
		draw_circle(Vector2.ZERO, radius, _fill_color)

	draw_arc(Vector2.ZERO, radius + 2.0, 0.0, TAU, 16, _stroke_color, 2.0)
	if pierce_left > 0:
		draw_arc(Vector2.ZERO, radius + 5.0, 0.0, TAU, 20, Color("#22D3EE"), 1.6)
	if aoe_radius > 0.0:
		draw_arc(Vector2.ZERO, radius + 7.0, 0.0, TAU, 20, Color("#C4B5FD"), 1.4)
	if dot_damage > 0:
		draw_arc(Vector2.ZERO, radius + 5.0, 0.0, TAU, 20, Color("#FB923C"), 1.4)
