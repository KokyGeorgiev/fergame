if (typeof Map !== 'undefined' && typeof Map.init === 'function') {
    Map.init({
        containerId: "map-world",
        mapSize: 50,
        worldSize: 200
    });
}

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
