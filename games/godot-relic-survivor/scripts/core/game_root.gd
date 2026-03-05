extends Node2D

const GameState := preload("res://scripts/core/game_state.gd")
const SignalBus := preload("res://scripts/core/signal_bus.gd")
const Balance := preload("res://scripts/data/balance.gd")
const InputActions := preload("res://scripts/core/input_actions.gd")
const RuntimeOptions := preload("res://scripts/core/runtime_options.gd")

const SpawnDirector := preload("res://scripts/systems/spawn_director.gd")
const AutoAttackSystem := preload("res://scripts/systems/auto_attack_system.gd")
const CombatSystem := preload("res://scripts/systems/combat_system.gd")
const UpgradeSystem := preload("res://scripts/systems/upgrade_system.gd")
const RelicSystem := preload("res://scripts/systems/relic_system.gd")
const MiniBossDirector := preload("res://scripts/systems/miniboss_director.gd")
const QaRuntime := preload("res://scripts/systems/qa_runtime.gd")
const BossRewardRuntime := preload("res://scripts/systems/boss_reward_runtime.gd")
const StageEventSystem := preload("res://scripts/systems/stage_event_system.gd")
const MetaProgression := preload("res://scripts/systems/meta_progression.gd")
const CharacterSystem := preload("res://scripts/systems/character_system.gd")
const WeaponSystem := preload("res://scripts/systems/weapon_system.gd")
const ActiveSkillSystem := preload("res://scripts/systems/active_skill_system.gd")
const TreeProgression := preload("res://scripts/systems/tree_progression.gd")
const MissionSystem := preload("res://scripts/systems/mission_system.gd")
const PressureRuntime := preload("res://scripts/systems/pressure_runtime.gd")
const LevelupAdvisor := preload("res://scripts/systems/levelup_advisor.gd")

const LevelUpPanel := preload("res://scripts/ui/level_up_panel.gd")
const TreePanel := preload("res://scripts/ui/tree_panel.gd")
const UpgradeHistoryPanel := preload("res://scripts/ui/upgrade_history_panel.gd")
const TitleMenu := preload("res://scripts/ui/title_menu.gd")
const OptionsMenu := preload("res://scripts/ui/options_menu.gd")
const EventBanner := preload("res://scripts/ui/event_banner.gd")
const StageEventOverlay := preload("res://scripts/ui/stage_event_overlay.gd")
const SfxSlots := preload("res://scripts/audio/sfx_slots.gd")

@onready var _player: Node2D = $Player
@onready var _enemy_container: Node2D = $EnemyContainer
@onready var _projectile_container: Node2D = $ProjectileContainer
@onready var _camera_fx: Camera2D = $GameCamera
@onready var _hud: CanvasLayer = $HUD
@onready var _title_menu: CanvasLayer = $TitleMenu
@onready var _options_menu: CanvasLayer = $OptionsMenu

var _state: RefCounted
var _signal_bus: RefCounted
var _balance: RefCounted
var _input_actions: RefCounted
var _runtime_options: RefCounted

var _spawn_director
var _auto_attack_system
var _combat_system
var _upgrade_system
var _relic_system
var _miniboss_director

var _stage_event_system

var _qa_runtime
var _boss_reward_runtime
var _meta_progression
var _tree_progression
var _mission_system
var _pressure_runtime
var _levelup_advisor
var _character_system
var _weapon_system
var _active_skill_system

var _level_up_panel
var _tree_panel
var _upgrade_history_panel
var _event_banner
var _stage_event_overlay
var _sfx_slots

var _current_level_choices: Array = []
var _current_tree_options: Array = []
var _tree_menu_open: bool = false
var _history_menu_open: bool = false
var _title_menu_open: bool = false
var _title_menu_boot_mode: bool = false
var _options_menu_open: bool = false

var _setting_sfx_preset: String = "default"
var _setting_impact_scale: float = 1.0
var _setting_window_mode: String = "windowed"
const _SETTINGS_PATH := "user://settings.cfg"
var _tree_ui_test_done: bool = false
var _last_game_over: bool = false
var _fps_probe_enabled: bool = false
var _fps_probe_tick_left: float = 0.0
var _fps_probe_samples: int = 0
var _fps_probe_sum: float = 0.0
var _fps_probe_min: float = 9999.0
var _fps_probe_max: float = 0.0

func _ready() -> void:
	_state = GameState.new()
	_signal_bus = SignalBus.new()
	_balance = Balance.new()
	_input_actions = InputActions.new()
	_runtime_options = RuntimeOptions.new()

	_runtime_options.parse_user_args(OS.get_cmdline_user_args())
	_input_actions.ensure_default_bindings()
	_fps_probe_enabled = bool(_runtime_options.fps_probe)

	_player.setup(_balance, _state)
	_hud.setup(_state, _player, _enemy_container, _projectile_container)

	_spawn_director = SpawnDirector.new()
	add_child(_spawn_director)
	_spawn_director.setup(_balance, _state, _player, _enemy_container)
	_spawn_director.set_elite_test_mode(bool(_runtime_options.elite_test))
	_spawn_director.set_elite_variant_test_mode(bool(_runtime_options.elite_variant_test))

	_auto_attack_system = AutoAttackSystem.new()
	add_child(_auto_attack_system)
	_auto_attack_system.setup(_balance, _state, _player, _enemy_container, _projectile_container)

	_combat_system = CombatSystem.new()
	add_child(_combat_system)
	_combat_system.setup(_balance, _state, _player, _enemy_container, _projectile_container, _camera_fx)

	_upgrade_system = UpgradeSystem.new()
	add_child(_upgrade_system)
	_upgrade_system.setup(_state)

	_miniboss_director = MiniBossDirector.new()
	add_child(_miniboss_director)
	_miniboss_director.setup(
		_balance,
		_state,
		_player,
		_enemy_container,
		float(_runtime_options.boss_spawn_time_override),
		float(_runtime_options.boss_hp_scale_override),
		bool(_runtime_options.boss_pattern_test)
	)
	_hud.set_miniboss_director(_miniboss_director)
	_spawn_director.set_miniboss_director(_miniboss_director)

	_level_up_panel = LevelUpPanel.new()
	add_child(_level_up_panel)
	_level_up_panel.set_context(_state, _balance)
	_level_up_panel.choice_selected.connect(_on_level_up_choice_selected)

	_tree_panel = TreePanel.new()
	add_child(_tree_panel)
	_tree_panel.option_selected.connect(_on_tree_option_selected)
	_tree_panel.close_requested.connect(_close_tree_menu)

	_upgrade_history_panel = UpgradeHistoryPanel.new()
	add_child(_upgrade_history_panel)
	_upgrade_history_panel.close_requested.connect(_close_upgrade_history_menu)

	if _title_menu and _title_menu.has_signal("start_requested"):
		_title_menu.start_requested.connect(_on_title_start_requested)
		_title_menu.resume_requested.connect(_on_title_resume_requested)
		_title_menu.restart_requested.connect(_on_title_restart_requested)
		_title_menu.options_requested.connect(_on_title_options_requested)
		_title_menu.quit_requested.connect(_on_title_quit_requested)

	if _options_menu and _options_menu.has_signal("close_requested"):
		_options_menu.close_requested.connect(_on_options_close_requested)
		_options_menu.sfx_preset_changed.connect(_on_options_sfx_preset_changed)
		_options_menu.impact_scale_changed.connect(_on_options_impact_scale_changed)
		_options_menu.window_mode_changed.connect(_on_options_window_mode_changed)

	_event_banner = EventBanner.new()
	add_child(_event_banner)

	_stage_event_overlay = StageEventOverlay.new()
	add_child(_stage_event_overlay)
	move_child(_stage_event_overlay, 1)
	_stage_event_overlay.setup(_balance, _state)

	_relic_system = RelicSystem.new()
	add_child(_relic_system)
	_relic_system.setup(_balance, _state, _signal_bus, _event_banner, bool(_runtime_options.relic_test))

	_stage_event_system = StageEventSystem.new()
	_stage_event_system.setup(_balance, _state, _signal_bus, _player, _event_banner, _stage_event_overlay, bool(_runtime_options.event_test))

	_sfx_slots = SfxSlots.new()
	add_child(_sfx_slots)
	_sfx_slots.apply_preset(String(_runtime_options.sfx_preset))
	_init_runtime_settings()

	_qa_runtime = QaRuntime.new()
	_qa_runtime.setup(_runtime_options, _balance, _state, _player)

	_boss_reward_runtime = BossRewardRuntime.new()
	_boss_reward_runtime.setup(_balance, _state, _signal_bus, _miniboss_director, _event_banner, _camera_fx, _sfx_slots)

	_character_system = CharacterSystem.new()
	_character_system.setup(_state, _runtime_options)

	_weapon_system = WeaponSystem.new()
	_weapon_system.setup(_state, _runtime_options)

	_active_skill_system = ActiveSkillSystem.new()
	add_child(_active_skill_system)
	_active_skill_system.setup(_state, _player, _enemy_container, _event_banner, bool(_runtime_options.character_test))

	_meta_progression = MetaProgression.new()
	_meta_progression.setup(_state, _event_banner, bool(_runtime_options.meta_test))

	_tree_progression = TreeProgression.new()
	_tree_progression.setup(
		_state,
		_runtime_options,
		_meta_progression,
		_event_banner,
		bool(_runtime_options.tree_test),
		bool(_runtime_options.tree_ui_test)
	)

	_mission_system = MissionSystem.new()
	_mission_system.setup(_state, _event_banner, bool(_runtime_options.mission_test))

	_levelup_advisor = LevelupAdvisor.new()
	_levelup_advisor.setup(_state)

	_pressure_runtime = PressureRuntime.new()
	_pressure_runtime.setup(_balance, _state, _spawn_director, _miniboss_director)

	_start_round()
	_runtime_options.print_enabled_flags()
	print("RELIC_SURVIVOR_BOOT_OK")
	if _should_show_title_menu_on_boot():
		_open_title_menu(true)

func _process(delta: float) -> void:
	_boss_reward_runtime.process(delta)
	_track_game_over_edge()
	_process_fps_probe(delta)

	if _title_menu_open:
		return
	if _options_menu_open:
		return

	if _state.is_game_over:
		if Input.is_action_just_pressed("upgrade_history"):
			if _history_menu_open:
				_close_upgrade_history_menu()
			else:
				_open_upgrade_history_menu()
			return
		if Input.is_action_just_pressed("tree_menu"):
			if _tree_menu_open:
				_close_tree_menu()
			else:
				_open_tree_menu()
			return
		if _tree_menu_open:
			_process_tree_menu_pause()
			return
		if _history_menu_open:
			return
		if bool(_runtime_options.qa_auto_restart):
			if _qa_runtime.process_game_over(delta):
				_restart_round()
				print("QA_AUTO_RESTART_TRIGGERED")
			return
		if Input.is_action_just_pressed("restart"):
			_restart_round()
		return

	if Input.is_action_just_pressed("upgrade_history"):
		if _history_menu_open:
			_close_upgrade_history_menu()
		elif not _tree_menu_open and not (_level_up_panel and _level_up_panel.visible):
			_open_upgrade_history_menu()
		return

	if Input.is_action_just_pressed("ui_cancel") and not _tree_menu_open and not _history_menu_open and not (_level_up_panel and _level_up_panel.visible):
		_open_title_menu(false)
		return

	if Input.is_action_just_pressed("tree_menu") and not _state.is_paused and not _tree_menu_open:
		_open_tree_menu()
		return

	if bool(_runtime_options.tree_ui_test) and not _tree_ui_test_done and _state.elapsed >= 6.0 and not _state.is_paused and not _tree_menu_open:
		_open_tree_menu()
		print("TREE_UI_PANEL_TEST_OPEN")
		return

	if _tree_menu_open:
		_process_tree_menu_pause()
		return

	if _history_menu_open:
		return

	if _state.is_paused:
		_process_levelup_pause()
		return

	_state.elapsed += delta
	_stage_event_system.process(delta)
	_mission_system.process(delta)
	if _state.is_game_over:
		return
	_update_pressure_hint()
	_qa_runtime.process_active(delta)

	while not _state.is_game_over and not _state.is_paused and _state.can_level_up():
		_state.consume_level_up()
		_open_level_up_panel()

	_clamp_player_inside_arena()

func _track_game_over_edge() -> void:
	if _state.is_game_over and not _last_game_over:
		_last_game_over = true
		_qa_runtime.on_game_over_entered()
		var boss_defeated: bool = bool(_miniboss_director.was_boss_defeated())
		_meta_progression.on_run_finished(int(_state.kills), boss_defeated)
	elif not _state.is_game_over:
		_last_game_over = false

func _process_levelup_pause() -> void:
	if not bool(_runtime_options.auto_levelup):
		return
	if _current_level_choices.is_empty():
		return
	var auto_idx: int = _pick_auto_levelup_index(_current_level_choices)
	_on_level_up_choice_selected(auto_idx)

func _process_tree_menu_pause() -> void:
	if not _tree_menu_open:
		return
	if bool(_runtime_options.tree_ui_test) and not _tree_ui_test_done:
		if not _current_tree_options.is_empty():
			_on_tree_option_selected(0)
		else:
			print("TREE_UI_NO_OPTIONS")
			_close_tree_menu()
		_tree_ui_test_done = true

func _open_tree_menu() -> void:
	if _tree_menu_open:
		return
	if _history_menu_open:
		return
	if _title_menu_open:
		return
	if _level_up_panel and _level_up_panel.visible:
		return

	_current_tree_options = _tree_progression.get_tree_ui_options(3)
	_tree_panel.show_options(String(_state.character_title), int(_state.meta_shards), _current_tree_options)

	_tree_menu_open = true
	_state.is_paused = true
	_player.set_enabled(false)
	print("TREE_PANEL_OPEN")

func _close_tree_menu() -> void:
	if not _tree_menu_open:
		return
	_tree_menu_open = false
	_current_tree_options = []
	_tree_panel.hide_panel()
	if not _state.is_game_over and not _history_menu_open:
		_state.is_paused = false
		_player.set_enabled(true)
	print("TREE_PANEL_CLOSED")

func _on_tree_option_selected(option_index: int) -> void:
	if option_index < 0 or option_index >= _current_tree_options.size():
		return

	var node: Dictionary = _current_tree_options[option_index]
	var node_id: String = String(node.get("id", ""))
	var result: Dictionary = _tree_progression.try_unlock_node(node_id)
	if bool(result.get("ok", false)):
		print("TREE_UI_UNLOCK_CONFIRMED:%s" % node_id)
	else:
		print("TREE_UI_UNLOCK_FAILED:%s" % String(result.get("reason", "unknown")))
	_close_tree_menu()

func _clamp_player_inside_arena() -> void:
	_player.position.x = clamp(_player.position.x, 0.0, float(_balance.ARENA_SIZE.x))
	_player.position.y = clamp(_player.position.y, 0.0, float(_balance.ARENA_SIZE.y))

func _update_pressure_hint() -> void:
	_pressure_runtime.update_pressure_hint()

func _start_round() -> void:
	_state.reset()
	_runtime_options.apply_round_boost_if_needed(_state)
	_character_system.apply_round_start_profile()
	_weapon_system.apply_round_start_profile()
	_meta_progression.apply_round_start_modifiers()
	_tree_progression.apply_round_start_modifiers()
	_active_skill_system.reset_round()

	_current_level_choices = []
	_current_tree_options = []
	_tree_menu_open = false
	_history_menu_open = false
	_title_menu_open = false
	_title_menu_boot_mode = false
	_options_menu_open = false
	_tree_ui_test_done = false
	_last_game_over = false

	_player.position = Vector2(float(_balance.ARENA_SIZE.x) * 0.5, float(_balance.ARENA_SIZE.y) * 0.5)
	_player.reset_runtime()
	_player.set_enabled(true)

	_clear_container(_projectile_container)
	_spawn_director.reset_runtime()
	_auto_attack_system.reset_runtime()
	_combat_system.reset_runtime()
	_relic_system.reset_runtime()
	_stage_event_system.reset_runtime()
	_mission_system.reset_runtime()
	_miniboss_director.reset_runtime()
	_level_up_panel.hide_panel()
	_tree_panel.hide_panel()
	if _upgrade_history_panel:
		_upgrade_history_panel.hide_panel()
	if _title_menu:
		_title_menu.hide_menu()
	if _options_menu and _options_menu.has_method("hide_menu"):
		_options_menu.hide_menu()
	_event_banner.visible = false

	_update_pressure_hint()
	_qa_runtime.reset_round()
	_boss_reward_runtime.reset_round()

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

	if _history_menu_open:
		_close_upgrade_history_menu()
	_state.is_paused = true
	_player.set_enabled(false)
	_signal_bus.emit_signal("level_up_opened", _state.level)
	_level_up_panel.show_choices(_current_level_choices, _state.level)

func _on_level_up_choice_selected(choice_index: int) -> void:
	if choice_index < 0 or choice_index >= _current_level_choices.size():
		return

	var picked: Dictionary = _current_level_choices[choice_index]
	var result: Dictionary = _upgrade_system.apply_upgrade(picked)
	_record_levelup_choice(picked, result)

	_signal_bus.emit_signal("upgrade_applied", String(result.get("id", "")), int(result.get("stack", 1)))
	_signal_bus.emit_signal("level_up_closed", _state.level)
	_signal_bus.emit_signal("hp_changed", _state.hp)
	_signal_bus.emit_signal("level_changed", _state.level)
	_signal_bus.emit_signal("exp_changed", _state.exp, _state.exp_to_next)

	_state.is_paused = false
	if not _state.is_game_over:
		_player.set_enabled(true)
	_level_up_panel.hide_panel()


func _should_show_title_menu_on_boot() -> bool:
	if DisplayServer.get_name() == "headless":
		return false
	if bool(_runtime_options.is_automation_mode()):
		return false
	return true

func _open_title_menu(boot_mode: bool) -> void:
	if _title_menu_open:
		return
	if _tree_menu_open:
		_close_tree_menu()
	if _history_menu_open:
		_close_upgrade_history_menu()
	if _options_menu_open:
		_close_options_menu(false)
	if _level_up_panel and _level_up_panel.visible:
		_level_up_panel.hide_panel()

	_title_menu_open = true
	_title_menu_boot_mode = boot_mode
	if _title_menu:
		if boot_mode and _title_menu.has_method("show_boot_menu"):
			_title_menu.show_boot_menu()
		elif _title_menu.has_method("show_pause_menu"):
			_title_menu.show_pause_menu()

	_state.is_paused = true
	_player.set_enabled(false)
	print("TITLE_MENU_OPEN")

func _close_title_menu(resume_play: bool) -> void:
	if not _title_menu_open:
		return
	_title_menu_open = false
	_title_menu_boot_mode = false
	if _title_menu and _title_menu.has_method("hide_menu"):
		_title_menu.hide_menu()
	if _options_menu and _options_menu.has_method("hide_menu"):
		_options_menu.hide_menu()
	_options_menu_open = false
	if resume_play and not _state.is_game_over and not _tree_menu_open and not _history_menu_open and not (_level_up_panel and _level_up_panel.visible):
		_state.is_paused = false
		_player.set_enabled(true)
	print("TITLE_MENU_CLOSED")

func _on_title_start_requested() -> void:
	_close_title_menu(false)
	_restart_round()
	print("TITLE_MENU_START")

func _on_title_resume_requested() -> void:
	_close_title_menu(true)

func _on_title_restart_requested() -> void:
	_close_title_menu(false)
	_restart_round()
	print("TITLE_MENU_RESTART")


func _on_title_options_requested() -> void:
	if _options_menu_open:
		return
	_open_options_menu()

func _on_options_close_requested() -> void:
	_close_options_menu(true)

func _on_options_sfx_preset_changed(preset: String) -> void:
	_setting_sfx_preset = preset
	if _sfx_slots:
		_sfx_slots.apply_preset(_setting_sfx_preset)
	_save_runtime_settings()

func _on_options_impact_scale_changed(scale: float) -> void:
	_setting_impact_scale = clampf(scale, 0.0, 1.6)
	if _camera_fx and _camera_fx.has_method("set_impact_scale"):
		_camera_fx.set_impact_scale(_setting_impact_scale)
	_save_runtime_settings()

func _on_options_window_mode_changed(mode: String) -> void:
	_setting_window_mode = mode
	_apply_window_mode(_setting_window_mode)
	_save_runtime_settings()

func _open_options_menu() -> void:
	if _options_menu_open:
		return
	_options_menu_open = true
	if _title_menu and _title_menu.has_method("hide_menu"):
		_title_menu.hide_menu()
	if _options_menu and _options_menu.has_method("show_menu"):
		_options_menu.show_menu(_setting_sfx_preset, _setting_impact_scale, _setting_window_mode)
	print("OPTIONS_MENU_OPEN")

func _close_options_menu(show_title_menu: bool) -> void:
	if not _options_menu_open:
		return
	_options_menu_open = false
	if _options_menu and _options_menu.has_method("hide_menu"):
		_options_menu.hide_menu()
	if show_title_menu and _title_menu_open and _title_menu:
		if _title_menu_boot_mode and _title_menu.has_method("show_boot_menu"):
			_title_menu.show_boot_menu()
		elif _title_menu.has_method("show_pause_menu"):
			_title_menu.show_pause_menu()
	print("OPTIONS_MENU_CLOSED")

func _init_runtime_settings() -> void:
	_setting_sfx_preset = String(_runtime_options.sfx_preset)
	_setting_impact_scale = 1.0
	_setting_window_mode = "fullscreen" if DisplayServer.window_get_mode() == DisplayServer.WINDOW_MODE_FULLSCREEN else "windowed"

	if _allow_runtime_settings_load():
		_load_runtime_settings()

	if _sfx_slots:
		_sfx_slots.apply_preset(_setting_sfx_preset)
	if _camera_fx and _camera_fx.has_method("set_impact_scale"):
		_camera_fx.set_impact_scale(_setting_impact_scale)
	_apply_window_mode(_setting_window_mode)

func _allow_runtime_settings_load() -> bool:
	if DisplayServer.get_name() == "headless":
		return false
	if bool(_runtime_options.is_automation_mode()):
		return false
	return true

func _load_runtime_settings() -> void:
	var cfg := ConfigFile.new()
	if cfg.load(_SETTINGS_PATH) != OK:
		return
	_setting_sfx_preset = String(cfg.get_value("options", "sfx_preset", _setting_sfx_preset))
	_setting_impact_scale = float(cfg.get_value("options", "impact_scale", _setting_impact_scale))
	_setting_window_mode = String(cfg.get_value("options", "window_mode", _setting_window_mode))

func _save_runtime_settings() -> void:
	if not _allow_runtime_settings_load():
		return
	var cfg := ConfigFile.new()
	cfg.set_value("options", "sfx_preset", _setting_sfx_preset)
	cfg.set_value("options", "impact_scale", _setting_impact_scale)
	cfg.set_value("options", "window_mode", _setting_window_mode)
	cfg.save(_SETTINGS_PATH)

func _apply_window_mode(mode: String) -> void:
	if DisplayServer.get_name() == "headless":
		return
	if mode == "fullscreen":
		DisplayServer.window_set_mode(DisplayServer.WINDOW_MODE_FULLSCREEN)
	else:
		DisplayServer.window_set_mode(DisplayServer.WINDOW_MODE_WINDOWED)

func _process_fps_probe(delta: float) -> void:
	if not _fps_probe_enabled:
		return
	if DisplayServer.get_name() == "headless":
		return

	var fps: float = float(Engine.get_frames_per_second())
	if fps <= 0.0:
		return

	_fps_probe_samples += 1
	_fps_probe_sum += fps
	_fps_probe_min = min(_fps_probe_min, fps)
	_fps_probe_max = max(_fps_probe_max, fps)

	_fps_probe_tick_left -= delta
	if _fps_probe_tick_left > 0.0:
		return
	_fps_probe_tick_left = 5.0
	var avg: float = _fps_probe_sum / max(1.0, float(_fps_probe_samples))
	print("FPS_PROBE_SAMPLE:cur=%.1f,avg=%.1f,min=%.1f,max=%.1f,samples=%d" % [fps, avg, _fps_probe_min, _fps_probe_max, _fps_probe_samples])

func _on_title_quit_requested() -> void:
	get_tree().quit()

func _open_upgrade_history_menu() -> void:
	if _history_menu_open:
		return
	if _title_menu_open:
		return
	if _tree_menu_open:
		return
	if _level_up_panel and _level_up_panel.visible:
		return
	if _upgrade_history_panel:
		_upgrade_history_panel.show_entries(Array(_state.levelup_history))
	_history_menu_open = true
	_state.is_paused = true
	_player.set_enabled(false)
	print("UPGRADE_HISTORY_OPEN")

func _close_upgrade_history_menu() -> void:
	if not _history_menu_open:
		return
	_history_menu_open = false
	if _upgrade_history_panel:
		_upgrade_history_panel.hide_panel()
	if not _state.is_game_over and not _tree_menu_open and not (_level_up_panel and _level_up_panel.visible):
		_state.is_paused = false
		_player.set_enabled(true)
	print("UPGRADE_HISTORY_CLOSED")

func _record_levelup_choice(choice: Dictionary, result: Dictionary) -> void:
	var entry := {
		"level": int(_state.level),
		"title": String(result.get("title", choice.get("title", "Unknown"))),
		"role": _resolve_upgrade_role(choice),
		"effects": _extract_choice_effect_lines(choice),
		"time_sec": snappedf(float(_state.elapsed), 0.1)
	}
	_state.levelup_history.append(entry)
	while _state.levelup_history.size() > 48:
		_state.levelup_history.remove_at(0)
	if _history_menu_open and _upgrade_history_panel:
		_upgrade_history_panel.show_entries(Array(_state.levelup_history))

func _resolve_upgrade_role(choice: Dictionary) -> String:
	var seen_roles: Dictionary = {}
	for raw_effect in _extract_choice_effects(choice):
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

func _extract_choice_effects(choice: Dictionary) -> Array:
	if choice.has("effects"):
		return Array(choice.get("effects", []))
	return [{"key": String(choice.get("effect_key", "")), "value": choice.get("effect_value", 0)}]

func _extract_choice_effect_lines(choice: Dictionary) -> Array:
	var lines: Array = []
	for raw_effect in _extract_choice_effects(choice):
		lines.append(_format_effect_brief(raw_effect))
	return lines

func _format_effect_brief(raw_effect: Variant) -> String:
	var effect: Dictionary = raw_effect
	var key: String = String(effect.get("key", ""))
	var value: Variant = effect.get("value", 0)
	match key:
		"attack_interval_reduction":
			return "공격주기 -%d%%" % int(round(float(value) * 100.0))
		"projectile_damage_bonus":
			return "피해 +%d" % int(value)
		"projectile_speed_bonus":
			return "탄속 +%d" % int(round(float(value)))
		"projectile_radius_bonus":
			return "반경 +%.1f" % float(value)
		"projectile_lifetime_bonus":
			return "수명 +%.2fs" % float(value)
		"attack_range_bonus":
			return "사거리 +%d" % int(round(float(value)))
		"extra_projectiles":
			return "추가탄 +%d" % int(value)
		"player_speed_bonus":
			return "이속 +%d" % int(round(float(value)))
		"dash_cooldown_reduction":
			return "대시쿨 -%d%%" % int(round(float(value) * 100.0))
		"player_invuln_bonus":
			return "무적 +%.2fs" % float(value)
		"max_hp_plus_heal":
			return "최대HP+%d/회복+%d" % [int(value), int(value)]
		"instant_heal":
			return "즉시회복 +%d" % int(value)
		_:
			return "%s %+s" % [key, str(value)]

func _pick_auto_levelup_index(choices: Array) -> int:
	return int(_levelup_advisor.pick_best_choice_index(choices))

func _clear_container(container: Node2D) -> void:
	for node in container.get_children():
		node.queue_free()
