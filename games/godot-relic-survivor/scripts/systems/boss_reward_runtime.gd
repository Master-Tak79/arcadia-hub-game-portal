extends RefCounted

var _balance: RefCounted
var _state: RefCounted
var _signal_bus: RefCounted
var _miniboss_director: Node
var _event_banner: CanvasLayer
var _camera_fx: Camera2D
var _sfx_slots: Node

var _last_warning_active: bool = false
var _last_boss_alive: bool = false
var _last_boss_phase: int = 0
var _last_phase_transition: bool = false
var _last_dash_telegraph: bool = false
var _last_summon_telegraph: bool = false
var _boss_reward_applied: bool = false
var _slowmo_time_left: float = 0.0

var _pending_warning_sfx: float = -1.0
var _pending_spawn_sfx: float = -1.0
var _pending_defeat_sfx: float = -1.0
var _dash_telegraph_sfx_cd: float = 0.0
var _summon_telegraph_sfx_cd: float = 0.0

func setup(
	balance: RefCounted,
	state: RefCounted,
	signal_bus: RefCounted,
	miniboss_director: Node,
	event_banner: CanvasLayer,
	camera_fx: Camera2D,
	sfx_slots: Node
) -> void:
	_balance = balance
	_state = state
	_signal_bus = signal_bus
	_miniboss_director = miniboss_director
	_event_banner = event_banner
	_camera_fx = camera_fx
	_sfx_slots = sfx_slots
	reset_round()

func reset_round() -> void:
	_last_warning_active = false
	_last_boss_alive = false
	_last_boss_phase = 0
	_last_phase_transition = false
	_last_dash_telegraph = false
	_last_summon_telegraph = false
	_boss_reward_applied = false
	_slowmo_time_left = 0.0
	_pending_warning_sfx = -1.0
	_pending_spawn_sfx = -1.0
	_pending_defeat_sfx = -1.0
	_dash_telegraph_sfx_cd = 0.0
	_summon_telegraph_sfx_cd = 0.0
	Engine.time_scale = 1.0

func process(delta: float) -> void:
	_dash_telegraph_sfx_cd = max(0.0, _dash_telegraph_sfx_cd - delta)
	_summon_telegraph_sfx_cd = max(0.0, _summon_telegraph_sfx_cd - delta)
	_update_slowmo(delta)
	_process_pending_sfx(delta)
	_process_miniboss_state_transitions()

func _process_miniboss_state_transitions() -> void:
	if _miniboss_director == null:
		return

	var warning_active: bool = false
	if _miniboss_director.has_method("is_warning_active"):
		warning_active = bool(_miniboss_director.is_warning_active())

	var boss_alive: bool = false
	if _miniboss_director.has_method("is_boss_alive"):
		boss_alive = bool(_miniboss_director.is_boss_alive())

	var boss_phase: int = 0
	if _miniboss_director.has_method("get_boss_phase"):
		boss_phase = int(_miniboss_director.get_boss_phase())
	var phase_transition: bool = false
	if _miniboss_director.has_method("is_boss_phase_transitioning"):
		phase_transition = bool(_miniboss_director.is_boss_phase_transitioning())

	var dash_telegraph: bool = false
	if _miniboss_director.has_method("is_boss_dash_telegraphing"):
		dash_telegraph = bool(_miniboss_director.is_boss_dash_telegraphing())

	var summon_telegraph: bool = false
	if _miniboss_director.has_method("is_boss_summon_telegraphing"):
		summon_telegraph = bool(_miniboss_director.is_boss_summon_telegraphing())

	if warning_active and not _last_warning_active:
		if _event_banner:
			_event_banner.show_message("⚠ WARNING: MINIBOSS APPROACHING", 1.6, Color("#7C2D12"))
		if _camera_fx and _camera_fx.has_method("play_warning_pulse"):
			_camera_fx.play_warning_pulse()
		_pending_warning_sfx = float(_balance.SFX_BOSS_WARNING_DELAY)

	if boss_alive and not _last_boss_alive:
		if _event_banner:
			_event_banner.show_message("⚠ MINIBOSS HAS ENTERED THE ARENA\n초기 1초는 접촉 피해 없음", 1.9, Color("#7C2D12"))
		if _camera_fx and _camera_fx.has_method("play_boss_spawn_impact"):
			_camera_fx.play_boss_spawn_impact()
		_pending_spawn_sfx = float(_balance.SFX_BOSS_SPAWN_DELAY)

	if phase_transition and not _last_phase_transition and boss_alive:
		if _event_banner and _last_boss_phase < 2:
			_event_banner.show_message("⚠ PHASE SHIFT — 패턴 전환 중", 1.05, Color("#7F1D1D"))
		if _camera_fx and _camera_fx.has_method("play_warning_pulse"):
			_camera_fx.play_warning_pulse()

	if boss_phase >= 2 and _last_boss_phase < 2 and boss_alive:
		if _event_banner:
			_event_banner.show_message("🔥 PHASE 2: OVERDRIVE", 1.3, Color("#991B1B"))
		if _camera_fx and _camera_fx.has_method("play_boss_spawn_impact"):
			_camera_fx.play_boss_spawn_impact()
		if _sfx_slots and _sfx_slots.has_method("play_boss_spawn"):
			_sfx_slots.play_boss_spawn()

	if dash_telegraph and not _last_dash_telegraph and boss_alive:
		if _event_banner:
			_event_banner.show_message("⚠ DASH CHARGE — 잠시 옆으로 이탈하세요", 0.72, Color("#7F1D1D"))
		if _camera_fx and _camera_fx.has_method("play_warning_pulse"):
			_camera_fx.play_warning_pulse()
		if _dash_telegraph_sfx_cd <= 0.0 and _sfx_slots and _sfx_slots.has_method("play_boss_warning"):
			_sfx_slots.play_boss_warning()
			_dash_telegraph_sfx_cd = 0.48

	if summon_telegraph and not _last_summon_telegraph and boss_alive:
		var pattern: String = ""
		if _miniboss_director.has_method("get_boss_pending_summon_pattern"):
			pattern = String(_miniboss_director.get_boss_pending_summon_pattern())
		if _event_banner:
			if pattern == "wall":
				_event_banner.show_message("⚠ SUMMON CAST — 전방 차단열 전개", 0.9, Color("#14532D"))
			else:
				_event_banner.show_message("⚠ SUMMON CAST — 소환 링 전개", 0.9, Color("#0F4C5C"))
		if _camera_fx and _camera_fx.has_method("play_warning_pulse"):
			_camera_fx.play_warning_pulse()
		if _summon_telegraph_sfx_cd <= 0.0 and _sfx_slots:
			if pattern == "wall" and _sfx_slots.has_method("play_boss_spawn"):
				_sfx_slots.play_boss_spawn()
			elif _sfx_slots.has_method("play_boss_warning"):
				_sfx_slots.play_boss_warning()
			_summon_telegraph_sfx_cd = 0.62

	if not boss_alive and _last_boss_alive and not _boss_reward_applied:
		_apply_boss_clear_reward()

	_last_warning_active = warning_active
	_last_boss_alive = boss_alive
	_last_boss_phase = boss_phase
	_last_phase_transition = phase_transition
	_last_dash_telegraph = dash_telegraph
	_last_summon_telegraph = summon_telegraph

func _apply_boss_clear_reward() -> void:
	_boss_reward_applied = true

	var reward_exp: int = int(_balance.MINIBOSS_EXP_REWARD)
	var heal: int = 2
	_state.gain_exp(reward_exp)
	_state.hp = min(_state.max_hp, _state.hp + heal)

	if _event_banner:
		_event_banner.show_message("✅ PHASE CLEAR: MINIBOSS DEFEATED\n+%d EXP  +%d HP" % [reward_exp, heal], 2.7, Color("#14532D"))
	_signal_bus.emit_signal("hp_changed", _state.hp)
	_signal_bus.emit_signal("exp_changed", _state.exp, _state.exp_to_next)
	print("BOSS_CLEAR_REWARD_APPLIED")

	if _camera_fx and _camera_fx.has_method("play_boss_defeat_impact"):
		_camera_fx.play_boss_defeat_impact()
	_pending_defeat_sfx = float(_balance.SFX_BOSS_DEFEAT_DELAY)

	_slowmo_time_left = 0.6
	Engine.time_scale = 0.4

func _process_pending_sfx(delta: float) -> void:
	if _pending_warning_sfx >= 0.0:
		_pending_warning_sfx -= delta
		if _pending_warning_sfx <= 0.0:
			_pending_warning_sfx = -1.0
			if _sfx_slots and _sfx_slots.has_method("play_boss_warning"):
				_sfx_slots.play_boss_warning()

	if _pending_spawn_sfx >= 0.0:
		_pending_spawn_sfx -= delta
		if _pending_spawn_sfx <= 0.0:
			_pending_spawn_sfx = -1.0
			if _sfx_slots and _sfx_slots.has_method("play_boss_spawn"):
				_sfx_slots.play_boss_spawn()

	if _pending_defeat_sfx >= 0.0:
		_pending_defeat_sfx -= delta
		if _pending_defeat_sfx <= 0.0:
			_pending_defeat_sfx = -1.0
			if _sfx_slots and _sfx_slots.has_method("play_boss_defeat"):
				_sfx_slots.play_boss_defeat()

func _update_slowmo(delta: float) -> void:
	if _slowmo_time_left <= 0.0:
		return
	_slowmo_time_left -= delta
	if _slowmo_time_left <= 0.0:
		Engine.time_scale = 1.0
