extends RefCounted

const TABLE := {
	"default": {
		"id": "default",
		"title": "Wanderer",
		"max_hp_bonus": 0,
		"move_speed_bonus": 0.0,
		"attack_interval_reduction": 0.0,
		"dash_cooldown_reduction": 0.0,
		"invuln_bonus": 0.0
	},
	"ranger": {
		"id": "ranger",
		"title": "Ranger",
		"max_hp_bonus": -1,
		"move_speed_bonus": 52.0,
		"attack_interval_reduction": 0.05,
		"dash_cooldown_reduction": 0.10,
		"invuln_bonus": 0.00
	},
	"warden": {
		"id": "warden",
		"title": "Warden",
		"max_hp_bonus": 3,
		"move_speed_bonus": -20.0,
		"attack_interval_reduction": 0.00,
		"dash_cooldown_reduction": 0.00,
		"invuln_bonus": 0.14
	}
}

func get_profile(character_id: String) -> Dictionary:
	var cid: String = String(character_id).strip_edges().to_lower()
	if not TABLE.has(cid):
		cid = "default"
	return Dictionary(TABLE.get(cid, TABLE["default"]))
