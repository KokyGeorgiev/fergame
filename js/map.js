var Map = {

    isPanning: false,
    lastTouch: { x: 0, y: 0 },
    camera: {
        x: 300,
        y: 300,
        zoom: 1
    },
    containerId: "map-world",

    getLevelName: function (level) {
        switch (level) {
            case 1: return 'village';
            case 2: return 'town';
            case 3: return 'fortress';
            case 4: return 'capital';
            default: return 'unknown';
        }
    },

    init: function ({
        containerId = "map",
        mapSize = 50,
        worldSize = 100
    }) {
        const container = document.getElementById("map");
        const world = document.getElementById(containerId);

        this.generateWorldMap(containerId, mapSize, worldSize);
        this.centerCameraOnCapital(containerId, mapSize, worldSize);
        this.addMobileSupport();

    },

    generateWorldMap: function (containerId, mapSize, worldSize) {
        const map = document.getElementById(containerId);
        map.innerHTML = "";

        const half = worldSize / 2;
        const width = map.clientWidth;
        const height = map.clientHeight;

        function worldToScreen(x, y) {
            return {
                left: ((x + half) / worldSize) * width,
                top: ((y + half) / worldSize) * height
            };
        }

        for (let i = 0; i < worldData.villages.length; i++) {
            const v = worldData.villages[i];
            // ❌ Skip hidden villages entirely
            if (v.state === VisibilityState.HIDDEN) continue;

            const pos = worldToScreen(v.coordinates.x, v.coordinates.y);

            const marker = document.createElement("div");
            marker.className = `marker level-${v.level} ${v.state}`;
            marker.style.left = `${pos.left}px`;
            marker.style.top = `${pos.top}px`;

            marker.addEventListener('click', (e) => {
                e.stopPropagation();
                let actions = ``;

                if (v.state !== VisibilityState.OWNED) {
                    actions += `<button onclick="Map.captureVillage(${i})">Capture</button>`;
                }
                if (v.level >= 2) {
                    actions += `<button onclick="Map.scout(${i})">Scout around!</button>`;
                }

                let content = `
                <div class="content-card">
                    <div class="content-card-title color-2">
                        ${v.name}<br>
                        <div class="content-card-subtitle">
                            (${this.getLevelName(v.level)})<br>
                        </div>
                    </div>
                    <div class="content-card-body color-5">
                        Gold: ${v.resources.gold} %<br>
                        Wood: ${v.resources.wood} %<br>
                        Stone: ${v.resources.stone} %<br>
                        Food: ${v.resources.food} %
                    </div>
                    ${actions}
                </div>`;

                showPopup(content, e.clientX, e.clientY);
            });

            map.appendChild(marker);
        }

    },


    captureVillage: function (index) {
        const village = worldData.villages[index];
        if (!village || village.state === VisibilityState.OWNED) {
            return;
        }

        const popup = document.getElementById('popup');
        if (popup) {
            popup.style.display = 'none';
        }

        GameNotifications.startProgress('Capturing a ' + this.getLevelName(village.level) + '...', 1000, 'warning', function () {
            village.state = VisibilityState.OWNED;
            if (typeof updateCapitalIncomeSummary === 'function') {
                updateCapitalIncomeSummary();
            }
            this.generateWorldMap("map-world", 50, 200);
            GameNotifications.add(this.getLevelName(village.level).charAt(0).toUpperCase() + this.getLevelName(village.level).slice(1) + ' captured: ' + village.name, 'success');
        }.bind(this));
    },

    scout: function (index) {
        const village = worldData.villages[index];
        const popup = document.getElementById('popup');
        if (popup) {
            popup.style.display = 'none';
        }

        GameNotifications.startProgress('Scouting...', 5000, 'info', function () {
            let closest = null;
            let minDist = Infinity;
            for (let vv of worldData.villages) {
                if (vv.state === VisibilityState.HIDDEN) {
                    const dist = Math.sqrt((vv.coordinates.x - village.coordinates.x) ** 2 + (vv.coordinates.y - village.coordinates.y) ** 2);
                    if (dist < minDist) {
                        minDist = dist;
                        closest = vv;
                    }
                }
            }
            if (closest) {
                closest.state = VisibilityState.DISCOVERED;
                this.generateWorldMap("map-world", 50, 200);
                GameNotifications.add('New ' + this.getLevelName(closest.level) + ' discovered: ' + closest.name, 'success');
            } else {
                GameNotifications.add('No hidden villages found.', 'warning');
            }
        }.bind(this));
    },

    getCapital: function () {
        return worldData.villages.find(v => v.level === 4);
    },

    updateCamera: function () {
        const map = document.getElementById(this.containerId);
        map.style.transform =
            `translate(${-this.camera.x}px, ${-this.camera.y}px) scale(${this.camera.zoom})`;
    },

    moveCamera: function (dx, dy) {
        this.camera.x += dx;
        this.camera.y += dy;
        this.updateCamera();
    },

    zoomCamera: function (amount) {
        this.camera.zoom = Math.min(2, Math.max(0.5, this.camera.zoom + amount));
        this.updateCamera();
    },

    centerCameraOnCapital: function (containerId, mapSize, worldSize) {
        const map = document.getElementById(containerId);
        const capital = this.getCapital();
        if (!capital) return;
        const viewport = document.getElementById("map-container");

        const half = worldSize / 2;

        const wx = ((capital.coordinates.x + half) / worldSize) * map.clientWidth;
        const wy = ((capital.coordinates.y + half) / worldSize) * map.clientHeight;

        this.camera.x = wx - viewport.clientWidth / 2;
        this.camera.y = wy - viewport.clientHeight / 2;

        this.updateCamera();
    },

    addMobileSupport: function () {
        const map = document.getElementById(this.containerId);
        map.addEventListener("touchstart", e => {
            if (e.touches.length === 1) {
                isPanning = true;
                lastTouch.x = e.touches[0].clientX;
                lastTouch.y = e.touches[0].clientY;
            }
        });
        map.addEventListener("touchmove", e => {
            if (!isPanning || e.touches.length !== 1) return;

            const touch = e.touches[0];
            const dx = lastTouch.x - touch.clientX;
            const dy = lastTouch.y - touch.clientY;

            this.camera.x += dx;
            this.camera.y += dy;

            lastTouch.x = touch.clientX;
            lastTouch.y = touch.clientY;

            this.updateCamera();
        });

        map.addEventListener("touchend", () => {
            isPanning = false;
        });

        let lastPinchDistance = null;

        function pinchDistance(t1, t2) {
            return Math.hypot(
                t1.clientX - t2.clientX,
                t1.clientY - t2.clientY
            );
        }



        map.addEventListener("touchmove", e => {
            if (e.touches.length === 2) {
                isPanning = false;

                const d = pinchDistance(e.touches[0], e.touches[1]);

                if (lastPinchDistance !== null) {
                    const delta = (d - lastPinchDistance) * 0.002;
                    this.camera.zoom = Math.min(2, Math.max(0.5, camera.zoom + delta));
                    this.updateCamera();
                }

                lastPinchDistance = d;
            }
        });

        map.addEventListener("touchend", e => {
            if (e.touches.length < 2) {
                lastPinchDistance = null;
            }
        });

    }


}