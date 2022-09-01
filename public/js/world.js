export const Location = Object.freeze({
  Start: Symbol("start"),
  Dummies: Symbol("dummies"),
  TutPort: Symbol("tutport"),
  CrossRoad: Symbol("crossroad"),
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

export const LocationData = {
  [Location.Start]: {
    position: [22, 142],
    players: [],
  },
  [Location.Dummies]: {
    position: [14, 126],
    players: [],
  },
  [Location.TutPort]: {
    position: [46, 129],
    players: [],
  },
  [Location.CityLg]: {
    position: [101, 140],
    players: [],
  },
  [Location.CrossRoad]: {
    position: [122, 132],
    players: [],
  },
  [Location.Statue]: {
    position: [117, 119],
    players: [],
  },
  [Location.CityMd]: {
    position: [142, 112],
    players: [],
  },
  [Location.Trees]: {
    position: [88, 118],
    players: [],
  },
};

export function enterLocation(username, location) {
  if (!Location[location].players.find(currentUsername => currentUsername === username)) {
    LocationData[location].players.push(username);
    return true;
  }

  return false;
}


// A directed graph between locations
export const worldGraph = {
  [Location.Start]: [Location.Dummies, Location.TutPort],
  [Location.Dummies]: [Location.Start, Location.TutPort],
  [Location.TutPort]: [Location.Dummies, Location.Start, Location.CityLg],
  [Location.CityLg]: [Location.TutPort, Location.CrossRoad],
  [Location.CrossRoad]: [Location.CityLg, Location.Statue, Location.CityMd],
  [Location.Statue]: [Location.CrossRoad],
  [Location.CityMd]: [Location.CrossRoad],
  [Location.Trees]: [Location.CrossRoad],
}