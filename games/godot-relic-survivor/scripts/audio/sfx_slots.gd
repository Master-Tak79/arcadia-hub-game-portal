extends Node

const SLOT_BOSS_WARNING := "boss_warning"
const SLOT_BOSS_SPAWN := "boss_spawn"
const SLOT_BOSS_DEFEAT := "boss_defeat"

const _DEFAULT_SLOT_PATHS := {
	SLOT_BOSS_WARNING: "res://assets/audio/boss_warning.ogg",
	SLOT_BOSS_SPAWN: "res://assets/audio/boss_spawn.ogg",
	SLOT_BOSS_DEFEAT: "res://assets/audio/boss_defeat.ogg"
}

const _DEFAULT_SLOT_VOLUMES := {
	SLOT_BOSS_WARNING: -10.5,
	SLOT_BOSS_SPAWN: -8.0,
	SLOT_BOSS_DEFEAT: -6.5
}

const _DEFAULT_SLOT_PITCH_JITTER := {
	SLOT_BOSS_WARNING: 0.03,
	SLOT_BOSS_SPAWN: 0.02,
	SLOT_BOSS_DEFEAT: 0.015
}

var _players: Dictionary = {}
var _missing_reported: Dictionary = {}

func _ready() -> void:
	_create_slot(SLOT_BOSS_WARNING)
	_create_slot(SLOT_BOSS_SPAWN)
	_create_slot(SLOT_BOSS_DEFEAT)
	configure_default_paths()

func configure_default_paths() -> void:
	for slot in _DEFAULT_SLOT_PATHS.keys():
		var path: String = String(_DEFAULT_SLOT_PATHS[slot])
		set_slot_stream_from_path(String(slot), path)

func set_slot_stream(slot: String, stream: AudioStream) -> void:
	if not _players.has(slot):
		return
	var player: AudioStreamPlayer = _players[slot]
	player.stream = stream

func set_slot_stream_from_path(slot: String, resource_path: String) -> void:
	if not _players.has(slot):
		return

	# 1) Regular resource loading
	if ResourceLoader.exists(resource_path):
		var stream := load(resource_path)
		if stream is AudioStream:
			set_slot_stream(slot, stream)
			return

	# 2) Fallback for direct OGG files on filesystem
	var abs_path: String = ProjectSettings.globalize_path(resource_path)
	if FileAccess.file_exists(abs_path):
		var ogg_stream := AudioStreamOggVorbis.load_from_file(abs_path)
		if ogg_stream:
			set_slot_stream(slot, ogg_stream)

func play_slot(slot: String) -> void:
	if not _players.has(slot):
		return
	var player: AudioStreamPlayer = _players[slot]
	if player.stream == null:
		if not bool(_missing_reported.get(slot, false)):
			_missing_reported[slot] = true
			print("SFX_SLOT_UNASSIGNED:%s" % slot)
		return

	var jitter: float = float(_DEFAULT_SLOT_PITCH_JITTER.get(slot, 0.0))
	player.pitch_scale = 1.0 + randf_range(-jitter, jitter)
	if player.playing:
		player.stop()
	player.play()

func play_boss_warning() -> void:
	play_slot(SLOT_BOSS_WARNING)

func play_boss_spawn() -> void:
	play_slot(SLOT_BOSS_SPAWN)

func play_boss_defeat() -> void:
	play_slot(SLOT_BOSS_DEFEAT)

func _create_slot(slot: String) -> void:
	var player := AudioStreamPlayer.new()
	player.name = "Sfx_%s" % slot
	player.bus = "Master"
	player.volume_db = float(_DEFAULT_SLOT_VOLUMES.get(slot, -8.0))
	add_child(player)
	_players[slot] = player
