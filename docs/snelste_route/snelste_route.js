const CEL_GROOTTE = 30;
const ROOSTER_GAP = 1;
const KRUISPUNT_STAP = CEL_GROOTTE + ROOSTER_GAP;
const KRUISPUNT_OFFSET = ROOSTER_GAP / 2;

let getekendeSegmenten = new Map();

function tekenRooster() { // Niet in flowchart
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

function verwijderBlauw() { // Niet in flowchart
    const existing = document.querySelector('.kruispunt.blauw');
    if (existing) {
        vorigeBlauwMarker = existing;
        existing.classList.remove('blauw');
    }
}

function toggleKruispunt(marker) { // Niet in flowchart
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

// Check of het kruispunt een torentje bevat
function bevatPunt(lijst, r, c) {
    return lijst.some(p => p.r === r && p.c === c);
}

// Check of het kruispunt op de rand is
function isRand(r, c, maxRows, maxCols) {
    return r === 0 || c === 0 || r === maxRows || c === maxCols;
}

// Bereken korste route van punt tot punt
function vindPad(start, doel, roodLijst, maxRows, maxCols) {
    let queue = [{ ...start, pad: [] }];

    // Set om te zorgen dat we niet de hele tijd dezelfde kruispunten af gaan
    let bezocht = new Set();
    // Voeg start pos toe
    bezocht.add(`${start.r},${start.c}`);
  
    // Blijf zoeken zolang er posities in de queue zitten
  	while (queue.length > 0) {
        let { r, c, pad } = queue.shift();

        // Als het doel bereikt is, return het pad
        if (r === doel.r && c === doel.c) return pad;

        // Neem alle kruispunten in de buurt
        const buren = [
            { r: r + 1, c: c }, { r: r - 1, c: c },
            { r: r, c: c + 1 }, { r: r, c: c - 1 }
        ];

        // Check alle buren
        for (let buur of buren) {
            let sleutel = `${buur.r},${buur.c}`;
          
            if (
                // Checks of de buur in het grid zit en of het geen rood torentje is
                buur.r >= 0 && buur.r <= maxRows &&
                buur.c >= 0 && buur.c <= maxCols &&
                !bevatPunt(roodLijst, buur.r, buur.c) &&
                // Zorg dat het niet de hele tijd dezelfde kruispunten afgaat
                !bezocht.has(sleutel) &&
                (
                    // Mag geen rand punt zijn tenzij het het doel is (dit moet zo omdat het anders geen terugroute vindt naar de start locatie die op de rand ligt)
                    !isRand(buur.r, buur.c, maxRows, maxCols) ||
                    (buur.r === doel.r && buur.c === doel.c)
                )
            ) {
                // Markeer kruispunt als bezocht
                bezocht.add(sleutel);
                queue.push({ ...buur, pad: [...pad, buur] });
            }
        }
    }

    // Geen pad gevonden
    return null;
}

function berekenRoute() {
    const allePunten = document.querySelectorAll('.kruispunt');
    const cols = parseInt(document.getElementById('inputCols').value);
    const rows = parseInt(document.getElementById('inputRows').value); 

    let start = null;
    let groen = [];
    let rood = [];

    // Neem de ingevoerde punten
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
	
    // Geen start geplaatst
    if (!start || groen.length === 0) {
    	alert("Zet een blauwe start positie en min. 1 groen punt");
      	return;
    }
	
    let huidigePos = start;
    let nogTePlaatsen = [...groen];
    let route = [start];
  
    // Loop zolang nog niet alle torentjes geplaatst/bereikt zijn
    while (nogTePlaatsen.length > 0) {
    	let dichtstbijzijnde;
    	let kortstePad;
      
        // Zoek het dichtsbijzijnde groen punt
      	for (let i = 0; i < nogTePlaatsen.length; i++) {
            // Bereken korste pad naar punt
            let pad = vindPad(huidigePos, nogTePlaatsen[i], rood, rows, cols);

            // Check of het pad korter is dan vorige gezochten paden
            if (pad && (!kortstePad || pad.length < kortstePad.length)) {
                kortstePad = pad;
                dichtstbijzijnde = i;
            }
        }

        // Er is geen route/bereikbaar groen punt
		if (!kortstePad) {
            alert("Sommige groene punten zijn onbereikbaar door de rode muren!");
            return;
        }
      
        // Voeg het pad toe aan de totale route
        route.push(...kortstePad);
        // Sla de positie op waar het pad is geeindigd
      	huidigePos = nogTePlaatsen[dichtstbijzijnde];
        // Verwijder het groene punt van de ongeplaatste punten lijst
      	nogTePlaatsen.splice(dichtstbijzijnde, 1);
    }

    // Bereken pad van laatste groene punt naar de start positie
    let terugPad = vindPad(huidigePos, start, rood, rows, cols);

    // Er is geen route terug
    if (!terugPad) {
        alert("Kan niet terugkeren naar de startpositie!");
        return;
    }

    // Code voor animatie te tonen op website (niet toegevoegd aan deze upload)
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

    sendRoute(heenRoute, terugRoute, groen);
}

function naarCoordArray(punten) {
    return punten.map(p => [p.r, p.c]);
}

function sendRoute(heenRoute, terugRoute, groen) {
    const json = {
        heenroute: naarCoordArray(heenRoute),
        terugroute: naarCoordArray(terugRoute),
        groenpunten: naarCoordArray(groen)
    };

    // Example output:
    /*
    {
        "heenroute":[[0,2],[1,2],[2,2],[2,3],[2,4],[2,5],[2,6]],
        "terugroute":[[2,6],[1,6],[1,5],[1,4],[1,3],[1,2],[0,2]],
        "groenpunten":[[2,6]]
    }
    */

    sendCommand(JSON.stringify(json))
}

function verwijderRoute() { // Niet in flowchart
    document.querySelectorAll('.route-lijn').forEach(e => e.remove());
    getekendeSegmenten.clear();
}

function segmentKey(a, b) { // Niet in flowchart
    const k1 = `${a.r},${a.c}-${b.r},${b.c}`;
    const k2 = `${b.r},${b.c}-${a.r},${a.c}`;
    return k1 < k2 ? k1 : k2;
}

function tekenRouteAnimatie(route, kleur = "yellow", startDelay = 0) { // Niet in flowchart
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
