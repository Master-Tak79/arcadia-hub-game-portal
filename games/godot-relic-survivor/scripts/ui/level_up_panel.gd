extends CanvasLayer

signal choice_selected(choice_index: int)

var _state: RefCounted
var _balance: RefCounted

var _bg: ColorRect
var _panel: Panel
var _title: Label
var _hint: Label
var _option_labels: Array = []
var _choices: Array = []

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
	_bg.color = Color(0, 0, 0, 0.60)
	_bg.anchor_right = 1.0
	_bg.anchor_bottom = 1.0
	add_child(_bg)

	_panel = Panel.new()
	_panel.offset_left = 160
	_panel.offset_top = 92
	_panel.offset_right = 1120
	_panel.offset_bottom = 628
	add_child(_panel)

	_title = Label.new()
	_title.position = Vector2(24, 16)
	_title.size = Vector2(900, 44)
	_title.add_theme_font_size_override("font_size", 28)
	_panel.add_child(_title)

	_hint = Label.new()
	_hint.position = Vector2(24, 62)
	_hint.size = Vector2(900, 40)
	_hint.text = "숫자키 1/2/3으로 선택 · 🟥공격 🟦기동 🟩생존 🟪혼합"
	_panel.add_child(_hint)

	for i in range(3):
		var option := Label.new()
		option.position = Vector2(24, 116 + i * 136)
		option.size = Vector2(900, 122)
		option.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
		option.add_theme_font_size_override("font_size", 20)
		_panel.add_child(option)
		_option_labels.append(option)

func _update_texts(level: int) -> void:
	var hp_line := ""
	if _state != null and _state.has_method("get"):
		var hp: int = int(_state.hp)
		var max_hp: int = max(1, int(_state.max_hp))
		hp_line = " · 현재 체력 %d/%d" % [hp, max_hp]
	_title.text = "LEVEL UP! (Lv.%d) · 빌드 방향을 선택하세요%s" % [level, hp_line]

	for i in range(_option_labels.size()):
		var label: Label = _option_labels[i]
		if i >= _choices.size():
			label.text = "%d) (선택지 없음)" % (i + 1)
			label.self_modulate = Color(1, 1, 1, 0.7)
			continue

		var choice: Dictionary = _choices[i]
		label.text = _build_option_text(i + 1, choice)
		label.self_modulate = _get_role_color(_resolve_role(choice))

func _build_option_text(index: int, choice: Dictionary) -> String:
	var role: String = _resolve_role(choice)
	var role_tag: String = _get_role_tag(role)
	var role_name: String = _get_role_name(role)

	var name: String = String(choice.get("title", "Unknown"))
	var stack_now: int = int(choice.get("current_stack", 0))
	var max_stack: int = max(1, int(choice.get("max_stacks", 1)))
	var stack_next: int = min(max_stack, stack_now + 1)

	var effects: Array = _extract_effects(choice)
	var effect_parts: Array[String] = []
	for raw_effect in effects:
		var effect: Dictionary = raw_effect
		effect_parts.append(_format_effect_line(effect))
	var effect_line: String = " · ".join(effect_parts)

	var desc: String = String(choice.get("desc", ""))
	var note: String = _build_priority_note(role)
	var final_note: String = note if note != "" else "추천: 현재 빌드 방향과 시너지가 높은 항목을 선택하세요"
	var projection_line: String = _build_projection_line(choice)

	return "%d) %s [%s %s]\n   효과: %s\n   설명: %s\n   STACK: %d/%d → %d/%d\n   %s\n   %s" % [
		index,
		name,
		role_tag,
		role_name,
		effect_line,
		desc,
		stack_now,
		max_stack,
		stack_next,
		max_stack,
		projection_line,
		final_note,
	]

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
		return "예상 지표: 계산 불가"

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

	return "예상: DPS %.1f → %.1f (%+d%%), 생존 %.1f → %.1f (%+d%%)" % [
		dps_before,
		dps_after,
		int(round(dps_delta)),
		surv_before,
		surv_after,
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
		return "주의: 화력 강화 전 생존 보강을 먼저 고려하세요"
	if role == "offense":
		return "추천: 보스 처치 속도/웨이브 정리력을 높입니다"
	if role == "mobility":
		return "추천: 회피 여유를 확보해 억울사 리스크를 낮춥니다"
	if role == "survival":
		return "추천: 후반 유지력과 실수 허용치를 높입니다"
	if role == "hybrid":
		return "추천: 안정성과 화력을 동시에 보강합니다"
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

func _get_role_color(role: String) -> Color:
	match role:
		"offense":
			return Color(1.0, 0.88, 0.88, 1.0)
		"mobility":
			return Color(0.88, 0.95, 1.0, 1.0)
		"survival":
			return Color(0.90, 1.0, 0.90, 1.0)
		"hybrid":
			return Color(0.96, 0.90, 1.0, 1.0)
		_:
			return Color(1, 1, 1, 1)
