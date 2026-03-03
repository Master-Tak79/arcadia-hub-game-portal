extends RefCounted

var _state: RefCounted
var _event_banner: CanvasLayer
var _mission_test: bool = false

var _next_assign_in: float = 8.0
var _mission_index: int = 0
var _baseline_kills: int = 0
var _baseline_elite_kills: int = 0
var _baseline_dash_uses: int = 0

func setup(state: RefCounted, event_banner: CanvasLayer, mission_test: bool = false) -> void:
	_state = state
	_event_banner = event_banner
	_mission_test = mission_test
	reset_runtime()

func reset_runtime() -> void:
	_next_assign_in = 3.0 if _mission_test else 8.0
	_mission_index = 0
	_baseline_kills = int(_state.kills) if _state else 0
	_baseline_elite_kills = int(_state.elite_kills) if _state else 0
	_baseline_dash_uses = int(_state.dash_uses) if _state else 0

	if _state:
		_state.mission_id = ""
		_state.mission_title = ""
		_state.mission_progress = 0
		_state.mission_target = 0
		_state.mission_reward_exp = 0
		_state.mission_active = false
		_state.mission_time_left = 0.0

func process(delta: float) -> void:
	if _state == null or _state.is_game_over or _state.is_paused:
		return

	if not _state.mission_active:
		_next_assign_in -= delta
		if _next_assign_in <= 0.0:
			_assign_next_mission()
		return

	_state.mission_time_left = max(0.0, _state.mission_time_left - delta)
	_update_progress()

	if _state.mission_progress >= _state.mission_target:
		_complete_mission()
		return

	if _state.mission_time_left <= 0.0:
		print("MISSION_FAILED:%s" % _state.mission_id)
		_state.mission_active = false
		_state.mission_id = ""
		_state.mission_title = ""
		_state.mission_progress = 0
		_state.mission_target = 0
		_state.mission_reward_exp = 0
		_state.mission_time_left = 0.0
		_next_assign_in = 8.0 if not _mission_test else 3.0

func _assign_next_mission() -> void:
	var pool: Array = _get_mission_pool()
	if pool.is_empty():
		return

	var mission: Dictionary = pool[_mission_index % pool.size()]
	_mission_index += 1

	_state.mission_id = String(mission.get("id", "mission"))
	_state.mission_title = String(mission.get("title", "Mission"))
	_state.mission_target = int(mission.get("target", 1))
	_state.mission_reward_exp = int(mission.get("reward_exp", 6))
	_state.mission_time_left = float(mission.get("duration", 24.0))
	_state.mission_progress = 0
	_state.mission_active = true

	_baseline_kills = int(_state.kills)
	_baseline_elite_kills = int(_state.elite_kills)
	_baseline_dash_uses = int(_state.dash_uses)

	print("MISSION_ASSIGNED:%s" % _state.mission_id)
	if _event_banner:
		_event_banner.show_message("🎯 %s" % _state.mission_title, 1.0, Color("#0F766E"))

func _get_mission_pool() -> Array:
	if _mission_test:
		return [
			{"id": "clear_wave", "title": "Kill 6 enemies", "target": 6, "reward_exp": 9, "duration": 20.0},
			{"id": "elite_hunt", "title": "Defeat 1 elite", "target": 1, "reward_exp": 12, "duration": 24.0}
		]
	return [
		{"id": "clear_wave", "title": "Kill 18 enemies", "target": 18, "reward_exp": 11, "duration": 38.0},
		{"id": "elite_hunt", "title": "Defeat 2 elites", "target": 2, "reward_exp": 16, "duration": 46.0},
		{"id": "dash_drill", "title": "Use dash 6 times", "target": 6, "reward_exp": 10, "duration": 34.0}
	]

func _update_progress() -> void:
	match _state.mission_id:
		"clear_wave":
			_state.mission_progress = max(0, int(_state.kills) - _baseline_kills)
		"elite_hunt":
			_state.mission_progress = max(0, int(_state.elite_kills) - _baseline_elite_kills)
		"dash_drill":
			_state.mission_progress = max(0, int(_state.dash_uses) - _baseline_dash_uses)
		_:
			_state.mission_progress = 0

func _complete_mission() -> void:
	print("MISSION_COMPLETED:%s" % _state.mission_id)
	_state.gain_exp(int(_state.mission_reward_exp))
	_state.hp = min(_state.max_hp, _state.hp + 1)
	_state.mission_completed_count += 1
	if _event_banner:
		_event_banner.show_message("✅ MISSION CLEAR +%d EXP" % _state.mission_reward_exp, 0.95, Color("#065F46"))

	_state.mission_active = false
	_state.mission_id = ""
	_state.mission_title = ""
	_state.mission_progress = 0
	_state.mission_target = 0
	_state.mission_reward_exp = 0
	_state.mission_time_left = 0.0
	_next_assign_in = 6.0 if not _mission_test else 2.0
