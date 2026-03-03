extends Node2D

var _color: Color = Color("#67E8F9")
var _radius: float = 10.0
var _line_width: float = 2.0
var _duration: float = 0.18
var _life: float = 0.18

func setup(at_pos: Vector2, color: Color, radius: float, line_width: float, duration: float) -> void:
	position = at_pos
	_color = color
	_radius = max(2.0, radius)
	_line_width = max(1.0, line_width)
	_duration = max(0.05, duration)
	_life = _duration
	queue_redraw()

func _process(delta: float) -> void:
	_life -= delta
	if _life <= 0.0:
		queue_free()
		return
	queue_redraw()

func _draw() -> void:
	var t: float = 1.0 - (_life / max(0.001, _duration))
	var alpha: float = clampf(1.0 - t, 0.0, 1.0)
	var r: float = _radius * (0.65 + t * 1.1)

	# soft glow core
	draw_circle(Vector2.ZERO, r * 0.28, Color(_color.r, _color.g, _color.b, alpha * 0.32))
	draw_circle(Vector2.ZERO, max(1.0, r * 0.14), Color(_color.r, _color.g, _color.b, alpha * 0.62))

	# expanding ring
	draw_arc(Vector2.ZERO, r, 0.0, TAU, 28, Color(_color.r, _color.g, _color.b, alpha), _line_width)

	# burst spokes for stronger hit readability
	var spoke_count: int = 6
	var spoke_len: float = r * (0.32 + 0.18 * t)
	for i in range(spoke_count):
		var ang: float = (TAU / float(spoke_count)) * float(i) + (t * 0.45)
		var from: Vector2 = Vector2.RIGHT.rotated(ang) * (r * 0.72)
		var to: Vector2 = Vector2.RIGHT.rotated(ang) * (r * 0.72 + spoke_len)
		draw_line(from, to, Color(_color.r, _color.g, _color.b, alpha * 0.72), max(1.0, _line_width * 0.78))
