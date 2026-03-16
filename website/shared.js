window.noodStop = function () {
  if (getState() === "TIMEUP" || getState() === "PARKED") return;

  const json = { 
    "noodstop": true
  }

  sendCommand(JSON.stringify(json));

  setState("ESTOP");
  render();
}