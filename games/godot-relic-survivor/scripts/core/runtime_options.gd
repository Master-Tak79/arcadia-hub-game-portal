extends RefCounted

var boss_spawn_time_override: float = -1.0
var boss_hp_scale_override: float = 1.0
var boss_test_boost: bool = false
var boss_pattern_test: bool = false
var boss_phase2_test: bool = false
var elite_test: bool = false
var relic_test: bool = false
var event_test: bool = false
var meta_test: bool = false
var character_test: bool = false
var tree_test: bool = false
var tree_ui_test: bool = false
var feel_test: bool = false
var mission_test: bool = false
var elite_variant_test: bool = false
var character_id: String = "default"
var weapon_id: String = "default"

var auto_levelup: bool = false

var qa_auto_restart: bool = false
var qa_restart_delay: float = 0.8

var qa_force_damage: bool = false
var qa_force_damage_interval: float = 0.9

var qa_autopilot: bool = false

var sfx_preset: String = "default"  # default | quiet | hype
var fps_probe: bool = false

func parse_user_args(args: Array) -> void:
	for arg in args:
		if arg == "--boss-test" or arg == "boss-test":
			boss_spawn_time_override = 12.0
			boss_hp_scale_override = 0.25
			boss_test_boost = true
			boss_pattern_test = false
			boss_phase2_test = false
		elif arg == "--boss-pattern-test" or arg == "boss-pattern-test":
			boss_spawn_time_override = 12.0
			boss_hp_scale_override = 1.0
			boss_test_boost = false
			boss_pattern_test = true
			boss_phase2_test = false
		elif arg == "--boss-phase2-test" or arg == "boss-phase2-test":
			boss_spawn_time_override = 12.0
			boss_hp_scale_override = 0.78
			boss_test_boost = true
			boss_pattern_test = false
			boss_phase2_test = true
		elif arg == "--elite-test" or arg == "elite-test":
			elite_test = true
		elif arg == "--relic-test" or arg == "relic-test":
			relic_test = true
		elif arg == "--event-test" or arg == "event-test":
			event_test = true
		elif arg == "--meta-test" or arg == "meta-test":
			meta_test = true
		elif arg == "--character-test" or arg == "character-test":
			character_test = true
			if character_id == "default":
				character_id = "ranger"
		elif arg == "--tree-test" or arg == "tree-test":
			tree_test = true
			if character_id == "default":
				character_id = "ranger"
		elif arg == "--tree-ui-test" or arg == "tree-ui-test":
			tree_ui_test = true
			if character_id == "default":
				character_id = "ranger"
		elif arg == "--feel-test" or arg == "feel-test":
			feel_test = true
		elif arg == "--mission-test" or arg == "mission-test":
			mission_test = true
		elif arg == "--elite-variant-test" or arg == "elite-variant-test":
			elite_variant_test = true
		elif String(arg).begins_with("--character="):
			character_id = _sanitize_character_id(String(arg).get_slice("=", 1))
		elif String(arg).begins_with("character="):
			character_id = _sanitize_character_id(String(arg).get_slice("=", 1))
		elif String(arg).begins_with("--weapon="):
			weapon_id = _sanitize_weapon_id(String(arg).get_slice("=", 1))
		elif String(arg).begins_with("weapon="):
			weapon_id = _sanitize_weapon_id(String(arg).get_slice("=", 1))
		elif arg == "--auto-levelup" or arg == "auto-levelup":
			auto_levelup = true
		elif arg == "--qa-auto-restart" or arg == "qa-auto-restart":
			qa_auto_restart = true
		elif arg == "--qa-force-damage" or arg == "qa-force-damage":
			qa_force_damage = true
		elif arg == "--qa-autopilot" or arg == "qa-autopilot":
			qa_autopilot = true
		elif String(arg).begins_with("--sfx-preset="):
			sfx_preset = _sanitize_sfx_preset(String(arg).get_slice("=", 1))
		elif String(arg).begins_with("--sfx="):
			sfx_preset = _sanitize_sfx_preset(String(arg).get_slice("=", 1))
		elif arg == "--fps-probe" or arg == "fps-probe":
			fps_probe = true

func apply_round_boost_if_needed(state: RefCounted) -> void:
	if not boss_test_boost:
		return
	state.max_hp = 20
	state.hp = 20
	state.attack_interval_reduction = 0.35
	state.attack_range_bonus = 180.0
	state.projectile_damage_bonus = 2
	state.extra_projectiles = 1
	state.player_invuln_bonus = 0.25

func print_enabled_flags() -> void:
	if boss_spawn_time_override > 0.0:
		print("BOSS_TEST_MODE_ON")
	if boss_test_boost:
		print("BOSS_TEST_BOOST_ON")
	if boss_pattern_test:
		print("BOSS_PATTERN_TEST_ON")
	if boss_phase2_test:
		print("BOSS_PHASE2_TEST_ON")
	if auto_levelup:
		print("AUTO_LEVELUP_ON")
	if elite_test:
		print("ELITE_TEST_ON")
	if relic_test:
		print("RELIC_TEST_ON")
	if event_test:
		print("EVENT_TEST_ON")
	if meta_test:
		print("META_TEST_ON")
	if character_test:
		print("CHARACTER_TEST_ON")
	if tree_test:
		print("TREE_TEST_ON")
	if tree_ui_test:
		print("TREE_UI_TEST_ON")
	if feel_test:
		print("FEEL_TEST_ON")
	if mission_test:
		print("MISSION_TEST_ON")
	if elite_variant_test:
		print("ELITE_VARIANT_TEST_ON")
	if character_id != "default":
		print("CHARACTER_OVERRIDE:%s" % character_id)
	if weapon_id != "default":
		print("WEAPON_OVERRIDE:%s" % weapon_id)
	if qa_auto_restart:
		print("QA_AUTO_RESTART_ON")
	if qa_force_damage:
		print("QA_FORCE_DAMAGE_ON")
	if qa_autopilot:
		print("QA_AUTOPILOT_ON")
	if sfx_preset != "default":
		print("SFX_PRESET:%s" % sfx_preset)
	if fps_probe:
		print("FPS_PROBE_ON")

func _sanitize_sfx_preset(raw: String) -> String:
	var preset := raw.strip_edges().to_lower()
	match preset:
		"default", "quiet", "hype":
			return preset
		_:
			return "default"

func _sanitize_character_id(raw: String) -> String:
	var cid := raw.strip_edges().to_lower()
	match cid:
		"default", "ranger", "warden":
			return cid
		_:
			return "default"

func _sanitize_weapon_id(raw: String) -> String:
	var wid := raw.strip_edges().to_lower()
	match wid:
		"default", "pierce", "dot", "aoe":
			return wid
		_:
			return "default"

func is_automation_mode() -> bool:
	if auto_levelup or qa_autopilot or qa_force_damage or qa_auto_restart:
		return true
	if boss_test_boost or boss_pattern_test or boss_phase2_test:
		return true
	if elite_test or relic_test or event_test or meta_test:
		return true
	if character_test or tree_test or tree_ui_test:
		return true
	if feel_test or mission_test or elite_variant_test:
		return true
	return false

