extends Node2D

const Balance := preload("res://scripts/data/balance.gd")
const BG_TEXTURE := preload("res://assets/sprites/kenney/background/base.png")

var _size := Vector2(1280, 720)

func _ready() -> void:
	_size = Balance.new().ARENA_SIZE
	queue_redraw()

func _draw() -> void:
	draw_rect(Rect2(Vector2.ZERO, _size), Color("#060A16"), true)
	if BG_TEXTURE:
		draw_texture_rect(BG_TEXTURE, Rect2(Vector2.ZERO, _size), true, Color(0.8, 0.84, 1.0, 0.22))

	for x in range(0, int(_size.x) + 1, 80):
		draw_line(Vector2(x, 0), Vector2(x, _size.y), Color("#1B2A44"), 1.0)
	for y in range(0, int(_size.y) + 1, 80):
		draw_line(Vector2(0, y), Vector2(_size.x, y), Color("#1B2A44"), 1.0)
