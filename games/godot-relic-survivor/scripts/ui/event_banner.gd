extends CanvasLayer

var _panel_bg: ColorRect
var _panel_border: ColorRect
var _label: Label
var _time_left: float = 0.0
var _duration: float = 0.0
var _base_color: Color = Color("#0B1220")

func _ready() -> void:
	visible = false

	_panel_bg = ColorRect.new()
	_panel_bg.anchor_left = 0.5
	_panel_bg.anchor_right = 0.5
	_panel_bg.anchor_top = 0.0
	_panel_bg.anchor_bottom = 0.0
	_panel_bg.offset_left = -420
	_panel_bg.offset_right = 420
	_panel_bg.offset_top = 28
	_panel_bg.offset_bottom = 120
	_panel_bg.color = _base_color
	add_child(_panel_bg)

	_panel_border = ColorRect.new()
	_panel_border.anchor_left = 0.5
	_panel_border.anchor_right = 0.5
	_panel_border.anchor_top = 0.0
	_panel_border.anchor_bottom = 0.0
	_panel_border.offset_left = -422
	_panel_border.offset_right = 422
	_panel_border.offset_top = 26
	_panel_border.offset_bottom = 122
	_panel_border.color = Color(1, 1, 1, 0.18)
	add_child(_panel_border)
	move_child(_panel_border, 0)

	_label = Label.new()
	_label.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	_label.vertical_alignment = VERTICAL_ALIGNMENT_CENTER
	_label.anchor_left = 0.5
	_label.anchor_right = 0.5
	_label.anchor_top = 0.0
	_label.anchor_bottom = 0.0
	_label.offset_left = -400
	_label.offset_right = 400
	_label.offset_top = 40
	_label.offset_bottom = 108
	_label.add_theme_font_size_override("font_size", 24)
	add_child(_label)

func show_message(text: String, duration: float = 2.2, tint: Color = Color("#1E293B")) -> void:
	_time_left = max(0.1, duration)
	_duration = _time_left
	visible = true
	_label.text = text
	_base_color = tint
	_set_alpha(1.0)

func _process(delta: float) -> void:
	if not visible:
		return

	_time_left -= delta
	if _duration > 0.0:
		var fade_ratio: float = clampf(_time_left / _duration, 0.0, 1.0)
		var alpha: float = 0.25 + 0.75 * fade_ratio
		_set_alpha(alpha)

	if _time_left <= 0.0:
		visible = false

func _set_alpha(alpha: float) -> void:
	var bg := _base_color
	bg.a = 0.86 * alpha
	_panel_bg.color = bg

	var border := Color(1, 1, 1, 0.0)
	border.a = 0.22 * alpha
	if _panel_border:
		_panel_border.color = border

	_label.self_modulate = Color(1, 1, 1, alpha)
