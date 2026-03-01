extends Node2D

const GameState := preload("res://scripts/core/game_state.gd")
const SignalBus := preload("res://scripts/core/signal_bus.gd")
const Balance := preload("res://scripts/data/balance.gd")
const InputActions := preload("res://scripts/core/input_actions.gd")
const SpawnDirector := preload("res://scripts/systems/spawn_director.gd")
const AutoAttackSystem := preload("res://scripts/systems/auto_attack_system.gd")
const CombatSystem := preload("res://scripts/systems/combat_system.gd")
const UpgradeSystem := preload("res://scripts/systems/upgrade_system.gd")
const MiniBossDirector := preload("res://scripts/systems/miniboss_director.gd")
const LevelUpPanel := preload("res://scripts/ui/level_up_panel.gd")
const EventBanner := preload("res://scripts/ui/event_banner.gd")

@onready var _player: Node2D = $Player
@onready var _enemy_container: Node2D = $EnemyContainer
@onready var _projectile_container: Node2D = $ProjectileContainer
@onready var _hud: CanvasLayer = $HUD

var _state: RefCounted
var _signal_bus: RefCounted
var _balance: RefCounted
var _input_actions: RefCounted

var _spawn_director: Node
var _auto_attack_system: Node
var _combat_system: Node
var _upgrade_system: Node
var _miniboss_director: Node
var _level_up_panel: CanvasLayer
var _event_banner: CanvasLayer

var _current_level_choices: Array = []
var _boss_spawn_time_override: float = -1.0
var _boss_hp_scale_override: float = 1.0
var _boss_test_boost: bool = false
var _auto_levelup: bool = false
var _qa_auto_restart: bool = false
var _qa_restart_delay: float = 0.8
var _qa_restart_time_left: float = 0.0
var _qa_force_damage: bool = false
var _qa_force_damage_interval: float = 0.9
var _qa_force_damage_time_left: float = 0.9
var _qa_autopilot: bool = false
var _qa_autopilot_time: float = 0.0

var _last_boss_alive: bool = false
var _last_game_over: bool = false
var _boss_reward_applied: bool = false
var _slowmo_time_left: float = 0.0

func _ready() -> void:
	_state = GameState.new()
	_signal_bus = SignalBus.new()
	_balance = Balance.new()
	_input_actions = InputActions.new()
	_input_actions.ensure_default_bindings()
	_detect_runtime_modes()

	_player.setup(_balance, _state)
	_hud.setup(_state, _player, _enemy_container, _projectile_container)

	_spawn_director = SpawnDirector.new()
	add_child(_spawn_director)
	_spawn_director.setup(_balance, _state, _player, _enemy_container)

	_auto_attack_system = AutoAttackSystem.new()
	add_child(_auto_attack_system)
	_auto_attack_system.setup(_balance, _state, _player, _enemy_container, _projectile_container)

	_combat_system = CombatSystem.new()
	add_child(_combat_system)
	_combat_system.setup(_balance, _state, _player, _enemy_container, _projectile_container)

	_upgrade_system = UpgradeSystem.new()
	add_child(_upgrade_system)
	_upgrade_system.setup(_state)

	_miniboss_director = MiniBossDirector.new()
	add_child(_miniboss_director)
	_miniboss_director.setup(_balance, _state, _player, _enemy_container, _boss_spawn_time_override, _boss_hp_scale_override)
	_hud.set_miniboss_director(_miniboss_director)

	_level_up_panel = LevelUpPanel.new()
	add_child(_level_up_panel)
	_level_up_panel.choice_selected.connect(_on_level_up_choice_selected)

	_event_banner = EventBanner.new()
	add_child(_event_banner)

	_start_round()
	if _boss_spawn_time_override > 0.0:
		print("BOSS_TEST_MODE_ON")
	if _boss_test_boost:
		print("BOSS_TEST_BOOST_ON")
	if _auto_levelup:
		print("AUTO_LEVELUP_ON")
	if _qa_auto_restart:
		print("QA_AUTO_RESTART_ON")
	if _qa_force_damage:
		print("QA_FORCE_DAMAGE_ON")
	if _qa_autopilot:
		print("QA_AUTOPILOT_ON")
	print("RELIC_SURVIVOR_BOOT_OK")

func _process(delta: float) -> void:
	_update_slowmo(delta)

	if _state.is_game_over and not _last_game_over:
		_last_game_over = true
		_qa_restart_time_left = _qa_restart_delay
	elif not _state.is_game_over:
		_last_game_over = false

	if _state.is_game_over:
		if _qa_auto_restart:
			_qa_restart_time_left -= delta
			if _qa_restart_time_left <= 0.0:
				_restart_round()
				print("QA_AUTO_RESTART_TRIGGERED")
			return
		if Input.is_action_just_pressed("restart"):
			_restart_round()
		return

	if _state.is_paused:
		if _auto_levelup and not _current_level_choices.is_empty():
			var auto_idx: int = _pick_auto_levelup_index(_current_level_choices)
			_on_level_up_choice_selected(auto_idx)
		return

	_state.elapsed += delta
	_process_miniboss_state_transitions()
	_process_qa_force_damage(delta)
	_process_qa_autopilot(delta)

	while not _state.is_game_over and not _state.is_paused and _state.can_level_up():
		_state.consume_level_up()
		_open_level_up_panel()

	_player.position.x = clamp(_player.position.x, 0.0, float(_balance.ARENA_SIZE.x))
	_player.position.y = clamp(_player.position.y, 0.0, float(_balance.ARENA_SIZE.y))

func _start_round() -> void:
	_state.reset()
	if _boss_test_boost:
		_state.max_hp = 20
		_state.hp = 20
		_state.attack_interval_reduction = 0.35
		_state.attack_range_bonus = 180.0
		_state.projectile_damage_bonus = 2
		_state.extra_projectiles = 1
		_state.player_invuln_bonus = 0.25
	_current_level_choices = []
	_last_boss_alive = false
	_last_game_over = false
	_boss_reward_applied = false
	_slowmo_time_left = 0.0
	_qa_restart_time_left = _qa_restart_delay
	_qa_force_damage_time_left = _qa_force_damage_interval
	_qa_autopilot_time = 0.0
	Engine.time_scale = 1.0
	_player.position = Vector2(float(_balance.ARENA_SIZE.x) * 0.5, float(_balance.ARENA_SIZE.y) * 0.5)
	_player.reset_runtime()
	_player.set_enabled(true)
	_clear_container(_projectile_container)
	if _spawn_director and _spawn_director.has_method("reset_runtime"):
		_spawn_director.reset_runtime()
	if _auto_attack_system and _auto_attack_system.has_method("reset_runtime"):
		_auto_attack_system.reset_runtime()
	if _combat_system and _combat_system.has_method("reset_runtime"):
		_combat_system.reset_runtime()
	if _miniboss_director and _miniboss_director.has_method("reset_runtime"):
		_miniboss_director.reset_runtime()
	if _level_up_panel and _level_up_panel.has_method("hide_panel"):
		_level_up_panel.hide_panel()
	if _event_banner:
		_event_banner.visible = false

func _restart_round() -> void:
	_start_round()

func _open_level_up_panel() -> void:
	_current_level_choices = _upgrade_system.roll_choices(3)
	if _current_level_choices.is_empty():
		return

	for i in range(_current_level_choices.size()):
		var choice: Dictionary = _current_level_choices[i]
		var id: String = String(choice.get("id", ""))
		choice["current_stack"] = _state.get_upgrade_stack(id)
		_current_level_choices[i] = choice

	_state.is_paused = true
	_player.set_enabled(false)
	_signal_bus.emit_signal("level_up_opened", _state.level)
	_level_up_panel.show_choices(_current_level_choices, _state.level)

func _on_level_up_choice_selected(choice_index: int) -> void:
	if choice_index < 0 or choice_index >= _current_level_choices.size():
		return

	var picked: Dictionary = _current_level_choices[choice_index]
	var result: Dictionary = _upgrade_system.apply_upgrade(picked)

	_signal_bus.emit_signal("upgrade_applied", String(result.get("id", "")), int(result.get("stack", 1)))
	_signal_bus.emit_signal("level_up_closed", _state.level)
	_signal_bus.emit_signal("hp_changed", _state.hp)
	_signal_bus.emit_signal("level_changed", _state.level)
	_signal_bus.emit_signal("exp_changed", _state.exp, _state.exp_to_next)

	_state.is_paused = false
	if not _state.is_game_over:
		_player.set_enabled(true)
	_level_up_panel.hide_panel()

func _process_miniboss_state_transitions() -> void:
	if _miniboss_director == null:
		return

	var boss_alive: bool = false
	if _miniboss_director.has_method("is_boss_alive"):
		boss_alive = bool(_miniboss_director.is_boss_alive())

	if boss_alive and not _last_boss_alive and _event_banner:
		_event_banner.show_message("⚠ MINIBOSS HAS ENTERED THE ARENA", 1.8)

	if not boss_alive and _last_boss_alive and not _boss_reward_applied:
		_apply_boss_clear_reward()

	_last_boss_alive = boss_alive

func _apply_boss_clear_reward() -> void:
	_boss_reward_applied = true
	var reward_exp: int = int(_balance.MINIBOSS_EXP_REWARD)
	var heal: int = 2
	_state.gain_exp(reward_exp)
	_state.hp = min(_state.max_hp, _state.hp + heal)

	if _event_banner:
		_event_banner.show_message("✅ MINIBOSS DEFEATED\n+%d EXP  +%d HP" % [reward_exp, heal], 2.5)
	_signal_bus.emit_signal("hp_changed", _state.hp)
	_signal_bus.emit_signal("exp_changed", _state.exp, _state.exp_to_next)
	print("BOSS_CLEAR_REWARD_APPLIED")

	_slowmo_time_left = 0.6
	Engine.time_scale = 0.4

func _update_slowmo(delta: float) -> void:
	if _slowmo_time_left <= 0.0:
		return
	_slowmo_time_left -= delta
	if _slowmo_time_left <= 0.0:
		Engine.time_scale = 1.0

func _process_qa_force_damage(delta: float) -> void:
	if not _qa_force_damage or _state.is_game_over or _state.is_paused:
		return

	_qa_force_damage_time_left -= delta
	if _qa_force_damage_time_left > 0.0:
		return

	_qa_force_damage_time_left = _qa_force_damage_interval
	_state.hp = max(0, _state.hp - 1)
	if _state.hp <= 0:
		_state.is_game_over = true
		_player.set_enabled(false)
		print("QA_FORCE_DEATH")

func _process_qa_autopilot(delta: float) -> void:
	if not _qa_autopilot or _state.is_game_over or _state.is_paused:
		return

	_qa_autopilot_time += delta
	var center := Vector2(float(_balance.ARENA_SIZE.x) * 0.5, float(_balance.ARENA_SIZE.y) * 0.5)
	var radius := Vector2(280.0, 190.0)
	var target := center + Vector2(cos(_qa_autopilot_time * 1.13), sin(_qa_autopilot_time * 1.71)) * radius
	_player.position = target

func _detect_runtime_modes() -> void:
	for arg in OS.get_cmdline_user_args():
		if arg == "--boss-test" or arg == "boss-test":
			_boss_spawn_time_override = 12.0
			_boss_hp_scale_override = 0.25
			_boss_test_boost = true
		elif arg == "--auto-levelup" or arg == "auto-levelup":
			_auto_levelup = true
		elif arg == "--qa-auto-restart" or arg == "qa-auto-restart":
			_qa_auto_restart = true
		elif arg == "--qa-force-damage" or arg == "qa-force-damage":
			_qa_force_damage = true
		elif arg == "--qa-autopilot" or arg == "qa-autopilot":
			_qa_autopilot = true

func _pick_auto_levelup_index(choices: Array) -> int:
	var priorities := {
		"extra_projectiles": 100,
		"projectile_damage_bonus": 95,
		"attack_interval_reduction": 92,
		"projectile_speed_bonus": 80,
		"attack_range_bonus": 72,
		"max_hp_plus_heal": 60,
		"instant_heal": 50,
		"player_speed_bonus": 40,
		"dash_cooldown_reduction": 35,
		"player_invuln_bonus": 30,
		"projectile_radius_bonus": 28,
		"projectile_lifetime_bonus": 26
	}

	var best_idx: int = 0
	var best_score: int = -9999
	for i in range(choices.size()):
		var choice: Dictionary = choices[i]
		var effect_key: String = String(choice.get("effect_key", ""))
		var score: int = int(priorities.get(effect_key, 0))
		if score > best_score:
			best_score = score
			best_idx = i
	return best_idx

func _clear_container(container: Node2D) -> void:
	for node in container.get_children():
		node.queue_free()
