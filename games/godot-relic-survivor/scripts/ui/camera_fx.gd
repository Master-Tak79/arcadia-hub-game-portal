extends Camera2D

var _shake_time_left: float = 0.0
var _shake_strength: float = 0.0
var _shake_falloff: float = 0.5
var _base_zoom: Vector2 = Vector2.ONE

var _pulse_time_left: float = 0.0
var _pulse_strength: float = 0.0
var _pulse_falloff: float = 0.36
var _impact_scale: float = 1.0

func _ready() -> void:
	make_current()
	position = Vector2(640, 360)
	_base_zoom = zoom

func play_warning_pulse() -> void:
	_start_pulse(0.24, 0.08, 0.30)

func play_boss_spawn_impact() -> void:
	_start_shake(0.40, 10.0, 0.5)
	_start_pulse(0.30, 0.14, 0.36)

func play_boss_defeat_impact() -> void:
	_start_shake(0.48, 14.0, 0.5)
	_start_pulse(0.36, 0.18, 0.40)

# Step 20-C: combat feel hooks
func play_combat_hit_light() -> void:
	_start_shake(0.07, 2.8, 0.16)

func play_combat_hit_heavy() -> void:
	_start_shake(0.11, 4.2, 0.18)
	_start_pulse(0.08, 0.025, 0.16)

func play_player_damage_impact() -> void:
	_start_shake(0.14, 5.2, 0.20)
	_start_pulse(0.10, 0.03, 0.18)

func _process(delta: float) -> void:
	_update_shake(delta)
	_update_pulse(delta)

func _start_shake(duration: float, strength: float, falloff: float) -> void:
	var scaled_strength: float = strength * _impact_scale
	_shake_time_left = max(_shake_time_left, duration)
	_shake_strength = max(_shake_strength, scaled_strength)
	_shake_falloff = max(0.08, falloff)

func _start_pulse(duration: float, strength: float, falloff: float) -> void:
	var scaled_strength: float = strength * _impact_scale
	_pulse_time_left = max(_pulse_time_left, duration)
	_pulse_strength = max(_pulse_strength, scaled_strength)
	_pulse_falloff = max(0.08, falloff)

func _update_shake(delta: float) -> void:
	if _shake_time_left <= 0.0:
		offset = offset.lerp(Vector2.ZERO, min(1.0, delta * 22.0))
		return

	_shake_time_left -= delta
	var t: float = clampf(_shake_time_left / max(0.001, _shake_falloff), 0.0, 1.0)
	var strength: float = _shake_strength * t
	offset = Vector2(randf_range(-strength, strength), randf_range(-strength, strength))

	if _shake_time_left <= 0.0:
		offset = Vector2.ZERO
		_shake_strength = 0.0

func _update_pulse(delta: float) -> void:
	if _pulse_time_left <= 0.0:
		zoom = zoom.lerp(_base_zoom, min(1.0, delta * 12.0))
		return

	_pulse_time_left -= delta
	var k: float = clampf(_pulse_time_left / max(0.001, _pulse_falloff), 0.0, 1.0)
	var z: float = 1.0 + (_pulse_strength * k)
	zoom = Vector2(z, z)

	if _pulse_time_left <= 0.0:
		zoom = _base_zoom
		_pulse_strength = 0.0

func set_impact_scale(scale: float) -> void:
	_impact_scale = clampf(scale, 0.0, 1.6)

func get_impact_scale() -> float:
	return _impact_scale
