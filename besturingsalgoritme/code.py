import time
from adafruit_httpserver import Server, Request, GET, Websocket
import board
import digitalio
import pwmio
from analogio import AnalogIn

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

reftijd = time.monotonic()

while True:
    

    nu = time.monotonic()
    
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