extends CanvasLayer

signal choice_selected(choice_index: int)

var _state: RefCounted
var _balance: RefCounted

var _bg: ColorRect
var _panel: Panel
var _title: Label
var _hint: Label
var _option_cards: Array = []
var _choices: Array = []

var _open_anim_time: float = 0.0
var _open_anim_duration: float = 0.20
var _panel_base_top: float = 92.0
var _panel_base_bottom: float = 628.0

func set_state(state: RefCounted) -> void:
	_state = state

func set_context(state: RefCounted, balance: RefCounted) -> void:
	_state = state
	_balance = balance

func _ready() -> void:
	_build_ui()
	hide_panel()

func show_choices(choices: Array, level: int) -> void:
	_choices = choices
	visible = true
	_open_anim_time = 0.0
	_apply_open_visual(0.0)
	_update_texts(level)

func hide_panel() -> void:
	visible = false
	_choices = []
	_open_anim_time = 0.0
	_apply_open_visual(1.0)

func _process(delta: float) -> void:
	if not visible:
		return

	_update_open_animation(delta)

	if Input.is_action_just_pressed("levelup_1"):
		emit_signal("choice_selected", 0)
	elif Input.is_action_just_pressed("levelup_2"):
		emit_signal("choice_selected", 1)
	elif Input.is_action_just_pressed("levelup_3"):
		emit_signal("choice_selected", 2)

func _build_ui() -> void:
	_bg = ColorRect.new()
	_bg.color = Color(0, 0, 0, 0.65)
	_bg.anchor_right = 1.0
	_bg.anchor_bottom = 1.0
	add_child(_bg)

	_panel = Panel.new()
	_panel.offset_left = 160
	_panel.offset_top = _panel_base_top
	_panel.offset_right = 1120
	_panel.offset_bottom = _panel_base_bottom
	add_child(_panel)
	_apply_panel_style()

	_title = Label.new()
	_title.position = Vector2(24, 16)
	_title.size = Vector2(900, 44)
	_title.add_theme_font_size_override("font_size", 28)
	_panel.add_child(_title)

	_hint = Label.new()
	_hint.position = Vector2(24, 62)
	_hint.size = Vector2(900, 40)
	_hint.text = "숫자키 1/2/3 선택 · 카드형 추천 UI · 🟥공격 🟦기동 🟩생존 🟪혼합"
	_panel.add_child(_hint)

	for i in range(3):
		_option_cards.append(_build_option_card(i))

func _build_option_card(index: int) -> Dictionary:
	var card_width: float = 292.0
	var card_gap: float = 18.0
	var base_x: float = 24.0 + float(index) * (card_width + card_gap)
	var base_y: float = 114.0

	var card := Panel.new()
	card.position = Vector2(base_x, base_y)
	card.size = Vector2(card_width, 420)
	_panel.add_child(card)

	var key_label := Label.new()
	key_label.position = Vector2(14, 10)
	key_label.size = Vector2(card_width - 28.0, 28)
	key_label.add_theme_font_size_override("font_size", 18)
	card.add_child(key_label)

	var title_label := Label.new()
	title_label.position = Vector2(14, 42)
	title_label.size = Vector2(card_width - 28.0, 56)
	title_label.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	title_label.add_theme_font_size_override("font_size", 22)
	card.add_child(title_label)

	var effect_label := Label.new()
	effect_label.position = Vector2(14, 104)
	effect_label.size = Vector2(card_width - 28.0, 130)
	effect_label.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	effect_label.add_theme_font_size_override("font_size", 16)
	card.add_child(effect_label)

	var projection_label := Label.new()
	projection_label.position = Vector2(14, 238)
	projection_label.size = Vector2(card_width - 28.0, 72)
	projection_label.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	projection_label.add_theme_font_size_override("font_size", 15)
	card.add_child(projection_label)

	var note_label := Label.new()
	note_label.position = Vector2(14, 314)
	note_label.size = Vector2(card_width - 28.0, 76)
	note_label.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	note_label.add_theme_font_size_override("font_size", 14)
	card.add_child(note_label)

	var stack_label := Label.new()
	stack_label.position = Vector2(14, 392)
	stack_label.size = Vector2(card_width - 28.0, 24)
	stack_label.add_theme_font_size_override("font_size", 14)
	card.add_child(stack_label)

	return {
		"root": card,
		"key": key_label,
		"title": title_label,
		"effects": effect_label,
		"projection": projection_label,
		"note": note_label,
		"stack": stack_label,
		"base_y": base_y
	}

func _apply_panel_style() -> void:
	if _panel == null:
		return
	var style := StyleBoxFlat.new()
	style.bg_color = Color("#0B1220")
	style.border_color = Color(1, 1, 1, 0.14)
	style.border_width_left = 2
	style.border_width_top = 2
	style.border_width_right = 2
	style.border_width_bottom = 2
	style.corner_radius_top_left = 12
	style.corner_radius_top_right = 12
	style.corner_radius_bottom_left = 12
	style.corner_radius_bottom_right = 12
	_panel.add_theme_stylebox_override("panel", style)

func _update_open_animation(delta: float) -> void:
	if _open_anim_duration <= 0.0:
		_apply_open_visual(1.0)
		return

	if _open_anim_time >= _open_anim_duration:
		return

	_open_anim_time = min(_open_anim_duration, _open_anim_time + delta)
	var t: float = clampf(_open_anim_time / _open_anim_duration, 0.0, 1.0)
	var eased: float = 1.0 - pow(1.0 - t, 3.0)
	_apply_open_visual(eased)

func _apply_open_visual(ratio: float) -> void:
	var r: float = clampf(ratio, 0.0, 1.0)
	if _bg:
		var c := _bg.color
		c.a = 0.65 * (0.24 + 0.76 * r)
		_bg.color = c

	if _panel:
		var y_offset: float = lerpf(24.0, 0.0, r)
		_panel.offset_top = _panel_base_top + y_offset
		_panel.offset_bottom = _panel_base_bottom + y_offset
		_panel.self_modulate = Color(1, 1, 1, 0.18 + 0.82 * r)

	if _title:
		_title.self_modulate = Color(1, 1, 1, 0.2 + 0.8 * r)
	if _hint:
		_hint.self_modulate = Color(1, 1, 1, 0.18 + 0.82 * r)

	for i in range(_option_cards.size()):
		var card_info: Dictionary = _option_cards[i]
		var card: Panel = card_info.get("root")
		if card == null:
			continue
		var delay: float = float(i) * 0.08
		var local_ratio: float = clampf((r - delay) / max(0.001, 1.0 - delay), 0.0, 1.0)
		var local_ease: float = 1.0 - pow(1.0 - local_ratio, 3.0)
		var base_y: float = float(card_info.get("base_y", 114.0))
		card.position.y = base_y + lerpf(22.0, 0.0, local_ease)
		card.scale = Vector2.ONE * lerpf(0.96, 1.0, local_ease)
		card.self_modulate = Color(1, 1, 1, 0.12 + 0.88 * local_ease)

func _update_texts(level: int) -> void:
	var hp_line := ""
	if _state != null:
		var hp: int = int(_state.hp)
		var max_hp: int = max(1, int(_state.max_hp))
		hp_line = " · 현재 체력 %d/%d" % [hp, max_hp]
	_title.text = "LEVEL UP! (Lv.%d) · 카드 하나를 선택하세요%s" % [level, hp_line]

	for i in range(_option_cards.size()):
		var card_info: Dictionary = _option_cards[i]
		if i >= _choices.size():
			_fill_empty_card(card_info, i)
			continue
		var choice: Dictionary = _choices[i]
		_fill_choice_card(card_info, i + 1, choice)

func _fill_empty_card(card_info: Dictionary, idx: int) -> void:
	_apply_card_style(card_info, "utility")
	(card_info.get("key") as Label).text = "%d) 선택지 없음" % (idx + 1)
	(card_info.get("title") as Label).text = "-"
	(card_info.get("effects") as Label).text = ""
	(card_info.get("projection") as Label).text = ""
	(card_info.get("note") as Label).text = ""
	(card_info.get("stack") as Label).text = ""

func _fill_choice_card(card_info: Dictionary, index: int, choice: Dictionary) -> void:
	var role: String = _resolve_role(choice)
	var role_tag: String = _get_role_tag(role)
	var role_name: String = _get_role_name(role)
	var title: String = String(choice.get("title", "Unknown"))
	var note: String = _build_priority_note(role)
	if note == "":
		note = "추천: 현재 빌드와 시너지가 높은 카드"

	var stack_now: int = int(choice.get("current_stack", 0))
	var max_stack: int = max(1, int(choice.get("max_stacks", 1)))
	var stack_next: int = min(max_stack, stack_now + 1)

	_apply_card_style(card_info, role)
	(card_info.get("key") as Label).text = "%d) %s %s" % [index, role_tag, role_name]
	(card_info.get("title") as Label).text = title
	(card_info.get("effects") as Label).text = _build_effect_summary(choice)
	(card_info.get("projection") as Label).text = _build_projection_line(choice)
	(card_info.get("note") as Label).text = note
	(card_info.get("stack") as Label).text = "STACK %d/%d → %d/%d" % [stack_now, max_stack, stack_next, max_stack]

func _build_effect_summary(choice: Dictionary) -> String:
	var effects: Array = _extract_effects(choice)
	if effects.is_empty():
		return "효과: -"
	var lines: Array[String] = []
	for i in range(min(3, effects.size())):
		var effect: Dictionary = effects[i]
		lines.append("• %s" % _format_effect_line(effect))
	if effects.size() > 3:
		lines.append("• 외 %d개 효과" % int(effects.size() - 3))
	return "\n".join(lines)

func _apply_card_style(card_info: Dictionary, role: String) -> void:
	var card: Panel = card_info.get("root")
	if card == null:
		return
	var palette: Dictionary = _get_role_palette(role)

	var style := StyleBoxFlat.new()
	style.bg_color = Color(palette.get("bg", Color("#111827")))
	style.border_color = Color(palette.get("border", Color(1, 1, 1, 0.25)))
	style.border_width_left = 2
	style.border_width_top = 2
	style.border_width_right = 2
	style.border_width_bottom = 2
	style.corner_radius_top_left = 10
	style.corner_radius_top_right = 10
	style.corner_radius_bottom_left = 10
	style.corner_radius_bottom_right = 10
	card.add_theme_stylebox_override("panel", style)

	var key_label: Label = card_info.get("key")
	var title_label: Label = card_info.get("title")
	var effects_label: Label = card_info.get("effects")
	var projection_label: Label = card_info.get("projection")
	var note_label: Label = card_info.get("note")
	var stack_label: Label = card_info.get("stack")

	var key_color: Color = Color(palette.get("key", Color("#F8FAFC")))
	var text_color: Color = Color(palette.get("text", Color("#E5E7EB")))
	var muted_color: Color = Color(palette.get("muted", Color("#CBD5E1")))

	if key_label:
		key_label.self_modulate = key_color
	if title_label:
		title_label.self_modulate = text_color
	if effects_label:
		effects_label.self_modulate = text_color
	if projection_label:
		projection_label.self_modulate = muted_color
	if note_label:
		note_label.self_modulate = muted_color
	if stack_label:
		stack_label.self_modulate = muted_color

func _get_role_palette(role: String) -> Dictionary:
	match role:
		"offense":
			return {
				"bg": Color("#2A1013"),
				"border": Color("#F97373"),
				"key": Color("#FCA5A5"),
				"text": Color("#FEE2E2"),
				"muted": Color("#FECACA")
			}
		"mobility":
			return {
				"bg": Color("#0F1E2D"),
				"border": Color("#60A5FA"),
				"key": Color("#93C5FD"),
				"text": Color("#DBEAFE"),
				"muted": Color("#BFDBFE")
			}
		"survival":
			return {
				"bg": Color("#102417"),
				"border": Color("#4ADE80"),
				"key": Color("#86EFAC"),
				"text": Color("#DCFCE7"),
				"muted": Color("#BBF7D0")
			}
		"hybrid":
			return {
				"bg": Color("#22142D"),
				"border": Color("#C084FC"),
				"key": Color("#D8B4FE"),
				"text": Color("#F3E8FF"),
				"muted": Color("#E9D5FF")
			}
		_:
			return {
				"bg": Color("#172032"),
				"border": Color("#94A3B8"),
				"key": Color("#CBD5E1"),
				"text": Color("#E2E8F0"),
				"muted": Color("#CBD5E1")
			}

func _extract_effects(choice: Dictionary) -> Array:
	if choice.has("effects"):
		return Array(choice.get("effects", []))
	return [{"key": String(choice.get("effect_key", "")), "value": choice.get("effect_value", 0)}]

func _resolve_role(choice: Dictionary) -> String:
	var effects: Array = _extract_effects(choice)
	var seen_roles: Dictionary = {}
	for raw_effect in effects:
		var effect: Dictionary = raw_effect
		var key: String = String(effect.get("key", ""))
		seen_roles[_effect_role(key)] = true

	if seen_roles.size() >= 2:
		return "hybrid"
	if seen_roles.has("offense"):
		return "offense"
	if seen_roles.has("mobility"):
		return "mobility"
	if seen_roles.has("survival"):
		return "survival"
	return "utility"

func _effect_role(effect_key: String) -> String:
	match effect_key:
		"attack_interval_reduction", "projectile_damage_bonus", "projectile_speed_bonus", "projectile_radius_bonus", "projectile_lifetime_bonus", "attack_range_bonus", "extra_projectiles":
			return "offense"
		"player_speed_bonus", "dash_cooldown_reduction":
			return "mobility"
		"player_invuln_bonus", "max_hp_plus_heal", "instant_heal":
			return "survival"
		_:
			return "utility"

func _format_effect_line(effect: Dictionary) -> String:
	var key: String = String(effect.get("key", ""))
	var value: Variant = effect.get("value", 0)

	match key:
		"attack_interval_reduction":
			return "공격주기 -%d%%" % int(round(float(value) * 100.0))
		"projectile_damage_bonus":
			return "발사체 피해 +%d" % int(value)
		"projectile_speed_bonus":
			return "발사체 속도 +%d" % int(round(float(value)))
		"projectile_radius_bonus":
			return "발사체 반경 +%.1f" % float(value)
		"projectile_lifetime_bonus":
			return "발사체 수명 +%.2fs" % float(value)
		"attack_range_bonus":
			return "자동공격 사거리 +%d" % int(round(float(value)))
		"extra_projectiles":
			return "추가 발사체 +%d" % int(value)
		"player_speed_bonus":
			return "이동속도 +%d" % int(round(float(value)))
		"dash_cooldown_reduction":
			return "대시 쿨다운 -%d%%" % int(round(float(value) * 100.0))
		"player_invuln_bonus":
			return "피격 무적 +%.2fs" % float(value)
		"max_hp_plus_heal":
			return "최대 HP +%d / 즉시 회복 +%d" % [int(value), int(value)]
		"instant_heal":
			return "즉시 HP +%d" % int(value)
		_:
			return "%s %+s" % [key, str(value)]

func _build_projection_line(choice: Dictionary) -> String:
	if _state == null or _balance == null:
		return "간이예상: 계산 불가"

	var before: Dictionary = _snapshot_runtime_stats()
	var after: Dictionary = before.duplicate(true)

	for raw_effect in _extract_effects(choice):
		_apply_effect_to_snapshot(after, raw_effect)

	var dps_before: float = _estimate_dps_index(before)
	var dps_after: float = _estimate_dps_index(after)
	var surv_before: float = _estimate_survival_index(before)
	var surv_after: float = _estimate_survival_index(after)

	var dps_delta: float = _percent_delta(dps_before, dps_after)
	var surv_delta: float = _percent_delta(surv_before, surv_after)

	return "간이예상: DPS %+d%% · 생존 %+d%%" % [
		int(round(dps_delta)),
		int(round(surv_delta)),
	]

func _snapshot_runtime_stats() -> Dictionary:
	return {
		"max_hp": int(_state.max_hp),
		"hp": int(_state.hp),
		"attack_interval_reduction": float(_state.attack_interval_reduction),
		"projectile_damage_bonus": int(_state.projectile_damage_bonus),
		"extra_projectiles": int(_state.extra_projectiles),
		"player_speed_bonus": float(_state.player_speed_bonus),
		"dash_cooldown_reduction": float(_state.dash_cooldown_reduction),
		"player_invuln_bonus": float(_state.player_invuln_bonus),
	}

func _apply_effect_to_snapshot(snapshot: Dictionary, raw_effect: Variant) -> void:
	var effect: Dictionary = raw_effect
	var key: String = String(effect.get("key", ""))
	var value: Variant = effect.get("value", 0)

	match key:
		"attack_interval_reduction":
			snapshot["attack_interval_reduction"] = min(0.75, float(snapshot["attack_interval_reduction"]) + float(value))
		"projectile_damage_bonus":
			snapshot["projectile_damage_bonus"] = int(snapshot["projectile_damage_bonus"]) + int(value)
		"extra_projectiles":
			snapshot["extra_projectiles"] = int(snapshot["extra_projectiles"]) + int(value)
		"player_speed_bonus":
			snapshot["player_speed_bonus"] = float(snapshot["player_speed_bonus"]) + float(value)
		"dash_cooldown_reduction":
			snapshot["dash_cooldown_reduction"] = min(0.75, float(snapshot["dash_cooldown_reduction"]) + float(value))
		"player_invuln_bonus":
			snapshot["player_invuln_bonus"] = float(snapshot["player_invuln_bonus"]) + float(value)
		"max_hp_plus_heal":
			var hp_gain: int = int(value)
			snapshot["max_hp"] = int(snapshot["max_hp"]) + hp_gain
			snapshot["hp"] = min(int(snapshot["max_hp"]), int(snapshot["hp"]) + hp_gain)
		"instant_heal":
			snapshot["hp"] = min(int(snapshot["max_hp"]), int(snapshot["hp"]) + int(value))
		_:
			pass

func _estimate_dps_index(snapshot: Dictionary) -> float:
	var base_interval: float = max(0.1, float(_balance.ATTACK_INTERVAL))
	var reduction: float = clampf(float(snapshot["attack_interval_reduction"]), 0.0, 0.75)
	var interval: float = max(0.08, base_interval * (1.0 - reduction))

	var damage: float = max(1.0, float(_balance.PROJECTILE_DAMAGE) + float(snapshot["projectile_damage_bonus"]))
	var shots: float = max(1.0, 1.0 + float(snapshot["extra_projectiles"]))

	return (damage * shots) / interval

func _estimate_survival_index(snapshot: Dictionary) -> float:
	var hp: float = max(1.0, float(snapshot["hp"]))
	var max_hp: float = max(1.0, float(snapshot["max_hp"]))
	var hp_factor: float = hp + (max_hp * 0.35)

	var invuln: float = max(0.0, float(_balance.PLAYER_HIT_INVULN) + float(snapshot["player_invuln_bonus"]))
	var move_speed: float = max(1.0, float(_balance.PLAYER_SPEED) + float(snapshot["player_speed_bonus"]))
	var move_factor: float = move_speed / max(1.0, float(_balance.PLAYER_SPEED))
	var dash_cd: float = max(0.2, float(_balance.DASH_COOLDOWN) * (1.0 - float(snapshot["dash_cooldown_reduction"])))

	var mobility_factor: float = (1.0 / dash_cd) * 0.22 + move_factor * 0.18
	return hp_factor * (1.0 + invuln * 0.6 + mobility_factor)

func _percent_delta(before: float, after: float) -> float:
	if before <= 0.0001:
		return 0.0
	return ((after - before) / before) * 100.0

func _build_priority_note(role: String) -> String:
	if _state == null:
		return ""

	var hp_ratio: float = float(_state.hp) / max(1.0, float(_state.max_hp))
	if hp_ratio <= 0.38 and (role == "survival" or role == "hybrid"):
		return "추천: 현재 체력 구간에서 안정성 확보 우선"
	if hp_ratio <= 0.38 and role == "offense":
		return "주의: 화력 강화 전 생존 보강 우선"
	if role == "offense":
		return "추천: 보스 처치 속도/웨이브 정리력 강화"
	if role == "mobility":
		return "추천: 회피 여유 확보로 억울사 리스크 완화"
	if role == "survival":
		return "추천: 후반 유지력과 실수 허용치 강화"
	if role == "hybrid":
		return "추천: 안정성과 화력을 균형 있게 보강"
	return ""

func _get_role_tag(role: String) -> String:
	match role:
		"offense":
			return "🟥"
		"mobility":
			return "🟦"
		"survival":
			return "🟩"
		"hybrid":
			return "🟪"
		_:
			return "⬜"

func _get_role_name(role: String) -> String:
	match role:
		"offense":
			return "공격"
		"mobility":
			return "기동"
		"survival":
			return "생존"
		"hybrid":
			return "혼합"
		_:
			return "유틸"
