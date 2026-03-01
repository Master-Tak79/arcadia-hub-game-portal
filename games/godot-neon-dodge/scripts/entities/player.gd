extends Node2D

var move_speed: float = 340.0
var dash_multiplier: float = 2.2
var dash_duration: float = 0.12
var dash_cooldown: float = 1.0

var _enabled: bool = true
var _dash_time_left: float = 0.0
var _dash_cooldown_left: float = 0.0

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

func set_enabled(value: bool) -> void:
	_enabled = value

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

	if not _enabled:
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
