// Step between intersections: cell width (30px, from .cel in CSS) + gap (1px)
const CEL_GROOTTE = 30;
const ROOSTER_GAP = 1;
const KRUISPUNT_STAP = CEL_GROOTTE + ROOSTER_GAP; // 31px
const KRUISPUNT_OFFSET = ROOSTER_GAP / 2;         // 0.5px (center of gap line)

function tekenRooster() {
    const cols = parseInt(document.getElementById('inputCols').value, 10);
    const rows = parseInt(document.getElementById('inputRows').value, 10);
    const container = document.getElementById('rooster');

    container.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;

    container.innerHTML = '';

    const totaal = cols * rows;
    for (let i = 0; i < totaal; i++) {
        const div = document.createElement('div');
        div.classList.add('cel');
        container.appendChild(div);
    }

    // Add clickable intersection markers at every inner crossing of grid lines.
    // Outer-edge intersections are skipped since there is no outer border.
    // intersection (c, r) is centered at (c*STAP + OFFSET, r*STAP + OFFSET) px
    // relative to the container.
    for (let r = 1; r < rows; r++) {
        for (let c = 1; c < cols; c++) {
            const marker = document.createElement('div');
            marker.classList.add('kruispunt');
            marker.style.left = `${c * KRUISPUNT_STAP + KRUISPUNT_OFFSET}px`;
            marker.style.top = `${r * KRUISPUNT_STAP + KRUISPUNT_OFFSET}px`;
            marker.addEventListener('click', () => toggleKruispunt(marker));
            container.appendChild(marker);
        }
    }
}

function toggleKruispunt(marker) {
    if (!marker.classList.contains('groen') && !marker.classList.contains('rood') && !marker.classList.contains('blauw')) {
        marker.classList.add('groen');
    } else if (marker.classList.contains('groen')) {
        marker.classList.remove('groen');
        marker.classList.add('rood');
    } else if (marker.classList.contains('rood')) {
        marker.classList.remove('rood');
        marker.classList.add('blauw');
    } else {
        marker.classList.remove('blauw');
    }
}

window.onload = tekenRooster;