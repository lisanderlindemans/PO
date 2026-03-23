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

MEET_INTERVAL = 0.2  # 200 ms tussen metingen

def meet_gemiddelde():
    metingen = []
    laatste_tijd = time.monotonic()

    while len(metingen) < AANTAL_METINGEN:
        nu = time.monotonic()

        if nu - laatste_tijd >= MEET_INTERVAL:
            laatste_tijd = nu

            afstand = sensor.distance
            if afstand is not None and afstand > 0:
                metingen.append(afstand)

    if len(metingen) > 0:
        return sum(metingen) / len(metingen)
    else:
        return None

def check_botsing_sensor():
    global BOTSING_COUNTER

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