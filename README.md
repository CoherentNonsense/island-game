# Submission for olc::CodeJam

(if i finish)


## Packet Protocol

Packets start with a packet id and can be followed by numbers and strings

Writing this down here so I can reference it.

---

|packet id|description|type|
|---------|-----------|----|
|__client messages__|
|000|host a game|[]|
|001|join a game|[gameId: string, username: string]|
|002|quit|[]|
|__host messages__|
|100|joined game|[initialgamestate...]
|__server messages__|
|200|game not responding|[]|
|200|hosted game|[gameId: number]|
