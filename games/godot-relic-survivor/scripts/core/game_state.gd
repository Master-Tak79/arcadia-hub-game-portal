extends RefCounted

var max_hp: int = 5
var hp: int = 5

var level: int = 1
var exp: int = 0
var exp_to_next: int = 12

var elapsed: float = 0.0
var kills: int = 0

var pressure_hint: float = 0.0
var pressure_band: String = "low"

var death_reason: String = ""
var death_context: String = ""

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
	pressure_hint = 0.0
	pressure_band = "low"
	death_reason = ""
	death_context = ""
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
