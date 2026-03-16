import { render, setState, getState } from "./script.js"

window.noodStop = function () {
  if (getStatet() === "TIMEUP" || getState() === "PARKED") return;

  setState("ESTOP");
  
  const json = { 
    "noodstop": true
  }

  const ws = new WebSocket("ws://192.168.4.1/connect-websocket");
  ws.send(JSON.stringify(json))

  render();
}