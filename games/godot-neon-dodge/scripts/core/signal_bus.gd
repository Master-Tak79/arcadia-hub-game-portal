extends RefCounted

signal player_damaged(delta_hp: int)
signal hp_changed(value: int)
signal score_changed(value: int)
signal game_over(final_score: int)
