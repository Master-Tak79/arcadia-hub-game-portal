extends CanvasLayer

var _state: RefCounted
var _player: Node2D
var _enemy_container: Node2D
var _projectile_container: Node2D
var _miniboss_director: Node
var _label: Label

func setup(state: RefCounted, player: Node2D, enemy_container: Node2D, projectile_container: Node2D) -> void:
	_state = state
	_player = player
	_enemy_container = enemy_container
	_projectile_container = projectile_container
	_label = Label.new()
	_label.position = Vector2(16, 16)
	_label.size = Vector2(560, 300)
	add_child(_label)
	_refresh()

func set_miniboss_director(director: Node) -> void:
	_miniboss_director = director

func _process(_delta: float) -> void:
	_refresh()

func _refresh() -> void:
	if _label == null or _state == null:
		return

	var enemies: int = _enemy_container.get_child_count() if _enemy_container else 0
	var projectiles: int = _projectile_container.get_child_count() if _projectile_container else 0
	var dash_text: String = "-"
	if _player and _player.has_method("get_dash_cooldown_left"):
		var cooldown_left: float = _player.get_dash_cooldown_left()
		dash_text = "READY" if cooldown_left <= 0.01 else "%.2fs" % cooldown_left

	var ranks: Dictionary = Dictionary(_state.meta_perk_ranks)
	var text := "HP: %d / %d\nLV: %d\nEXP: %d / %d\nTIME: %.1f\nKILLS: %d\nENEMIES: %d\nSHOTS: %d\nDASH: %s\nCHAR: %s\nWEAPON: %s\nPRESSURE: %s (%.2f)\nRELICS: %d\nMETA: SHARDS %d · RUNS %d · V/C/F %d/%d/%d" % [
		_state.hp,
		_state.max_hp,
		_state.level,
		_state.exp,
		_state.exp_to_next,
		_state.elapsed,
		_state.kills,
		enemies,
		projectiles,
		dash_text,
		String(_state.character_title),
		String(_state.weapon_title),
		String(_state.pressure_band).to_upper(),
		float(_state.pressure_hint),
		int(_state.relic_obtained_count),
		int(_state.meta_shards),
		int(_state.meta_total_runs),
		int(ranks.get("vitality", 0)),
		int(ranks.get("celerity", 0)),
		int(ranks.get("focus", 0))
	]

	if _state.is_paused and not _state.is_game_over:
		text += "\nLEVEL UP 선택 중 (1/2/3)"

	if int(_state.relic_obtained_count) > 0:
		if String(_state.relic_last_title) != "":
			text += "\n📿 LAST RELIC: %s" % String(_state.relic_last_title)
		var preview: Array[String] = []
		for i in range(_state.relic_order.size() - 1, -1, -1):
			if preview.size() >= 3:
				break
			var id: String = String(_state.relic_order[i])
			var title: String = String(_state.relic_titles.get(id, id))
			var stack: int = int(_state.relic_stacks.get(id, 0))
			preview.append("%s x%d" % [title, stack])
		if not preview.is_empty():
			text += "\nSET: " + " | ".join(preview)

	if String(_state.active_event_id) != "":
		text += "\n🌐 EVENT: %s (%s %.1fs)" % [
			String(_state.active_event_label),
			String(_state.active_event_phase).to_upper(),
			float(_state.active_event_time_left)
		]

	if _miniboss_director:
		if _miniboss_director.has_method("is_warning_active") and _miniboss_director.is_warning_active():
			var remain: float = 0.0
			if _miniboss_director.has_method("get_warning_remaining"):
				remain = _miniboss_director.get_warning_remaining()
			text += "\n⚠ MINIBOSS INCOMING: %.1fs" % remain
		elif _miniboss_director.has_method("is_boss_alive") and _miniboss_director.is_boss_alive():
			var phase: int = 1
			if _miniboss_director.has_method("get_boss_phase"):
				phase = int(_miniboss_director.get_boss_phase())
			text += "\n🔥 MINIBOSS ACTIVE · PHASE %d" % phase
			if _miniboss_director.has_method("is_boss_phase_transitioning") and _miniboss_director.is_boss_phase_transitioning():
				var shift_left: float = 0.0
				if _miniboss_director.has_method("get_boss_phase_transition_remaining"):
					shift_left = float(_miniboss_director.get_boss_phase_transition_remaining())
				text += "\n🔻 PHASE SHIFT: %.2fs" % shift_left
			if _miniboss_director.has_method("get_boss_spawn_grace_remaining"):
				var grace: float = float(_miniboss_director.get_boss_spawn_grace_remaining())
				if grace > 0.0:
					text += "\n🛡 BOSS SAFE WINDOW: %.1fs" % grace
			if _miniboss_director.has_method("is_boss_dash_telegraphing") and _miniboss_director.is_boss_dash_telegraphing():
				var dash_remain: float = 0.0
				if _miniboss_director.has_method("get_boss_dash_telegraph_remaining"):
					dash_remain = float(_miniboss_director.get_boss_dash_telegraph_remaining())
				text += "\n⚡ DASH TELEGRAPH: %.2fs" % dash_remain
			if _miniboss_director.has_method("is_boss_summon_telegraphing") and _miniboss_director.is_boss_summon_telegraphing():
				var summon_remain: float = 0.0
				if _miniboss_director.has_method("get_boss_summon_telegraph_remaining"):
					summon_remain = float(_miniboss_director.get_boss_summon_telegraph_remaining())
				var summon_pattern: String = ""
				if _miniboss_director.has_method("get_boss_pending_summon_pattern"):
					summon_pattern = String(_miniboss_director.get_boss_pending_summon_pattern())
				var pattern_label: String = "RING"
				if summon_pattern == "wall":
					pattern_label = "WALL"
				text += "\n🌀 SUMMON %s: %.2fs" % [pattern_label, summon_remain]
		elif _miniboss_director.has_method("was_boss_defeated") and _miniboss_director.was_boss_defeated():
			text += "\n✅ MINIBOSS DEFEATED"

	if _state.is_game_over:
		text += "\nGAME OVER"
		if String(_state.death_reason) != "":
			text += "\n☠ 원인: %s" % String(_state.death_reason)
		if String(_state.death_context) != "":
			text += "\nℹ %s" % String(_state.death_context)
		text += "\nPress [R] to Restart"
	_label.text = text
