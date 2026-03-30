const SHARED_WS_HOST = location.hostname || "192.168.4.1";
const SHARED_WS_URL = `ws://${SHARED_WS_HOST}:80/connect-websocket`;
const CONNECT_WANTED_KEY = "po.connectWanted";
const CONSOLE_LOG_KEY = "po.consoleLogs";

if (!window.__poShared) {
  window.__poShared = (() => {
    let socket;
    let reconnectTimer = null;
    let status = "disconnected";
    let wanted = localStorage.getItem(CONNECT_WANTED_KEY) === "1";

    const statusListeners = new Set();
    const messageListeners = new Set();
    const logListeners = new Set();

    function notifyStatus() {
      statusListeners.forEach(fn => fn(status));
    }

    function notifyMessage(message) {
      messageListeners.forEach(fn => fn(message));
    }

    function getLogs() {
      try {
        return JSON.parse(localStorage.getItem(CONSOLE_LOG_KEY) || "[]");
      } catch {
        return [];
      }
    }

    function setLogs(logs) {
      localStorage.setItem(CONSOLE_LOG_KEY, JSON.stringify(logs.slice(-500)));
      logListeners.forEach(fn => fn(getLogs()));
    }

    function appendLog(message) {
      const logs = getLogs();
      logs.push(`[${new Date().toLocaleTimeString()}] ${message}`);
      setLogs(logs);
    }

    function scheduleReconnect() {
      if (!wanted || reconnectTimer !== null) return;
      reconnectTimer = setTimeout(() => {
        reconnectTimer = null;
        if (wanted) connect();
      }, 1000);
    }

    function connect() {
      wanted = true;
      localStorage.setItem(CONNECT_WANTED_KEY, "1");

      if (socket && (socket.readyState === WebSocket.OPEN || socket.readyState === WebSocket.CONNECTING)) {
        return;
      }

      status = "connecting";
      notifyStatus();

      socket = new WebSocket(SHARED_WS_URL);

      socket.addEventListener("open", () => {
        status = "connected";
        notifyStatus();
        appendLog("Connected.");
      });

      socket.addEventListener("message", (event) => {
        notifyMessage(event.data);
        appendLog(event.data);
      });

      socket.addEventListener("close", () => {
        socket = undefined;
        status = "disconnected";
        notifyStatus();
        appendLog("Disconnected.");
        scheduleReconnect();
      });

      socket.addEventListener("error", () => {
        status = "disconnected";
        notifyStatus();
        appendLog("Connection error.");
      });
    }

    function disconnect() {
      wanted = false;
      localStorage.setItem(CONNECT_WANTED_KEY, "0");
      if (reconnectTimer !== null) {
        clearTimeout(reconnectTimer);
        reconnectTimer = null;
      }
      if (socket) socket.close();
      status = "disconnected";
      notifyStatus();
    }

    function send(command) {
      if (socket && socket.readyState === WebSocket.OPEN) {
        socket.send(command);
        return true;
      }
      return false;
    }

    function addStatusListener(fn) {
      statusListeners.add(fn);
      fn(status);
      return () => statusListeners.delete(fn);
    }

    function addMessageListener(fn) {
      messageListeners.add(fn);
      return () => messageListeners.delete(fn);
    }

    function addLogListener(fn) {
      logListeners.add(fn);
      fn(getLogs());
      return () => logListeners.delete(fn);
    }

    function clearLogs() {
      setLogs([]);
    }

    function isWanted() {
      return wanted;
    }

    if (wanted) connect();

    return {
      connect,
      disconnect,
      send,
      addStatusListener,
      addMessageListener,
      addLogListener,
      getLogs,
      clearLogs,
      isWanted
    };
  })();
}

window.connect_socket = () => window.__poShared.connect();
window.disconnect_socket = () => window.__poShared.disconnect();

window.sendCommand = function (command) {
  if (!window.__poShared.send(command)) {
    alert("Not connected to the PICO");
  }
};

window.noodStop = function () {
  if (typeof window.getState === "function") {
    if (window.getState() === "TIMEUP" || window.getState() === "PARKED") return;
    if (typeof window.setState === "function") window.setState("NOODSTOP");
    if (typeof window.render === "function") window.render();
  }

  if (!window.__poShared.send(JSON.stringify({ noodstop: true }))) {
    const ws = new WebSocket(SHARED_WS_URL);
    ws.onopen = () => {
      ws.send(JSON.stringify({ noodstop: true }));
      ws.close();
    };
  }
};

function noodStop_snelsteroute() {
  window.noodStop();
}
