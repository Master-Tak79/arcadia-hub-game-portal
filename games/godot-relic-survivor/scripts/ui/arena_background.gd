extends Node2D

const Balance := preload("res://scripts/data/balance.gd")
const BG_TEXTURE_PATH := "res://assets/sprites/kenney/background/base.png"
const TextureRuntime := preload("res://scripts/core/texture_runtime.gd")

var _size := Vector2(1280, 720)
var _bg_texture: Texture2D

func _ready() -> void:
	_size = Balance.new().ARENA_SIZE
	_bg_texture = TextureRuntime.load_texture(BG_TEXTURE_PATH)
	queue_redraw()

func _draw() -> void:
	draw_rect(Rect2(Vector2.ZERO, _size), Color("#060A16"), true)
	if _bg_texture:
		draw_texture_rect(_bg_texture, Rect2(Vector2.ZERO, _size), true, Color(0.8, 0.84, 1.0, 0.22))

	for x in range(0, int(_size.x) + 1, 80):
		draw_line(Vector2(x, 0), Vector2(x, _size.y), Color("#1B2A44"), 1.0)
	for y in range(0, int(_size.y) + 1, 80):
		draw_line(Vector2(0, y), Vector2(_size.x, y), Color("#1B2A44"), 1.0)
