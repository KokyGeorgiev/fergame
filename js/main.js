if (typeof Map !== 'undefined' && typeof Map.init === 'function') {
    Map.init({
        containerId: "map-world",
        mapSize: 50,
        worldSize: 200
    });
}

var GameNotifications = {
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

        while (list.children.length > 6) {
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

    startProgress: function (message, durationMs, type, onComplete) {
        var item = this.addAction(message, type);
        if (!item) {
            return null;
        }

        var bar = item.querySelector('.notification-bar span');
        var container = item.querySelector('.notification-bar');
        var startTime = Date.now();
        var interval = setInterval(function () {
            var elapsed = Date.now() - startTime;
            var progress = Math.min(elapsed / durationMs, 1);
            bar.style.width = Math.max(0, progress * 100) + '%';

            if (progress >= 1) {
                clearInterval(interval);

                if (typeof onComplete === 'function') {
                    onComplete();
                }

                if (item && item.parentNode) {
                    item.parentNode.removeChild(item);
                }

                if (container) {
                    container.style.display = 'none';
                }
            }
        }, 50);

        return item;
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
