import time
import board
import digitalio
import pwmio
from analogio import AnalogIn

# DEBUG MODE
debug = True

def debug(s):
    if debug:
        print(s)

<<<<<<< HEAD
ldr1_voor = AnalogIn(board.GP27)
ldr2_voor = AnalogIn(board.GP27)
=======
ldr_links_voor = AnalogIn(board.GP27) # PIN MOET NOG VERVANGEN
ldr_rechts_voor = AnalogIn(board.GP27)
>>>>>>> 04144d168e9fff70d61352ce353c6361b2c26932
ldr_achter = AnalogIn(board.GP27)

def calculate_voltage(value):
    return (value * 3.3) / 65535

reftijd = time.monotonic()

while True:
    nu = time.monotonic()
    
<<<<<<< HEAD
    ldr1_voor_value = calculate_voltage(ldr1_voor.value)
    ldr2_voor_value = calculate_voltage(ldr2_voor.value)
    ldr_achter_value = calculate_voltage(ldr_achter.value)

    if ldr1_voor_value >= 457 and ldr1_voor_value <= 465:
        debug("LDR 1 voor is op zwart.")
        ldr1_voor_black = True
    if ldr2_voor_value >= 467 and ldr2_voor_value <= 480:
        debug("LDR 2 voor is op zwart.")
        ldr2_voor_black = True
    if ldr_achter_value >= 467 and ldr_achter_value <= 473:
        debug("LDR achter is op zwart.")
        ldr_achter_black = True

    time.sleep(0.01)
=======
    ldr_links_voor_value = calculate_voltage(ldr_links_voor.value)
    ldr_rechts_voor_value = calculate_voltage(ldr_rechts_voor.value)
    ldr_achter_value = calculate_voltage(ldr_achter.value)

    if ldr_links_voor_value >= 457 and ldr_links_voor_value <= 465:
        debug("LDR 1 voor is op zwart.")
        ldr_links_voor_black = True
    else:
        ldr_links_voor_black = False

    if ldr_rechts_voor_value >= 467 and ldr_rechts_voor_value <= 480:
        debug("LDR 2 voor is op zwart.")
        ldr_rechts_voor_black = True
    else:
        ldr_rechts_voor_black = False

    if ldr_achter_value >= 467 and ldr_achter_value <= 473:
        debug("LDR achter is op zwart.")
        ldr_achter_black = True
    else:
        ldr_links_voor_black = False

    time.sleep(0.01)

import socketpool
import wifi
import time
from adafruit_httpserver import Server, Request, GET, Websocket

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
    server.poll()

    if websocket is not None:
        data = websocket.receive(fail_silently=True)
        if data is not None:
            print(data)

    time.sleep(0.1)
    
>>>>>>> 04144d168e9fff70d61352ce353c6361b2c26932
