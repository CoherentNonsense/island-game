# Island Game

Tiny RPG adventure set on a island with 'dynamic' terrain based on the weather. 

<hr>

## Submission for olc::CodeJam

[Itch.io Page](https://itch.io/jam/olc-codejam-2022)

## Screenshots

**Dynamic world**

barely

![game thumbnail](/misc/seasons.gif)

**Multiplayer**

![game thumbnail](/misc/game.gif)


## Local Build

##### Prerequisites

Install [Node](https://nodejs.org/)

##### 1 - Clone Repository
```
git clone https://github.com/CoherentNonsense/island-game.git
```
##### 2 - Download dependecies
```
cd island-game
npm install
```
##### 3 - Run development development server
```
npm run dev
```

Go to [http://localhost:8080/](http://localhost:8080)


## Packet Protocol

Packets start with a packet id and can be followed by numbers and strings

Writing this down here so I can reference it.

<hr>

|packet id|description|type|
|---------|-----------|----|
|__client messages__|
|000|host a game|[]|
|001|join a game|[gameId: string, username: string]|
|002|leave game|[]|
|003|enter location|[userId: number, locationId: number]|
|004|leave location|[userId: number]|
|005|speak|[message: string]|
|006|join party|[partyPassword: string, userId: number]|
|007|make party|[partyPassword: string]|
|008|join party accepted|[userId: number, memberId: number, ...repeated for all party members, end: -1]|
|009|leave party|[userId: number]|
|010|assign party leader|[partyPassword: string, userId: number]|
|011|party exists|[partyPassword: string]|
|012|party leader location selection|[leaderId: number, selection: number]|
|013|party enter combat|[leaderId: number, monsterId: number]|
|014|party submit attack|[leaderId: number, weaponId: number, damage: number]|
|015|party submit enemy attack (sent by party leader)|[leaderId: number, attackId: number, damage: number]
|__host messages__|
|100|update new player with game data|[locationId: number, userId: number, ...repeated for all players, end: -1]
|__server messages__|
|200|game ended|[]|
|201|host id doesn't exist|[]|
|202|player left|[gameId: number]|
|203|receive userId|[userId: number]|
|204|host id already exists|[]|