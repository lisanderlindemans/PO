const slider = document.getElementById("throttle");
const output = document.getElementById("value");

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
    window.sendCommand(JSON.stringify({
      type: "manual_control",
      throttle: val
    }));
  }, 50);
});

function links() {
  window.sendCommand(JSON.stringify({
    type: "manual_control",
    action: "links"
  }));
}

function rechts(){
  window.sendCommand(JSON.stringify({
    type: "manual_control",
    action: "rechts"
  }));
}

const manualSwitch = document.getElementById('manualSwitch');
const toggleLabel = document.getElementById('toggleLabel');

manualSwitch.addEventListener('change', function() {
    if(this.checked) {
        toggleLabel.textContent = "Manuele Besturing: Connecting";
        window.connect_socket();
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
    window.sendCommand(JSON.stringify({
        type: "mode",
        value: "manual"
    }));
}

function disableManualControl() {
    document.getElementById('throttle').disabled = true;
    document.querySelectorAll('.arrow-btn').forEach(btn => btn.disabled = true);

    // disable
    window.sendCommand(JSON.stringify({
        type: "mode",
        value: "auto"
    }));
}

window.__poShared.addStatusListener((sharedStatus) => {
  if (!manualSwitch.checked) return;
  if (sharedStatus === "connected") toggleLabel.textContent = "Manuele Besturing: ON";
  else if (sharedStatus === "connecting") toggleLabel.textContent = "Manuele Besturing: Connecting";
  else toggleLabel.textContent = "Manuele Besturing: Disconnected";
});
