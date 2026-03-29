import board
import digitalio
import pwmio
import time
import wifi_verbinding

MOTOR_L_PWM = pwmio.PWMOut(board.GP19, frequency=1000)
MOTOR_L_DIR = digitalio.DigitalInOut(board.GP20)
MOTOR_L_DIR.direction = digitalio.Direction.OUTPUT

MOTOR_R_PWM = pwmio.PWMOut(board.GP21, frequency=1000)
MOTOR_R_DIR = digitalio.DigitalInOut(board.GP22)
MOTOR_R_DIR.direction = digitalio.Direction.OUTPUT

MOTOR_R_DUTY = round(18000 * 1.5)
MOTOR_L_DUTY = round(15000 * 1.5)

def manueel_loop():
    if wifi_verbinding.manual_mode:
        if wifi_verbinding.manual_action == "links":
            draai_manueel_links()
            wifi_verbinding.manual_action = None
        
        elif wifi_verbinding.manual_action == "rechts":
            draai_manueel_rechts()
            wifi_verbinding.manual_action = None

        else:
            throttle_val = wifi_verbinding.manual_throttle
            if throttle_val >= 0:
                factor = throttle_val / 100
                rijd_manueel_rechtdoor(factor)
            elif throttle_val < 0:
                factor = throttle_val / -100
                rijd_manueel_achteruit(factor)

        return True

    else:
        return False

def draai_manueel_rechts():
    wifi_verbinding.debug("Manueel naar rechts aan het draaien")
    MOTOR_R_DIR.value = False
    MOTOR_R_PWM.duty_cycle = round(MOTOR_R_DUTY * 0.67)
    MOTOR_L_PWM.duty_cycle = round(MOTOR_L_DUTY * 0.67)

    time.sleep(0.)

    MOTOR_R_DIR.value = True
    MOTOR_R_PWM.duty_cycle = 0
    MOTOR_L_PWM.duty_cycle = 0

def draai_manueel_links():
    wifi_verbinding.debug("Manueel naar links aan het draaien")
    MOTOR_L_DIR.value = False
    MOTOR_R_PWM.duty_cycle = round(MOTOR_R_DUTY * 0.67)
    MOTOR_L_PWM.duty_cycle = round(MOTOR_L_DUTY * 0.67)

    time.sleep(0.05)

    MOTOR_L_DIR.value = True
    MOTOR_R_PWM.duty_cycle = 0
    MOTOR_L_PWM.duty_cycle = 0

def rijd_manueel_rechtdoor(factor=1.0):
    wifi_verbinding.debug("Manueel rechtdoor aan het rijden met " + str(factor * 100) + "%")
    MOTOR_L_DIR.value = True
    MOTOR_R_DIR.value = True
        
    MOTOR_L_PWM.duty_cycle = int(MOTOR_L_DUTY * factor)
    MOTOR_R_PWM.duty_cycle = int(MOTOR_R_DUTY * factor)

def rijd_manueel_achteruit(factor=1.0):
    wifi_verbinding.debug("Manueel achteruit aan het rijden met " + str(factor * 100) + "%")
    MOTOR_L_DIR.value = False
    MOTOR_R_DIR.value = False

    MOTOR_L_PWM.duty_cycle = int(MOTOR_L_DUTY * factor)
    MOTOR_R_PWM.duty_cycle = int(MOTOR_R_DUTY * factor)


MOTOR_L_DIR.value = True
MOTOR_R_DIR.value = True
MOTOR_L_PWM.duty_cycle = 0
MOTOR_R_PWM.duty_cycle = 0