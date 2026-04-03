import board
import pwmio

red = pwmio.PWMOut(board.GP9, frequency=1000, duty_cycle=0)
green = pwmio.PWMOut(board.GP10, frequency=1000, duty_cycle=0)
blue = pwmio.PWMOut(board.GP11, frequency=1000, duty_cycle=0)

def set_color(r, g, b):
    red.duty_cycle = int(r * 65535 / 255)
    green.duty_cycle = int(g * 65535 / 255)
    blue.duty_cycle = int(b * 65535 / 255)