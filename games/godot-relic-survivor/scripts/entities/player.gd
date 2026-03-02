extends Node2D

const PLAYER_TEXTURE := preload("res://assets/sprites/kenney/player/player_main.png")

var _state: RefCounted

var _base_move_speed: float = 340.0
var _base_dash_multiplier: float = 2.0
var _base_dash_duration: float = 0.12
var _base_dash_cooldown: float = 1.0

var _dash_time_left: float = 0.0
var _dash_cooldown_left: float = 0.0
var _enabled: bool = true

func setup(balance: RefCounted, state: RefCounted) -> void:
	_state = state
	_base_move_speed = float(balance.PLAYER_SPEED)
	_base_dash_multiplier = float(balance.DASH_MULTIPLIER)
	_base_dash_duration = float(balance.DASH_DURATION)
	_base_dash_cooldown = float(balance.DASH_COOLDOWN)
	reset_runtime()

func reset_runtime() -> void:
	_dash_time_left = 0.0
	_dash_cooldown_left = 0.0
	_enabled = true
	queue_redraw()

func set_enabled(value: bool) -> void:
	_enabled = value

func get_dash_cooldown_left() -> float:
	return max(0.0, _dash_cooldown_left)

func _process(delta: float) -> void:
	if _dash_cooldown_left > 0.0:
		_dash_cooldown_left -= delta
	if _dash_time_left > 0.0:
		_dash_time_left -= delta

	if not _enabled:
		queue_redraw()
		return

	var move_speed: float = (_base_move_speed + float(_state.player_speed_bonus)) * float(_state.event_move_speed_mult)
	var dash_multiplier: float = _base_dash_multiplier
	var dash_duration: float = _base_dash_duration
	var dash_cooldown: float = max(0.2, _base_dash_cooldown * (1.0 - float(_state.dash_cooldown_reduction)))

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
	var color := Color("#FFFFFF") if _enabled else Color("#94A3B8")
	if PLAYER_TEXTURE:
		var tex_size: Vector2 = PLAYER_TEXTURE.get_size()
		var scale: float = 30.0 / max(1.0, max(tex_size.x, tex_size.y))
		var draw_size: Vector2 = tex_size * scale
		draw_texture_rect(PLAYER_TEXTURE, Rect2(-draw_size * 0.5, draw_size), false, color)
	else:
		draw_circle(Vector2.ZERO, 14.0, Color("#22D3EE") if _enabled else Color("#64748B"))

	draw_arc(Vector2.ZERO, 18.0, 0.0, TAU, 24, Color("#67E8F9"), 2.0)
	if _dash_time_left > 0.0:
		draw_arc(Vector2.ZERO, 24.0, 0.0, TAU, 30, Color("#A78BFA"), 2.0)
