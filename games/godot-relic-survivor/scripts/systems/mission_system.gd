extends RefCounted

var _state: RefCounted
var _event_banner: CanvasLayer
var _mission_test: bool = false

var _next_assign_in: float = 8.0
var _mission_index: int = 0
var _baseline_kills: int = 0
var _baseline_elite_kills: int = 0
var _baseline_dash_uses: int = 0
var _consecutive_failures: int = 0

func setup(state: RefCounted, event_banner: CanvasLayer, mission_test: bool = false) -> void:
	_state = state
	_event_banner = event_banner
	_mission_test = mission_test
	reset_runtime()

func reset_runtime() -> void:
	_next_assign_in = 3.0 if _mission_test else 8.0
	_mission_index = 0
	_consecutive_failures = 0
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
		_state.mission_streak = 0
		_state.mission_best_streak = 0

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
		if int(_state.mission_streak) > 0:
			print("MISSION_STREAK_RESET")
		_state.mission_streak = 0
		_consecutive_failures = min(3, _consecutive_failures + 1)
		if _consecutive_failures >= 2:
			print("MISSION_DIFFICULTY_RELAX")
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

	var elapsed: float = float(_state.elapsed) if _state else 0.0
	var pressure: float = float(_state.pressure_hint) if _state else 0.0

	var clear_target: int = 16
	var clear_reward: int = 11
	var clear_duration: float = 36.0

	var elite_target: int = 1
	var elite_reward: int = 14
	var elite_duration: float = 40.0

	var dash_target: int = 4
	var dash_reward: int = 9
	var dash_duration: float = 30.0

	if elapsed >= 140.0:
		clear_target = 20
		clear_reward = 13
		clear_duration = 42.0
		elite_target = 2
		elite_reward = 17
		elite_duration = 46.0
		dash_target = 5
		dash_reward = 11
		dash_duration = 34.0

	if elapsed >= 300.0:
		clear_target = 24
		clear_reward = 15
		clear_duration = 48.0
		elite_target = 2
		elite_reward = 19
		elite_duration = 52.0
		dash_target = 6
		dash_reward = 12
		dash_duration = 38.0

	if pressure >= 0.95:
		clear_duration += 6.0
		elite_duration += 8.0
		dash_duration += 6.0
		clear_reward += 1
		elite_reward += 2
		dash_reward += 1

	var clear_wave := {
		"id": "clear_wave",
		"title": "Kill %d enemies" % clear_target,
		"target": clear_target,
		"reward_exp": clear_reward,
		"duration": clear_duration
	}
	var elite_hunt := {
		"id": "elite_hunt",
		"title": "Defeat %d elites" % elite_target,
		"target": elite_target,
		"reward_exp": elite_reward,
		"duration": elite_duration
	}
	var dash_drill := {
		"id": "dash_drill",
		"title": "Use dash %d times" % dash_target,
		"target": dash_target,
		"reward_exp": dash_reward,
		"duration": dash_duration
	}

	if _consecutive_failures >= 2:
		return [
			_relax_mission(clear_wave),
			_relax_mission(dash_drill),
			_relax_mission(clear_wave)
		]

	if elapsed < 100.0:
		return [clear_wave, dash_drill, clear_wave]
	if elapsed < 240.0:
		return [clear_wave, elite_hunt, dash_drill, clear_wave]
	return [clear_wave, elite_hunt, clear_wave, dash_drill, elite_hunt]

func _relax_mission(mission: Dictionary) -> Dictionary:
	var relaxed: Dictionary = mission.duplicate(true)
	relaxed["target"] = max(1, int(round(float(mission.get("target", 1)) * 0.75)))
	relaxed["duration"] = float(mission.get("duration", 20.0)) * 1.20
	relaxed["reward_exp"] = max(6, int(round(float(mission.get("reward_exp", 8)) * 0.9)))
	relaxed["title"] = "(Recover) %s" % String(mission.get("title", "Mission"))
	return relaxed

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
	_consecutive_failures = 0
	_state.mission_streak = int(_state.mission_streak) + 1
	_state.mission_best_streak = max(int(_state.mission_best_streak), int(_state.mission_streak))

	var streak_bonus: int = min(8, max(0, int(_state.mission_streak) - 1) * 2)
	var total_reward: int = int(_state.mission_reward_exp) + streak_bonus
	if streak_bonus > 0:
		print("MISSION_STREAK:%d:+%d" % [int(_state.mission_streak), streak_bonus])

	_state.gain_exp(total_reward)
	_state.hp = min(_state.max_hp, _state.hp + 1)
	_state.mission_completed_count += 1
	if _event_banner:
		if streak_bonus > 0:
			_event_banner.show_message("✅ MISSION x%d +%d EXP" % [int(_state.mission_streak), total_reward], 0.95, Color("#065F46"))
		else:
			_event_banner.show_message("✅ MISSION CLEAR +%d EXP" % total_reward, 0.95, Color("#065F46"))

	_state.mission_active = false
	_state.mission_id = ""
	_state.mission_title = ""
	_state.mission_progress = 0
	_state.mission_target = 0
	_state.mission_reward_exp = 0
	_state.mission_time_left = 0.0
	_next_assign_in = 6.0 if not _mission_test else 2.0
