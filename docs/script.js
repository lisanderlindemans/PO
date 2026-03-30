const GAME_SECONDS = 240; // in seconden
const ACC_POINTS   = { 1:100, 2:70, 3:50, 4:40, 5:20, 0:0 };
const GAME_STATE_KEY = "po.homeGameState";

function applyOrientation(points, orientation) {
  if (orientation === "upside_down") return 0;
  if (orientation === "side") return Math.floor(points / 2);
  return points;
}

// Mogelijke states:
// READY  : klaar om te starten
// RUNNING: timer loopt
// NOODSTOP  : noodstop
// PARKED : in garage
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

const timeLeftEl = document.getElementById("timeLeft");
const totalScoreEl = document.getElementById("totalScore");

const statusEl = document.getElementById("gameStatus");
const statusHintEl = document.getElementById("statusHint");

const redCountEl = document.getElementById("redCount");
const redPenaltyEl = document.getElementById("redPenalty");
const garageBonusEl = document.getElementById("garageBonus");
const timeBonusEl = document.getElementById("timeBonus");

const greensControlsEl = document.getElementById("greensControls");
const redsControlsEl = document.getElementById("redsControls");

const startBtn = document.getElementById("startBtn");
const resetBtn = document.getElementById("resetBtn");
const parkBtn = document.getElementById("parkBtn");

const interventieCountEl = document.getElementById("interventieCount");
const interventiePenaltyEl = document.getElementById("interventiePenalty");
const restartPenaltyEl = document.getElementById("restartPenalty");

let interventies = 0;
let restartLevel = 0; 
let lastUpdateMs = Date.now();

function computeInterventiePenalty() {
  return interventies * 50;
}

function saveGameState() {
  localStorage.setItem(GAME_STATE_KEY, JSON.stringify({
    state,
    remaining,
    greens,
    redTouched: Array.from(redTouched),
    parkedInGarage,
    interventies,
    restartLevel,
    lastUpdateMs
  }));
}

function loadGameState() {
  try {
    const raw = localStorage.getItem(GAME_STATE_KEY);
    if (!raw) return;
    const saved = JSON.parse(raw);

    state = saved.state ?? "READY";
    remaining = Number.isFinite(saved.remaining) ? saved.remaining : GAME_SECONDS;
    parkedInGarage = !!saved.parkedInGarage;
    interventies = Number.isFinite(saved.interventies) ? saved.interventies : 0;
    restartLevel = Number.isFinite(saved.restartLevel) ? saved.restartLevel : 0;
    lastUpdateMs = Number.isFinite(saved.lastUpdateMs) ? saved.lastUpdateMs : Date.now();

    redTouched.clear();
    (saved.redTouched || []).forEach(id => redTouched.add(String(id)));

    if (Array.isArray(saved.greens) && saved.greens.length === greens.length) {
      for (let i = 0; i < greens.length; i++) {
        greens[i].level = saved.greens[i].level ?? null;
        greens[i].orientation = saved.greens[i].orientation || "upright";
        greens[i].points = Number.isFinite(saved.greens[i].points) ? saved.greens[i].points : 0;
      }
    }

    if (state === "RUNNING" || state === "NOODSTOP") {
      const elapsed = Math.floor((Date.now() - lastUpdateMs) / 1000);
      if (elapsed > 0) {
        remaining = Math.max(0, remaining - elapsed);
        lastUpdateMs = Date.now();
        if (remaining <= 0) state = "TIMEUP";
      }
    }
  } catch {
    // negeren bij corrupte storage
  }
}

function computeRestartPenalty() {
  if (restartLevel === 2) return 50;
  if (restartLevel === 3) return 100;
  return 0;
}

function allGreensPlaced() {
  return greens.every(g => g.level !== null);
}

function computeGreensScore() {
  return greens.reduce((sum, g) => sum + (g.points || 0), 0);
}

// -50 per uniek rood geraakt
function computeRedPenalty() {
  return redTouched.size * 50;
}

// +100 als geparkeerd en nog tijd over 
function computeGarageBonus() {
  return parkedInGarage && remaining > 0 ? 100 : 0;
}

// +1 per resterende seconde als ALLE groen geplaatst én geparkeerd binnen tijd
function computeTimeBonus() {
  if (parkedInGarage && remaining > 0 && allGreensPlaced()) return remaining;
  return 0;
}

function computeTotalScore() {
  return computeGreensScore()- computeRedPenalty()- computeInterventiePenalty()- computeRestartPenalty()+ computeGarageBonus()+ computeTimeBonus();
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

// immediateTick=false wordt gebruikt bij state-herstel na paginaswitch:
// de timer moet dan verder lopen zonder direct 1 extra seconde af te trekken.
function setTimerRunning(running, immediateTick = true) {
  const isCurrentlyRunning = (timerHandle !== null);

  if (running && !isCurrentlyRunning) {
    if (immediateTick) timerTick();

    timerHandle = setInterval(timerTick, 1000);
  }

  if (!running && isCurrentlyRunning) {
    clearInterval(timerHandle);
    timerHandle = null;
  }
}

function timerTick() {
  if (!(state === "RUNNING" || state === "NOODSTOP")) return;

  remaining--;
  lastUpdateMs = Date.now();

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
  lastUpdateMs = Date.now();
  setTimerRunning(true);
  render();
}

function resetGame() {
  state = "READY";
  remaining = GAME_SECONDS;
  parkedInGarage = false;
  interventies = 0;
  restartLevel = 0;
  redTouched.clear();
  greens.forEach(g => { g.level = null; g.orientation = "upright"; g.points = 0; });
  lastUpdateMs = Date.now();

  setTimerRunning(false);
  updateGreenInfo();
  render();
}

function setGreenAccuracy(idx, level) {
  const prev = {...greens[idx]};
  const base = ACC_POINTS[level] ?? 0;
  const pts  = applyOrientation(base, greens[idx].orientation);

  const next = { level, orientation: greens[idx].orientation, points: pts };

  applyAction({ type:"set_green", index: idx, prev, next }, "do");

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
  render();
}

function toggleParked() {
  const prev = parkedInGarage;
  const next = !parkedInGarage;

  const prevState = state;
  const prevTimerRunning = (timerHandle !== null);

  let nextState;
  let nextTimerRunning;

  if (next === true) {
    nextState = "PARKED";
    nextTimerRunning = false; 
  } else {
    if (remaining <= 0) nextState = "TIMEUP";
    else if (prevState !== "READY") nextState = "RUNNING";
    else nextState = "READY";

    nextTimerRunning = (nextState === "RUNNING" || nextState === "NOODSTOP");
  }

  const action = {
    type: "set_parked",
    prev, next,
    prevState, nextState,
    prevTimerRunning, nextTimerRunning
  };

  applyAction(action, "do");
  render();
}


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

  document.querySelectorAll("button[data-red]").forEach(btn => btn.classList.remove("active-red"));
  for (const id of redTouched) {
    const redBtn = document.querySelector(`button[data-red='${id}']`);
    if (redBtn) redBtn.classList.add("active-red");
  }
  document.querySelectorAll(".restartBtn").forEach(btn => {
    btn.classList.remove("active-restart");
  });
  const activeRestartBtn = document.querySelector(
    `.restartBtn[data-restart='${restartLevel}']`
  );
  if (activeRestartBtn) {
      activeRestartBtn.classList.add("active-restart");
  }


  if (parkedInGarage) parkBtn.classList.add("active-park");
  else parkBtn.classList.remove("active-park");
}

function render() {
  timeLeftEl.textContent   = remaining;
  totalScoreEl.textContent = computeTotalScore();

  redCountEl.textContent   = redTouched.size;
  redPenaltyEl.textContent = `-${computeRedPenalty()}`;
  garageBonusEl.textContent= `${computeGarageBonus()}`;
  timeBonusEl.textContent  = `${computeTimeBonus()}`;
  interventieCountEl.textContent = interventies;
  interventiePenaltyEl.textContent = `-${computeInterventiePenalty()}`;
  restartPenaltyEl.textContent = `-${computeRestartPenalty()}`;

  statusEl.textContent = state;

  if (state === "READY")   statusHintEl.textContent = "Klaar om te starten.";
  else if (state === "RUNNING") statusHintEl.textContent = "Timer loopt.";
  else if (state === "NOODSTOP")   statusHintEl.textContent = "NOODSTOP actief (timer loopt door).";
  else if (state === "PARKED")  statusHintEl.textContent = "Geparkeerd: timer gestopt, score vastgelegd.";
  else if (state === "TIMEUP")  statusHintEl.textContent = "Tijd is op.";

  parkBtn.textContent = `Parked in garage: ${parkedInGarage ? "JA" : "NEE"}`;

  startBtn.disabled = (state !== "READY");

  updateGreenInfo();
  updateButtonHighlights();
  saveGameState();
}

startBtn.addEventListener("click", startGame);
resetBtn.addEventListener("click", resetGame);
parkBtn.addEventListener("click", toggleParked);

document.getElementById("interventiePlus").addEventListener("click", () => {
  interventies++;
  render();
});

document.getElementById("interventieMinus").addEventListener("click", () => {
  if (interventies > 0) interventies--;
  render();
});

document.querySelectorAll(".restartBtn").forEach(btn => {
  btn.addEventListener("click", () => {
    restartLevel = parseInt(btn.dataset.restart);
    render();
  });
});

buildGreenControls();
buildRedControls();
loadGameState();
if (state === "RUNNING" || state === "NOODSTOP") {
  setTimerRunning(true, false);
}
render();

window.__poShared.addStatusListener((sharedStatus) => {
  const statusEl = document.getElementById("status");
  if (!statusEl) return;
  if (sharedStatus === "connected") statusEl.textContent = "Status: Connected";
  else if (sharedStatus === "connecting") statusEl.textContent = "Status: Connecting";
  else statusEl.textContent = "Status: Disconnected";
});

function setState(value) {
  state = value;
  lastUpdateMs = Date.now();
  saveGameState();
}

function getState() {
  return state;
}

window.render = render;
window.setState = setState;
window.getState = getState;
