extends RefCounted

const MetaPerks := preload("res://scripts/data/meta_perks.gd")

const PROFILE_PATH := "user://meta_profile.json"

var _state: RefCounted
var _event_banner: CanvasLayer
var _meta_test: bool = false

var _meta_perks: RefCounted
var _profile: Dictionary = {}

func setup(state: RefCounted, event_banner: CanvasLayer, meta_test: bool = false) -> void:
	_state = state
	_event_banner = event_banner
	_meta_test = meta_test
	_meta_perks = MetaPerks.new()
	_profile = _load_profile()

	if _meta_test:
		_bootstrap_meta_test_profile()
	ensure_tree_profile()

	_sync_state_view()
	print("META_PROFILE_LOADED")

func ensure_tree_profile() -> void:
	var changed: bool = false
	if not _profile.has("tree_unlocks"):
		_profile["tree_unlocks"] = {"ranger_tree": [], "warden_tree": []}
		changed = true
	if not _profile.has("tree_last_spent"):
		_profile["tree_last_spent"] = {}
		changed = true
	if changed:
		_save_profile()
		_sync_state_view()

func ensure_min_shards(min_shards: int) -> void:
	var target: int = max(0, min_shards)
	if int(_profile.get("shards", 0)) >= target:
		return
	_profile["shards"] = target
	_save_profile()
	_sync_state_view()

func spend_shards(amount: int) -> bool:
	var cost: int = max(0, amount)
	var shards: int = int(_profile.get("shards", 0))
	if cost <= 0:
		return true
	if shards < cost:
		return false
	_profile["shards"] = shards - cost
	_save_profile()
	_sync_state_view()
	return true

func get_tree_unlocks() -> Dictionary:
	ensure_tree_profile()
	return Dictionary(_profile.get("tree_unlocks", {})).duplicate(true)

func set_tree_unlocks(tree_unlocks: Dictionary, tree_last_spent: Dictionary = {}) -> void:
	_profile["tree_unlocks"] = Dictionary(tree_unlocks).duplicate(true)
	if not tree_last_spent.is_empty():
		_profile["tree_last_spent"] = Dictionary(tree_last_spent).duplicate(true)
	_save_profile()
	_sync_state_view()

func apply_round_start_modifiers() -> void:
	if _state == null:
		return

	var ranks: Dictionary = Dictionary(_profile.get("perk_ranks", {}))
	var vitality_rank: int = int(ranks.get("vitality", 0))
	var celerity_rank: int = int(ranks.get("celerity", 0))
	var focus_rank: int = int(ranks.get("focus", 0))

	var hp_bonus: int = vitality_rank
	var speed_bonus: float = float(celerity_rank) * 10.0
	var attack_interval_bonus: float = float(focus_rank) * 0.015

	_state.max_hp += hp_bonus
	_state.hp = _state.max_hp
	_state.player_speed_bonus += speed_bonus
	_state.attack_interval_reduction += attack_interval_bonus

	if hp_bonus > 0 or speed_bonus > 0.0 or attack_interval_bonus > 0.0:
		print("META_PERK_APPLIED:hp+%d,speed+%.1f,cadence+%.3f" % [hp_bonus, speed_bonus, attack_interval_bonus])

	_sync_state_view()

func on_run_finished(kills: int, boss_defeated: bool) -> void:
	var earned: int = _compute_run_reward(kills, boss_defeated)
	_profile["shards"] = int(_profile.get("shards", 0)) + earned
	_profile["total_runs"] = int(_profile.get("total_runs", 0)) + 1
	_profile["total_kills"] = int(_profile.get("total_kills", 0)) + max(0, kills)
	if boss_defeated:
		_profile["boss_kills"] = int(_profile.get("boss_kills", 0)) + 1

	var auto_upgrades: int = 2 if _meta_test else 1
	for _i in range(auto_upgrades):
		if not _try_auto_unlock_next_perk():
			break

	_save_profile()
	_sync_state_view()
	_state.meta_last_reward = earned

	if _event_banner:
		_event_banner.show_message("🧬 META +%d SHARDS" % earned, 0.95, Color("#4C1D95"))
	print("META_RUN_REWARD:earned=%d,total=%d" % [earned, int(_profile.get("shards", 0))])

func _compute_run_reward(kills: int, boss_defeated: bool) -> int:
	var reward: int = 1 + int(floor(float(max(0, kills)) / 25.0))
	if boss_defeated:
		reward += 3
	return clampi(reward, 1, 12)

func _try_auto_unlock_next_perk() -> bool:
	var ranks: Dictionary = Dictionary(_profile.get("perk_ranks", {}))
	for perk_id in _meta_perks.get_order():
		var perk: Dictionary = _meta_perks.get_perk(String(perk_id))
		if perk.is_empty():
			continue

		var rank: int = int(ranks.get(String(perk_id), 0))
		var max_rank: int = int(perk.get("max_rank", 1))
		if rank >= max_rank:
			continue

		var cost: int = _perk_cost(perk, rank)
		var shards: int = int(_profile.get("shards", 0))
		if shards < cost:
			continue

		ranks[String(perk_id)] = rank + 1
		_profile["perk_ranks"] = ranks
		_profile["shards"] = shards - cost
		print("META_PERK_UNLOCKED:%s:%d" % [String(perk_id), rank + 1])
		return true

	return false

func _perk_cost(perk: Dictionary, rank: int) -> int:
	var base_cost: int = int(perk.get("cost_base", 1))
	var step_cost: int = int(perk.get("cost_step", 0))
	return max(1, base_cost + rank * step_cost)

func _sync_state_view() -> void:
	if _state == null:
		return
	_state.meta_shards = int(_profile.get("shards", 0))
	_state.meta_total_runs = int(_profile.get("total_runs", 0))
	_state.meta_total_kills = int(_profile.get("total_kills", 0))
	_state.meta_boss_kills = int(_profile.get("boss_kills", 0))
	_state.meta_perk_ranks = Dictionary(_profile.get("perk_ranks", {}))
	_state.tree_unlocks = Dictionary(_profile.get("tree_unlocks", {})).duplicate(true)
	_state.tree_last_spent = Dictionary(_profile.get("tree_last_spent", {})).duplicate(true)

func _bootstrap_meta_test_profile() -> void:
	var shards: int = int(_profile.get("shards", 0))
	if shards < 4:
		_profile["shards"] = 4
		_save_profile()
		print("META_TEST_BOOTSTRAP")

func _default_profile() -> Dictionary:
	return {
		"version": 1,
		"shards": 0,
		"total_runs": 0,
		"total_kills": 0,
		"boss_kills": 0,
		"perk_ranks": _meta_perks.ensure_ranks({}),
		"tree_unlocks": {
			"ranger_tree": [],
			"warden_tree": []
		},
		"tree_last_spent": {}
	}

func _normalize_profile(raw: Dictionary) -> Dictionary:
	var profile: Dictionary = _default_profile()
	profile["version"] = int(raw.get("version", 1))
	profile["shards"] = max(0, int(raw.get("shards", 0)))
	profile["total_runs"] = max(0, int(raw.get("total_runs", 0)))
	profile["total_kills"] = max(0, int(raw.get("total_kills", 0)))
	profile["boss_kills"] = max(0, int(raw.get("boss_kills", 0)))
	profile["perk_ranks"] = _meta_perks.ensure_ranks(Dictionary(raw.get("perk_ranks", {})))
	var tree_unlocks_raw: Dictionary = Dictionary(raw.get("tree_unlocks", {}))
	var tree_unlocks: Dictionary = {
		"ranger_tree": Array(tree_unlocks_raw.get("ranger_tree", [])).duplicate(),
		"warden_tree": Array(tree_unlocks_raw.get("warden_tree", [])).duplicate()
	}
	profile["tree_unlocks"] = tree_unlocks
	profile["tree_last_spent"] = Dictionary(raw.get("tree_last_spent", {})).duplicate(true)
	return profile

func _load_profile() -> Dictionary:
	if not FileAccess.file_exists(PROFILE_PATH):
		return _default_profile()

	var file: FileAccess = FileAccess.open(PROFILE_PATH, FileAccess.READ)
	if file == null:
		return _default_profile()

	var text: String = file.get_as_text()
	var parsed: Variant = JSON.parse_string(text)
	if typeof(parsed) != TYPE_DICTIONARY:
		return _default_profile()

	return _normalize_profile(Dictionary(parsed))

func _save_profile() -> void:
	var file: FileAccess = FileAccess.open(PROFILE_PATH, FileAccess.WRITE)
	if file == null:
		return
	file.store_string(JSON.stringify(_profile, "\t"))
	print("META_PROFILE_SAVED")
