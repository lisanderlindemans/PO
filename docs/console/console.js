let socket;

const statusEl = document.getElementById("status");
const consoleOutputEl = document.getElementById("consoleOutput");

function append_console_line(message) {
  const timestamp = new Date().toLocaleTimeString();
  consoleOutputEl.textContent += `[${timestamp}] ${message}\n`;
  consoleOutputEl.scrollTop = consoleOutputEl.scrollHeight;
}

function connect_socket() {
  disconnect_socket();

  socket = new WebSocket("ws://192.168.4.1:80/connect-websocket");

  socket.addEventListener("open", () => {
    statusEl.textContent = "Status: Connected";
    append_console_line("Connected.");
  });

  socket.addEventListener("close", () => {
    socket = undefined;
    statusEl.textContent = "Status: Disconnected";
    append_console_line("Disconnected.");
  });

  socket.addEventListener("message", (event) => {
    append_console_line(event.data);
  });

  socket.addEventListener("error", () => {
    socket = undefined;
    statusEl.textContent = "Status: Disconnected";
    append_console_line("Connection error.");
  });
}

function disconnect_socket() {
  if (socket !== undefined) {
    socket.close();
  }
}

function clear_console() {
  consoleOutputEl.textContent = "";
}

function noodStop_console() {
  if (socket !== undefined) {
    socket.send(JSON.stringify({ noodstop: true }));
    return;
  }

  const ws = new WebSocket("ws://192.168.4.1:80/connect-websocket");
  ws.onopen = () => {
    ws.send(JSON.stringify({ noodstop: true }));
    ws.close();
  };
}

window.connect_socket = connect_socket;
window.disconnect_socket = disconnect_socket;
window.clear_console = clear_console;
window.noodStop_console = noodStop_console;
