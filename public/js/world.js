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

export const LocationData = {
  [Location.Start]: {
    name: "Tutorial Island",
    position: [22, 142],
    players: [],
  },
  [Location.Dummies]: {
    name: "Fighting Dummies",
    position: [14, 126],
    players: [],
  },
  [Location.TutPort]: {
    position: [46, 129],
    name: "Port",
    players: [],
  }
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
  [Location.TutPort]: [Location.Dummies, Location.Start]
}