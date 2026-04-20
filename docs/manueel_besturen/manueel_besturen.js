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

function sendManualAction(action) {
  window.sendCommand(JSON.stringify({
    type: "manual_control",
    action
  }));
}

const HOLD_REPEAT_MS = 100;

function setupHoldButton(button, action) {
  let intervalId = null;

  const stop = () => {
    if (intervalId) {
      clearInterval(intervalId);
      intervalId = null;
    }
  };

  const start = () => {
    if (button.disabled || intervalId) return;
    sendManualAction(action);
    intervalId = setInterval(() => sendManualAction(action), HOLD_REPEAT_MS);
  };

  button.addEventListener("pointerdown", start);
  button.addEventListener("pointerup", stop);
  button.addEventListener("pointerleave", stop);
  button.addEventListener("pointercancel", stop);
}

setupHoldButton(document.getElementById("btnLinks"), "links");
setupHoldButton(document.getElementById("btnRechts"), "rechts");

const manualSwitch = document.getElementById('manualSwitch');
const toggleLabel = document.getElementById('toggleLabel');
let manualRequested = false;

manualSwitch.addEventListener('change', function() {
    if(this.checked) {
        manualRequested = true;
        toggleLabel.textContent = "Manuele Besturing: ON";
        enableManualControl()
    } else {
        manualRequested = false;
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
  if (!manualSwitch.checked && !manualRequested) return;
  if (sharedStatus === "connected") {
    if (manualRequested) enableManualControl();
    toggleLabel.textContent = "Manuele Besturing: ON";
  }
  else if (sharedStatus === "connecting") toggleLabel.textContent = "Manuele Besturing: Connecting";
  else toggleLabel.textContent = "Manuele Besturing: Disconnected";
});
