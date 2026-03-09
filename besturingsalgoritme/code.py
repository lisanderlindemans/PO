import time
import board
from analogio import AnalogIn
from wifi_verbinding import wifi_loop, start_wifi, route_data

# DEBUG MODE
debug = True

def debug(s):
    if debug:
        print(s)

def calculate_voltage(value):
    return (value * 3.3) / 65535

ldr_links_voor = AnalogIn(board.GP27) # PIN MOET NOG VERVANGEN
ldr_rechts_voor = AnalogIn(board.GP27)
ldr_achter = AnalogIn(board.GP27)

start_wifi()

reftijd = time.monotonic()

while True:
    wifi_loop()

    nu = time.monotonic()
    
    if route_data is not None:
        heenroute = route_data["heenroute"]
        terugroute = route_data["terugroute"]
        groenpunten = route_data["groenpunten"]

        debug("Heenroute ontvangen:")
        debug(heenroute)

    time.sleep(0.01)