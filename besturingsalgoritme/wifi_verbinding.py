import socketpool
import wifi
from adafruit_httpserver import Server, Request, GET, Websocket
import json

# DEBUG MODE
DEBUG = True

def debug(s):
    if DEBUG:
        print(s)
        try:
            if websocket is not None:
                websocket.send_message(json.dumps({"debug": str(s)}))
        except Exception:
            pass

SSID = "PICO-TEAM-106"
PASSWORD = "TmV2CA1x0z39oipbI47A"

server = None
websocket = None
route_data = None
noodstop = False

def start_wifi():
    global server

    wifi.radio.start_ap(ssid=SSID, password=PASSWORD)

    pool = socketpool.SocketPool(wifi.radio)
    server = Server(pool, "/static", debug=True)

    @server.route("/connect-websocket", GET)
    def connect_client(request: Request):
        global websocket

        if websocket is not None:
            websocket.close()

        websocket = Websocket(request)
        return websocket

    server.start(str(wifi.radio.ipv4_address_ap), 80)

def wifi_loop():
    global route_data
    global noodstop
    global websocket

    try:
        server.poll()
    except (BrokenPipeError, OSError):
        if websocket is not None:
            try:
                websocket.close()
            except (BrokenPipeError, OSError, RuntimeError) as e:
                debug(f"Websocket close error: {e}")
            websocket = None
        return

    if websocket is not None:
        data = websocket.receive(fail_silently=True)

        if data is not None:
            debug(data)

            try:
                data_json = json.loads(data)

                if data_json.get("noodstop"):
                    debug("1")
                    noodstop = True
                else:
                    debug("2")
                    route_data = data_json
            except Exception as e:
                print("JSON error:", e)
