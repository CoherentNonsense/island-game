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
  Grasslands: Symbol("grasslands"),
  Campfire: Symbol("campfire"),
  Ice: Symbol("ice"),
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
  [Location.ForestN]: {
    position: [115, 78],
    players: [],
  },
  [Location.ForestS]: {
    position: [105, 97],
    players: [],
  },
  [Location.Dungeon]: {
    position: [83, 69],
    players: [],
  },
  [Location.TundraS]: {
    position: [65, 43],
    players: [],
  },
  [Location.TundraN]: {
    position: [86, 18],
    players: [],
  },
  [Location.Cave]: {
    position: [25, 36],
    players: [],
  },
  [Location.Grasslands]: {
    position: [41, 88],
    players: [],
  },
  [Location.Campfire]: {
    position: [12, 70],
    players: [],
  },
  [Location.Ice]: {
    position: [123, 26],
    players: [],
  },
  [Location.CitySm]: {
    position: [69, 101],
    players: [],
  },
  [Location.Tower]: {
    position: [113, 49],
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
  [Location.CrossRoad]: [Location.CrossRoad, Location.CityLg, Location.Statue, Location.CityMd],
  [Location.Statue]: [Location.Statue, Location.CrossRoad, Location.Trees, Location.ForestS],
  [Location.CityLg]: [Location.CityLg, Location.CrossRoad],
  [Location.CityMd]: [Location.CityMd, Location.CrossRoad, Location.ForestS],
  [Location.Trees]: [Location.Trees, Location.Statue, Location.CitySm, Location.ForestS],
  [Location.ForestN]: [Location.ForestN, Location.ForestS, Location.Dungeon],
  [Location.ForestS]: [Location.ForestS, Location.ForestN, Location.CitySm, Location.Statue, Location.Trees, Location.CityMd],
  [Location.Dungeon]: [Location.Dungeon, Location.ForestN, Location.TundraS],
  [Location.TundraS]: [Location.TundraS, Location.TundraN, Location.Dungeon],
  [Location.TundraN]: [Location.TundraN, Location.TundraS, Location.Ice],
  [Location.Cave]: [Location.Cave, Location.Campfire],
  [Location.Grasslands]: [Location.Grasslands, Location.Campfire, Location.CitySm],
  [Location.Campfire]: [Location.Campfire, Location.Grasslands, Location.Cave],
  [Location.Ice]: [Location.Ice, Location.Tower, Location.TundraN],
  [Location.CitySm]: [Location.CitySm, Location.Grasslands, Location.Trees],
  [Location.Tower]: [Location.Tower, Location.Ice],
}

export const locations = [
  Location.Start,
  Location.Dummies,
  Location.TutPort,
  Location.CrossRoad,
  Location.Statue,
  Location.CityLg,
  Location.CityMd,
  Location.Trees,
  Location.ForestN,
  Location.ForestS,
  Location.Dungeon,
  Location.TundraS,
  Location.TundraN,
  Location.Cave,
  Location.Grasslands,
  Location.Campfire,
  Location.Ice,
  Location.CitySm,
  Location.Tower,
]

export let LocationToId = {};
export let IdToLocation = {};

locations.forEach((location, i) => {
  LocationToId[location] = i;
  IdToLocation[i] = location;
});