extends RefCounted

static var _cache: Dictionary = {}

static func load_texture(path: String) -> Texture2D:
	var key: String = String(path).strip_edges()
	if key == "":
		return null
	if _cache.has(key):
		return _cache[key] as Texture2D

	var image := Image.new()
	var err: int = image.load(ProjectSettings.globalize_path(key))
	if err != OK:
		return null

	var tex: Texture2D = ImageTexture.create_from_image(image)
	_cache[key] = tex
	return tex

static func clear_cache() -> void:
	_cache.clear()
