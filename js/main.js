if (typeof Map !== 'undefined' && typeof Map.init === 'function') {
    Map.init({
        containerId: "map-world",
        mapSize: 50,
        worldSize: 200
    });
}

var GameNotifications = {
    activeActions: [],

    addToList: function (listId, message, type, showProgress) {
        var list = document.getElementById(listId);
        if (!list) {
            return null;
        }

        var item = document.createElement('div');
        item.className = 'notification-item ' + (type || 'info');

        item.innerHTML = `
            <div class="notification-label">${message}</div>
            <div class="notification-bar" style="display: ${showProgress ? 'block' : 'none'};"><span></span></div>
        `;

        list.prepend(item);

        while (list.children.length > 10) {
            list.removeChild(list.lastChild);
        }

        return item;
    },

    add: function (message, type) {
        return this.addToList('notification-list', message, type, false);
    },

    addAction: function (message, type) {
        return this.addToList('action-list', message, type, true);
    },

    startProgress: function (message, durationMs, type, onComplete, metadata) {
        var item = this.addAction(message, type);
        if (!item) {
            return null;
        }

        var resumeRemainingMs = metadata && typeof metadata.resumeRemainingMs === 'number' ? metadata.resumeRemainingMs : durationMs;
        var actionId = metadata && metadata.id ? metadata.id : (Date.now() + '-' + Math.random().toString(16).slice(2));
        var actionType = metadata && metadata.actionType ? metadata.actionType : (type || 'info');
        var actionState = {
            id: actionId,
            type: actionType,
            message: message,
            durationMs: durationMs,
            remainingMs: resumeRemainingMs,
            startedAt: Date.now(),
            metadata: metadata || {}
        };

        this.activeActions.push(actionState);

        var bar = item.querySelector('.notification-bar span');
        var container = item.querySelector('.notification-bar');
        var startTime = Date.now() - (durationMs - resumeRemainingMs);
        var interval = setInterval(function () {
            var elapsed = Date.now() - startTime;
            var progress = Math.min(elapsed / durationMs, 1);
            var remainingMs = Math.max(0, durationMs - elapsed);
            actionState.remainingMs = remainingMs;
            bar.style.width = Math.max(0, progress * 100) + '%';

            if (progress >= 1) {
                clearInterval(interval);

                if (item && item.parentNode) {
                    item.parentNode.removeChild(item);
                }

                this.activeActions = this.activeActions.filter(function (action) {
                    return action.id !== actionId;
                });

                if (typeof onComplete === 'function') {
                    onComplete();
                }

                if (container) {
                    container.style.display = 'none';
                }
            }
        }.bind(this), 50);

        return item;
    },

    restoreActions: function () {
        if (!Array.isArray(this.activeActions)) {
            return;
        }

        this.activeActions.forEach(function (action) {
            if (!action || !action.metadata) {
                return;
            }

            if (action.type === 'scout' && typeof action.metadata.villageIndex === 'number') {
                if (typeof Map !== 'undefined' && typeof Map.scout === 'function') {
                    Map.scout(action.metadata.villageIndex, {
                        resume: true,
                        remainingMs: action.remainingMs,
                        durationMs: action.durationMs,
                        actionId: action.id
                    });
                }
            }
        });
    }
};

var PageNavigation = {
    pages: {
        "nav_home": "page-home",
        "nav-capital": "page-capital",
        "nav_map": "page-map"
    },

    showPage: function (pageId) {
        var pages = document.querySelectorAll('.page-content');
        pages.forEach(function (page) {
            page.classList.toggle('active', page.id === pageId);
        });
    },

    init: function () {
        var self = this;

        Object.keys(this.pages).forEach(function (buttonId) {
            var button = document.getElementById(buttonId);
            var pageId = self.pages[buttonId];

            if (button) {
                button.addEventListener('click', function () {
                    self.showPage(pageId);
                });
            }
        });

        this.showPage('page-home');
    }
};

PageNavigation.init();

if (typeof loadGameState === 'function') {
    loadGameState();
}

if (typeof Map !== 'undefined' && typeof Map.generateWorldMap === 'function') {
    Map.generateWorldMap("map-world", 50, 200);
    if (typeof Map.centerCameraOnCapital === 'function') {
        Map.centerCameraOnCapital("map-world", 50, 200);
    }
}

if (typeof GameNotifications !== 'undefined' && typeof GameNotifications.restoreActions === 'function') {
    GameNotifications.restoreActions();
}

window.manualSaveGame = function () {
    if (typeof saveGameState === 'function') {
        saveGameState();
    }

    if (typeof GameNotifications !== 'undefined' && typeof GameNotifications.add === 'function') {
        GameNotifications.add('Game saved.', 'success');
    }
};

/*
Map.generateWorldMap({
    containerId: "map",
    mapSize: 50,
    worldSize: 200
});
*/

function showPopup(content, x, y) {
    let popup = document.getElementById('popup');
    if (!popup) {
        popup = document.createElement('div');
        popup.id = 'popup';
        popup.className = 'color-4';
        document.body.appendChild(popup);
    }
    popup.innerHTML = content;
    popup.style.left = x + 'px';
    popup.style.top = y + 'px';
    popup.style.display = 'block';

    // Close on click outside
    const closePopup = (e) => {
        if (!popup.contains(e.target)) {
            popup.style.display = 'none';
            document.removeEventListener('click', closePopup);
        }
    };
    // Delay to prevent immediate close
    setTimeout(() => {
        document.addEventListener('click', closePopup);
    }, 0);
}
