function tekenRooster() {
    const cols = document.getElementById('inputCols').value;
    const rows = document.getElementById('inputRows').value;
    const container = document.getElementById('rooster');

    container.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;

    container.innerHTML = '';

    const totaal = cols * rows;
    for (let i = 0; i < totaal; i++) {
        const div = document.createElement('div');
        div.classList.add('cel');
        div.addEventListener('click', function () {
            if (this.classList.contains('groen')) {
                this.classList.remove('groen');
                this.classList.add('rood');
            } else if (this.classList.contains('rood')) {
                this.classList.remove('rood');
            } else {
                this.classList.add('groen');
            }
        });
        container.appendChild(div);
    }
}

function berekenSnelsteRoute() {
    const cols = parseInt(document.getElementById('inputCols').value);
    const container = document.getElementById('rooster');
    const cellen = Array.from(container.querySelectorAll('.cel'));

    const startCellen = cellen.filter(c => c.classList.contains('groen'));
    const eindCellen  = cellen.filter(c => c.classList.contains('rood'));

    const startIndex = cellen.indexOf(startCellen[0] ?? null);
    const eindIndex  = cellen.indexOf(eindCellen[0] ?? null);

    const resultaatEl = document.getElementById('routeResultaat');

    if (startCellen.length === 0 || eindCellen.length === 0) {
        resultaatEl.textContent = 'Stel een groen startpunt en een rood eindpunt in.';
        return;
    }
    if (startCellen.length > 1) {
        resultaatEl.textContent = 'Er mag maar één groen startpunt zijn.';
        return;
    }
    if (eindCellen.length > 1) {
        resultaatEl.textContent = 'Er mag maar één rood eindpunt zijn.';
        return;
    }

    // BFS op het rooster
    const totaal = cellen.length;
    const rijen  = Math.ceil(totaal / cols);
    const bezocht = new Array(totaal).fill(false);
    const vorige  = new Array(totaal).fill(-1);
    const wachtrij = [startIndex];
    bezocht[startIndex] = true;

    const buren = (idx) => {
        const r = Math.floor(idx / cols);
        const k = idx % cols;
        const lijst = [];
        if (r > 0)        lijst.push(idx - cols);
        if (r < rijen-1)  lijst.push(idx + cols);
        if (k > 0)        lijst.push(idx - 1);
        if (k < cols-1)   lijst.push(idx + 1);
        return lijst;
    };

    while (wachtrij.length > 0) {
        const huidig = wachtrij.shift();
        if (huidig === eindIndex) break;
        for (const buur of buren(huidig)) {
            if (!bezocht[buur]) {
                bezocht[buur] = true;
                vorige[buur]  = huidig;
                wachtrij.push(buur);
            }
        }
    }

    // Herstel pad
    const pad = [];
    let stap = eindIndex;
    while (stap !== -1) {
        pad.unshift(stap);
        stap = vorige[stap];
    }

    if (pad[0] !== startIndex) {
        resultaatEl.textContent = 'Geen route gevonden.';
        return;
    }

    // Markeer het pad (behoud groen/rood voor start/eind)
    cellen.forEach(c => c.classList.remove('pad'));
    pad.forEach(idx => {
        if (idx !== startIndex && idx !== eindIndex) {
            cellen[idx].classList.add('pad');
        }
    });

    resultaatEl.textContent = `Snelste route gevonden: ${pad.length - 1} stap(pen).`;
}

window.onload = tekenRooster;