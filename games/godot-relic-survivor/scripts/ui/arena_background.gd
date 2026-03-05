extends Node2D

const Balance := preload("res://scripts/data/balance.gd")
const BG_TEXTURE_PATH := "res://assets/sprites/kenney/background/base.png"
const TextureRuntime := preload("res://scripts/core/texture_runtime.gd")

var _size := Vector2(1280, 720)
var _bg_texture: Texture2D
var _time_acc: float = 0.0
var _stars_far: Array = []
var _stars_near: Array = []

func _ready() -> void:
	_size = Balance.new().ARENA_SIZE
	_bg_texture = TextureRuntime.load_texture(BG_TEXTURE_PATH)
	_build_star_layers()
	queue_redraw()

func _process(delta: float) -> void:
	_time_acc += delta
	queue_redraw()

func _build_star_layers() -> void:
	var rng := RandomNumberGenerator.new()
	rng.seed = 981274

	_stars_far.clear()
	_stars_near.clear()

	for _i in range(110):
		_stars_far.append({
			"x": rng.randf_range(0.0, _size.x),
			"y": rng.randf_range(0.0, _size.y),
			"r": rng.randf_range(0.5, 1.3),
			"a": rng.randf_range(0.18, 0.46),
			"spd": rng.randf_range(1.0, 4.5)
		})

	for _j in range(48):
		_stars_near.append({
			"x": rng.randf_range(0.0, _size.x),
			"y": rng.randf_range(0.0, _size.y),
			"r": rng.randf_range(1.1, 2.4),
			"a": rng.randf_range(0.22, 0.62),
			"spd": rng.randf_range(5.0, 12.0)
		})

func _draw() -> void:
	draw_rect(Rect2(Vector2.ZERO, _size), Color("#050A14"), true)
	if _bg_texture:
		draw_texture_rect(_bg_texture, Rect2(Vector2.ZERO, _size), true, Color(0.82, 0.90, 1.0, 0.20))

	_draw_star_layer(_stars_far, Color("#A5B4FC"), 0.45)
	_draw_star_layer(_stars_near, Color("#C7D2FE"), 0.75)
	_draw_grid_overlay()
	_draw_center_glow()
	_draw_edge_vignette()

func _draw_star_layer(layer: Array, tint: Color, alpha_scale: float) -> void:
	for star_data in layer:
		var x0: float = float(star_data.get("x", 0.0))
		var y0: float = float(star_data.get("y", 0.0))
		var speed: float = float(star_data.get("spd", 2.0))
		var radius: float = float(star_data.get("r", 1.0))
		var alpha: float = float(star_data.get("a", 0.3)) * alpha_scale

		var x: float = fposmod(x0 + _time_acc * speed, _size.x)
		var y: float = y0
		var pulse: float = 0.82 + 0.18 * sin(_time_acc * (1.4 + speed * 0.03) + x0 * 0.01)
		draw_circle(Vector2(x, y), radius, Color(tint.r, tint.g, tint.b, alpha * pulse))

func _draw_grid_overlay() -> void:
	for x in range(0, int(_size.x) + 1, 80):
		draw_line(Vector2(x, 0), Vector2(x, _size.y), Color(0.15, 0.23, 0.38, 0.28), 1.0)
	for y in range(0, int(_size.y) + 1, 80):
		draw_line(Vector2(0, y), Vector2(_size.x, y), Color(0.15, 0.23, 0.38, 0.28), 1.0)

func _draw_center_glow() -> void:
	var center := _size * 0.5
	var rings := 4
	for i in range(rings):
		var ratio: float = float(i) / max(1.0, float(rings - 1))
		var radius: float = lerpf(_size.y * 0.18, _size.y * 0.44, ratio)
		var alpha: float = lerpf(0.05, 0.015, ratio)
		draw_circle(center, radius, Color(0.35, 0.48, 0.80, alpha))

func _draw_edge_vignette() -> void:
	var bands: int = 10
	for i in range(bands):
		var ratio: float = float(i + 1) / float(bands)
		var thickness: float = 8.0 + ratio * 8.0
		var alpha: float = 0.010 + ratio * 0.010
		var inset: float = float(i) * thickness

		draw_rect(Rect2(inset, inset, _size.x - inset * 2.0, thickness), Color(0, 0, 0, alpha), true)
		draw_rect(Rect2(inset, _size.y - inset - thickness, _size.x - inset * 2.0, thickness), Color(0, 0, 0, alpha), true)
		draw_rect(Rect2(inset, inset, thickness, _size.y - inset * 2.0), Color(0, 0, 0, alpha), true)
		draw_rect(Rect2(_size.x - inset - thickness, inset, thickness, _size.y - inset * 2.0), Color(0, 0, 0, alpha), true)
