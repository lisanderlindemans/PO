window.noodStop = function () {
  if (window.getState() === "TIMEUP" || window.getState() === "PARKED") return;

  const json = { 
    "noodstop": true
  }

  window.sendCommand(JSON.stringify(json));

  window.setState("ESTOP");
  window.render();
}