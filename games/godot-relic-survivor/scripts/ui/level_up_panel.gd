extends CanvasLayer

signal choice_selected(choice_index: int)

var _bg: ColorRect
var _panel: Panel
var _title: Label
var _hint: Label
var _option_labels: Array = []
var _choices: Array = []

func _ready() -> void:
	_build_ui()
	hide_panel()

func show_choices(choices: Array, level: int) -> void:
	_choices = choices
	visible = true
	_update_texts(level)

func hide_panel() -> void:
	visible = false
	_choices = []

func _process(_delta: float) -> void:
	if not visible:
		return

	if Input.is_action_just_pressed("levelup_1"):
		emit_signal("choice_selected", 0)
	elif Input.is_action_just_pressed("levelup_2"):
		emit_signal("choice_selected", 1)
	elif Input.is_action_just_pressed("levelup_3"):
		emit_signal("choice_selected", 2)

func _build_ui() -> void:
	_bg = ColorRect.new()
	_bg.color = Color(0, 0, 0, 0.55)
	_bg.anchor_right = 1.0
	_bg.anchor_bottom = 1.0
	add_child(_bg)

	_panel = Panel.new()
	_panel.offset_left = 180
	_panel.offset_top = 120
	_panel.offset_right = 1100
	_panel.offset_bottom = 600
	add_child(_panel)

	_title = Label.new()
	_title.position = Vector2(24, 18)
	_title.size = Vector2(840, 40)
	_panel.add_child(_title)

	_hint = Label.new()
	_hint.position = Vector2(24, 62)
	_hint.size = Vector2(840, 30)
	_hint.text = "숫자키 1/2/3으로 선택"
	_panel.add_child(_hint)

	for i in range(3):
		var option := Label.new()
		option.position = Vector2(24, 120 + i * 110)
		option.size = Vector2(840, 90)
		option.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
		_panel.add_child(option)
		_option_labels.append(option)

func _update_texts(level: int) -> void:
	_title.text = "LEVEL UP!  (Lv.%d)  업그레이드를 선택하세요" % level

	for i in range(_option_labels.size()):
		var label: Label = _option_labels[i]
		if i >= _choices.size():
			label.text = "%d) (선택지 없음)" % (i + 1)
			continue
		var choice: Dictionary = _choices[i]
		var name: String = String(choice.get("title", "Unknown"))
		var desc: String = String(choice.get("desc", ""))
		var stack_now: int = int(choice.get("current_stack", 0))
		var max_stack: int = int(choice.get("max_stacks", 1))
		label.text = "%d) %s\n   %s\n   STACK: %d / %d" % [i + 1, name, desc, stack_now, max_stack]
