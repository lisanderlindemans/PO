const slider = document.getElementById("throttle");
const output = document.getElementById("value");

let ws;

slider.addEventListener("input", () => {
  let val = parseInt(slider.value);

  if (Math.abs(val) < 5) val = 0;

  output.textContent = val;

  ws.send(JSON.stringify({
    type: "manual_control",
    throttle: val
  }));
});

function links() {
  ws.send(JSON.stringify({
    type: "manual_control",
    action: "links"
  }));
}

function rechts(){
  ws.send(JSON.stringify({
    type: "manual_control",
    action: "rechts"
  }));
}

const manualSwitch = document.getElementById('manualSwitch');
const toggleLabel = document.getElementById('toggleLabel');

manualSwitch.addEventListener('change', function() {
    if(this.checked) {
        toggleLabel.textContent = "Manuele Besturing: ON";
        ws = new WebSocket("ws://192.168.4.1/connect-websocket");
        enableManualControl();
    } else {
        toggleLabel.textContent = "Manuele Besturing: OFF";
        disableManualControl();
    }
});

function enableManualControl() {
    document.getElementById('throttle').disabled = false;
    document.querySelectorAll('.arrow-btn').forEach(btn => btn.disabled = false);

    // enable
    ws.send(JSON.stringify({
        type: "mode",
        value: "manual"
    }));
}

function disableManualControl() {
    document.getElementById('throttle').disabled = true;
    document.querySelectorAll('.arrow-btn').forEach(btn => btn.disabled = true);

    // disable
    ws.send(JSON.stringify({
        type: "mode",
        value: "auto"
    }));
}