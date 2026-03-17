const outputEl = document.getElementById("debugOutput");
const statusEl = document.getElementById("status");
const autoScrollEl = document.getElementById("autoScroll");

let socket = undefined;
let state = "READY";

function appendLine(line) {
  outputEl.textContent += `${line}\n`;
  if (autoScrollEl.checked) {
    outputEl.scrollTop = outputEl.scrollHeight;
  }
}

function connect_socket() {
  disconnect_socket();
  socket = new WebSocket("ws://192.168.4.1:80/connect-websocket");

  socket.addEventListener("open", () => {
    statusEl.textContent = "Status: Connected";
    appendLine("[socket] Connected");
  });

  socket.addEventListener("close", () => {
    socket = undefined;
    statusEl.textContent = "Status: Disconnected";
    appendLine("[socket] Disconnected");
  });

  socket.addEventListener("message", (event) => {
    try {
      const data = JSON.parse(event.data);
      if (data.debug !== undefined) {
        appendLine(data.debug);
      } else {
        appendLine(event.data);
      }
    } catch (error) {
      appendLine(event.data);
    }
  });

  socket.addEventListener("error", () => {
    socket = undefined;
    statusEl.textContent = "Status: Disconnected";
    appendLine("[socket] Error");
  });
}

function disconnect_socket() {
  if (socket !== undefined) {
    socket.close();
  }
}

function sendCommand(command) {
  if (socket !== undefined) {
    socket.send(command);
  } else {
    alert("Not connected to the PICO");
  }
}

function setState(value) {
  state = value;
}

function getState() {
  return state;
}

function render() {}

document.getElementById("connectBtn").addEventListener("click", connect_socket);
document.getElementById("clearBtn").addEventListener("click", () => {
  outputEl.textContent = "";
});

window.connect_socket = connect_socket;
window.sendCommand = sendCommand;
window.setState = setState;
window.getState = getState;
window.render = render;
