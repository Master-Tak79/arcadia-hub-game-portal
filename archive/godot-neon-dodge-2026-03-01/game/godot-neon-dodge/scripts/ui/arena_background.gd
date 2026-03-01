extends Node2D

const Balance := preload("res://scripts/data/balance.gd")

var _size := Vector2(1280, 720)

func _ready() -> void:
	var balance := Balance.new()
	_size = balance.ARENA_SIZE
	queue_redraw()

func _draw() -> void:
	draw_rect(Rect2(Vector2.ZERO, _size), Color("#111827"), true)
	draw_rect(Rect2(Vector2(2, 2), _size - Vector2(4, 4)), Color("#1F2937"), false, 2.0)

	var grid_color := Color("#1f2937")
	for x in range(0, int(_size.x) + 1, 80):
		draw_line(Vector2(x, 0), Vector2(x, _size.y), grid_color, 1.0)
	for y in range(0, int(_size.y) + 1, 80):
		draw_line(Vector2(0, y), Vector2(_size.x, y), grid_color, 1.0)
