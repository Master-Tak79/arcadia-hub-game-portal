extends Node2D

var move_speed: float = 340.0
var dash_multiplier: float = 2.2
var dash_duration: float = 0.12
var dash_cooldown: float = 1.0

var _dash_time_left := 0.0
var _dash_cooldown_left := 0.0

func setup(balance: RefCounted) -> void:
	move_speed = balance.PLAYER_SPEED
	dash_multiplier = balance.DASH_MULTIPLIER
	dash_duration = balance.DASH_DURATION
	dash_cooldown = balance.DASH_COOLDOWN

func _process(delta: float) -> void:
	var input_dir := Vector2(
		Input.get_action_strength("ui_right") - Input.get_action_strength("ui_left"),
		Input.get_action_strength("ui_down") - Input.get_action_strength("ui_up")
	)
	if input_dir.length() > 1.0:
		input_dir = input_dir.normalized()

	if _dash_cooldown_left > 0.0:
		_dash_cooldown_left -= delta
	if _dash_time_left > 0.0:
		_dash_time_left -= delta

	if Input.is_action_just_pressed("ui_accept") and _dash_cooldown_left <= 0.0:
		_dash_time_left = dash_duration
		_dash_cooldown_left = dash_cooldown

	var speed := move_speed
	if _dash_time_left > 0.0:
		speed *= dash_multiplier

	position += input_dir * speed * delta
