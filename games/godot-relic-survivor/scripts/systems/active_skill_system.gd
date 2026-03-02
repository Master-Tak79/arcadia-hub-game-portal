extends Node

var _state: RefCounted
var _player: Node2D
var _enemy_container: Node2D
var _event_banner: CanvasLayer
var _character_test: bool = false

var _skill_id: String = ""
var _skill_title: String = ""
var _cooldown: float = 0.0
var _cooldown_left: float = 0.0
var _active_left: float = 0.0

var _ranger_speed_bonus: float = 120.0
var _ranger_attack_bonus: float = 0.12

var _warden_invuln_bonus: float = 0.35

func setup(state: RefCounted, player: Node2D, enemy_container: Node2D, event_banner: CanvasLayer, character_test: bool = false) -> void:
	_state = state
	_player = player
	_enemy_container = enemy_container
	_event_banner = event_banner
	_character_test = character_test

func reset_round() -> void:
	_skill_id = ""
	_skill_title = ""
	_cooldown = 0.0
	_cooldown_left = 0.0
	_active_left = 0.0

	if _state == null:
		return

	match String(_state.character_id):
		"ranger":
			_skill_id = "ranger_burst"
			_skill_title = "Windstep Burst"
			_cooldown = 16.0
		"warden":
			_skill_id = "warden_bulwark"
			_skill_title = "Bulwark Pulse"
			_cooldown = 18.0
		_:
			_skill_id = ""
			_skill_title = ""
			_cooldown = 0.0

	_state.active_skill_id = _skill_id
	_state.active_skill_title = _skill_title
	_state.active_skill_cooldown_left = 0.0
	_state.active_skill_active_left = 0.0

func _process(delta: float) -> void:
	if _state == null or _state.is_game_over or _state.is_paused:
		return
	if _skill_id == "":
		return

	if _cooldown_left > 0.0:
		_cooldown_left = max(0.0, _cooldown_left - delta)

	if _active_left > 0.0:
		_active_left = max(0.0, _active_left - delta)
		if _active_left <= 0.0:
			_on_skill_end()

	_state.active_skill_cooldown_left = _cooldown_left
	_state.active_skill_active_left = _active_left

	var trigger: bool = Input.is_action_just_pressed("active_skill")
	if _character_test and _cooldown_left <= 0.0 and _state.elapsed > 6.0:
		trigger = true

	if trigger and _cooldown_left <= 0.0:
		_activate_skill()

func _activate_skill() -> void:
	_cooldown_left = _cooldown

	match _skill_id:
		"ranger_burst":
			_active_left = 3.5
			_state.player_speed_bonus += _ranger_speed_bonus
			_state.attack_interval_reduction += _ranger_attack_bonus
			print("ACTIVE_SKILL_USED:ranger_burst")
			if _event_banner:
				_event_banner.show_message("⚡ Windstep Burst", 0.9, Color("#0E7490"))
		"warden_bulwark":
			_active_left = 2.2
			_state.player_invuln_bonus += _warden_invuln_bonus
			var hit_count: int = _apply_warden_pulse_damage()
			print("ACTIVE_SKILL_USED:warden_bulwark")
			print("ACTIVE_SKILL_HIT:%d" % hit_count)
			if _event_banner:
				_event_banner.show_message("🛡 Bulwark Pulse", 0.9, Color("#1E3A8A"))

func _on_skill_end() -> void:
	match _skill_id:
		"ranger_burst":
			_state.player_speed_bonus -= _ranger_speed_bonus
			_state.attack_interval_reduction -= _ranger_attack_bonus
		"warden_bulwark":
			_state.player_invuln_bonus -= _warden_invuln_bonus

func _apply_warden_pulse_damage() -> int:
	if _enemy_container == null or _player == null:
		return 0

	var count: int = 0
	var pulse_radius: float = 128.0
	var pulse_damage: int = 2
	for enemy in _enemy_container.get_children():
		if not (enemy is Node2D):
			continue
		if enemy.is_queued_for_deletion():
			continue
		if not enemy.has_method("get_hit_radius"):
			continue
		var hit_radius: float = float(enemy.get_hit_radius())
		if _player.position.distance_to(enemy.position) > pulse_radius + hit_radius:
			continue
		if enemy.has_method("apply_damage"):
			var killed: bool = bool(enemy.apply_damage(pulse_damage))
			if killed:
				_state.kills += 1
				var exp_reward: int = 3
				if enemy.has_method("get_exp_reward"):
					exp_reward = int(enemy.get_exp_reward())
				_state.gain_exp(exp_reward)
		count += 1
	return count
