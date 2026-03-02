extends RefCounted

const Characters := preload("res://scripts/data/characters.gd")

var _state: RefCounted
var _options: RefCounted
var _characters: RefCounted

func setup(state: RefCounted, options: RefCounted) -> void:
	_state = state
	_options = options
	_characters = Characters.new()

func apply_round_start_profile() -> void:
	if _state == null or _options == null:
		return

	var profile: Dictionary = _characters.get_profile(String(_options.character_id))
	var character_id: String = String(profile.get("id", "default"))
	var title: String = String(profile.get("title", "Wanderer"))

	_state.character_id = character_id
	_state.character_title = title

	var hp_bonus: int = int(profile.get("max_hp_bonus", 0))
	var speed_bonus: float = float(profile.get("move_speed_bonus", 0.0))
	var attack_bonus: float = float(profile.get("attack_interval_reduction", 0.0))
	var dash_bonus: float = float(profile.get("dash_cooldown_reduction", 0.0))
	var invuln_bonus: float = float(profile.get("invuln_bonus", 0.0))

	_state.max_hp = max(1, _state.max_hp + hp_bonus)
	_state.hp = _state.max_hp
	_state.player_speed_bonus += speed_bonus
	_state.attack_interval_reduction += attack_bonus
	_state.dash_cooldown_reduction += dash_bonus
	_state.player_invuln_bonus += invuln_bonus

	print("CHARACTER_SELECTED:%s" % character_id)
	if character_id != "default":
		print("CHARACTER_PROFILE_APPLIED:%s" % title)
