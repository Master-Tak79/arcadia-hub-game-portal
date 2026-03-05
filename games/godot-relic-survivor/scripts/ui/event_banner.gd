extends CanvasLayer

var _panel_bg: ColorRect
var _panel_border: ColorRect
var _label: Label
var _time_left: float = 0.0
var _duration: float = 0.0
var _base_color: Color = Color("#0B1220")

var _enter_anim_time: float = 0.0
var _enter_anim_duration: float = 0.22
var _base_top: float = 28.0
var _base_bottom: float = 120.0

func _ready() -> void:
	visible = false

	_panel_bg = ColorRect.new()
	_panel_bg.anchor_left = 0.5
	_panel_bg.anchor_right = 0.5
	_panel_bg.anchor_top = 0.0
	_panel_bg.anchor_bottom = 0.0
	_panel_bg.offset_left = -420
	_panel_bg.offset_right = 420
	_panel_bg.offset_top = _base_top
	_panel_bg.offset_bottom = _base_bottom
	_panel_bg.color = _base_color
	add_child(_panel_bg)

	_panel_border = ColorRect.new()
	_panel_border.anchor_left = 0.5
	_panel_border.anchor_right = 0.5
	_panel_border.anchor_top = 0.0
	_panel_border.anchor_bottom = 0.0
	_panel_border.offset_left = -422
	_panel_border.offset_right = 422
	_panel_border.offset_top = _base_top - 2
	_panel_border.offset_bottom = _base_bottom + 2
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
	_enter_anim_time = 0.0
	_set_alpha(0.0)
	_set_slide(22.0)

func _process(delta: float) -> void:
	if not visible:
		return

	_time_left -= delta
	_enter_anim_time = min(_enter_anim_duration, _enter_anim_time + delta)

	var enter_ratio: float = 1.0
	if _enter_anim_duration > 0.0:
		enter_ratio = clampf(_enter_anim_time / _enter_anim_duration, 0.0, 1.0)
	enter_ratio = 1.0 - pow(1.0 - enter_ratio, 3.0)

	var fade_ratio: float = 1.0
	if _duration > 0.0:
		fade_ratio = clampf(_time_left / _duration, 0.0, 1.0)

	var alpha: float = (0.22 + 0.78 * fade_ratio) * enter_ratio
	_set_alpha(alpha)
	_set_slide(22.0 * (1.0 - enter_ratio))

	if _time_left <= 0.0:
		visible = false

func _set_slide(y_offset: float) -> void:
	if _panel_bg:
		_panel_bg.offset_top = _base_top + y_offset
		_panel_bg.offset_bottom = _base_bottom + y_offset
	if _panel_border:
		_panel_border.offset_top = (_base_top - 2) + y_offset
		_panel_border.offset_bottom = (_base_bottom + 2) + y_offset
	if _label:
		_label.offset_top = 40 + y_offset
		_label.offset_bottom = 108 + y_offset

func _set_alpha(alpha: float) -> void:
	var bg := _base_color
	bg.a = 0.86 * alpha
	_panel_bg.color = bg

	var border := Color(1, 1, 1, 0.0)
	border.a = 0.22 * alpha
	if _panel_border:
		_panel_border.color = border

	_label.self_modulate = Color(1, 1, 1, alpha)
