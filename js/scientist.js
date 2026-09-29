var scienceDiscoveries = {
    scoutingSpeed: {
        name: 'Scouting speed',
        level: 0,
        baseCost: {
            gold: 10000,
            wood: 10000,
            stone: 10000
        }
    }
};

function getScienceCost(scienceKey) {
    var discovery = scienceDiscoveries[scienceKey];
    if (!discovery || !discovery.baseCost) {
        return null;
    }

    var nextLevel = (discovery.level || 0) + 1;

    return {
        gold: discovery.baseCost.gold * nextLevel,
        wood: discovery.baseCost.wood * nextLevel,
        stone: discovery.baseCost.stone * nextLevel,
        food: 0
    };
}

function canAffordScienceCost(cost) {
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

function purchaseScience(scienceKey) {
    var discovery = scienceDiscoveries[scienceKey];
    if (!discovery) {
        return false;
    }

    var cost = getScienceCost(scienceKey);
    if (!canAffordScienceCost(cost)) {
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
    renderScientistDiscoveryPanel();
    return true;
}

window.purchaseScience = purchaseScience;

function renderScientistDiscoveryPanel() {
    var panel = document.getElementById('scientist-discoveries');
    if (!panel) {
        return;
    }

    var entries = Object.keys(scienceDiscoveries).map(function (scienceKey) {
        var discovery = scienceDiscoveries[scienceKey];
        var cost = getScienceCost(scienceKey);
        var canAfford = canAffordScienceCost(cost);
        var buttonText = discovery.name + ' (Lv. ' + (discovery.level || 0) + ')';

        return `
            <div class="science-discovery-item">
                <div class="science-discovery-name">${discovery.name}</div>
                <div class="science-discovery-meta">Level: ${discovery.level || 0} | Cost: ${cost.gold} Gold / ${cost.wood} Wood / ${cost.stone} Stone</div>
                <button type="button" class="action-button" onclick="purchaseScience('${scienceKey}')" ${canAfford ? '' : 'disabled'}>
                    ${buttonText}
                </button>
            </div>
        `;
    });

    panel.innerHTML = entries.join('');
}

window.renderScientistDiscoveryPanel = renderScientistDiscoveryPanel;

function getScoutingSpeedMultiplier() {
    var discovery = scienceDiscoveries.scoutingSpeed || { level: 0 };
    var level = discovery.level || 0;
    return Math.pow(0.7, level);
}
