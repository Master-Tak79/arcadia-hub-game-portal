extends Node2D

var _state: RefCounted
var _arena_size: Vector2 = Vector2(1280, 720)
var _snapshot: Dictionary = {}

func setup(balance: RefCounted, state: RefCounted) -> void:
	_state = state
	_arena_size = Vector2(float(balance.ARENA_SIZE.x), float(balance.ARENA_SIZE.y))
	clear_snapshot()

func clear_snapshot() -> void:
	_snapshot = {
		"event_id": "",
		"phase": "",
		"time_left": 0.0,
		"zone_center": Vector2.ZERO,
		"zone_radius": 0.0,
	}
	queue_redraw()

func set_snapshot(data: Dictionary) -> void:
	_snapshot = data.duplicate(true)
	queue_redraw()

func _draw() -> void:
	if _state == null:
		return

	var event_id: String = String(_snapshot.get("event_id", ""))
	if event_id == "":
		return

	var phase: String = String(_snapshot.get("phase", ""))
	var time_left: float = float(_snapshot.get("time_left", 0.0))
	var zone_center: Vector2 = _snapshot.get("zone_center", Vector2.ZERO)
	var zone_radius: float = float(_snapshot.get("zone_radius", 0.0))

	if event_id == "fog":
		var alpha: float = 0.12 if phase == "telegraph" else 0.26
		draw_rect(Rect2(Vector2.ZERO, _arena_size), Color(0.82, 0.87, 0.93, alpha), true)
		return

	if zone_radius <= 0.0:
		return

	if event_id == "slow_zone":
		if phase == "telegraph":
			draw_arc(zone_center, zone_radius, 0.0, TAU, 48, Color(0.42, 0.82, 1.0, 0.72), 3.2)
			var pulse: float = 0.25 + (sin(Time.get_ticks_msec() * 0.008) * 0.08)
			draw_circle(zone_center, zone_radius * 0.55, Color(0.32, 0.65, 1.0, pulse))
		else:
			draw_circle(zone_center, zone_radius, Color(0.22, 0.5, 0.92, 0.18))
			draw_arc(zone_center, zone_radius, 0.0, TAU, 48, Color(0.46, 0.78, 1.0, 0.55), 2.5)
			if time_left < 1.2:
				draw_arc(zone_center, zone_radius + 6.0, 0.0, TAU, 48, Color(0.56, 0.92, 1.0, 0.6), 2.2)
		return

	if event_id == "shock_zone":
		if phase == "telegraph":
			draw_arc(zone_center, zone_radius, 0.0, TAU, 48, Color(0.76, 0.98, 0.44, 0.85), 3.6)
			var ring_r: float = zone_radius * (0.45 + (sin(Time.get_ticks_msec() * 0.01) * 0.08))
			draw_arc(zone_center, ring_r, 0.0, TAU, 32, Color(0.85, 1.0, 0.56, 0.45), 2.2)
		else:
			draw_circle(zone_center, zone_radius, Color(0.54, 0.86, 0.2, 0.16))
			for i in range(3):
				var a: float = float(i) * TAU / 3.0 + (Time.get_ticks_msec() * 0.002)
				var p: Vector2 = zone_center + Vector2.RIGHT.rotated(a) * (zone_radius * 0.65)
				draw_circle(p, 5.0, Color(0.94, 1.0, 0.65, 0.72))
			draw_arc(zone_center, zone_radius, 0.0, TAU, 48, Color(0.86, 1.0, 0.7, 0.55), 2.8)
