const VisibilityState = Object.freeze({
  HIDDEN: "hidden",
  DISCOVERED: "discovered",
  OWNED: "owned"
});

const worldData = {
  villages: [
    {
      name: "Crownhold",
      coordinates: { x: 0, y: 0 },
      level: 4,
      state: VisibilityState.OWNED,
      resources: { gold: 200, wood: 200, stone: 200, food: 200 }
    },
    {
      name: "Greenfield",
      coordinates: { x: 10, y: 0 },
      level: 1,
      state: VisibilityState.OWNED,
      resources: { gold: 50, wood: 50, stone: 50, food: 50 }
    },
    {
      name: "Oakridge",
      coordinates: { x: 0, y: 10 },
      level: 1,
      state: VisibilityState.DISCOVERED,
      resources: { gold: 40, wood: 60, stone: 50, food: 50 }
    },
    {
      name: "Stonebrook",
      coordinates: { x: -10, y: 0 },
      level: 1,
      state: VisibilityState.HIDDEN,
      resources: { gold: 55, wood: 45, stone: 50, food: 50 }
    },
    {
      name: "Rivermarch",
      coordinates: { x: 0, y: -10 },
      level: 2,
      state: VisibilityState.DISCOVERED,
      resources: { gold: 70, wood: 70, stone: 70, food: 70 }
    },
    {
      name: "Highgrove",
      coordinates: { x: 20, y: 20 },
      level: 2,
      state: VisibilityState.HIDDEN,
      resources: { gold: 80, wood: 60, stone: 70, food: 70 }
    },
    {
      name: "Ironwatch",
      coordinates: { x: -20, y: 20 },
      level: 3,
      state: VisibilityState.HIDDEN,
      resources: { gold: 100, wood: 100, stone: 100, food: 100 }
    },
    {
      name: "Blackspire",
      coordinates: { x: 20, y: -20 },
      level: 3,
      state: VisibilityState.HIDDEN,
      resources: { gold: 100, wood: 100, stone: 100, food: 100 }
    }
  ]
};
