var RESOURCE_TICK_MS = 30000;
var RESOURCE_BASE = {
    gold: 100,
    wood: 100,
    stone: 100,
    food: 100
};

var playerResources = {
    gold: 1200,
    wood: 850,
    stone: 480,
    food: 665
};

function getOwnedVillageIncome(resourceName) {
    var totalIncome = 0;
    var base = RESOURCE_BASE[resourceName] || 100;

    if (!worldData || !Array.isArray(worldData.villages)) {
        return totalIncome;
    }

    worldData.villages.forEach(function (village) {
        if (village.state !== VisibilityState.OWNED) {
            return;
        }

        if (!village.resources || typeof village.resources[resourceName] === 'undefined') {
            return;
        }

        var incomePercentage = village.resources[resourceName];
        totalIncome += (incomePercentage / base) * base;
    });

    return totalIncome;
}

function calculateResourceGrowth() {
    var growth = {
        gold: 0,
        wood: 0,
        stone: 0,
        food: 0
    };

    Object.keys(growth).forEach(function (resourceName) {
        growth[resourceName] = getOwnedVillageIncome(resourceName);
    });

    return growth;
}

function updateResourceDisplay() {
    var resourceElements = {
        gold: document.getElementById('resource-gold'),
        wood: document.getElementById('resource-wood'),
        stone: document.getElementById('resource-stone'),
        food: document.getElementById('resource-food')
    };

    Object.keys(playerResources).forEach(function (resourceName) {
        if (resourceElements[resourceName]) {
            resourceElements[resourceName].textContent = resourceName.charAt(0).toUpperCase() + resourceName.slice(1) + ': ' + playerResources[resourceName];
        }
    });
}

function addResourcesTick() {
    console.log("Adding resources tick...");
    var growth = calculateResourceGrowth();

    Object.keys(playerResources).forEach(function (resourceName) {
        playerResources[resourceName] += growth[resourceName];
    });

    updateResourceDisplay();
}

updateResourceDisplay();
setInterval(addResourcesTick, RESOURCE_TICK_MS);
