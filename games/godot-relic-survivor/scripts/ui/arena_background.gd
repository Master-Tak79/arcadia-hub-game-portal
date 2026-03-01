extends Node2D

const Balance := preload("res://scripts/data/balance.gd")

var _size := Vector2(1280, 720)

func _ready() -> void:
	_size = Balance.new().ARENA_SIZE
	queue_redraw()

func _draw() -> void:
	draw_rect(Rect2(Vector2.ZERO, _size), Color("#0B1220"), true)
	for x in range(0, int(_size.x) + 1, 80):
		draw_line(Vector2(x, 0), Vector2(x, _size.y), Color("#15233D"), 1.0)
	for y in range(0, int(_size.y) + 1, 80):
		draw_line(Vector2(0, y), Vector2(_size.x, y), Color("#15233D"), 1.0)
