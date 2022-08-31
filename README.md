# Submission for olc::CodeJam

(if i finish)


## Packet Protocol

Packets start with a packet id and can be followed by numbers and strings

Writing this down here so I can reference it.

---

|packet id|description|type|
|---------|-----------|----|
|__client messages__|
|0|host a game|n/a|
|1|join a game|[gameId: number]|
|__server messages__|
|100|hosted game|[gameId: number]|
|101|joined game|[initialgamestate...]
|102|game ended|n/a|