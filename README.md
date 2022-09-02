# Island Game

Tiny RPG adventure set on a island with 'dynamic' terrain based on the weather. 

<hr>

## Submission for olc::CodeJam

[Itch.io Page](https://itch.io/jam/olc-codejam-2022)

## Screenshots


![game thumbnail](/misc/seasons.gif)

![game thumbnail](/misc/temp.gif)


## Packet Protocol

Packets start with a packet id and can be followed by numbers and strings

Writing this down here so I can reference it.

---

|packet id|description|type|
|---------|-----------|----|
|__client messages__|
|000|host a game|[]|
|001|join a game|[gameId: string, username: string]|
|002|leave game|[]|
|003|enter location|[userId: number, locationId: number]|
|004|leave location|[userId: number]|
|005|speak|[message: string]|
|__host messages__|
|n/a|
|__server messages__|
|200|game ended|[]|
|201|host id doesn't exist|[]|
|202|player left|[gameId: number]|
|203|receive userId|[userId: number]|
