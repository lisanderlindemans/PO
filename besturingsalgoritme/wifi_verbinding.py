import socketpool
import wifi
import time
from adafruit_httpserver import Server, Request, GET, Websocket
import board

SSID = "PICO-TEAM-106"
PASSWORD = "TmV2CA1x0z39oipbI47A"

server = None
websocket = None

def start_wifi():
    global server

    wifi.radio.start_ap(ssid=SSID, password=PASSWORD)

    print("My IP address is", wifi.radio.ipv4_address_ap)

    pool = socketpool.SocketPool(wifi.radio)
    server = Server(pool, "/static", debug=True)

    @server.route("/connect-websocket", GET)
    def connect_client(request: Request):
        global websocket

        if websocket is not None:
            websocket.close()

        websocket = Websocket(request)
        return websocket

    server.start(str(wifi.radio.ipv4_address_ap))

def wifi_loop():
    server.poll()

    if websocket is not None:
        data = websocket.receive(fail_silently=True)
        if data is not None:
            print(data)