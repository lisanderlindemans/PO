import board
import pwmio

red = pwmio.PWMOut(board.GP0, frequency=5000, duty_cycle=0)
green = pwmio.PWMOut(board.GP1, frequency=5000, duty_cycle=0)
blue = pwmio.PWMOut(board.GP2, frequency=5000, duty_cycle=0)

def set_color(r, g, b):
    red.duty_cycle = int(r * 65535 / 255)
    green.duty_cycle = int(g * 65535 / 255)
    blue.duty_cycle = int(b * 65535 / 255)