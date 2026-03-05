extends CanvasLayer

signal option_selected(option_index: int)
signal close_requested

var _bg: ColorRect
var _panel: Panel
var _title: Label
var _hint: Label
var _option_labels: Array = []
var _options: Array = []

func _ready() -> void:
	_build_ui()
	hide_panel()

func show_options(character_title: String, shards: int, options: Array) -> void:
	_options = options
	visible = true
	_title.text = "TREE UNLOCK · %s · SHARDS %d" % [character_title, shards]
	_update_option_labels()

func hide_panel() -> void:
	visible = false
	_options = []

func _process(_delta: float) -> void:
	if not visible:
		return

	if Input.is_action_just_pressed("tree_menu"):
		emit_signal("close_requested")
		return

	if Input.is_action_just_pressed("levelup_1"):
		emit_signal("option_selected", 0)
	elif Input.is_action_just_pressed("levelup_2"):
		emit_signal("option_selected", 1)
	elif Input.is_action_just_pressed("levelup_3"):
		emit_signal("option_selected", 2)

func _build_ui() -> void:
	_bg = ColorRect.new()
	_bg.color = Color(0, 0, 0, 0.62)
	_bg.anchor_right = 1.0
	_bg.anchor_bottom = 1.0
	add_child(_bg)

	_panel = Panel.new()
	_panel.offset_left = 180
	_panel.offset_top = 112
	_panel.offset_right = 1100
	_panel.offset_bottom = 620
	add_child(_panel)

	_title = Label.new()
	_title.position = Vector2(20, 14)
	_title.size = Vector2(860, 42)
	_title.add_theme_font_size_override("font_size", 26)
	_panel.add_child(_title)

	_hint = Label.new()
	_hint.position = Vector2(20, 54)
	_hint.size = Vector2(860, 36)
	_hint.text = "1/2/3 선택 · T 닫기 · 해금 효과는 다음 라운드 시작 시 적용"
	_panel.add_child(_hint)

	for i in range(3):
		var option := Label.new()
		option.position = Vector2(20, 100 + i * 126)
		option.size = Vector2(860, 112)
		option.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
		option.add_theme_font_size_override("font_size", 20)
		_panel.add_child(option)
		_option_labels.append(option)

func _update_option_labels() -> void:
	for i in range(_option_labels.size()):
		var label: Label = _option_labels[i]
		if i >= _options.size():
			label.text = "%d) (해금 가능한 노드 없음)" % (i + 1)
			label.self_modulate = Color(1, 1, 1, 0.6)
			continue

		var node: Dictionary = _options[i]
		var node_id: String = String(node.get("id", ""))
		var tier: int = int(node.get("tier", 1))
		var cost: int = int(node.get("cost", 1))
		var can_unlock: bool = bool(node.get("can_unlock", false))
		var reason: String = String(node.get("reason", ""))
		var status: String = "READY" if can_unlock else ("LOCKED: %s" % reason)

		var effect_parts: Array[String] = []
		for raw_effect in Array(node.get("effects", [])):
			var effect: Dictionary = raw_effect
			effect_parts.append("%s=%s" % [String(effect.get("key", "?")), str(effect.get("value", 0))])
		var effect_line: String = " / ".join(effect_parts)

		label.text = "%d) [%s] T%d · COST %d · %s\n   EFFECT: %s" % [
			i + 1,
			node_id,
			tier,
			cost,
			status,
			effect_line
		]
		label.self_modulate = Color("#D1FAE5") if can_unlock else Color("#FCA5A5")
