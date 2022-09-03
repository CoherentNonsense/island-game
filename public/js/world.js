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

export function enterLocation(userId, location) {
  if (!LocationData[location].players.includes(userId)) {
    LocationData[location].players.push(userId);
  }
}

export function leaveLocation(userId) {
  locations.forEach((location) => {
    LocationData[location].players = LocationData[location].players.filter(player => userId !== player);
  });
}

export function whereIs(userId) {
  let here = null;
  locations.forEach((location, id) => {
    if (LocationData[location].players.includes(userId)) {
      here = IdToLocation[id];
    }
  });

  return here;
}


// A directed graph between locations
export const worldGraph = {
  [Location.Start]: [Location.Start, Location.Dummies, Location.TutPort],
  [Location.Dummies]: [Location.Dummies, Location.Start, Location.TutPort],
  [Location.TutPort]: [Location.TutPort, Location.Dummies, Location.Start],
  [Location.CityLg]: [Location.CityLg, Location.CrossRoad],
  [Location.CrossRoad]: [Location.CrossRoad, Location.CityLg, Location.Statue, Location.CityMd],
  [Location.Statue]: [Location.Status, Location.CrossRoad],
  [Location.CityMd]: [Location.CityMd, Location.CrossRoad],
  [Location.Trees]: [Location.Trees, Location.CrossRoad],
}

export const locations = [
  Location.Start,
  Location.Dummies,
  Location.TutPort,
  Location.CityLg,
  Location.CrossRoad,
  Location.Statue,
  Location.CityMd,
  Location.Trees,
]

export let LocationToId = {};
export let IdToLocation = {};

locations.forEach((location, i) => {
  LocationToId[location] = i;
  IdToLocation[i] = location;
});