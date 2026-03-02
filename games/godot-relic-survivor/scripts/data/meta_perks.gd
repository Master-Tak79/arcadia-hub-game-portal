extends RefCounted

const ORDER := ["vitality", "celerity", "focus"]

const TABLE := {
	"vitality": {
		"id": "vitality",
		"title": "Ancient Vitality",
		"max_rank": 5,
		"cost_base": 2,
		"cost_step": 1,
		"effect": "max_hp",
		"value": 1
	},
	"celerity": {
		"id": "celerity",
		"title": "Ancient Celerity",
		"max_rank": 5,
		"cost_base": 2,
		"cost_step": 1,
		"effect": "move_speed",
		"value": 10.0
	},
	"focus": {
		"id": "focus",
		"title": "Ancient Focus",
		"max_rank": 5,
		"cost_base": 3,
		"cost_step": 1,
		"effect": "attack_interval_reduction",
		"value": 0.015
	}
}

func get_order() -> Array:
	return ORDER.duplicate()

func get_perk(perk_id: String) -> Dictionary:
	return Dictionary(TABLE.get(perk_id, {}))

func ensure_ranks(source: Dictionary) -> Dictionary:
	var ranks: Dictionary = {}
	for perk_id in ORDER:
		ranks[perk_id] = max(0, int(source.get(perk_id, 0)))
	return ranks
