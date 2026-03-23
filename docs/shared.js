window.noodStop = function () {

  // niets doen als het spel al voorbij is
  if (window.getState() === "TIMEUP" || window.getState() === "PARKED") return;

  window.setState("NOODSTOP");

  const gameStatus = document.getElementById("gameStatus");
  const hint = document.getElementById("statusHint");

  if (gameStatus) gameStatus.textContent = "NOODSTOP";
  if (hint) hint.textContent = "NOODSTOP actief (timer loopt door).";

  if (typeof window.render === "function") {
    window.render();
  }

  const ws = new WebSocket("ws://192.168.4.1/connect-websocket");
  
  ws.onopen = () => {
    ws.send(JSON.stringify({ noodstop: true }));
  };
}

function noodStop_snelsteroute() {
  const ws = new WebSocket("ws://192.168.4.1/connect-websocket");
  
  ws.onopen = () => {
    ws.send(JSON.stringify({ noodstop: true }));
  };
}