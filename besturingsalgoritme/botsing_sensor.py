import board
import busio
import time
import adafruit_us100
from wifi_verbinding import debug

uart = busio.UART(board.GP0, board.GP1, baudrate=9600)
sensor = adafruit_us100.US100(uart)

BOTSING_DREMPEL = 10
BOTSING_MIN_METINGEN = 3

BOTSING_COUNTER = 0

laatste_meting_tijd = 0
MEET_INTERVAL = 0.2

def check_botsing_sensor():
    global BOTSING_COUNTER
    global laatste_meting_tijd

    nu = time.monotonic()

    # Alleen meten als interval voorbij is
    if nu - laatste_meting_tijd < MEET_INTERVAL:
        return False

    laatste_meting_tijd = nu

    afstand = sensor.distance

    if afstand is not None and afstand > 0:
        debug(f"Afstand: {afstand:.1f} cm")

        if afstand < BOTSING_DREMPEL:
            BOTSING_COUNTER += 1
        else:
            BOTSING_COUNTER = 0

        if BOTSING_COUNTER >= BOTSING_MIN_METINGEN:
            debug("Botsing gedetecteerd")
            exit()

    return False