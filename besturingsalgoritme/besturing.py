import board
import digitalio
import analogio
import pwmio
import time

MOTOR_L_PWM = pwmio.PWMOut(board.GP19,frequency=1000)
MOTOR_L_DIR = digitalio.DigitalInOut(board.GP20)
MOTOR_L_DIR.direction = digitalio.Direction.OUTPUT
MOTOR_R_PWM = pwmio.PWMOut(board.GP21,frequency=1000)
MOTOR_R_DIR = digitalio.DigitalInOut(board.GP22)
MOTOR_R_DIR.direction = digitalio.Direction.OUTPUT

# Sstaan voor respectievelijk links, rechts en achter
LDR_L = analogio.AnalogIn(board.GP26)
LDR_R = analogio.AnalogIn(board.GP27)
LDR_A = analogio.AnalogIn(board.GP28)

GRENSWAARDE_LDR = 2.9 # LDR-voltage moet onder deze waarde liggen om zwart te detecteren
MOTOR_R_DUTY = 40000
MOTOR_L_DUTY = 30000

def calculate_voltage(value):
    return (value * 3.3) / 65535

def draai_rechts():
    while calculate_voltage(LDR_L.value) > GRENSWAARDE_LDR:
        MOTOR_R_PWM.duty_cycle = 40000
        MOTOR_L_PWM.duty_cycle = 30000
        MOTOR_R_DIR = False
        print("Naar rechts aan het draaien!")
        time.sleep(0.1)
    MOTOR_R_DIR = True

MOTOR_L_DIR.value = True
MOTOR_R_DIR.value = True

while True:
    if calculate_voltage(LDR_A.value) < GRENSWAARDE_LDR:
        MOTOR_R_PWM.duty_cycle = 0
        MOTOR_L_PWM.duty_cycle = 0
        draai_rechts()
    else:
        MOTOR_R_PWM.duty_cycle = 40000
        MOTOR_L_PWM.duty_cycle = 30000

    time.sleep(0.1)