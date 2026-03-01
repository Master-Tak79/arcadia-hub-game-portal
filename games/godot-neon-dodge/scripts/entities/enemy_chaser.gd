extends Node2D

var target: Node2D
var speed: float = 120.0
var hit_radius: float = 24.0
var signal_bus: RefCounted

func setup(target_node: Node2D, speed_value: float, hit_radius_value: float, bus: RefCounted) -> void:
	target = target_node
	speed = speed_value
	hit_radius = hit_radius_value
	signal_bus = bus

func _process(delta: float) -> void:
	if target == null:
		return

	var to_target := target.position - position
	var dist := to_target.length()
	if dist > 0.001:
		position += to_target.normalized() * speed * delta

	if dist <= hit_radius and signal_bus:
		signal_bus.emit_signal("player_damaged", -1)
		queue_free()
