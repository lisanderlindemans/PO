window.noodStop = function () {

  // niets doen als het spel al voorbij is
  if (window.getState() === "TIMEUP" || window.getState() === "PARKED") return;

  const json = { 
    "noodstop": true
  }
  window.sendCommand(JSON.stringify(json));

  // status van het spel aanpassen
  window.setState("ESTOP");

  // status op de pagina aanpassen
  const gameStatus = document.getElementById("gameStatus");
  const hint = document.getElementById("statusHint");

  if (gameStatus) gameStatus.textContent = "ESTOP";
  if (hint) hint.textContent = "NOODSTOP actief (timer loopt door).";

  // interface opnieuw tekenen
  if (typeof window.render === "function") {
    window.render();
  }
}