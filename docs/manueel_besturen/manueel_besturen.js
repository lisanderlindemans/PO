const slider = document.getElementById("throttle");
const output = document.getElementById("value");

let ws;

let debounceTimeout = null;

slider.addEventListener("input", () => {
  let val = parseInt(slider.value);

  if (Math.abs(val) < 5) val = 0;

  output.textContent = val;

  // Zorgen dat wifi niet gespammed word
  if (debounceTimeout) {
    clearTimeout(debounceTimeout);
  }

  debounceTimeout = setTimeout(() => {
    ws.send(JSON.stringify({
      type: "manual_control",
      throttle: val
    }));
  }, 50);
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
        toggleLabel.textContent = "Manuele Besturing: Connecting";
        ws = new WebSocket("ws://192.168.4.1/connect-websocket");

        ws.onopen = () => {
          enableManualControl();
          toggleLabel.textContent = "Manuele Besturing: ON";
        };
    } else {
        toggleLabel.textContent = "Manuele Besturing: OFF";
        ws.close();
        ws = null;
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