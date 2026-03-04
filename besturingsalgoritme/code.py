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

ldr1_voor = AnalogIn(board.GP27)
ldr2_voor = AnalogIn(board.GP27)
ldr_achter = AnalogIn(board.GP27)

def calculate_voltage(value):
    return (value * 3.3) / 65535

reftijd = time.monotonic()

while True:
    nu = time.monotonic()
    
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