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

let intervalLinks = null;
let intervalRechts = null;

const btnLinks = document.querySelectorAll('.arrow-btn')[0];

btnLinks.addEventListener("mousedown", () => {
  intervalLinks = setInterval(() => {
    ws.send(JSON.stringify({
      type: "manual_control",
      action: "links"
    }));
  }, 100);
});

btnLinks.addEventListener("mouseup", stopLinks);
btnLinks.addEventListener("mouseleave", stopLinks);

function stopLinks() {
  if (intervalLinks) {
    clearInterval(intervalLinks);
    intervalLinks = null;
  }
}

const btnRechts = document.querySelectorAll('.arrow-btn')[1];

btnRechts.addEventListener("mousedown", () => {
  intervalRechts = setInterval(() => {
    ws.send(JSON.stringify({
      type: "manual_control",
      action: "rechts"
    }));
  }, 100);
});

btnRechts.addEventListener("mouseup", stopRechts);
btnRechts.addEventListener("mouseleave", stopRechts);

function stopRechts() {
  if (intervalRechts) {
    clearInterval(intervalRechts);
    intervalRechts = null;
  }
}

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
