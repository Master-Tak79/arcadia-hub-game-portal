extends RefCounted

const CharacterTrees := preload("res://scripts/data/character_trees.gd")

var _state: RefCounted
var _runtime_options: RefCounted
var _meta_progression: RefCounted
var _event_banner: CanvasLayer
var _tree_test: bool = false

var _character_trees: RefCounted

func setup(state: RefCounted, runtime_options: RefCounted, meta_progression: RefCounted, event_banner: CanvasLayer, tree_test: bool = false) -> void:
	_state = state
	_runtime_options = runtime_options
	_meta_progression = meta_progression
	_event_banner = event_banner
	_tree_test = tree_test
	_character_trees = CharacterTrees.new()

	if _meta_progression and _meta_progression.has_method("ensure_tree_profile"):
		_meta_progression.ensure_tree_profile()

	if _tree_test and _meta_progression and _meta_progression.has_method("ensure_min_shards"):
		_meta_progression.ensure_min_shards(6)
		print("TREE_TEST_BOOTSTRAP")

	print("TREE_PROFILE_LOADED")

func apply_round_start_modifiers() -> void:
	if _state == null or _meta_progression == null:
		return

	var character_id: String = String(_state.character_id)
	var tree: Dictionary = _character_trees.get_tree_by_character(character_id)
	if tree.is_empty():
		if _meta_progression.has_method("get_tree_unlocks"):
			_state.tree_unlocks = Dictionary(_meta_progression.get_tree_unlocks())
		return

	if _tree_test:
		_try_unlock_first_available(tree)

	var tree_unlocks: Dictionary = {}
	if _meta_progression.has_method("get_tree_unlocks"):
		tree_unlocks = Dictionary(_meta_progression.get_tree_unlocks())
	_state.tree_unlocks = tree_unlocks

	var tree_id: String = String(tree.get("id", ""))
	var unlocked: Array = Array(tree_unlocks.get(tree_id, []))
	var unlocked_set: Dictionary = {}
	for node_id in unlocked:
		unlocked_set[String(node_id)] = true

	var applied_count: int = 0
	for raw_node in _character_trees.list_nodes(tree):
		var node: Dictionary = raw_node
		var node_id: String = String(node.get("id", ""))
		if node_id == "" or not unlocked_set.has(node_id):
			continue
		_apply_node_effects(node)
		applied_count += 1

	if applied_count > 0:
		print("TREE_APPLIED:%s" % character_id)

func _try_unlock_first_available(tree: Dictionary) -> void:
	var tree_id: String = String(tree.get("id", ""))
	if tree_id == "":
		return

	var tree_unlocks: Dictionary = Dictionary(_meta_progression.get_tree_unlocks()) if _meta_progression.has_method("get_tree_unlocks") else {}
	var unlocked: Array = Array(tree_unlocks.get(tree_id, [])).duplicate()
	var unlocked_set: Dictionary = {}
	for node_id in unlocked:
		unlocked_set[String(node_id)] = true

	for raw_node in _character_trees.list_nodes(tree):
		var node: Dictionary = raw_node
		var node_id: String = String(node.get("id", ""))
		if node_id == "" or unlocked_set.has(node_id):
			continue
		if not _can_unlock_node(node, unlocked_set):
			continue
		var cost: int = int(node.get("cost", 1))
		if not _meta_progression.has_method("spend_shards"):
			return
		if not bool(_meta_progression.spend_shards(cost)):
			continue
		unlocked.append(node_id)
		tree_unlocks[tree_id] = unlocked
		if _meta_progression.has_method("set_tree_unlocks"):
			_meta_progression.set_tree_unlocks(tree_unlocks, {"node_id": node_id, "cost": cost, "tree_id": tree_id})
		print("TREE_NODE_UNLOCKED:%s" % node_id)
		if _event_banner:
			_event_banner.show_message("🌿 TREE UNLOCK: %s" % node_id, 0.85, Color("#065F46"))
		return

func _can_unlock_node(node: Dictionary, unlocked_set: Dictionary) -> bool:
	for required in Array(node.get("requires", [])):
		if not unlocked_set.has(String(required)):
			return false
	return true

func _apply_node_effects(node: Dictionary) -> void:
	for raw_effect in Array(node.get("effects", [])):
		var effect: Dictionary = raw_effect
		var key: String = String(effect.get("key", ""))
		var value: Variant = effect.get("value", 0)
		match key:
			"attack_interval_reduction":
				_state.attack_interval_reduction += float(value)
			"player_speed_bonus":
				_state.player_speed_bonus += float(value)
			"max_hp_bonus":
				_state.max_hp += int(value)
				_state.hp = _state.max_hp
			"player_invuln_bonus":
				_state.player_invuln_bonus += float(value)
			"weapon_pierce_bonus":
				var weapon_profile: Dictionary = Dictionary(_state.weapon_profile)
				weapon_profile["pierce"] = int(weapon_profile.get("pierce", 0)) + int(value)
				_state.weapon_profile = weapon_profile
			"weapon_damage_mult_mul":
				var weapon_profile_mul: Dictionary = Dictionary(_state.weapon_profile)
				weapon_profile_mul["damage_mult"] = float(weapon_profile_mul.get("damage_mult", 1.0)) * float(value)
				_state.weapon_profile = weapon_profile_mul
			"active_skill_cooldown_scale_mul":
				_state.active_skill_cooldown_scale *= float(value)
			"active_skill_pulse_radius_bonus":
				_state.active_skill_pulse_radius_bonus += float(value)
			"contact_damage_reduction":
				_state.contact_damage_reduction += int(value)
			"active_skill_guardian_echo":
				_state.active_skill_guardian_echo = bool(value)
			_:
				pass
