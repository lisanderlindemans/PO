/************************************************************
 * 1) SPELREGELS (opdracht)
 ************************************************************/
const GAME_SECONDS = 240;             // 4 minuten
const ACC_POINTS   = { 1:100, 2:70, 3:50, 4:40, 5:20, 0:0 }; // accuraatheid → basispunten

// Oriëntatie beïnvloedt punten:
// - upright: punten blijven
// - side: halve punten
// - upside_down: 0 punten
function applyOrientation(points, orientation) {
  if (orientation === "upside_down") return 0;
  if (orientation === "side") return Math.floor(points / 2);
  return points;
}

/************************************************************
 * 2) STATE (speltoestand)
 ************************************************************/
// Mogelijke states:
// READY  : klaar om te starten
// RUNNING: timer loopt
// ESTOP  : noodstop (timer loopt door volgens jouw regel)
// PARKED : in garage (timer stopt, resterende tijd wordt bonus bij score)
// TIMEUP : tijd is op
let state = "READY";

// Resterende seconden
let remaining = GAME_SECONDS;

// Timer handle (setInterval)
let timerHandle = null;

// Groene torens: 4 items met level, orientation en points
const greens = Array.from({length: 4}, () => ({
  level: null,
  orientation: "upright",
  points: 0
}));

// Rode torens: set met unieke ids ("1".."5")
const redTouched = new Set();

// Garage status
let parkedInGarage = false;

// Undo/Redo stacks
const undoStack = [];
const redoStack = [];

/************************************************************
 * 3) UI references (koppeling naar HTML elementen)
 ************************************************************/
const timeLeftEl     = document.getElementById("timeLeft");
const totalScoreEl   = document.getElementById("totalScore");

// Let op: spelstatus is gameStatus (niet status!)
const statusEl       = document.getElementById("gameStatus");
const statusHintEl   = document.getElementById("statusHint");

const redCountEl     = document.getElementById("redCount");
const redPenaltyEl   = document.getElementById("redPenalty");
const garageBonusEl  = document.getElementById("garageBonus");
const timeBonusEl    = document.getElementById("timeBonus");

const greensControlsEl = document.getElementById("greensControls");
const redsControlsEl   = document.getElementById("redsControls");

const startBtn = document.getElementById("startBtn");
const resetBtn = document.getElementById("resetBtn");
const undoBtn  = document.getElementById("undoBtn");
const redoBtn  = document.getElementById("redoBtn");
const noodBtn  = document.getElementById("noodBtn");
const parkBtn  = document.getElementById("parkBtn");

/************************************************************
 * 4) SCORE helpers
 ************************************************************/
function allGreensPlaced() {
  return greens.every(g => g.level !== null);
}

function computeGreensScore() {
  return greens.reduce((sum, g) => sum + (g.points || 0), 0);
}

// Straf: -50 per uniek rood geraakt
function computeRedPenalty() {
  return redTouched.size * 50;
}

// Garage bonus: +100 als geparkeerd en nog tijd over 
function computeGarageBonus() {
  return parkedInGarage && remaining > 0 ? 100 : 0;
}

// Tijdbonus: +1 per resterende seconde als ALLE groen geplaatst én geparkeerd binnen tijd
function computeTimeBonus() {
  if (parkedInGarage && remaining > 0 && allGreensPlaced()) return remaining;
  return 0;
}

function computeTotalScore() {
  return computeGreensScore() - computeRedPenalty() + computeGarageBonus() + computeTimeBonus();
}

/************************************************************
 * 5) UNDO/REDO model
 ************************************************************/
// Acties die we onthouden:
// - set_green: wijzig groen torentje (accuracy/orientation)
// - touch_red: rood geraakt
// - set_parked: garage toggle inclusief state/timer gedrag
function pushAction(action) {
  undoStack.push(action);
  redoStack.length = 0;
  render();
}

function applyAction(action, direction) {
  const doIt = (direction === "do");

  if (action.type === "set_green") {
    const idx = action.index;
    const data = doIt ? action.next : action.prev;
    greens[idx].level = data.level;
    greens[idx].orientation = data.orientation;
    greens[idx].points = data.points;
    return;
  }
  if (action.type === "set_parked") {
    parkedInGarage = doIt ? action.next : action.prev;

    // state + timer status terugzetten
    state = doIt ? action.nextState : action.prevState;
    const shouldRun = doIt ? action.nextTimerRunning : action.prevTimerRunning;
    setTimerRunning(shouldRun);
    return;
  }
  if (action.type === "toggle_red") {
    if (doIt) {
      if (action.next) redTouched.add(action.id);
      else redTouched.delete(action.id);
    } else {
      if (action.prev) redTouched.add(action.id);
      else redTouched.delete(action.id);
    }
    return;
  }
}

function undo() { //de undo button
  if (undoStack.length === 0) return;
  const action = undoStack.pop();
  applyAction(action, "undo");
  redoStack.push(action);
  render();
}

function redo() { //de redo button
  if (redoStack.length === 0) return;
  const action = redoStack.pop();
  applyAction(action, "do");
  undoStack.push(action);
  render();
}

/************************************************************
 * 6) TIMER control
 ************************************************************/
function setTimerRunning(running) {
  const isCurrentlyRunning = (timerHandle !== null);

  if (running && !isCurrentlyRunning) {

    // 🔥 Onmiddellijke eerste tick
    timerTick();

    timerHandle = setInterval(timerTick, 1000);
  }

  if (!running && isCurrentlyRunning) {
    clearInterval(timerHandle);
    timerHandle = null;
  }
}

function timerTick() {
  if (!(state === "RUNNING" || state === "ESTOP")) return;

  remaining--;

  if (remaining <= 0) {
    remaining = 0;
    state = "TIMEUP";
    clearInterval(timerHandle);
    timerHandle = null;
  }

  render();
}

function startGame() {
  if (state !== "READY") return;
  state = "RUNNING";
  setTimerRunning(true);
  render();
}

function resetGame() {
  state = "READY";
  remaining = GAME_SECONDS;
  parkedInGarage = false;

  redTouched.clear();
  greens.forEach(g => { g.level = null; g.orientation = "upright"; g.points = 0; });

  undoStack.length = 0;
  redoStack.length = 0;

  setTimerRunning(false);
  updateGreenInfo();
  render();
}

/************************************************************
 * 7) CONTROLS: groen/rood/garage/noodstop
 ************************************************************/
function setGreenAccuracy(idx, level) {
  const prev = {...greens[idx]};
  const base = ACC_POINTS[level] ?? 0;
  const pts  = applyOrientation(base, greens[idx].orientation);

  const next = { level, orientation: greens[idx].orientation, points: pts };

  applyAction({ type:"set_green", index: idx, prev, next }, "do");
  pushAction({ type:"set_green", index: idx, prev, next });

  updateGreenInfo();
  render();
}

function setGreenOrientation(idx, orientation) {
  const prev  = {...greens[idx]};
  const level = greens[idx].level ?? 0;
  const base  = ACC_POINTS[level] ?? 0;
  const pts   = applyOrientation(base, orientation);

  const next = { level: greens[idx].level, orientation, points: pts };

  applyAction({ type:"set_green", index: idx, prev, next }, "do");
  pushAction({ type:"set_green", index: idx, prev, next });

  updateGreenInfo();
  render();
}

function touchRed(id) {
  const prev = redTouched.has(id);
  const next = !prev;

  const action = {
    type: "toggle_red",
    id,
    prev,
    next
  };

  applyAction(action, "do");
  pushAction(action);
  render();
}

// Garage knop: timer stopt wanneer geparkeerd, en score gebruikt remaining als bonus-regel
function toggleParked() {
  const prev = parkedInGarage;
  const next = !parkedInGarage;

  const prevState = state;
  const prevTimerRunning = (timerHandle !== null);

  let nextState;
  let nextTimerRunning;

  if (next === true) {
    nextState = "PARKED";
    nextTimerRunning = false;  // timer stopt meteen
  } else {
    if (remaining <= 0) nextState = "TIMEUP";
    else if (prevState !== "READY") nextState = "RUNNING";
    else nextState = "READY";

    nextTimerRunning = (nextState === "RUNNING" || nextState === "ESTOP");
  }

  const action = {
    type: "set_parked",
    prev, next,
    prevState, nextState,
    prevTimerRunning, nextTimerRunning
  };

  applyAction(action, "do");
  pushAction(action);
  render();
}

// NOODSTOP: timer blijft lopen (als hij al liep)
function eStop() {
  if (state === "READY") {
    // In READY loopt timer nog niet, maar we tonen ESTOP als status
    state = "ESTOP";
  } else if (state !== "TIMEUP" && state !== "PARKED") {
    state = "ESTOP";
  }
  render();
}

/************************************************************
 * 8) UI opbouwen (groen/rood knoppen)
 ************************************************************/
function buildGreenControls() {
  greensControlsEl.innerHTML = "";

  const accButtons = [
    {label:"100", level:1},
    {label:"70",  level:2},
    {label:"50",  level:3},
    {label:"40",  level:4},
    {label:"20",  level:5},
    {label:"0",   level:0},
  ];

  const oriButtons = [
    {label:"Recht",        val:"upright"},
    {label:"Zijkant (½)",  val:"side"},
    {label:"Kop (0)",      val:"upside_down"},
  ];

  for (let i = 0; i < 4; i++) {
    const wrap = document.createElement("div");
    wrap.className = "box";

    const header = document.createElement("div");
    header.className = "greenHeader";
    header.innerHTML = `<div class="title">Groen ${i+1}</div><div class="pill" id="gpill${i}">punten: 0</div>`;
    wrap.appendChild(header);

    const accLbl = document.createElement("div");
    accLbl.className = "muted";
    accLbl.textContent = "Accuraatheid:";
    wrap.appendChild(accLbl);

    accButtons.forEach(b => {
      const btn = document.createElement("button");
      btn.textContent = b.label;
      btn.dataset.type = "acc";
      btn.dataset.index = String(i);
      btn.dataset.level = String(b.level);
      btn.addEventListener("click", () => setGreenAccuracy(i, b.level));
      wrap.appendChild(btn);
    });

    wrap.appendChild(document.createElement("div")).style.marginTop = "8px";

    const oriLbl = document.createElement("div");
    oriLbl.className = "muted";
    oriLbl.textContent = "Oriëntatie:";
    wrap.appendChild(oriLbl);

    oriButtons.forEach(b => {
      const btn = document.createElement("button");
      btn.textContent = b.label;
      btn.dataset.type = "ori";
      btn.dataset.index = String(i);
      btn.dataset.ori = b.val;
      btn.addEventListener("click", () => setGreenOrientation(i, b.val));
      wrap.appendChild(btn);
    });

    const info = document.createElement("div");
    info.className = "muted";
    info.style.marginTop = "8px";
    info.id = `ginfo${i}`;
    info.textContent = "Nog geen score ingesteld.";
    wrap.appendChild(info);

    greensControlsEl.appendChild(wrap);
  }
}

function buildRedControls() {
  redsControlsEl.innerHTML = "";
  for (let i = 1; i <= 5; i++) {
    const btn = document.createElement("button");
    btn.textContent = `Rood #${i} geraakt`;
    btn.dataset.red = String(i);
    btn.addEventListener("click", () => touchRed(String(i)));
    redsControlsEl.appendChild(btn);
  }
}

function updateGreenInfo() {
  for (let i = 0; i < 4; i++) {
    const pill = document.getElementById(`gpill${i}`);
    const info = document.getElementById(`ginfo${i}`);
    if (!pill || !info) continue;

    pill.textContent = `punten: ${greens[i].points}`;
    const lvl = greens[i].level === null ? "—" : greens[i].level;
    info.textContent = `Niveau: ${lvl} | Oriëntatie: ${greens[i].orientation} | Punten: ${greens[i].points}`;
  }
}

function updateButtonHighlights() {
  // reset green highlights
  document.querySelectorAll("button[data-type='acc']").forEach(btn => btn.classList.remove("active-acc"));
  document.querySelectorAll("button[data-type='ori']").forEach(btn => btn.classList.remove("active-ori"));

  for (let i = 0; i < 4; i++) {
    if (greens[i].level !== null) {
      const accBtn = document.querySelector(
        `button[data-type='acc'][data-index='${i}'][data-level='${greens[i].level}']`
      );
      if (accBtn) accBtn.classList.add("active-acc");
    }

    const oriBtn = document.querySelector(
      `button[data-type='ori'][data-index='${i}'][data-ori='${greens[i].orientation}']`
    );
    if (oriBtn) oriBtn.classList.add("active-ori");
  }

  // red highlights
  document.querySelectorAll("button[data-red]").forEach(btn => btn.classList.remove("active-red"));
  for (const id of redTouched) {
    const redBtn = document.querySelector(`button[data-red='${id}']`);
    if (redBtn) redBtn.classList.add("active-red");
  }

  // park highlight
  if (parkedInGarage) parkBtn.classList.add("active-park");
  else parkBtn.classList.remove("active-park");
}

/************************************************************
 * 9) RENDER: alles updaten op scherm
 ************************************************************/
function render() {
  timeLeftEl.textContent   = remaining;
  totalScoreEl.textContent = computeTotalScore();

  redCountEl.textContent   = redTouched.size;
  redPenaltyEl.textContent = `-${computeRedPenalty()}`;
  garageBonusEl.textContent= `${computeGarageBonus()}`;
  timeBonusEl.textContent  = `${computeTimeBonus()}`;

  // spelstatus naar de UI
  statusEl.textContent = state;

  if (state === "READY")   statusHintEl.textContent = "Klaar om te starten.";
  else if (state === "RUNNING") statusHintEl.textContent = "Timer loopt.";
  else if (state === "ESTOP")   statusHintEl.textContent = "NOODSTOP actief (timer loopt door).";
  else if (state === "PARKED")  statusHintEl.textContent = "Geparkeerd: timer gestopt, score vastgelegd.";
  else if (state === "TIMEUP")  statusHintEl.textContent = "Tijd is op.";

  parkBtn.textContent = `Parked in garage: ${parkedInGarage ? "JA" : "NEE"}`;

  undoBtn.disabled  = undoStack.length === 0;
  redoBtn.disabled  = redoStack.length === 0;

  startBtn.disabled = (state !== "READY");

  updateGreenInfo();
  updateButtonHighlights();
}

/************************************************************
 * 10) WIRING: knoppen koppelen aan functies
 ************************************************************/
startBtn.addEventListener("click", startGame);
resetBtn.addEventListener("click", resetGame);
undoBtn.addEventListener("click", undo);
redoBtn.addEventListener("click", redo);
noodBtn.addEventListener("click", eStop);
parkBtn.addEventListener("click", toggleParked);

// Initial UI build
buildGreenControls();
buildRedControls();
render();

/************************************************************
 * 11) OPDRACHT: WebSocket skelet-code (INTACT)
 ************************************************************
 * LET OP:
 * - Deze code gebruikt id="status" in de DOM.
 * - Daarom gebruiken wij id="gameStatus" voor de spelstatus.
 *
 * In de opdracht staat ook:
 *   socket = new WebSocket("ws://192.168.4.1:80/connect-websocket");
 * We laten dat intact zoals gevraagd.
 ************************************************************/
let socket = undefined;

function connect_socket() {
    // Close any existing sockets
    disconnect_socket();

    socket = new WebSocket("ws://192.168.4.1:80/connect-websocket");

    // Connection opened
    socket.addEventListener("open", (event) => {
        document.getElementById("status").textContent = "Status: Connected";
    });

    socket.addEventListener("close", (event) => {
        socket = undefined;
        document.getElementById("status").textContent = "Status: Disconnected";
    });

    socket.addEventListener("message", (event) => {
        console.log(event.data)
    });

    socket.addEventListener("error", (event) => {
        socket = undefined;
        document.getElementById("status").textContent = "Status: Disconnected";
    });
}

function disconnect_socket() {
    if(socket != undefined) {
        socket.close();
    }
}

function sendCommand(command) {
    if(socket != undefined) {
        socket.send(command)
    } else {
        alert("Not connected to the PICO")
    }
}

/************************************************************
 * 12) LATER uitbreiden (optioneel)
 ************************************************************
 * Als je later wél commando's wil sturen vanaf je bestaande knoppen,
 * dan kan je bv. IN je bestaande event handlers iets toevoegen zoals:
 *
 *   sendCommand("ESTOP");
 *   sendCommand("PARK");
 *
 * Maar momenteel doen we dat niet automatisch, enkel connecten.
 ************************************************************/
