extends CanvasLayer

var _state: RefCounted
var _player: Node2D
var _enemy_container: Node2D
var _projectile_container: Node2D
var _miniboss_director: Node

var _status_panel: Panel
var _status_title: Label
var _hp_bar: ProgressBar
var _hp_label: Label
var _exp_bar: ProgressBar
var _exp_label: Label
var _status_body: Label

var _mission_panel: Panel
var _mission_title: Label
var _mission_bar: ProgressBar
var _mission_body: Label

var _boss_panel: Panel
var _boss_label: Label

var _meta_panel: Panel
var _meta_label: Label

var _relic_panel: Panel
var _relic_label: Label

func setup(state: RefCounted, player: Node2D, enemy_container: Node2D, projectile_container: Node2D) -> void:
	_state = state
	_player = player
	_enemy_container = enemy_container
	_projectile_container = projectile_container
	_build_ui()
	_refresh()

func set_miniboss_director(director: Node) -> void:
	_miniboss_director = director

func _process(_delta: float) -> void:
	_refresh()

func _build_ui() -> void:
	if _status_panel:
		return

	_status_panel = _make_panel(Rect2(14, 14, 432, 246))
	_status_title = _make_label(Vector2(16, 10), Vector2(398, 24), 18)
	_status_title.text = "COMBAT STATUS"
	_status_panel.add_child(_status_title)

	_hp_bar = _make_bar(Vector2(16, 40), Vector2(398, 20), Color("#B91C1C"), Color("#F87171"))
	_status_panel.add_child(_hp_bar)
	_hp_label = _make_label(Vector2(18, 39), Vector2(392, 22), 14)
	_status_panel.add_child(_hp_label)

	_exp_bar = _make_bar(Vector2(16, 66), Vector2(398, 16), Color("#1E3A8A"), Color("#60A5FA"))
	_status_panel.add_child(_exp_bar)
	_exp_label = _make_label(Vector2(18, 64), Vector2(392, 20), 13)
	_exp_panel_text_color(_exp_label, Color("#DBEAFE"))
	_status_panel.add_child(_exp_label)

	_status_body = _make_label(Vector2(16, 90), Vector2(398, 144), 15)
	_status_body.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	_status_panel.add_child(_status_body)

	_mission_panel = _make_panel(Rect2(14, 266, 432, 128))
	_mission_title = _make_label(Vector2(16, 10), Vector2(398, 24), 17)
	_mission_title.text = "MISSION"
	_mission_panel.add_child(_mission_title)
	_mission_bar = _make_bar(Vector2(16, 38), Vector2(398, 18), Color("#14532D"), Color("#4ADE80"))
	_mission_panel.add_child(_mission_bar)
	_mission_body = _make_label(Vector2(16, 62), Vector2(398, 52), 14)
	_mission_body.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	_mission_panel.add_child(_mission_body)

	_boss_panel = _make_panel(Rect2(0, 14, 420, 156), true)
	_boss_label = _make_label(Vector2(16, 12), Vector2(386, 132), 16)
	_boss_label.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	_boss_panel.add_child(_boss_label)

	_meta_panel = _make_panel(Rect2(0, 176, 420, 110), true)
	_meta_label = _make_label(Vector2(16, 10), Vector2(386, 88), 14)
	_meta_label.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	_meta_panel.add_child(_meta_label)

	_relic_panel = _make_panel(Rect2(14, 402, 432, 118))
	_relic_label = _make_label(Vector2(16, 10), Vector2(398, 96), 14)
	_relic_label.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	_relic_panel.add_child(_relic_label)

func _make_panel(rect: Rect2, anchor_right: bool = false) -> Panel:
	var panel := Panel.new()
	if anchor_right:
		panel.anchor_left = 1.0
		panel.anchor_right = 1.0
		panel.offset_left = -rect.size.x - 14.0
		panel.offset_top = rect.position.y
		panel.offset_right = -14.0
		panel.offset_bottom = rect.position.y + rect.size.y
	else:
		panel.offset_left = rect.position.x
		panel.offset_top = rect.position.y
		panel.offset_right = rect.position.x + rect.size.x
		panel.offset_bottom = rect.position.y + rect.size.y

	var style := StyleBoxFlat.new()
	style.bg_color = Color("#0B1220")
	style.bg_color.a = 0.80
	style.border_color = Color(1, 1, 1, 0.17)
	style.border_width_left = 2
	style.border_width_top = 2
	style.border_width_right = 2
	style.border_width_bottom = 2
	style.corner_radius_top_left = 10
	style.corner_radius_top_right = 10
	style.corner_radius_bottom_left = 10
	style.corner_radius_bottom_right = 10
	panel.add_theme_stylebox_override("panel", style)
	add_child(panel)
	return panel

func _make_label(pos: Vector2, size: Vector2, font_size: int) -> Label:
	var label := Label.new()
	label.position = pos
	label.size = size
	label.add_theme_font_size_override("font_size", font_size)
	label.self_modulate = Color("#E2E8F0")
	return label

func _exp_panel_text_color(label: Label, color: Color) -> void:
	if label:
		label.self_modulate = color

func _make_bar(pos: Vector2, size: Vector2, bg_color: Color, fill_color: Color) -> ProgressBar:
	var bar := ProgressBar.new()
	bar.min_value = 0.0
	bar.max_value = 100.0
	bar.value = 0.0
	bar.show_percentage = false
	bar.position = pos
	bar.size = size

	var bg := StyleBoxFlat.new()
	bg.bg_color = bg_color
	bg.bg_color.a = 0.55
	bg.corner_radius_top_left = 6
	bg.corner_radius_top_right = 6
	bg.corner_radius_bottom_left = 6
	bg.corner_radius_bottom_right = 6

	var fill := StyleBoxFlat.new()
	fill.bg_color = fill_color
	fill.corner_radius_top_left = 6
	fill.corner_radius_top_right = 6
	fill.corner_radius_bottom_left = 6
	fill.corner_radius_bottom_right = 6

	bar.add_theme_stylebox_override("background", bg)
	bar.add_theme_stylebox_override("fill", fill)
	return bar

func _refresh() -> void:
	if _state == null:
		return

	_refresh_status_panel()
	_refresh_mission_panel()
	_refresh_boss_panel()
	_refresh_meta_panel()
	_refresh_relic_panel()

func _refresh_status_panel() -> void:
	var hp_max: int = max(1, int(_state.max_hp))
	var hp_now: int = clampi(int(_state.hp), 0, hp_max)
	_hp_bar.value = (float(hp_now) / float(hp_max)) * 100.0
	_hp_label.text = "HP %d / %d" % [hp_now, hp_max]

	var exp_target: int = max(1, int(_state.exp_to_next))
	var exp_now: int = clampi(int(_state.exp), 0, exp_target)
	_exp_bar.value = (float(exp_now) / float(exp_target)) * 100.0
	_exp_label.text = "EXP %d / %d" % [exp_now, exp_target]

	var enemies: int = _enemy_container.get_child_count() if _enemy_container else 0
	var projectiles: int = _projectile_container.get_child_count() if _projectile_container else 0
	var dash_text: String = "-"
	if _player:
		var cooldown_left: float = _player.get_dash_cooldown_left()
		dash_text = "READY" if cooldown_left <= 0.01 else "%.2fs" % cooldown_left

	var skill_text: String = "-"
	if String(_state.active_skill_id) != "":
		if float(_state.active_skill_active_left) > 0.0:
			skill_text = "%s ACTIVE %.1fs" % [String(_state.active_skill_title), float(_state.active_skill_active_left)]
		elif float(_state.active_skill_cooldown_left) > 0.0:
			skill_text = "%s CD %.1fs" % [String(_state.active_skill_title), float(_state.active_skill_cooldown_left)]
		else:
			skill_text = "%s READY" % String(_state.active_skill_title)

	var pressure_band: String = String(_state.pressure_band).to_upper()
	var pressure_value: float = float(_state.pressure_hint)
	var lines: Array[String] = [
		"LV %d · TIME %.1fs · KILLS %d" % [int(_state.level), float(_state.elapsed), int(_state.kills)],
		"CHAR %s · WEAPON %s" % [String(_state.character_title), String(_state.weapon_title)],
		"DASH %s · SKILL %s" % [dash_text, skill_text],
		"ENEMIES %d · SHOTS %d" % [enemies, projectiles],
		"PRESSURE %s (%.2f)" % [pressure_band, pressure_value]
	]
	if _state.is_paused and not _state.is_game_over:
		lines.append("PAUSED · 1/2/3 선택 · H 히스토리 · T 트리")
	if _state.is_game_over:
		lines.append("GAME OVER · R 재시작")

	_status_body.text = "\n".join(lines)

func _refresh_mission_panel() -> void:
	if bool(_state.mission_active):
		var target: int = max(1, int(_state.mission_target))
		var progress: int = clampi(int(_state.mission_progress), 0, target)
		_mission_bar.value = (float(progress) / float(target)) * 100.0
		_mission_body.text = "%s\n%d / %d · %.0fs 남음 · STREAK %d (BEST %d)" % [
			String(_state.mission_title),
			progress,
			target,
			float(_state.mission_time_left),
			int(_state.mission_streak),
			int(_state.mission_best_streak)
		]
	else:
		_mission_bar.value = 0.0
		_mission_body.text = "할당 대기 중\nSTREAK %d (BEST %d)" % [int(_state.mission_streak), int(_state.mission_best_streak)]

func _refresh_boss_panel() -> void:
	if _boss_panel == null or _boss_label == null:
		return
	if _miniboss_director == null:
		_boss_panel.visible = false
		return

	_boss_panel.visible = true
	if _miniboss_director.is_warning_active():
		_boss_label.self_modulate = Color("#FCA5A5")
		_boss_label.text = "⚠ MINIBOSS INCOMING\n등장까지 %.1fs" % float(_miniboss_director.get_warning_remaining())
		return

	if _miniboss_director.is_boss_alive():
		var phase: int = int(_miniboss_director.get_boss_phase())
		var lines: Array[String] = ["🔥 MINIBOSS ACTIVE · PHASE %d" % phase]
		if _miniboss_director.is_boss_phase_transitioning():
			lines.append("🔻 PHASE SHIFT %.2fs" % float(_miniboss_director.get_boss_phase_transition_remaining()))
		var grace: float = float(_miniboss_director.get_boss_spawn_grace_remaining())
		if grace > 0.0:
			lines.append("🛡 SAFE WINDOW %.1fs" % grace)
		if _miniboss_director.is_boss_dash_telegraphing():
			lines.append("⚡ DASH %.2fs" % float(_miniboss_director.get_boss_dash_telegraph_remaining()))
		if _miniboss_director.is_boss_summon_telegraphing():
			var pat: String = String(_miniboss_director.get_boss_pending_summon_pattern()).to_upper()
			lines.append("🌀 SUMMON %s %.2fs" % [pat, float(_miniboss_director.get_boss_summon_telegraph_remaining())])
		_boss_label.self_modulate = Color("#FEE2E2")
		_boss_label.text = "\n".join(lines)
		return

	if _miniboss_director.was_boss_defeated():
		_boss_label.self_modulate = Color("#BBF7D0")
		_boss_label.text = "✅ MINIBOSS DEFEATED"
	else:
		_boss_panel.visible = false

func _refresh_meta_panel() -> void:
	if _meta_label == null:
		return
	var ranks: Dictionary = Dictionary(_state.meta_perk_ranks)
	var unlocks: Dictionary = Dictionary(_state.tree_unlocks)
	var ranger_nodes: int = Array(unlocks.get("ranger_tree", [])).size()
	var warden_nodes: int = Array(unlocks.get("warden_tree", [])).size()
	_meta_label.text = "META\nSHARDS %d · RUNS %d\nV/C/F %d/%d/%d · TREE R%d W%d" % [
		int(_state.meta_shards),
		int(_state.meta_total_runs),
		int(ranks.get("vitality", 0)),
		int(ranks.get("celerity", 0)),
		int(ranks.get("focus", 0)),
		ranger_nodes,
		warden_nodes
	]

func _refresh_relic_panel() -> void:
	if _relic_label == null:
		return
	if int(_state.relic_obtained_count) <= 0:
		_relic_label.text = "RELICS\n아직 획득한 유물이 없습니다"
		return

	var lines: Array[String] = ["RELICS %d" % int(_state.relic_obtained_count)]
	if String(_state.relic_last_title) != "":
		lines.append("LAST: %s" % String(_state.relic_last_title))

	var preview: Array[String] = []
	for i in range(_state.relic_order.size() - 1, -1, -1):
		if preview.size() >= 3:
			break
		var id: String = String(_state.relic_order[i])
		var title: String = String(_state.relic_titles.get(id, id))
		var stack: int = int(_state.relic_stacks.get(id, 0))
		preview.append("%s x%d" % [title, stack])
	if not preview.is_empty():
		lines.append("SET: " + " | ".join(preview))

	if String(_state.active_event_id) != "":
		lines.append("EVENT: %s (%s %.1fs)" % [
			String(_state.active_event_label),
			String(_state.active_event_phase).to_upper(),
			float(_state.active_event_time_left)
		])

	if _state.is_game_over:
		if String(_state.death_reason) != "":
			lines.append("☠ %s" % String(_state.death_reason))
		if String(_state.death_context) != "":
			lines.append("ℹ %s" % String(_state.death_context))

	_relic_label.text = "\n".join(lines)
