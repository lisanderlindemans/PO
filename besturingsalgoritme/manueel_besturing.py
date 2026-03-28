import board
import digitalio
import pwmio
from wifi_verbinding import debug

MOTOR_L_PWM = pwmio.PWMOut(board.GP19, frequency=1000)
MOTOR_L_DIR = digitalio.DigitalInOut(board.GP20)
MOTOR_L_DIR.direction = digitalio.Direction.OUTPUT

MOTOR_R_PWM = pwmio.PWMOut(board.GP21, frequency=1000)
MOTOR_R_DIR = digitalio.DigitalInOut(board.GP22)
MOTOR_R_DIR.direction = digitalio.Direction.OUTPUT

MOTOR_R_DUTY = round(18000 * 1.5)
MOTOR_L_DUTY = round(15000 * 1.5)

def draai_manueel_rechts():
    debug("Manueel naar rechts aan het draaien")
    MOTOR_R_DIR.value = False
    MOTOR_R_PWM.duty_cycle = round(MOTOR_R_DUTY * 0.67)
    MOTOR_L_PWM.duty_cycle = round(MOTOR_L_DUTY * 0.67)

    MOTOR_R_DIR.value = True
    MOTOR_R_PWM.duty_cycle = 0
    MOTOR_L_PWM.duty_cycle = 0

def draai_manueel_links():
    debug("Manueel naar links aan het draaien")
    MOTOR_L_DIR.value = False
    MOTOR_R_PWM.duty_cycle = round(MOTOR_R_DUTY * 0.67)
    MOTOR_L_PWM.duty_cycle = round(MOTOR_L_DUTY * 0.67)

    MOTOR_L_DIR.value = True
    MOTOR_R_PWM.duty_cycle = 0
    MOTOR_L_PWM.duty_cycle = 0

def rijd_manueel_rechtdoor(factor=1.0):
    debug("Manueel rechtdoor aan het rijden met " + str(factor * 100) + "%")
    MOTOR_L_DIR.value = True
    MOTOR_R_DIR.value = True
        
    MOTOR_L_PWM.duty_cycle = int(MOTOR_L_DUTY * factor)
    MOTOR_R_PWM.duty_cycle = int(MOTOR_L_DUTY * factor)

def rijd_manueel_achteruit(factor=-1.0):
    debug("Manueel achteruit aan het rijden met " + str(factor * 100) + "%")
    MOTOR_L_DIR.value = False
    MOTOR_R_DIR.value = False

    MOTOR_L_PWM.duty_cycle = int(MOTOR_L_DUTY * factor)
    MOTOR_R_PWM.duty_cycle = int(MOTOR_L_DUTY * factor)


MOTOR_L_DIR.value = True
MOTOR_R_DIR.value = True
MOTOR_L_PWM.duty_cycle = 0
MOTOR_R_PWM.duty_cycle = 0