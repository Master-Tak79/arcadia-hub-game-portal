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
const EventBanner := preload("res://scripts/ui/event_banner.gd")
const StageEventOverlay := preload("res://scripts/ui/stage_event_overlay.gd")
const SfxSlots := preload("res://scripts/audio/sfx_slots.gd")

@onready var _player: Node2D = $Player
@onready var _enemy_container: Node2D = $EnemyContainer
@onready var _projectile_container: Node2D = $ProjectileContainer
@onready var _camera_fx: Camera2D = $GameCamera
@onready var _hud: CanvasLayer = $HUD

var _state: RefCounted
var _signal_bus: RefCounted
var _balance: RefCounted
var _input_actions: RefCounted
var _runtime_options: RefCounted

var _spawn_director: Node
var _auto_attack_system: Node
var _combat_system: Node
var _upgrade_system: Node
var _relic_system: Node
var _miniboss_director: Node

var _stage_event_system: RefCounted

var _qa_runtime: RefCounted
var _boss_reward_runtime: RefCounted
var _meta_progression: RefCounted
var _tree_progression: RefCounted
var _mission_system: RefCounted
var _pressure_runtime: RefCounted
var _levelup_advisor: RefCounted
var _character_system: RefCounted
var _weapon_system: RefCounted
var _active_skill_system: Node

var _level_up_panel: CanvasLayer
var _tree_panel: CanvasLayer
var _event_banner: CanvasLayer
var _stage_event_overlay: Node2D
var _sfx_slots: Node

var _current_level_choices: Array = []
var _current_tree_options: Array = []
var _tree_menu_open: bool = false
var _tree_ui_test_done: bool = false
var _last_game_over: bool = false

func _ready() -> void:
	_state = GameState.new()
	_signal_bus = SignalBus.new()
	_balance = Balance.new()
	_input_actions = InputActions.new()
	_runtime_options = RuntimeOptions.new()

	_runtime_options.parse_user_args(OS.get_cmdline_user_args())
	_input_actions.ensure_default_bindings()

	_player.setup(_balance, _state)
	_hud.setup(_state, _player, _enemy_container, _projectile_container)

	_spawn_director = SpawnDirector.new()
	add_child(_spawn_director)
	_spawn_director.setup(_balance, _state, _player, _enemy_container)
	if _spawn_director.has_method("set_elite_test_mode"):
		_spawn_director.set_elite_test_mode(bool(_runtime_options.elite_test))
	if _spawn_director.has_method("set_elite_variant_test_mode"):
		_spawn_director.set_elite_variant_test_mode(bool(_runtime_options.elite_variant_test))

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
	if _spawn_director and _spawn_director.has_method("set_miniboss_director"):
		_spawn_director.set_miniboss_director(_miniboss_director)

	_level_up_panel = LevelUpPanel.new()
	add_child(_level_up_panel)
	if _level_up_panel.has_method("set_context"):
		_level_up_panel.set_context(_state, _balance)
	elif _level_up_panel.has_method("set_state"):
		_level_up_panel.set_state(_state)
	_level_up_panel.choice_selected.connect(_on_level_up_choice_selected)

	_tree_panel = TreePanel.new()
	add_child(_tree_panel)
	_tree_panel.option_selected.connect(_on_tree_option_selected)
	_tree_panel.close_requested.connect(_close_tree_menu)

	_event_banner = EventBanner.new()
	add_child(_event_banner)

	_stage_event_overlay = StageEventOverlay.new()
	add_child(_stage_event_overlay)
	move_child(_stage_event_overlay, 1)
	if _stage_event_overlay.has_method("setup"):
		_stage_event_overlay.setup(_balance, _state)

	_relic_system = RelicSystem.new()
	add_child(_relic_system)
	_relic_system.setup(_balance, _state, _signal_bus, _event_banner, bool(_runtime_options.relic_test))

	_stage_event_system = StageEventSystem.new()
	_stage_event_system.setup(_balance, _state, _signal_bus, _player, _event_banner, _stage_event_overlay, bool(_runtime_options.event_test))

	_sfx_slots = SfxSlots.new()
	add_child(_sfx_slots)
	if _sfx_slots and _sfx_slots.has_method("apply_preset"):
		_sfx_slots.apply_preset(String(_runtime_options.sfx_preset))

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

func _process(delta: float) -> void:
	_boss_reward_runtime.process(delta)
	_track_game_over_edge()

	if _state.is_game_over:
		if Input.is_action_just_pressed("tree_menu"):
			if _tree_menu_open:
				_close_tree_menu()
			else:
				_open_tree_menu()
			return
		if _tree_menu_open:
			_process_tree_menu_pause()
			return
		if bool(_runtime_options.qa_auto_restart):
			if _qa_runtime.process_game_over(delta):
				_restart_round()
				print("QA_AUTO_RESTART_TRIGGERED")
			return
		if Input.is_action_just_pressed("restart"):
			_restart_round()
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

	if _state.is_paused:
		_process_levelup_pause()
		return

	_state.elapsed += delta
	if _stage_event_system and _stage_event_system.has_method("process"):
		_stage_event_system.process(delta)
	if _mission_system and _mission_system.has_method("process"):
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
		if _meta_progression and _meta_progression.has_method("on_run_finished"):
			var boss_defeated: bool = false
			if _miniboss_director and _miniboss_director.has_method("was_boss_defeated"):
				boss_defeated = bool(_miniboss_director.was_boss_defeated())
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
	if _level_up_panel and _level_up_panel.visible:
		return
	if _tree_progression == null or not _tree_progression.has_method("get_tree_ui_options"):
		return

	_current_tree_options = _tree_progression.get_tree_ui_options(3)
	if _tree_panel and _tree_panel.has_method("show_options"):
		_tree_panel.show_options(String(_state.character_title), int(_state.meta_shards), _current_tree_options)

	_tree_menu_open = true
	_state.is_paused = true
	if _player and _player.has_method("set_enabled"):
		_player.set_enabled(false)
	print("TREE_PANEL_OPEN")

func _close_tree_menu() -> void:
	if not _tree_menu_open:
		return
	_tree_menu_open = false
	_current_tree_options = []
	if _tree_panel and _tree_panel.has_method("hide_panel"):
		_tree_panel.hide_panel()
	if not _state.is_game_over:
		_state.is_paused = false
		if _player and _player.has_method("set_enabled"):
			_player.set_enabled(true)
	print("TREE_PANEL_CLOSED")

func _on_tree_option_selected(option_index: int) -> void:
	if option_index < 0 or option_index >= _current_tree_options.size():
		return
	if _tree_progression == null or not _tree_progression.has_method("try_unlock_node"):
		_close_tree_menu()
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
	if _pressure_runtime and _pressure_runtime.has_method("update_pressure_hint"):
		_pressure_runtime.update_pressure_hint()

func _start_round() -> void:
	_state.reset()
	_runtime_options.apply_round_boost_if_needed(_state)
	if _character_system and _character_system.has_method("apply_round_start_profile"):
		_character_system.apply_round_start_profile()
	if _weapon_system and _weapon_system.has_method("apply_round_start_profile"):
		_weapon_system.apply_round_start_profile()
	if _meta_progression and _meta_progression.has_method("apply_round_start_modifiers"):
		_meta_progression.apply_round_start_modifiers()
	if _tree_progression and _tree_progression.has_method("apply_round_start_modifiers"):
		_tree_progression.apply_round_start_modifiers()
	if _active_skill_system and _active_skill_system.has_method("reset_round"):
		_active_skill_system.reset_round()

	_current_level_choices = []
	_current_tree_options = []
	_tree_menu_open = false
	_tree_ui_test_done = false
	_last_game_over = false

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
	if _relic_system and _relic_system.has_method("reset_runtime"):
		_relic_system.reset_runtime()
	if _stage_event_system and _stage_event_system.has_method("reset_runtime"):
		_stage_event_system.reset_runtime()
	if _mission_system and _mission_system.has_method("reset_runtime"):
		_mission_system.reset_runtime()
	if _miniboss_director and _miniboss_director.has_method("reset_runtime"):
		_miniboss_director.reset_runtime()
	if _level_up_panel and _level_up_panel.has_method("hide_panel"):
		_level_up_panel.hide_panel()
	if _tree_panel and _tree_panel.has_method("hide_panel"):
		_tree_panel.hide_panel()
	if _event_banner:
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

func _pick_auto_levelup_index(choices: Array) -> int:
	if _levelup_advisor and _levelup_advisor.has_method("pick_best_choice_index"):
		return int(_levelup_advisor.pick_best_choice_index(choices))
	return 0

func _clear_container(container: Node2D) -> void:
	for node in container.get_children():
		node.queue_free()
