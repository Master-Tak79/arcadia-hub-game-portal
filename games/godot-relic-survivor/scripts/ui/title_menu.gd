extends CanvasLayer

signal start_requested
signal resume_requested
signal restart_requested
signal options_requested
signal quit_requested

var _bg: ColorRect
var _panel: Panel
var _title: Label
var _subtitle: Label
var _status: Label

var _btn_primary: Button
var _btn_secondary: Button
var _btn_quit: Button

var _boot_mode: bool = true

func _ready() -> void:
	_build_ui()
	hide_menu()

func show_boot_menu() -> void:
	_boot_mode = true
	visible = true
	_title.text = "RELIC SURVIVOR"
	_subtitle.text = "ALPHA DEV BUILD"
	_status.text = "시작을 누르면 새로운 런이 시작됩니다"
	_btn_primary.text = "START GAME"
	_btn_secondary.text = "OPTIONS (SOON)"
	_btn_quit.text = "QUIT"
	_btn_primary.grab_focus()

func show_pause_menu() -> void:
	_boot_mode = false
	visible = true
	_title.text = "PAUSE MENU"
	_subtitle.text = "RUN CONTROL"
	_status.text = "Esc 또는 Resume으로 게임 복귀"
	_btn_primary.text = "RESUME"
	_btn_secondary.text = "RESTART RUN"
	_btn_quit.text = "QUIT"
	_btn_primary.grab_focus()

func hide_menu() -> void:
	visible = false

func _process(_delta: float) -> void:
	if not visible:
		return
	if Input.is_action_just_pressed("ui_cancel") and not _boot_mode:
		emit_signal("resume_requested")

func _build_ui() -> void:
	_bg = ColorRect.new()
	_bg.anchor_right = 1.0
	_bg.anchor_bottom = 1.0
	_bg.color = Color(0, 0, 0, 0.70)
	add_child(_bg)

	_panel = Panel.new()
	_panel.anchor_left = 0.5
	_panel.anchor_top = 0.5
	_panel.anchor_right = 0.5
	_panel.anchor_bottom = 0.5
	_panel.offset_left = -260
	_panel.offset_top = -190
	_panel.offset_right = 260
	_panel.offset_bottom = 190
	add_child(_panel)

	var style := StyleBoxFlat.new()
	style.bg_color = Color("#0B1220")
	style.bg_color.a = 0.92
	style.border_color = Color(1, 1, 1, 0.18)
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
	_title.position = Vector2(28, 22)
	_title.size = Vector2(460, 42)
	_title.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	_title.add_theme_font_size_override("font_size", 34)
	_title.self_modulate = Color("#E2E8F0")
	_panel.add_child(_title)

	_subtitle = Label.new()
	_subtitle.position = Vector2(28, 62)
	_subtitle.size = Vector2(460, 22)
	_subtitle.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	_subtitle.add_theme_font_size_override("font_size", 14)
	_subtitle.self_modulate = Color("#94A3B8")
	_panel.add_child(_subtitle)

	_status = Label.new()
	_status.position = Vector2(28, 92)
	_status.size = Vector2(460, 24)
	_status.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	_status.add_theme_font_size_override("font_size", 14)
	_status.self_modulate = Color("#CBD5E1")
	_panel.add_child(_status)

	_btn_primary = _make_button(Vector2(96, 142), "START", _on_primary_pressed)
	_panel.add_child(_btn_primary)

	_btn_secondary = _make_button(Vector2(96, 200), "OPTIONS", _on_secondary_pressed)
	_panel.add_child(_btn_secondary)

	_btn_quit = _make_button(Vector2(96, 258), "QUIT", _on_quit_pressed)
	_panel.add_child(_btn_quit)

func _make_button(pos: Vector2, text: String, callback: Callable) -> Button:
	var btn := Button.new()
	btn.position = pos
	btn.size = Vector2(328, 44)
	btn.text = text
	btn.add_theme_font_size_override("font_size", 18)
	btn.pressed.connect(callback)
	return btn

func _on_primary_pressed() -> void:
	if _boot_mode:
		emit_signal("start_requested")
	else:
		emit_signal("resume_requested")

func _on_secondary_pressed() -> void:
	if _boot_mode:
		emit_signal("options_requested")
	else:
		emit_signal("restart_requested")

func _on_quit_pressed() -> void:
	emit_signal("quit_requested")
