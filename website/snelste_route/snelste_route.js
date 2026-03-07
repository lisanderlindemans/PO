const CEL_GROOTTE = 30;
const ROOSTER_GAP = 1;
const KRUISPUNT_STAP = CEL_GROOTTE + ROOSTER_GAP;
const KRUISPUNT_OFFSET = ROOSTER_GAP / 2;

let getekendeSegmenten = new Map();

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

    verwijderRoute();

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

function isRand(r, c, maxRows, maxCols) {
    return r === 0 || c === 0 || r === maxRows || c === maxCols;
}

function vindPad(start, doel, roodLijst, maxRows, maxCols) {
    let queue = [{ ...start, pad: [] }];
    let bezocht = new Set();
    bezocht.add(`${start.r},${start.c}`);
  
  	while (queue.length > 0) {
        let { r, c, pad } = queue.shift();

        if (r === doel.r && c === doel.c) return pad;

        const buren = [
            { r: r + 1, c: c }, { r: r - 1, c: c },
            { r: r, c: c + 1 }, { r: r, c: c - 1 }
        ];

        for (let buur of buren) {
            let sleutel = `${buur.r},${buur.c}`;
          
            if (
                buur.r >= 0 && buur.r <= maxRows &&
                buur.c >= 0 && buur.c <= maxCols &&
                !bevatPunt(roodLijst, buur.r, buur.c) &&
                !bezocht.has(sleutel) &&
                (
                    !isRand(buur.r, buur.c, maxRows, maxCols) ||
                    (buur.r === doel.r && buur.c === doel.c)
                )
            ) {
                
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
    let route = [start];
  
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
      	huidigePos = nogTePlaatsen[dichtstbijzijnde];
      	nogTePlaatsen.splice(dichtstbijzijnde, 1);
    }

    let terugPad = vindPad(huidigePos, start, rood, rows, cols);

    if (!terugPad) {
        alert("Kan niet terugkeren naar de startpositie!");
        return;
    }

    const heenRoute = [...route];
    const terugRoute = [huidigePos, ...terugPad];

    console.log("Snelste route gevonden:", [...heenRoute, ...terugPad]);

    verwijderRoute();

    tekenRouteAnimatie(heenRoute, "yellow", 0);

    tekenRouteAnimatie(
        terugRoute,
        "blue",
        (heenRoute.length - 1) * 200
    );
}

function verwijderRoute() {
    document.querySelectorAll('.route-lijn').forEach(e => e.remove());
    getekendeSegmenten.clear();
}

function segmentKey(a, b) {
    const k1 = `${a.r},${a.c}-${b.r},${b.c}`;
    const k2 = `${b.r},${b.c}-${a.r},${a.c}`;
    return k1 < k2 ? k1 : k2;
}

function tekenRouteAnimatie(route, kleur = "yellow", startDelay = 0) {
    const container = document.getElementById('rooster');

    for (let i = 0; i < route.length - 1; i++) {
        const a = route[i];
        const b = route[i + 1];

        setTimeout(() => {

            const key = segmentKey(a, b);
            let finaleKleur = kleur;

            if (kleur === "blue" && getekendeSegmenten.has(key)) {
                finaleKleur = "green";
                getekendeSegmenten.get(key).style.backgroundColor = "green";
            }

            const lijn = document.createElement('div');
            lijn.classList.add('route-lijn');
            lijn.style.backgroundColor = finaleKleur;

            const x1 = a.c * KRUISPUNT_STAP + KRUISPUNT_OFFSET;
            const y1 = a.r * KRUISPUNT_STAP + KRUISPUNT_OFFSET;

            const x2 = b.c * KRUISPUNT_STAP + KRUISPUNT_OFFSET;
            const y2 = b.r * KRUISPUNT_STAP + KRUISPUNT_OFFSET;

            if (x1 === x2) {
                lijn.style.left = `${x1 - 2}px`;
                lijn.style.top = `${Math.min(y1, y2)}px`;
                lijn.style.width = `4px`;
                lijn.style.height = `${Math.abs(y2 - y1)}px`;
            } else {
                lijn.style.left = `${Math.min(x1, x2)}px`;
                lijn.style.top = `${y1 - 2}px`;
                lijn.style.width = `${Math.abs(x2 - x1)}px`;
                lijn.style.height = `4px`;
            }

            container.appendChild(lijn);

            if (!getekendeSegmenten.has(key)) {
                getekendeSegmenten.set(key, lijn);
            }

        }, startDelay + i * 200);
    }
}