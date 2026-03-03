extends RefCounted

static func load_texture(path: String) -> Texture2D:
	var image := Image.new()
	var err: int = image.load(ProjectSettings.globalize_path(path))
	if err != OK:
		return null
	return ImageTexture.create_from_image(image)
