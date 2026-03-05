extends RefCounted

const Weapons := preload("res://scripts/data/weapons.gd")

var _state: RefCounted
var _options: RefCounted
var _weapons: RefCounted

func setup(state: RefCounted, options: RefCounted) -> void:
	_state = state
	_options = options
	_weapons = Weapons.new()

func apply_round_start_profile() -> void:
	if _state == null or _options == null:
		return

	var selected_id: String = String(_options.weapon_id)
	if selected_id == "default":
		selected_id = _infer_weapon_from_character(String(_state.character_id))

	var profile: Dictionary = _weapons.get_profile(selected_id)
	_state.weapon_id = String(profile.get("id", "default"))
	_state.weapon_title = String(profile.get("title", "Relic Bolt"))
	_state.weapon_profile = profile

	print("WEAPON_SELECTED:%s" % _state.weapon_id)
	if _state.weapon_id != "default":
		print("WEAPON_PROFILE_APPLIED:%s" % _state.weapon_title)

func _infer_weapon_from_character(character_id: String) -> String:
	match character_id:
		"ranger":
			return "pierce"
		"warden":
			return "aoe"
		_:
			return "default"
