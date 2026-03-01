extends CanvasLayer

var _label: Label
var _time_left: float = 0.0

func _ready() -> void:
	visible = false
	_label = Label.new()
	_label.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	_label.vertical_alignment = VERTICAL_ALIGNMENT_CENTER
	_label.anchor_left = 0.0
	_label.anchor_top = 0.0
	_label.anchor_right = 1.0
	_label.anchor_bottom = 0.0
	_label.offset_left = 120
	_label.offset_top = 36
	_label.offset_right = -120
	_label.offset_bottom = 132
	add_child(_label)

func show_message(text: String, duration: float = 2.2) -> void:
	_time_left = max(0.1, duration)
	visible = true
	_label.text = text

func _process(delta: float) -> void:
	if not visible:
		return
	_time_left -= delta
	if _time_left <= 0.0:
		visible = false
