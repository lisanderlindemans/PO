import socketpool
import wifi
import time
from adafruit_httpserver import Server, Request, GET, Websocket
import board

SSID = "PICO-TEAM-106"      # Verander X naar groepsnummer
PASSWORD = "TmV2CA1x0z39oipbI47A"     # Minstens 8 tekens, verander voor veiligheid

wifi.radio.start_ap(ssid=SSID, password=PASSWORD)

# print IP adres
print("My IP address is", wifi.radio.ipv4_address_ap)

pool = socketpool.SocketPool(wifi.radio)
server = Server(pool, "/static", debug=True)

websocket = None

# Deze functie wordt uitgevoerd wanneer de server een HTTP request ontvangt
@server.route("/connect-websocket", GET)
def connect_client(request: Request):
    global websocket  # pylint: disable=global-statement

    if websocket is not None:
        websocket.close()  # Close any existing connection

    websocket = Websocket(request)
    return websocket

server.start(str(wifi.radio.ipv4_address_ap))

while True:
    server.poll() #de wifi

    if websocket is not None:
        data = websocket.receive(fail_silently=True)
        if data is not None:
            print(data)