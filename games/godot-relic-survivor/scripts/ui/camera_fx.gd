extends Camera2D

var _shake_time_left: float = 0.0
var _shake_strength: float = 0.0
var _base_zoom: Vector2 = Vector2.ONE

var _pulse_time_left: float = 0.0
var _pulse_strength: float = 0.0

func _ready() -> void:
	current = true
	position = Vector2(640, 360)
	_base_zoom = zoom

func play_warning_pulse() -> void:
	_pulse_time_left = max(_pulse_time_left, 0.24)
	_pulse_strength = max(_pulse_strength, 0.08)

func play_boss_spawn_impact() -> void:
	_start_shake(0.40, 10.0)
	_pulse_time_left = max(_pulse_time_left, 0.30)
	_pulse_strength = max(_pulse_strength, 0.14)

func play_boss_defeat_impact() -> void:
	_start_shake(0.48, 14.0)
	_pulse_time_left = max(_pulse_time_left, 0.36)
	_pulse_strength = max(_pulse_strength, 0.18)

func _process(delta: float) -> void:
	_update_shake(delta)
	_update_pulse(delta)

func _start_shake(duration: float, strength: float) -> void:
	_shake_time_left = max(_shake_time_left, duration)
	_shake_strength = max(_shake_strength, strength)

func _update_shake(delta: float) -> void:
	if _shake_time_left <= 0.0:
		offset = offset.lerp(Vector2.ZERO, min(1.0, delta * 20.0))
		return

	_shake_time_left -= delta
	var t: float = clampf(_shake_time_left / 0.5, 0.0, 1.0)
	var strength: float = _shake_strength * t
	offset = Vector2(randf_range(-strength, strength), randf_range(-strength, strength))

	if _shake_time_left <= 0.0:
		offset = Vector2.ZERO
		_shake_strength = 0.0

func _update_pulse(delta: float) -> void:
	if _pulse_time_left <= 0.0:
		zoom = zoom.lerp(_base_zoom, min(1.0, delta * 10.0))
		return

	_pulse_time_left -= delta
	var k: float = clampf(_pulse_time_left / 0.36, 0.0, 1.0)
	var z: float = 1.0 + (_pulse_strength * k)
	zoom = Vector2(z, z)

	if _pulse_time_left <= 0.0:
		zoom = _base_zoom
		_pulse_strength = 0.0
