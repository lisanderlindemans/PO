import board
import digitalio
import analogio
import pwmio
import time

MOTOR_L_PWM = pwmio.PWMOut(board.GP19, frequency=1000)
MOTOR_L_DIR = digitalio.DigitalInOut(board.GP20)
MOTOR_L_DIR.direction = digitalio.Direction.OUTPUT
MOTOR_R_PWM = pwmio.PWMOut(board.GP21, frequency=1000)
MOTOR_R_DIR = digitalio.DigitalInOut(board.GP22)
MOTOR_R_DIR.direction = digitalio.Direction.OUTPUT

# staan voor respectievelijk links, rechts en achter
LDR_L = analogio.AnalogIn(board.GP26)
LDR_R = analogio.AnalogIn(board.GP27)
LDR_A = analogio.AnalogIn(board.GP28)

GRENSWAARDE_LDR = (
    0.28  # LDR-voltage moet BOVEN deze waarde liggen om zwart te detecteren
)
MOTOR_R_DUTY = 30000
MOTOR_L_DUTY = 33000
THRESHOLD_AUTOCORRECT = 0.06
MOTOR_R_FORWARD = True
MOTOR_L_FORWARD = False

def calculate_voltage(value):
    return (value * 3.3) / 65535

def draai_rechts():
    MOTOR_R_DIR.value = not MOTOR_R_FORWARD
    MOTOR_L_DIR.value = MOTOR_L_FORWARD
    MOTOR_R_PWM.duty_cycle = round(MOTOR_R_DUTY * 0.8)
    MOTOR_L_PWM.duty_cycle = round(MOTOR_L_DUTY * 0.8)
    time.sleep(1.5)
    while calculate_voltage(LDR_L.value) < GRENSWAARDE_LDR:
        time.sleep(0.01)
    MOTOR_R_PWM.duty_cycle = 0
    MOTOR_L_PWM.duty_cycle = 0
    MOTOR_R_DIR.value = MOTOR_R_FORWARD
    MOTOR_L_DIR.value = MOTOR_L_FORWARD

def draai_links():
    MOTOR_L_DIR.value = not MOTOR_L_FORWARD
    MOTOR_R_DIR.value = MOTOR_R_FORWARD
    MOTOR_R_PWM.duty_cycle = round(MOTOR_R_DUTY * 0.8)
    MOTOR_L_PWM.duty_cycle = round(MOTOR_L_DUTY * 0.8)
    time.sleep(1.5)
    while calculate_voltage(LDR_R.value) < GRENSWAARDE_LDR:
        time.sleep(0.01)
    MOTOR_R_PWM.duty_cycle = 0
    MOTOR_L_PWM.duty_cycle = 0
    MOTOR_L_DIR.value = MOTOR_L_FORWARD
    MOTOR_R_DIR.value = MOTOR_R_FORWARD

def rijd_rechtdoor():
    MOTOR_L_DIR.value = MOTOR_L_FORWARD
    MOTOR_R_DIR.value = MOTOR_R_FORWARD
    MOTOR_L_PWM.duty_cycle = round(MOTOR_L_DUTY * 1.5)
    MOTOR_R_PWM.duty_cycle = round(MOTOR_R_DUTY * 1.5)
    time.sleep(1.0)
    while calculate_voltage(LDR_A.value) < GRENSWAARDE_LDR:
        if calculate_voltage(LDR_R.value) - calculate_voltage(LDR_L.value) > THRESHOLD_AUTOCORRECT: # Stuur NAAR rechts bij
            MOTOR_R_PWM.duty_cycle = round(MOTOR_R_DUTY * 0.8)
            MOTOR_L_PWM.duty_cycle = round(MOTOR_L_DUTY * 1.5)
        elif calculate_voltage(LDR_L.value) - calculate_voltage(LDR_R.value) > THRESHOLD_AUTOCORRECT: # Stuur NAAR links bij
            MOTOR_L_PWM.duty_cycle = round(MOTOR_L_DUTY * 0.8)
            MOTOR_R_PWM.duty_cycle = round(MOTOR_R_DUTY * 1.5)
        else:
            MOTOR_L_PWM.duty_cycle = round(MOTOR_L_DUTY * 1.5)
            MOTOR_R_PWM.duty_cycle = round(MOTOR_R_DUTY * 1.5)
        time.sleep(0.01)
    MOTOR_L_PWM.duty_cycle = 0
    MOTOR_R_PWM.duty_cycle = 0
