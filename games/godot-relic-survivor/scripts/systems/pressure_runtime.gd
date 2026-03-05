extends RefCounted

var _balance: RefCounted
var _state: RefCounted
var _spawn_director: Node
var _miniboss_director: Node

func setup(balance: RefCounted, state: RefCounted, spawn_director: Node, miniboss_director: Node) -> void:
	_balance = balance
	_state = state
	_spawn_director = spawn_director
	_miniboss_director = miniboss_director

func set_spawn_director(spawn_director: Node) -> void:
	_spawn_director = spawn_director

func set_miniboss_director(miniboss_director: Node) -> void:
	_miniboss_director = miniboss_director

func update_pressure_hint() -> void:
	if _state == null or _balance == null:
		return

	var active_count: int = 0
	if _spawn_director and _spawn_director.has_method("get_active_enemy_count"):
		active_count = int(_spawn_director.get_active_enemy_count())

	var soft_cap: float = max(1.0, float(_balance.ACTIVE_ENEMY_SOFT_CAP))
	var hard_cap: float = max(soft_cap + 1.0, float(_balance.ACTIVE_ENEMY_HARD_CAP))

	var pressure: float = 0.0
	if float(active_count) <= soft_cap:
		pressure = float(active_count) / soft_cap
	else:
		pressure = 1.0 + ((float(active_count) - soft_cap) / max(1.0, hard_cap - soft_cap))

	if _miniboss_director and _miniboss_director.has_method("is_warning_active") and bool(_miniboss_director.is_warning_active()):
		pressure += 0.18
	if _miniboss_director and _miniboss_director.has_method("is_boss_alive") and bool(_miniboss_director.is_boss_alive()):
		pressure += 0.34

	pressure = clampf(pressure, 0.0, 2.0)
	_state.pressure_hint = pressure
	if pressure < 0.50:
		_state.pressure_band = "low"
	elif pressure < 0.95:
		_state.pressure_band = "mid"
	else:
		_state.pressure_band = "high"
