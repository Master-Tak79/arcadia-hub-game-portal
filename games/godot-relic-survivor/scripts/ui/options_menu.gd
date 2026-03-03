extends CanvasLayer

signal close_requested
signal sfx_preset_changed(preset: String)
signal impact_scale_changed(scale: float)
signal window_mode_changed(mode: String)

const _SFX_PRESETS: Array[String] = ["default", "quiet", "hype"]
const _WINDOW_MODES: Array[String] = ["windowed", "fullscreen"]
const _IMPACT_LEVELS: Array = [
	{"label": "OFF", "value": 0.0},
	{"label": "LOW", "value": 0.55},
	{"label": "NORMAL", "value": 1.0},
	{"label": "HIGH", "value": 1.25}
]

var _bg: ColorRect
var _panel: Panel
var _title: Label
var _hint: Label

var _sfx_row: Label
var _impact_row: Label
var _window_row: Label

var _btn_sfx: Button
var _btn_impact: Button
var _btn_window: Button
var _btn_back: Button

var _sfx_idx: int = 0
var _impact_idx: int = 2
var _window_idx: int = 0

func _ready() -> void:
	_build_ui()
	hide_menu()

func show_menu(current_preset: String, current_impact_scale: float, current_window_mode: String) -> void:
	_sfx_idx = _SFX_PRESETS.find(current_preset)
	if _sfx_idx < 0:
		_sfx_idx = 0

	_window_idx = _WINDOW_MODES.find(current_window_mode)
	if _window_idx < 0:
		_window_idx = 0

	_impact_idx = 0
	var best_dist: float = 999.0
	for i in range(_IMPACT_LEVELS.size()):
		var val: float = float(_IMPACT_LEVELS[i].get("value", 1.0))
		var dist: float = absf(val - current_impact_scale)
		if dist < best_dist:
			best_dist = dist
			_impact_idx = i

	visible = true
	_refresh_rows()
	_btn_sfx.grab_focus()

func hide_menu() -> void:
	visible = false

func _process(_delta: float) -> void:
	if not visible:
		return
	if Input.is_action_just_pressed("ui_cancel"):
		emit_signal("close_requested")

func _build_ui() -> void:
	_bg = ColorRect.new()
	_bg.anchor_right = 1.0
	_bg.anchor_bottom = 1.0
	_bg.color = Color(0, 0, 0, 0.66)
	add_child(_bg)

	_panel = Panel.new()
	_panel.anchor_left = 0.5
	_panel.anchor_top = 0.5
	_panel.anchor_right = 0.5
	_panel.anchor_bottom = 0.5
	_panel.offset_left = -280
	_panel.offset_top = -210
	_panel.offset_right = 280
	_panel.offset_bottom = 210
	add_child(_panel)

	var style := StyleBoxFlat.new()
	style.bg_color = Color("#0B1220")
	style.bg_color.a = 0.94
	style.border_color = Color(1, 1, 1, 0.20)
	style.border_width_left = 2
	style.border_width_top = 2
	style.border_width_right = 2
	style.border_width_bottom = 2
	style.corner_radius_top_left = 12
	style.corner_radius_top_right = 12
	style.corner_radius_bottom_left = 12
	style.corner_radius_bottom_right = 12
	_panel.add_theme_stylebox_override("panel", style)

	_title = Label.new()
	_title.position = Vector2(26, 18)
	_title.size = Vector2(508, 36)
	_title.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	_title.add_theme_font_size_override("font_size", 28)
	_title.text = "OPTIONS"
	_title.self_modulate = Color("#E2E8F0")
	_panel.add_child(_title)

	_hint = Label.new()
	_hint.position = Vector2(26, 54)
	_hint.size = Vector2(508, 22)
	_hint.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	_hint.add_theme_font_size_override("font_size", 14)
	_hint.text = "좌/우 버튼으로 순환 · ESC/Back으로 닫기"
	_hint.self_modulate = Color("#94A3B8")
	_panel.add_child(_hint)

	_sfx_row = _make_row_label(Vector2(40, 100))
	_panel.add_child(_sfx_row)
	_btn_sfx = _make_row_button(Vector2(360, 94), _on_sfx_pressed)
	_panel.add_child(_btn_sfx)

	_impact_row = _make_row_label(Vector2(40, 154))
	_panel.add_child(_impact_row)
	_btn_impact = _make_row_button(Vector2(360, 148), _on_impact_pressed)
	_panel.add_child(_btn_impact)

	_window_row = _make_row_label(Vector2(40, 208))
	_panel.add_child(_window_row)
	_btn_window = _make_row_button(Vector2(360, 202), _on_window_pressed)
	_panel.add_child(_btn_window)

	_btn_back = Button.new()
	_btn_back.position = Vector2(154, 300)
	_btn_back.size = Vector2(252, 44)
	_btn_back.text = "BACK"
	_btn_back.add_theme_font_size_override("font_size", 18)
	_btn_back.pressed.connect(func() -> void: emit_signal("close_requested"))
	_panel.add_child(_btn_back)

func _make_row_label(pos: Vector2) -> Label:
	var label := Label.new()
	label.position = pos
	label.size = Vector2(300, 40)
	label.add_theme_font_size_override("font_size", 17)
	label.self_modulate = Color("#E2E8F0")
	return label

func _make_row_button(pos: Vector2, callback: Callable) -> Button:
	var btn := Button.new()
	btn.position = pos
	btn.size = Vector2(160, 36)
	btn.add_theme_font_size_override("font_size", 16)
	btn.pressed.connect(callback)
	return btn

func _refresh_rows() -> void:
	var sfx: String = _SFX_PRESETS[_sfx_idx]
	var impact_label: String = String(_IMPACT_LEVELS[_impact_idx].get("label", "NORMAL"))
	var window_mode: String = _WINDOW_MODES[_window_idx]

	_sfx_row.text = "SFX PRESET"
	_btn_sfx.text = sfx.to_upper()

	_impact_row.text = "CAMERA IMPACT"
	_btn_impact.text = impact_label

	_window_row.text = "WINDOW MODE"
	_btn_window.text = window_mode.to_upper()

func _on_sfx_pressed() -> void:
	_sfx_idx = (_sfx_idx + 1) % _SFX_PRESETS.size()
	_refresh_rows()
	emit_signal("sfx_preset_changed", _SFX_PRESETS[_sfx_idx])

func _on_impact_pressed() -> void:
	_impact_idx = (_impact_idx + 1) % _IMPACT_LEVELS.size()
	_refresh_rows()
	emit_signal("impact_scale_changed", float(_IMPACT_LEVELS[_impact_idx].get("value", 1.0)))

func _on_window_pressed() -> void:
	_window_idx = (_window_idx + 1) % _WINDOW_MODES.size()
	_refresh_rows()
	emit_signal("window_mode_changed", _WINDOW_MODES[_window_idx])
