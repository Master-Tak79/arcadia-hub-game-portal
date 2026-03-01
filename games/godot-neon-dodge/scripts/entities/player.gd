extends Node2D

var move_speed: float = 340.0
var dash_multiplier: float = 2.2
var dash_duration: float = 0.12
var dash_cooldown: float = 1.0

var _enabled: bool = true
var _dash_time_left: float = 0.0
var _dash_cooldown_left: float = 0.0
var _hit_flash_left: float = 0.0

func setup(balance: RefCounted) -> void:
	move_speed = float(balance.PLAYER_SPEED)
	dash_multiplier = float(balance.DASH_MULTIPLIER)
	dash_duration = float(balance.DASH_DURATION)
	dash_cooldown = float(balance.DASH_COOLDOWN)
	reset_runtime()

func reset_runtime() -> void:
	_enabled = true
	_dash_time_left = 0.0
	_dash_cooldown_left = 0.0
	_hit_flash_left = 0.0
	queue_redraw()

func set_enabled(value: bool) -> void:
	_enabled = value

func on_hit() -> void:
	_hit_flash_left = 0.12
	queue_redraw()

func get_dash_cooldown_left() -> float:
	return max(0.0, _dash_cooldown_left)

func get_dash_cooldown_norm() -> float:
	if dash_cooldown <= 0.0:
		return 0.0
	return clamp(_dash_cooldown_left / dash_cooldown, 0.0, 1.0)

func _process(delta: float) -> void:
	if _dash_cooldown_left > 0.0:
		_dash_cooldown_left -= delta
	if _dash_time_left > 0.0:
		_dash_time_left -= delta
	if _hit_flash_left > 0.0:
		_hit_flash_left -= delta

	if not _enabled:
		queue_redraw()
		return

	var input_dir := Vector2(
		Input.get_action_strength("move_right") - Input.get_action_strength("move_left"),
		Input.get_action_strength("move_down") - Input.get_action_strength("move_up")
	)
	if input_dir.length() > 1.0:
		input_dir = input_dir.normalized()

	if Input.is_action_just_pressed("dash") and _dash_cooldown_left <= 0.0:
		_dash_time_left = dash_duration
		_dash_cooldown_left = dash_cooldown

	var speed: float = move_speed
	if _dash_time_left > 0.0:
		speed *= dash_multiplier

	position += input_dir * speed * delta
	queue_redraw()

func _draw() -> void:
	var body_color := Color("#22D3EE")
	if _hit_flash_left > 0.0:
		body_color = Color("#FB7185")
	if not _enabled:
		body_color = Color("#64748B")

	draw_circle(Vector2.ZERO, 14.0, body_color)
	draw_arc(Vector2.ZERO, 18.0, 0.0, TAU, 24, Color("#67E8F9"), 2.0)

	if _dash_time_left > 0.0:
		draw_arc(Vector2.ZERO, 24.0, 0.0, TAU, 30, Color("#A78BFA"), 3.0)
