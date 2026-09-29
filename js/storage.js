const VisibilityState = Object.freeze({
  HIDDEN: "hidden",
  DISCOVERED: "discovered",
  OWNED: "owned"
});

const SAVE_KEY = "fallen-empire-save-v1";

const DEFAULT_WORLD_DATA = {
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

const worldData = {
  villages: cloneData(DEFAULT_WORLD_DATA.villages)
};

const DEFAULT_MAX_LEVEL = 10;

const scienceDiscoveries = {
  scoutingSpeed: {
    name: 'Scouting speed',
    level: 0,
    maxLevel: DEFAULT_MAX_LEVEL,
    baseCost: {
      gold: 10000,
      wood: 10000,
      stone: 10000
    }
  }
};

const capitalBuildings = {
  barracks: {
    name: 'Barracks',
    level: 0,
    maxLevel: DEFAULT_MAX_LEVEL,
    baseCost: {
      gold: 250,
      wood: 200,
      stone: 150
    }
  }
};

function cloneData(value) {
  return JSON.parse(JSON.stringify(value));
}

function saveGameState() {
  if (typeof localStorage === 'undefined' || typeof worldData === 'undefined') {
    return;
  }

  var snapshot = {
    worldData: cloneData(worldData),
    playerResources: cloneData(playerResources),
    scienceDiscoveries: cloneData(scienceDiscoveries),
    capitalBuildings: cloneData(capitalBuildings),
    mapCamera: (typeof Map !== 'undefined' && Map.camera) ? {
      x: Map.camera.x,
      y: Map.camera.y,
      zoom: Map.camera.zoom
    } : null,
    activeActions: (typeof GameNotifications !== 'undefined' && Array.isArray(GameNotifications.activeActions)) ? GameNotifications.activeActions.map(function (action) {
      return {
        id: action.id,
        type: action.type,
        message: action.message,
        durationMs: action.durationMs,
        remainingMs: action.remainingMs,
        startedAt: action.startedAt,
        metadata: action.metadata
      };
    }) : [],
    savedAt: Date.now()
  };

  localStorage.setItem(SAVE_KEY, JSON.stringify(snapshot));
}

function loadGameState() {
  if (typeof localStorage === 'undefined') {
    return false;
  }

  var raw = localStorage.getItem(SAVE_KEY);
  if (!raw) {
    return false;
  }

  try {
    var snapshot = JSON.parse(raw);

    if (snapshot.worldData && Array.isArray(snapshot.worldData.villages)) {
      worldData.villages = snapshot.worldData.villages;
    }

    if (snapshot.playerResources) {
      Object.keys(playerResources).forEach(function (key) {
        if (typeof snapshot.playerResources[key] !== 'undefined') {
          playerResources[key] = snapshot.playerResources[key];
        }
      });
    }

    if (snapshot.scienceDiscoveries && typeof scienceDiscoveries !== 'undefined') {
      Object.keys(scienceDiscoveries).forEach(function (scienceKey) {
        if (snapshot.scienceDiscoveries[scienceKey] && typeof snapshot.scienceDiscoveries[scienceKey].level !== 'undefined') {
          scienceDiscoveries[scienceKey].level = snapshot.scienceDiscoveries[scienceKey].level;
        }
      });
    }

    if (snapshot.capitalBuildings && typeof capitalBuildings !== 'undefined') {
      Object.keys(capitalBuildings).forEach(function (buildingKey) {
        if (snapshot.capitalBuildings[buildingKey] && typeof snapshot.capitalBuildings[buildingKey].level !== 'undefined') {
          capitalBuildings[buildingKey].level = snapshot.capitalBuildings[buildingKey].level;
        }
      });
    }

    if (snapshot.mapCamera && typeof Map !== 'undefined') {
      Map.camera.x = snapshot.mapCamera.x || Map.camera.x;
      Map.camera.y = snapshot.mapCamera.y || Map.camera.y;
      Map.camera.zoom = snapshot.mapCamera.zoom || Map.camera.zoom;
    }

    if (snapshot.activeActions && Array.isArray(snapshot.activeActions)) {
      if (typeof GameNotifications !== 'undefined') {
        GameNotifications.activeActions = snapshot.activeActions;
      }
    }

    return true;
  } catch (error) {
    return false;
  }
}

function resetGameState() {
  if (typeof worldData !== 'undefined') {
    worldData.villages = cloneData(DEFAULT_WORLD_DATA.villages);
  }

  if (typeof playerResources !== 'undefined') {
    Object.keys(playerResources).forEach(function (resourceName) {
      playerResources[resourceName] = 0;
    });
  }

  if (typeof scienceDiscoveries !== 'undefined') {
    Object.keys(scienceDiscoveries).forEach(function (scienceKey) {
      if (scienceDiscoveries[scienceKey] && typeof scienceDiscoveries[scienceKey].level !== 'undefined') {
        scienceDiscoveries[scienceKey].level = 0;
      }
    });
  }

  if (typeof capitalBuildings !== 'undefined') {
    Object.keys(capitalBuildings).forEach(function (buildingKey) {
      if (capitalBuildings[buildingKey] && typeof capitalBuildings[buildingKey].level !== 'undefined') {
        capitalBuildings[buildingKey].level = 0;
      }
    });
  }

  if (typeof GameNotifications !== 'undefined') {
    GameNotifications.activeActions = [];
    var actionList = document.getElementById('action-list');
    if (actionList) {
      actionList.innerHTML = '';
    }
  }

  if (typeof localStorage !== 'undefined') {
    localStorage.removeItem(SAVE_KEY);
  }

  if (typeof Map !== 'undefined' && typeof Map.generateWorldMap === 'function') {
    Map.generateWorldMap('map-world', 50, 200);
    if (typeof Map.centerCameraOnCapital === 'function') {
      Map.centerCameraOnCapital('map-world', 50, 200);
    }
  }

  if (typeof updateResourceDisplay === 'function') {
    updateResourceDisplay();
  }

  if (typeof updateCapitalIncomeSummary === 'function') {
    updateCapitalIncomeSummary();
  }

  if (typeof renderScientistDiscoveryPanel === 'function') {
    renderScientistDiscoveryPanel();
  }

  if (typeof GameNotifications !== 'undefined' && typeof GameNotifications.add === 'function') {
    GameNotifications.add('Game reset to the starting state.', 'warning');
  }
}

window.saveGameState = saveGameState;
window.loadGameState = loadGameState;
window.resetGameState = resetGameState;
