extends RefCounted

const ACT_MOVE_LEFT := "move_left"
const ACT_MOVE_RIGHT := "move_right"
const ACT_MOVE_UP := "move_up"
const ACT_MOVE_DOWN := "move_down"
const ACT_DASH := "dash"
const ACT_RESTART := "restart"

func ensure_default_bindings() -> void:
	_ensure_action(ACT_MOVE_LEFT, [KEY_A, KEY_LEFT])
	_ensure_action(ACT_MOVE_RIGHT, [KEY_D, KEY_RIGHT])
	_ensure_action(ACT_MOVE_UP, [KEY_W, KEY_UP])
	_ensure_action(ACT_MOVE_DOWN, [KEY_S, KEY_DOWN])
	_ensure_action(ACT_DASH, [KEY_SPACE])
	_ensure_action(ACT_RESTART, [KEY_R])

func _ensure_action(action: StringName, keys: Array) -> void:
	if not InputMap.has_action(action):
		InputMap.add_action(action)

	for keycode in keys:
		if _has_key_binding(action, keycode):
			continue
		var event := InputEventKey.new()
		event.physical_keycode = keycode
		InputMap.action_add_event(action, event)

func _has_key_binding(action: StringName, keycode: int) -> bool:
	for event in InputMap.action_get_events(action):
		if event is InputEventKey and event.physical_keycode == keycode:
			return true
	return false
