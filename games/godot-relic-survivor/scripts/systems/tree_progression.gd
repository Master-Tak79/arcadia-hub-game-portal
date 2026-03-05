extends RefCounted

const CharacterTrees := preload("res://scripts/data/character_trees.gd")

var _state: RefCounted
var _runtime_options: RefCounted
var _meta_progression: RefCounted
var _event_banner: CanvasLayer
var _tree_test: bool = false
var _tree_ui_test: bool = false

var _character_trees: RefCounted
var _test_tree_reset_done: bool = false

func setup(
	state: RefCounted,
	runtime_options: RefCounted,
	meta_progression: RefCounted,
	event_banner: CanvasLayer,
	tree_test: bool = false,
	tree_ui_test: bool = false
) -> void:
	_state = state
	_runtime_options = runtime_options
	_meta_progression = meta_progression
	_event_banner = event_banner
	_tree_test = tree_test
	_tree_ui_test = tree_ui_test
	_character_trees = CharacterTrees.new()

	if _meta_progression and _meta_progression.has_method("ensure_tree_profile"):
		_meta_progression.ensure_tree_profile()

	if (_tree_test or _tree_ui_test) and _meta_progression and _meta_progression.has_method("ensure_min_shards"):
		_meta_progression.ensure_min_shards(6)
		if _tree_test:
			print("TREE_TEST_BOOTSTRAP")
		if _tree_ui_test:
			print("TREE_UI_TEST_BOOTSTRAP")

	_test_tree_reset_done = false

	_sync_state_tree()
	print("TREE_PROFILE_LOADED")

func apply_round_start_modifiers() -> void:
	if _state == null or _meta_progression == null:
		return

	var tree: Dictionary = _get_current_tree()
	if tree.is_empty():
		_sync_state_tree()
		return

	if (_tree_test or _tree_ui_test) and not _test_tree_reset_done:
		_reset_tree_for_test(String(tree.get("id", "")))
		_test_tree_reset_done = true

	if _tree_test:
		_auto_unlock_first_available(tree)

	_sync_state_tree()
	_apply_unlocked_nodes(tree)

func get_tree_ui_options(max_items: int = 3) -> Array:
	var tree: Dictionary = _get_current_tree()
	if tree.is_empty():
		return []

	var tree_id: String = String(tree.get("id", ""))
	var tree_unlocks: Dictionary = _get_tree_unlocks()
	var unlocked: Array = Array(tree_unlocks.get(tree_id, []))
	var unlocked_set: Dictionary = _build_unlocked_set(unlocked)

	var ready_nodes: Array = []
	var blocked_nodes: Array = []
	for raw_node in _character_trees.list_nodes(tree):
		var node: Dictionary = raw_node
		var node_id: String = String(node.get("id", ""))
		if node_id == "" or unlocked_set.has(node_id):
			continue
		var check: Dictionary = _evaluate_unlock_state(node, unlocked_set)
		var node_copy: Dictionary = node.duplicate(true)
		node_copy["can_unlock"] = bool(check.get("can_unlock", false))
		node_copy["reason"] = String(check.get("reason", ""))
		if bool(node_copy.get("can_unlock", false)):
			ready_nodes.append(node_copy)
		else:
			blocked_nodes.append(node_copy)

	var merged: Array = ready_nodes
	merged.append_array(blocked_nodes)
	var result: Array = []
	for i in range(min(max_items, merged.size())):
		result.append(merged[i])
	return result

func try_unlock_node(node_id: String) -> Dictionary:
	var tree: Dictionary = _get_current_tree()
	if tree.is_empty():
		return {"ok": false, "reason": "tree 없음"}

	var node: Dictionary = _character_trees.get_node(tree, node_id)
	if node.is_empty():
		return {"ok": false, "reason": "node 없음"}

	var tree_id: String = String(tree.get("id", ""))
	var tree_unlocks: Dictionary = _get_tree_unlocks()
	var unlocked: Array = Array(tree_unlocks.get(tree_id, [])).duplicate()
	var unlocked_set: Dictionary = _build_unlocked_set(unlocked)
	if unlocked_set.has(node_id):
		return {"ok": false, "reason": "이미 해금"}

	var check: Dictionary = _evaluate_unlock_state(node, unlocked_set)
	if not bool(check.get("can_unlock", false)):
		return {"ok": false, "reason": String(check.get("reason", "잠김"))}

	var cost: int = int(node.get("cost", 1))
	if not _meta_progression.has_method("spend_shards") or not bool(_meta_progression.spend_shards(cost)):
		return {"ok": false, "reason": "샤드 부족"}

	unlocked.append(node_id)
	tree_unlocks[tree_id] = unlocked
	if _meta_progression.has_method("set_tree_unlocks"):
		_meta_progression.set_tree_unlocks(tree_unlocks, {
			"node_id": node_id,
			"cost": cost,
			"tree_id": tree_id,
			"at": int(Time.get_unix_time_from_system())
		})

	_sync_state_tree()
	print("TREE_NODE_UNLOCKED:%s" % node_id)
	if _event_banner:
		_event_banner.show_message("🌿 TREE UNLOCK: %s" % node_id, 0.85, Color("#065F46"))

	return {"ok": true, "node_id": node_id, "cost": cost}

func _reset_tree_for_test(tree_id: String) -> void:
	if tree_id == "":
		return
	if _meta_progression == null:
		return

	if _meta_progression.has_method("ensure_min_shards"):
		_meta_progression.ensure_min_shards(6)

	var tree_unlocks: Dictionary = _get_tree_unlocks()
	tree_unlocks[tree_id] = []
	if _meta_progression.has_method("set_tree_unlocks"):
		_meta_progression.set_tree_unlocks(tree_unlocks, {"tree_id": tree_id, "node_id": "", "cost": 0})
	if _tree_test:
		print("TREE_TEST_PROFILE_RESET")
	if _tree_ui_test:
		print("TREE_UI_TEST_PROFILE_RESET")

func _auto_unlock_first_available(tree: Dictionary) -> void:
	for raw_node in _character_trees.list_nodes(tree):
		var node: Dictionary = raw_node
		var node_id: String = String(node.get("id", ""))
		if node_id == "":
			continue
		var result: Dictionary = try_unlock_node(node_id)
		if bool(result.get("ok", false)):
			return

func _get_current_tree() -> Dictionary:
	if _state == null:
		return {}
	return _character_trees.get_tree_by_character(String(_state.character_id))

func _get_tree_unlocks() -> Dictionary:
	if _meta_progression and _meta_progression.has_method("get_tree_unlocks"):
		return Dictionary(_meta_progression.get_tree_unlocks()).duplicate(true)
	return {}

func _sync_state_tree() -> void:
	if _state == null:
		return
	if _meta_progression and _meta_progression.has_method("get_tree_unlocks"):
		_state.tree_unlocks = Dictionary(_meta_progression.get_tree_unlocks()).duplicate(true)

func _build_unlocked_set(unlocked: Array) -> Dictionary:
	var unlocked_set: Dictionary = {}
	for node_id in unlocked:
		unlocked_set[String(node_id)] = true
	return unlocked_set

func _evaluate_unlock_state(node: Dictionary, unlocked_set: Dictionary) -> Dictionary:
	if not _can_unlock_requirements(node, unlocked_set):
		return {"can_unlock": false, "reason": "선행 노드 필요"}
	var cost: int = int(node.get("cost", 1))
	var shards: int = int(_state.meta_shards) if _state != null else 0
	if shards < cost:
		return {"can_unlock": false, "reason": "샤드 부족"}
	return {"can_unlock": true, "reason": ""}

func _can_unlock_requirements(node: Dictionary, unlocked_set: Dictionary) -> bool:
	for required in Array(node.get("requires", [])):
		if not unlocked_set.has(String(required)):
			return false
	return true

func _apply_unlocked_nodes(tree: Dictionary) -> void:
	var tree_id: String = String(tree.get("id", ""))
	var tree_unlocks: Dictionary = _get_tree_unlocks()
	var unlocked: Array = Array(tree_unlocks.get(tree_id, []))
	var unlocked_set: Dictionary = _build_unlocked_set(unlocked)

	var applied_count: int = 0
	for raw_node in _character_trees.list_nodes(tree):
		var node: Dictionary = raw_node
		var node_id: String = String(node.get("id", ""))
		if node_id == "" or not unlocked_set.has(node_id):
			continue
		_apply_node_effects(node)
		applied_count += 1

	if applied_count > 0:
		print("TREE_APPLIED:%s" % String(_state.character_id))

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
