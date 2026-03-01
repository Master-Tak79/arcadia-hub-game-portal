extends Node

const SLOT_BOSS_WARNING := "boss_warning"
const SLOT_BOSS_SPAWN := "boss_spawn"
const SLOT_BOSS_DEFEAT := "boss_defeat"

const _DEFAULT_SLOT_PATHS := {
	SLOT_BOSS_WARNING: "res://assets/audio/boss_warning.ogg",
	SLOT_BOSS_SPAWN: "res://assets/audio/boss_spawn.ogg",
	SLOT_BOSS_DEFEAT: "res://assets/audio/boss_defeat.ogg"
}

var _players: Dictionary = {}
var _missing_reported: Dictionary = {}

func _ready() -> void:
	_create_slot(SLOT_BOSS_WARNING, -8.0)
	_create_slot(SLOT_BOSS_SPAWN, -6.0)
	_create_slot(SLOT_BOSS_DEFEAT, -4.0)

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
	if not ResourceLoader.exists(resource_path):
		return

	var stream := load(resource_path)
	if stream is AudioStream:
		set_slot_stream(slot, stream)

func play_slot(slot: String) -> void:
	if not _players.has(slot):
		return
	var player: AudioStreamPlayer = _players[slot]
	if player.stream == null:
		if not bool(_missing_reported.get(slot, false)):
			_missing_reported[slot] = true
			print("SFX_SLOT_UNASSIGNED:%s" % slot)
		return
	player.play()

func play_boss_warning() -> void:
	play_slot(SLOT_BOSS_WARNING)

func play_boss_spawn() -> void:
	play_slot(SLOT_BOSS_SPAWN)

func play_boss_defeat() -> void:
	play_slot(SLOT_BOSS_DEFEAT)

func _create_slot(slot: String, volume_db: float) -> void:
	var player := AudioStreamPlayer.new()
	player.name = "Sfx_%s" % slot
	player.bus = "Master"
	player.volume_db = volume_db
	add_child(player)
	_players[slot] = player
