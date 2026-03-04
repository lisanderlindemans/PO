const CEL_GROOTTE = 30;
const ROOSTER_GAP = 1;
const KRUISPUNT_STAP = CEL_GROOTTE + ROOSTER_GAP;
const KRUISPUNT_OFFSET = ROOSTER_GAP / 2;

function tekenRooster() {
    const cols = parseInt(document.getElementById('inputCols').value, 10);
    const rows = parseInt(document.getElementById('inputRows').value, 10);
    const container = document.getElementById('rooster');

    container.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;

    container.innerHTML = '';
    vorigeBlauwMarker = null;

    const totaal = cols * rows;
    for (let i = 0; i < totaal; i++) {
        const div = document.createElement('div');
        div.classList.add('cel');
        container.appendChild(div);
    }

    for (let r = 1; r < rows; r++) {
        for (let c = 1; c < cols; c++) {
            const marker = document.createElement('div');
            marker.classList.add('kruispunt');

            marker.dataset.row = r;
            marker.dataset.col = c;

            marker.style.left = `${c * KRUISPUNT_STAP + KRUISPUNT_OFFSET}px`;
            marker.style.top = `${r * KRUISPUNT_STAP + KRUISPUNT_OFFSET}px`;
            marker.addEventListener('click', () => toggleKruispunt(marker));
            container.appendChild(marker);
        }
    }

    const randPositions = [];
    for (let c = 1; c < cols; c++) {
        randPositions.push([0, c]);
        randPositions.push([rows, c]);
    }
    for (let r = 1; r < rows; r++) {
        randPositions.push([r, 0]);
        randPositions.push([r, cols]);
    }
    for (const [r, c] of randPositions) {
        const marker = document.createElement('div');
        marker.classList.add('kruispunt');
        marker.dataset.rand = 'true';

        marker.dataset.row = r;
        marker.dataset.col = c;

        marker.style.left = `${c * KRUISPUNT_STAP + KRUISPUNT_OFFSET}px`;
        marker.style.top = `${r * KRUISPUNT_STAP + KRUISPUNT_OFFSET}px`;
        marker.addEventListener('click', () => toggleKruispunt(marker));
        container.appendChild(marker);
    }
}

let vorigeBlauwMarker = null;

function verwijderBlauw() {
    const existing = document.querySelector('.kruispunt.blauw');
    if (existing) {
        vorigeBlauwMarker = existing;
        existing.classList.remove('blauw');
    }
}

function toggleKruispunt(marker) {
    const isRand = marker.dataset.rand === 'true';

    if (isRand) {
        if (marker.classList.contains('blauw')) {
            marker.classList.remove('blauw');
            if (vorigeBlauwMarker && vorigeBlauwMarker !== marker) {
                vorigeBlauwMarker.classList.add('blauw');
            }
            vorigeBlauwMarker = null;
        } else {
            verwijderBlauw();
            marker.classList.add('blauw');
        }
    } else if (!marker.classList.contains('groen') && !marker.classList.contains('rood') && !marker.classList.contains('blauw')) {
        marker.classList.add('groen');
    } else if (marker.classList.contains('groen')) {
        marker.classList.remove('groen');
        marker.classList.add('rood');
    } else if (marker.classList.contains('rood')) {
        marker.classList.remove('rood');
        verwijderBlauw();
        marker.classList.add('blauw');
    } else {
        marker.classList.remove('blauw');
        if (vorigeBlauwMarker && vorigeBlauwMarker !== marker) {
            vorigeBlauwMarker.classList.add('blauw');
        }
        vorigeBlauwMarker = null;
    }
}

window.onload = tekenRooster;

function berekenRoute() {
    const output = document.getElementById('route-output');
    const allePunten = document.querySelectorAll('.kruispunt');

    let start = null;
    let groen = [];
    let rood = [];

    allePunten.forEach(p => {
        const pos = { r: parseInt(p.dataset.row), c: parseInt(p.dataset.col) };
        
        if (p.classList.contains('blauw')) start = pos;
        if (p.classList.contains('groen')) groen.push(pos);
        if (p.classList.contains('rood')) rood.push(pos);

        // start.r -> row
        // start.c -> col
        // array[i].r -> row
        // array[i].c -> col
    });
}