var DEFAULT_MAX_LEVEL = 10;

var scienceDiscoveries = {
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

var capitalBuildings = {
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

function getMaxLevel(item) {
    if (!item) {
        return DEFAULT_MAX_LEVEL;
    }

    return typeof item.maxLevel === 'number' ? item.maxLevel : DEFAULT_MAX_LEVEL;
}

function isAtMaxLevel(item) {
    return (item.level || 0) >= getMaxLevel(item);
}

function getResourceCostForLevel(baseCost, level) {
    if (!baseCost) {
        return null;
    }

    var multiplier = 1 + ((level || 0) * 0.5);
    return {
        gold: Math.round((baseCost.gold || 0) * multiplier),
        wood: Math.round((baseCost.wood || 0) * multiplier),
        stone: Math.round((baseCost.stone || 0) * multiplier),
        food: 0
    };
}

function canAffordResourceCost(cost) {
    if (!cost) {
        return false;
    }

    return Object.keys(cost).every(function (resourceName) {
        if ((cost[resourceName] || 0) <= 0) {
            return true;
        }

        return (playerResources[resourceName] || 0) >= cost[resourceName];
    });
}

function getScienceCost(scienceKey) {
    var discovery = scienceDiscoveries[scienceKey];
    if (!discovery || !discovery.baseCost || isAtMaxLevel(discovery)) {
        return null;
    }

    var nextLevel = (discovery.level || 0) + 1;
    return getResourceCostForLevel(discovery.baseCost, nextLevel - 1);
}

function purchaseScience(scienceKey) {
    var discovery = scienceDiscoveries[scienceKey];
    if (!discovery || isAtMaxLevel(discovery)) {
        return false;
    }

    var cost = getScienceCost(scienceKey);
    if (!cost || !canAffordResourceCost(cost)) {
        return false;
    }

    Object.keys(cost).forEach(function (resourceName) {
        if ((cost[resourceName] || 0) > 0) {
            playerResources[resourceName] -= cost[resourceName];
        }
    });

    discovery.level = (discovery.level || 0) + 1;
    updateResourceDisplay();
    updateCapitalIncomeSummary();
    renderCapitalPanels();
    return true;
}

window.purchaseScience = purchaseScience;

function getBuildingCost(buildingKey) {
    var building = capitalBuildings[buildingKey];
    if (!building || !building.baseCost || isAtMaxLevel(building)) {
        return null;
    }

    return getResourceCostForLevel(building.baseCost, building.level || 0);
}

function purchaseBuilding(buildingKey) {
    var building = capitalBuildings[buildingKey];
    if (!building || isAtMaxLevel(building)) {
        return false;
    }

    var cost = getBuildingCost(buildingKey);
    if (!cost || !canAffordResourceCost(cost)) {
        return false;
    }

    Object.keys(cost).forEach(function (resourceName) {
        if ((cost[resourceName] || 0) > 0) {
            playerResources[resourceName] -= cost[resourceName];
        }
    });

    building.level = (building.level || 0) + 1;
    updateResourceDisplay();
    updateCapitalIncomeSummary();
    renderCapitalPanels();
    return true;
}

window.purchaseBuilding = purchaseBuilding;

function renderScientistDiscoveryPanel() {
    var panel = document.getElementById('scientist-discoveries');
    if (!panel) {
        return;
    }

    var entries = Object.keys(scienceDiscoveries).map(function (scienceKey) {
        var discovery = scienceDiscoveries[scienceKey];
        var cost = getScienceCost(scienceKey);
        var canAfford = cost ? canAffordResourceCost(cost) : false;
        var isMaxed = isAtMaxLevel(discovery);
        var buttonText = isMaxed ? discovery.name + ' (Maxed)' : discovery.name + ' (Lv. ' + (discovery.level || 0) + ')';
        var costText = isMaxed ? 'Max level reached' : 'Cost: ' + cost.gold + ' Gold / ' + cost.wood + ' Wood / ' + cost.stone + ' Stone';

        return `
            <div class="science-discovery-item">
                <div class="science-discovery-name">${discovery.name}</div>
                <div class="science-discovery-meta">Level: ${discovery.level || 0} / ${getMaxLevel(discovery)} | ${costText}</div>
                <button type="button" class="action-button" onclick="purchaseScience('${scienceKey}')" ${isMaxed || !canAfford ? 'disabled' : ''}>
                    ${buttonText}
                </button>
            </div>
        `;
    });

    panel.innerHTML = entries.join('');
}

window.renderScientistDiscoveryPanel = renderScientistDiscoveryPanel;

function renderCapitalBuildingPanel() {
    var panel = document.getElementById('capital-buildings');
    if (!panel) {
        return;
    }

    var entries = Object.keys(capitalBuildings).map(function (buildingKey) {
        var building = capitalBuildings[buildingKey];
        var cost = getBuildingCost(buildingKey);
        var canAfford = cost ? canAffordResourceCost(cost) : false;
        var isMaxed = isAtMaxLevel(building);
        var buttonText = isMaxed ? building.name + ' (Maxed)' : building.name + ' (Lv. ' + (building.level || 0) + ')';
        var costText = isMaxed ? 'Max level reached' : 'Cost: ' + cost.gold + ' Gold / ' + cost.wood + ' Wood / ' + cost.stone + ' Stone';

        return `
            <div class="science-discovery-item">
                <div class="science-discovery-name">${building.name}</div>
                <div class="science-discovery-meta">Level: ${building.level || 0} / ${getMaxLevel(building)} | ${costText}</div>
                <button type="button" class="action-button" onclick="purchaseBuilding('${buildingKey}')" ${isMaxed || !canAfford ? 'disabled' : ''}>
                    ${buttonText}
                </button>
            </div>
        `;
    });

    panel.innerHTML = entries.join('');
}

window.renderCapitalBuildingPanel = renderCapitalBuildingPanel;

function renderCapitalPanels() {
    renderScientistDiscoveryPanel();
    renderCapitalBuildingPanel();
}

window.renderCapitalPanels = renderCapitalPanels;

function getScoutingSpeedMultiplier() {
    var discovery = scienceDiscoveries.scoutingSpeed || { level: 0 };
    var level = discovery.level || 0;
    return Math.pow(0.7, level);
}
