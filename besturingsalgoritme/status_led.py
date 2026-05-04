import board
import pwmio
import math
import time
import route_volger
from besturing import MOTOR_L_FORWARD, MOTOR_L_DIR, MOTOR_R_DIR, MOTOR_R_FORWARD

red = pwmio.PWMOut(board.GP9, frequency=1000, duty_cycle=0)
green = pwmio.PWMOut(board.GP10, frequency=1000, duty_cycle=0)
blue = pwmio.PWMOut(board.GP11, frequency=1000, duty_cycle=0)

def set_color(r, g, b):
    red.duty_cycle = int(r * 65535)
    green.duty_cycle = int(g * 65535)
    blue.duty_cycle = int(b * 65535)

def LED_beweging(t):
    vgl = 0.5 + 0.5 * math.sin(2*math.pi*t)

    set_color(vgl, 1, vgl)

def LED_toren(t):
    if round(t) % 2 == 0:
        set_color(1, 0.2, 0.0)
    else:
        set_color(0, 0, 0)

def LED_achteruit(t):
    if round(t) % 2 == 0:
        set_color(1, 0, 0)
    else:
        set_color(0, 0, 0)

def LED_terugroute():
    set_color(0, 0, 1)

def LED_loop():
    nu =  time.monotonic()

    if MOTOR_L_DIR.value is not MOTOR_L_FORWARD and MOTOR_R_DIR.value is not MOTOR_R_FORWARD:
        LED_achteruit(nu)
    elif route_volger.terugroute:
        LED_terugroute()
    elif route_volger.toren_aan_het_plaatsen:
        LED_toren(nu)
    else:
        LED_beweging(nu)