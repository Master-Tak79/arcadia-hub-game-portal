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
const MiniBossDirector := preload("res://scripts/systems/miniboss_director.gd")
const QaRuntime := preload("res://scripts/systems/qa_runtime.gd")
const BossRewardRuntime := preload("res://scripts/systems/boss_reward_runtime.gd")

const LevelUpPanel := preload("res://scripts/ui/level_up_panel.gd")
const EventBanner := preload("res://scripts/ui/event_banner.gd")
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
var _miniboss_director: Node

var _qa_runtime: RefCounted
var _boss_reward_runtime: RefCounted

var _level_up_panel: CanvasLayer
var _event_banner: CanvasLayer
var _sfx_slots: Node

var _current_level_choices: Array = []
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
		float(_runtime_options.boss_hp_scale_override)
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

	_event_banner = EventBanner.new()
	add_child(_event_banner)

	_sfx_slots = SfxSlots.new()
	add_child(_sfx_slots)
	if _sfx_slots and _sfx_slots.has_method("apply_preset"):
		_sfx_slots.apply_preset(String(_runtime_options.sfx_preset))

	_qa_runtime = QaRuntime.new()
	_qa_runtime.setup(_runtime_options, _balance, _state, _player)

	_boss_reward_runtime = BossRewardRuntime.new()
	_boss_reward_runtime.setup(_balance, _state, _signal_bus, _miniboss_director, _event_banner, _camera_fx, _sfx_slots)

	_start_round()
	_runtime_options.print_enabled_flags()
	print("RELIC_SURVIVOR_BOOT_OK")

func _process(delta: float) -> void:
	_boss_reward_runtime.process(delta)
	_track_game_over_edge()

	if _state.is_game_over:
		if bool(_runtime_options.qa_auto_restart):
			if _qa_runtime.process_game_over(delta):
				_restart_round()
				print("QA_AUTO_RESTART_TRIGGERED")
			return
		if Input.is_action_just_pressed("restart"):
			_restart_round()
		return

	if _state.is_paused:
		_process_levelup_pause()
		return

	_state.elapsed += delta
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
	elif not _state.is_game_over:
		_last_game_over = false

func _process_levelup_pause() -> void:
	if not bool(_runtime_options.auto_levelup):
		return
	if _current_level_choices.is_empty():
		return
	var auto_idx: int = _pick_auto_levelup_index(_current_level_choices)
	_on_level_up_choice_selected(auto_idx)

func _clamp_player_inside_arena() -> void:
	_player.position.x = clamp(_player.position.x, 0.0, float(_balance.ARENA_SIZE.x))
	_player.position.y = clamp(_player.position.y, 0.0, float(_balance.ARENA_SIZE.y))

func _update_pressure_hint() -> void:
	var active_count: int = 0
	if _spawn_director and _spawn_director.has_method("get_active_enemy_count"):
		active_count = int(_spawn_director.get_active_enemy_count())

	var soft_cap: float = max(1.0, float(_balance.ACTIVE_ENEMY_SOFT_CAP))
	var hard_cap: float = max(soft_cap + 1.0, float(_balance.ACTIVE_ENEMY_HARD_CAP))

	var pressure: float = 0.0
	if float(active_count) <= soft_cap:
		pressure = float(active_count) / soft_cap
	else:
		pressure = 1.0 + ((float(active_count) - soft_cap) / max(1.0, hard_cap - soft_cap))

	if _miniboss_director and _miniboss_director.has_method("is_warning_active") and bool(_miniboss_director.is_warning_active()):
		pressure += 0.18
	if _miniboss_director and _miniboss_director.has_method("is_boss_alive") and bool(_miniboss_director.is_boss_alive()):
		pressure += 0.34

	pressure = clampf(pressure, 0.0, 2.0)
	_state.pressure_hint = pressure
	if pressure < 0.50:
		_state.pressure_band = "low"
	elif pressure < 0.95:
		_state.pressure_band = "mid"
	else:
		_state.pressure_band = "high"

func _start_round() -> void:
	_state.reset()
	_runtime_options.apply_round_boost_if_needed(_state)

	_current_level_choices = []
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
	if _miniboss_director and _miniboss_director.has_method("reset_runtime"):
		_miniboss_director.reset_runtime()
	if _level_up_panel and _level_up_panel.has_method("hide_panel"):
		_level_up_panel.hide_panel()
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
