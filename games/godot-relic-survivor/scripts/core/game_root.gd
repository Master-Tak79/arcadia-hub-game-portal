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

var _current_level_choices: Array = []
var _boss_spawn_time_override: float = -1.0
var _boss_hp_scale_override: float = 1.0
var _boss_test_boost: bool = false
var _auto_levelup: bool = false

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

	_start_round()
	if _boss_spawn_time_override > 0.0:
		print("BOSS_TEST_MODE_ON")
	if _boss_test_boost:
		print("BOSS_TEST_BOOST_ON")
	if _auto_levelup:
		print("AUTO_LEVELUP_ON")
	print("RELIC_SURVIVOR_BOOT_OK")

func _process(delta: float) -> void:
	if _state.is_game_over:
		if Input.is_action_just_pressed("restart"):
			_restart_round()
		return

	if _state.is_paused:
		if _auto_levelup and not _current_level_choices.is_empty():
			var auto_idx: int = _pick_auto_levelup_index(_current_level_choices)
			_on_level_up_choice_selected(auto_idx)
		return

	_state.elapsed += delta

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

func _detect_runtime_modes() -> void:
	for arg in OS.get_cmdline_user_args():
		if arg == "--boss-test" or arg == "boss-test":
			_boss_spawn_time_override = 12.0
			_boss_hp_scale_override = 0.25
			_boss_test_boost = true
		elif arg == "--auto-levelup" or arg == "auto-levelup":
			_auto_levelup = true

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
