extends RefCounted

const TABLE := {
	"default": {
		"id": "default",
		"title": "Relic Bolt",
		"damage_mult": 1.00,
		"speed_mult": 1.00,
		"radius_bonus": 0.0,
		"pierce": 0,
		"dot_damage": 0,
		"dot_duration": 0.0,
		"dot_tick": 0.0,
		"aoe_radius": 0.0,
		"aoe_mult": 0.0,
		"color": "#FCD34D"
	},
	"pierce": {
		"id": "pierce",
		"title": "Prism Lance",
		"damage_mult": 0.86,
		"speed_mult": 1.08,
		"radius_bonus": -0.6,
		"pierce": 2,
		"dot_damage": 0,
		"dot_duration": 0.0,
		"dot_tick": 0.0,
		"aoe_radius": 0.0,
		"aoe_mult": 0.0,
		"color": "#67E8F9"
	},
	"dot": {
		"id": "dot",
		"title": "Ash Seeder",
		"damage_mult": 0.72,
		"speed_mult": 0.96,
		"radius_bonus": 0.0,
		"pierce": 0,
		"dot_damage": 1,
		"dot_duration": 2.4,
		"dot_tick": 0.5,
		"aoe_radius": 0.0,
		"aoe_mult": 0.0,
		"color": "#F97316"
	},
	"aoe": {
		"id": "aoe",
		"title": "Echo Mortar",
		"damage_mult": 0.90,
		"speed_mult": 0.92,
		"radius_bonus": 1.0,
		"pierce": 0,
		"dot_damage": 0,
		"dot_duration": 0.0,
		"dot_tick": 0.0,
		"aoe_radius": 66.0,
		"aoe_mult": 0.55,
		"color": "#A78BFA"
	}
}

func get_profile(weapon_id: String) -> Dictionary:
	var wid: String = String(weapon_id).strip_edges().to_lower()
	if not TABLE.has(wid):
		wid = "default"
	return Dictionary(TABLE.get(wid, TABLE["default"]))
