var Map = {

    generateWorldMap: function ({
        containerId = "map",
        worldSize = 100
    } = {}) {
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

        for (const v of worldData.villages) {
            // ❌ Skip hidden villages entirely
            if (v.state === VisibilityState.HIDDEN) continue;

            const pos = worldToScreen(v.coordinates.x, v.coordinates.y);

            const marker = document.createElement("div");
            marker.className = `marker level-${v.level} ${v.state}`;
            marker.style.left = `${pos.left}px`;
            marker.style.top = `${pos.top}px`;
            marker.title = `${v.name} (Lv ${v.level})`;

            map.appendChild(marker);
        }
    }

}