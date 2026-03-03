extends RefCounted

var max_hp: int = 5
var hp: int = 5

var level: int = 1
var exp: int = 0
var exp_to_next: int = 12

var elapsed: float = 0.0
var kills: int = 0
var elite_kills: int = 0
var dash_uses: int = 0

var mission_id: String = ""
var mission_title: String = ""
var mission_progress: int = 0
var mission_target: int = 0
var mission_reward_exp: int = 0
var mission_active: bool = false
var mission_time_left: float = 0.0
var mission_completed_count: int = 0

var pressure_hint: float = 0.0
var pressure_band: String = "low"

var death_reason: String = ""
var death_context: String = ""

var character_id: String = "default"
var character_title: String = "Wanderer"
var weapon_id: String = "default"
var weapon_title: String = "Relic Bolt"
var weapon_profile: Dictionary = {}

var active_skill_id: String = ""
var active_skill_title: String = ""
var active_skill_cooldown_left: float = 0.0
var active_skill_active_left: float = 0.0

var tree_unlocks: Dictionary = {}
var tree_last_spent: Dictionary = {}

var contact_damage_reduction: int = 0
var active_skill_cooldown_scale: float = 1.0
var active_skill_pulse_radius_bonus: float = 0.0
var active_skill_guardian_echo: bool = false

var event_move_speed_mult: float = 1.0
var event_attack_range_mult: float = 1.0
var active_event_id: String = ""
var active_event_label: String = ""
var active_event_phase: String = ""
var active_event_time_left: float = 0.0

var is_game_over: bool = false
var is_paused: bool = false

var upgrade_stacks: Dictionary = {}
var relic_stacks: Dictionary = {}
var relic_titles: Dictionary = {}
var relic_order: Array = []
var relic_obtained_count: int = 0
var relic_last_title: String = ""
var relic_last_desc: String = ""

var meta_shards: int = 0
var meta_total_runs: int = 0
var meta_total_kills: int = 0
var meta_boss_kills: int = 0
var meta_last_reward: int = 0
var meta_perk_ranks: Dictionary = {}

# Upgrade-driven runtime modifiers
var attack_interval_reduction: float = 0.0
var attack_range_bonus: float = 0.0
var projectile_speed_bonus: float = 0.0
var projectile_damage_bonus: int = 0
var projectile_radius_bonus: float = 0.0
var projectile_lifetime_bonus: float = 0.0
var extra_projectiles: int = 0

var player_speed_bonus: float = 0.0
var dash_cooldown_reduction: float = 0.0
var player_invuln_bonus: float = 0.0

func reset() -> void:
	max_hp = 5
	hp = 5

	level = 1
	exp = 0
	exp_to_next = 12

	elapsed = 0.0
	kills = 0
	elite_kills = 0
	dash_uses = 0
	mission_id = ""
	mission_title = ""
	mission_progress = 0
	mission_target = 0
	mission_reward_exp = 0
	mission_active = false
	mission_time_left = 0.0
	mission_completed_count = 0
	pressure_hint = 0.0
	pressure_band = "low"
	death_reason = ""
	death_context = ""
	character_id = "default"
	character_title = "Wanderer"
	weapon_id = "default"
	weapon_title = "Relic Bolt"
	weapon_profile = {}
	active_skill_id = ""
	active_skill_title = ""
	active_skill_cooldown_left = 0.0
	active_skill_active_left = 0.0
	tree_unlocks = {}
	tree_last_spent = {}
	contact_damage_reduction = 0
	active_skill_cooldown_scale = 1.0
	active_skill_pulse_radius_bonus = 0.0
	active_skill_guardian_echo = false
	event_move_speed_mult = 1.0
	event_attack_range_mult = 1.0
	active_event_id = ""
	active_event_label = ""
	active_event_phase = ""
	active_event_time_left = 0.0

	is_game_over = false
	is_paused = false

	upgrade_stacks = {}
	relic_stacks = {}
	relic_titles = {}
	relic_order = []
	relic_obtained_count = 0
	relic_last_title = ""
	relic_last_desc = ""

	meta_shards = 0
	meta_total_runs = 0
	meta_total_kills = 0
	meta_boss_kills = 0
	meta_last_reward = 0
	meta_perk_ranks = {}

	attack_interval_reduction = 0.0
	attack_range_bonus = 0.0
	projectile_speed_bonus = 0.0
	projectile_damage_bonus = 0
	projectile_radius_bonus = 0.0
	projectile_lifetime_bonus = 0.0
	extra_projectiles = 0

	player_speed_bonus = 0.0
	dash_cooldown_reduction = 0.0
	player_invuln_bonus = 0.0

func gain_exp(amount: int) -> void:
	exp += max(0, amount)

func can_level_up() -> bool:
	return exp >= exp_to_next

func consume_level_up() -> void:
	exp -= exp_to_next
	level += 1
	var next_value: int = int(round(float(exp_to_next) * 1.25 + 3.0))
	exp_to_next = clampi(next_value, 10, 9999)

func add_upgrade_stack(upgrade_id: String) -> int:
	var current: int = int(upgrade_stacks.get(upgrade_id, 0))
	current += 1
	upgrade_stacks[upgrade_id] = current
	return current

func get_upgrade_stack(upgrade_id: String) -> int:
	return int(upgrade_stacks.get(upgrade_id, 0))
