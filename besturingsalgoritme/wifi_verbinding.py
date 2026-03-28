import socketpool
import wifi
from adafruit_httpserver import Server, Request, GET, Websocket
import json

# DEBUG MODE
DEBUG = True

manual_action = None
manual_throttle = 0

def debug(s):
    if DEBUG:
        print(s)
        if websocket is not None:
            try:
                websocket.send_message(str(s)) # als error, vervang door send
            except Exception:
                pass

SSID = "PICO-TEAM-106"
PASSWORD = "TmV2CA1x0z39oipbI47A"

server = None
websocket = None
route_data = None
noodstop = False
manual_mode = False
manual_throttle = 0

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
    global manual_mode
    global manual_action
    global manual_throttle

    server.poll()

    if websocket is not None:
        data = websocket.receive(fail_silently=True)

        if data is not None:
            debug(data)

            try:
                data_json = json.loads(data)

                if data_json.get("type") == "mode":
                    if data_json.get("value") == "manuel":
                        manual_mode = True
                    else:
                        manual_mode = False
                
                elif data_json.get("type") == "manual_control":
                    if "action" in data_json:
                        manual_action = data_json.get("action")
                    elif "throttle" in data_json:
                        manual_throttle = int(data_json.get("throttle"))
                elif data_json.get("type") == "manual_control":
                    manual_action = data_json.get("action")
                elif data_json.get("noodstop"):
                    noodstop = True
                else:
                    route_data = data_json

            except Exception as e:
                print("JSON error:", e)
