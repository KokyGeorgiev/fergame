var CapitalTraining = {
    isTrainingActionActive: false,
    activeUnitKey: null
};

function renderBarracksTrainingPanel() {
    var panel = document.getElementById('barracks-training');
    if (!panel) {
        return;
    }

    var barracksLevel = (capitalBuildings.barracks && capitalBuildings.barracks.level) || 0;
    var entries = Object.keys(troopUnits).map(function (unitKey) {
        var unit = troopUnits[unitKey];
        var unlocked = barracksLevel >= (unit.unlockBarracksLevel || 1);
        var canAfford = unlocked && canAffordResourceCost(unit.cost);
        var isActiveTraining = CapitalTraining.isTrainingActionActive && CapitalTraining.activeUnitKey === unitKey;
        var isBlocked = CapitalTraining.isTrainingActionActive && CapitalTraining.activeUnitKey !== unitKey;
        var buttonText = isActiveTraining ? unit.name + ' (Training...)' : (unlocked ? unit.name : unit.name + ' (requires Barracks Lv. ' + unit.unlockBarracksLevel + ')');

        return `
            <div class="science-discovery-item">
                <div class="science-discovery-name">${unit.name}</div>
                <div class="science-discovery-meta">Cost: ${unit.cost.gold} Gold / ${unit.cost.wood} Wood / ${unit.cost.stone} Stone / ${unit.cost.food} Food | Strength: ${unit.strength || 1} | Owned: ${playerArmy.units[unitKey] || 0}</div>
                <button type="button" class="action-button" onclick="trainTroop('${unitKey}')" ${(!unlocked || !canAfford || isBlocked || isActiveTraining) ? 'disabled' : ''}>
                    ${buttonText}
                </button>
            </div>
        `;
    });

    panel.innerHTML = entries.join('');
}

window.renderBarracksTrainingPanel = renderBarracksTrainingPanel;

function getTrainingDuration(unitKey) {
    var unit = troopUnits[unitKey];
    if (!unit) {
        return 20000;
    }

    var strengthFactor = unit.strength || 1;
    var requiredLevel = unit.unlockBarracksLevel || 1;
    var baseDuration = 15000 + (strengthFactor * 12000);
    var unlockExponent = Math.pow(1.7, requiredLevel - 1);
    return Math.round(baseDuration * unlockExponent);
}

function trainTroop(unitKey, resumeState) {
    var unit = troopUnits[unitKey];
    if (!unit) {
        return false;
    }

    var barracksLevel = (capitalBuildings.barracks && capitalBuildings.barracks.level) || 0;
    if (barracksLevel < (unit.unlockBarracksLevel || 1)) {
        return false;
    }

    if (resumeState && resumeState.resume) {
        CapitalTraining.isTrainingActionActive = true;
        CapitalTraining.activeUnitKey = unitKey;
    } else {
        if (CapitalTraining.isTrainingActionActive && CapitalTraining.activeUnitKey !== unitKey) {
            return false;
        }

        if (CapitalTraining.isTrainingActionActive && CapitalTraining.activeUnitKey === unitKey) {
            return false;
        }

        if (!canAffordResourceCost(unit.cost)) {
            return false;
        }

        Object.keys(unit.cost).forEach(function (resourceName) {
            if ((unit.cost[resourceName] || 0) > 0) {
                playerResources[resourceName] = (playerResources[resourceName] || 0) - unit.cost[resourceName];
            }
        });

        CapitalTraining.isTrainingActionActive = true;
        CapitalTraining.activeUnitKey = unitKey;
    }

    var durationMs = resumeState && typeof resumeState.durationMs === 'number' ? resumeState.durationMs : getTrainingDuration(unitKey);
    var remainingMs = resumeState && typeof resumeState.remainingMs === 'number' ? resumeState.remainingMs : durationMs;
    var actionId = resumeState && resumeState.actionId ? resumeState.actionId : null;

    GameNotifications.startProgress('Training ' + unit.name + '...', durationMs, 'info', function () {
        if (!troopUnits[unitKey]) {
            return;
        }

        playerArmy.units[unitKey] = (playerArmy.units[unitKey] || 0) + 1;
        playerArmy.total = (playerArmy.total || 0) + 1;
        CapitalTraining.isTrainingActionActive = false;
        CapitalTraining.activeUnitKey = null;
        updateResourceDisplay();
        renderCapitalPanels();
    }, {
        id: actionId,
        actionType: 'train',
        unitKey: unitKey,
        resumeRemainingMs: remainingMs
    });

    updateResourceDisplay();
    return true;
}

window.trainTroop = trainTroop;
