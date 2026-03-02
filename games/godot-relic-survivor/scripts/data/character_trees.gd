extends RefCounted

const TREES := {
	"ranger_tree": {
		"id": "ranger_tree",
		"character_id": "ranger",
		"nodes": [
			{"id": "swift_draw", "tree_id": "ranger_tree", "tier": 1, "cost": 1, "requires": [], "effects": [{"key": "attack_interval_reduction", "value": 0.04}]},
			{"id": "trail_step", "tree_id": "ranger_tree", "tier": 1, "cost": 1, "requires": [], "effects": [{"key": "player_speed_bonus", "value": 18.0}]},
			{"id": "pierce_tuning", "tree_id": "ranger_tree", "tier": 2, "cost": 2, "requires": ["swift_draw"], "effects": [{"key": "weapon_pierce_bonus", "value": 1}, {"key": "weapon_damage_mult_mul", "value": 0.94}]},
			{"id": "burst_battery", "tree_id": "ranger_tree", "tier": 2, "cost": 2, "requires": ["trail_step"], "effects": [{"key": "active_skill_cooldown_scale_mul", "value": 0.88}]},
			{"id": "phantom_lane", "tree_id": "ranger_tree", "tier": 3, "cost": 3, "requires": ["pierce_tuning"], "effects": [{"key": "player_speed_bonus", "value": 12.0}, {"key": "attack_interval_reduction", "value": 0.03}]}
		]
	},
	"warden_tree": {
		"id": "warden_tree",
		"character_id": "warden",
		"nodes": [
			{"id": "iron_frame", "tree_id": "warden_tree", "tier": 1, "cost": 1, "requires": [], "effects": [{"key": "max_hp_bonus", "value": 2}]},
			{"id": "anchor_step", "tree_id": "warden_tree", "tier": 1, "cost": 1, "requires": [], "effects": [{"key": "player_invuln_bonus", "value": 0.06}]},
			{"id": "pulse_relay", "tree_id": "warden_tree", "tier": 2, "cost": 2, "requires": ["iron_frame"], "effects": [{"key": "active_skill_pulse_radius_bonus", "value": 18.0}]},
			{"id": "fortress_plate", "tree_id": "warden_tree", "tier": 2, "cost": 2, "requires": ["anchor_step"], "effects": [{"key": "contact_damage_reduction", "value": 1}]},
			{"id": "guardian_echo", "tree_id": "warden_tree", "tier": 3, "cost": 3, "requires": ["pulse_relay"], "effects": [{"key": "active_skill_guardian_echo", "value": true}]}
		]
	}
}

func get_tree_by_character(character_id: String) -> Dictionary:
	match String(character_id):
		"ranger":
			return Dictionary(TREES.get("ranger_tree", {}))
		"warden":
			return Dictionary(TREES.get("warden_tree", {}))
		_:
			return {}

func get_node(tree: Dictionary, node_id: String) -> Dictionary:
	for raw in Array(tree.get("nodes", [])):
		var node: Dictionary = raw
		if String(node.get("id", "")) == node_id:
			return node
	return {}

func list_nodes(tree: Dictionary) -> Array:
	return Array(tree.get("nodes", [])).duplicate(true)
