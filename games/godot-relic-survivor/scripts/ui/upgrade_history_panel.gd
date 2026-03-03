extends CanvasLayer

signal close_requested

var _bg: ColorRect
var _panel: Panel
var _title: Label
var _hint: Label
var _body: Label

var _entries: Array = []

func _ready() -> void:
	_build_ui()
	hide_panel()

func show_entries(entries: Array) -> void:
	_entries = entries.duplicate(true)
	visible = true
	_render()

func hide_panel() -> void:
	visible = false
	_entries = []

func _process(_delta: float) -> void:
	if not visible:
		return
	if Input.is_action_just_pressed("upgrade_history"):
		emit_signal("close_requested")

func _build_ui() -> void:
	_bg = ColorRect.new()
	_bg.color = Color(0, 0, 0, 0.65)
	_bg.anchor_right = 1.0
	_bg.anchor_bottom = 1.0
	add_child(_bg)

	_panel = Panel.new()
	_panel.offset_left = 210
	_panel.offset_top = 94
	_panel.offset_right = 1070
	_panel.offset_bottom = 634
	add_child(_panel)

	var style := StyleBoxFlat.new()
	style.bg_color = Color("#0B1220")
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
	_title.position = Vector2(22, 14)
	_title.size = Vector2(812, 40)
	_title.add_theme_font_size_override("font_size", 26)
	_title.text = "UPGRADE PICK HISTORY"
	_panel.add_child(_title)

	_hint = Label.new()
	_hint.position = Vector2(22, 50)
	_hint.size = Vector2(812, 30)
	_hint.text = "H 키로 닫기 · 최근 선택이 위에 표시됩니다"
	_panel.add_child(_hint)

	_body = Label.new()
	_body.position = Vector2(22, 88)
	_body.size = Vector2(812, 524)
	_body.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	_body.add_theme_font_size_override("font_size", 16)
	_panel.add_child(_body)

func _render() -> void:
	if _entries.is_empty():
		_body.text = "아직 선택한 카드가 없습니다.\n레벨업 카드 선택 후 다시 확인해보세요."
		return

	var lines: Array[String] = []
	var max_show: int = 14
	for i in range(_entries.size() - 1, -1, -1):
		if lines.size() >= max_show:
			break
		var e: Dictionary = _entries[i]
		var lv: int = int(e.get("level", 0))
		var role: String = String(e.get("role", "util"))
		var title: String = String(e.get("title", "Unknown"))
		var tsec: float = float(e.get("time_sec", 0.0))
		var effects: Array = Array(e.get("effects", []))
		var effect_text: String = " / ".join(effects)
		if effect_text.length() > 92:
			effect_text = effect_text.substr(0, 89) + "..."
		lines.append("Lv.%d · %s · %s (%.1fs)\n  - %s" % [lv, role, title, tsec, effect_text])

	_body.text = "\n\n".join(lines)
