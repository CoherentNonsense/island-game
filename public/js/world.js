export const Location = Object.freeze({
  Start: Symbol("start"),
  Dummies: Symbol("dummies"),
  TutPort: Symbol("tutport"),
  Statue: Symbol("statue"),
  Trees: Symbol("trees"),
  ForestN: Symbol("forestN"),
  ForestS: Symbol("forestS"),
  Dungeon: Symbol("dungeon"),
  TundraS: Symbol("tundraS"),
  TundraN: Symbol("tundraN"),
  Cave: Symbol("cave"),
  Grassland: Symbol("grassland"),
  Campfire: Symbol("campfire"),
  CitySm: Symbol("CitySm"),
  CityMd: Symbol("CityMd"),
  CityLg: Symbol("CityLg"),
  Tower: Symbol("tower"),  
});

const Options = Object.freeze({
  Enter: Symbol("enter"),
  Fight: Symbol("fight"),
});

export const Locations = {
  [Location.Start]: {
    name: "Tutorial Island",
    position: [22, 142],
    players: [],
  },
  [Location.Dummies]: {
    name: "Fighting Dummies",
    position: [14, 124],
    players: [],
    options: [Options.Fight],
  },
  [Location.TutPort]: {
    position: [46, 129],
    name: "Port",
    players: [],
  }
};


// A directed graph between locations
export const worldGraph = new Map();
worldGraph.set(Location.Start, [Location.Dummies]);
worldGraph.set(Location.Dummies, [Location.Start, Location.TutPort]);
worldGraph.set(Location.TutPort, [Location.Dummies]);
