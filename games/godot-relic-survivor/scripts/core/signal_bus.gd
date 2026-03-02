extends RefCounted

signal hp_changed(value: int)
signal level_changed(value: int)
signal exp_changed(current: int, needed: int)
signal kills_changed(value: int)
signal level_up_opened(level: int)
signal level_up_closed(level: int)
signal upgrade_applied(upgrade_id: String, stack: int)
signal relic_obtained(relic_id: String, title: String, stack: int)
signal stage_event_started(event_id: String, title: String)
signal stage_event_ended(event_id: String)
signal game_over(final_kills: int)
