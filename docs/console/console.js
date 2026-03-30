const statusEl = document.getElementById("status");
const consoleOutputEl = document.getElementById("consoleOutput");

function renderLogs(lines) {
  consoleOutputEl.textContent = lines.join("\n") + (lines.length ? "\n" : "");
  consoleOutputEl.scrollTop = consoleOutputEl.scrollHeight;
}

function clear_console() {
  window.__poShared.clearLogs();
}

window.clear_console = clear_console;

window.__poShared.addStatusListener((sharedStatus) => {
  if (sharedStatus === "connected") statusEl.textContent = "Status: Connected";
  else if (sharedStatus === "connecting") statusEl.textContent = "Status: Connecting";
  else statusEl.textContent = "Status: Disconnected";
});

window.__poShared.addLogListener((logs) => {
  renderLogs(logs);
});
