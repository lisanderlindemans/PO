import board
import busio
import time
import adafruit_us100
from wifi_verbinding import debug

uart = busio.UART(board.GP0, board.GP1, baudrate=9600)
sensor = adafruit_us100.US100(uart)

AANTAL_METINGEN = 5
BOTSING_DREMPEL = 10  # cm
BOTSING_MIN_METINGEN = 3
BOTSING_COUNTER = 0

def meet_gemiddelde():
    metingen = []
    for i in range(AANTAL_METINGEN):
        afstand = sensor.distance
        if afstand is not None and afstand > 0:
            metingen.append(afstand)
        time.sleep(0.05)
    if len(metingen) > 0:
        return sum(metingen)/len(metingen)
    else:
        return None

def check_botsing_sensor():
    afstand = meet_gemiddelde()
    if afstand is not None:
        debug(f"Afstand: {afstand:.1f} cm")

        if afstand < BOTSING_DREMPEL:
            BOTSING_COUNTER += 1
        else:
            BOTSING_COUNTER = 0

        if BOTSING_COUNTER >= BOTSING_MIN_METINGEN:
            debug("Botsing gedetecteerd")
            return True
    
    return False
