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

function bevatPunt(lijst, r, c) {
    return lijst.some(p => p.r === r && p.c === c);
}

function vindPad(start, doel, roodLijst, maxRows, maxCols) {
    let queue = [[{ ...start, pad: [] }]];
    let bezocht = new Set();
    bezocht.add(`${start.r},${start.c}`);
  
  	while (queue.length > 0) {
        let { r, c, pad } = queue.shift();

        if (r === doel.r && c === doel.c) return pad;

        // Kijk naar de buren
        const buren = [
            { r: r + 1, c: c }, { r: r - 1, c: c },
            { r: r, c: c + 1 }, { r: r, c: c - 1 }
        ];

        for (let buur of buren) {
            let sleutel = `${buur.r},${buur.c}`;
          
            if (buur.r >= 0 && buur.r <= maxRows && 
                buur.c >= 0 && buur.c <= maxCols && 
                !bevatPunt(roodLijst, buur.r, buur.c) && 
                !bezocht.has(sleutel)) {
                
                bezocht.add(sleutel);
                queue.push({ ...buur, pad: [...pad, buur] });
            }
        }
    }
    return null;
}

function berekenRoute() {
    const allePunten = document.querySelectorAll('.kruispunt');
    const cols = parseInt(document.getElementById('inputCols').value);
    const rows = parseInt(document.getElementById('inputRows').value); 

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
	
    if (!start || groen.length === 0) {
    	alert("Zet een blauwe start positie en min. 1 groen punt");
      	return;
    }
	
    let huidigePos = start;
    let nogTePlaatsen = [...groen];
    let route = [];
  
    while (nogTePlaatsen.length > 0) {
    	let dichtstbijzijnde;
    	let kortstePad;
      
      	for (let i = 0; i < nogTePlaatsen.length; i++) {
            let pad = vindPad(huidigePos, nogTePlaatsen[i], rood, rows, cols);
            if (pad && (!kortstePad || pad.length < kortstePad.length)) {
                kortstePad = pad;
                dichtstbijzijnde = i;
            }
        }

		if (!kortstePad) {
            alert("Sommige groene punten zijn onbereikbaar door de rode muren!");
            return;
        }
      
        route.push(...kortstePad);
      	huidigePos = nogTeBezoeken[dichtstbijzijnde];
      	nogTePlaatsen.splice(dichtstbijzijnde, 1);
    }

    console.log("Snelste route gevonden:", volledigeRoute);
    tekenRouteAnimatie(volledigeRoute);
}

function tekenRouteAnimatie(route) {
    route.forEach((stap, index) => {
        setTimeout(() => {
            const punt = document.querySelector(`.kruispunt[data-row="${stap.r}"][data-col="${stap.c}"]`);
            if (punt && !punt.classList.contains('groen')) {
                punt.style.backgroundColor = 'yellow';
            }
        }, index * 200);
    });
}