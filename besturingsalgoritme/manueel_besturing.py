import time
import wifi_verbinding
from wifi_verbinding import debug
from besturing import MOTOR_L_DIR, MOTOR_L_PWM, MOTOR_L_DUTY, MOTOR_R_DIR, MOTOR_R_PWM, MOTOR_R_DUTY
from status_led import LED_loop

last_debug_times = {
    "links": 0,
    "rechts": 0,
    "rechtdoor": 0,
    "achteruit": 0
}

DEBUG_INTERVAL = 5

def debug_met_interval(key, message):
    huidige_tijd = time.monotonic()
    
    if huidige_tijd - last_debug_times[key] >= DEBUG_INTERVAL:
        debug(message)
        last_debug_times[key] = huidige_tijd

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
    debug_met_interval("rechts", "Manueel naar rechts aan het draaien")
    MOTOR_R_DIR.value = False
    MOTOR_R_PWM.duty_cycle = round(MOTOR_R_DUTY * 0.67)
    MOTOR_L_PWM.duty_cycle = round(MOTOR_L_DUTY * 0.67)

    LED_loop()
    time.sleep(0.05)

    MOTOR_R_DIR.value = True
    MOTOR_R_PWM.duty_cycle = 0
    MOTOR_L_PWM.duty_cycle = 0

def draai_manueel_links():
    debug_met_interval("links", "Manueel naar links aan het draaien")
    MOTOR_L_DIR.value = False
    MOTOR_R_PWM.duty_cycle = round(MOTOR_R_DUTY * 0.67)
    MOTOR_L_PWM.duty_cycle = round(MOTOR_L_DUTY * 0.67)

    LED_loop()
    time.sleep(0.05)

    MOTOR_L_DIR.value = True
    MOTOR_R_PWM.duty_cycle = 0
    MOTOR_L_PWM.duty_cycle = 0

def rijd_manueel_rechtdoor(factor=1.0):
    debug_met_interval("rechtdoor", "Manueel rechtdoor aan het rijden met " + str(factor * 100) + "%")
    MOTOR_L_DIR.value = True
    MOTOR_R_DIR.value = True
    
    LED_loop()

    MOTOR_L_PWM.duty_cycle = int(MOTOR_L_DUTY * factor)
    MOTOR_R_PWM.duty_cycle = int(MOTOR_R_DUTY * factor)

def rijd_manueel_achteruit(factor=1.0):
    debug_met_interval("achteruit", "Manueel achteruit aan het rijden met " + str(factor * 100) + "%")
    MOTOR_L_DIR.value = False
    MOTOR_R_DIR.value = False

    LED_loop()

    MOTOR_L_PWM.duty_cycle = int(MOTOR_L_DUTY * factor)
    MOTOR_R_PWM.duty_cycle = int(MOTOR_R_DUTY * factor)


MOTOR_L_DIR.value = True
MOTOR_R_DIR.value = True
MOTOR_L_PWM.duty_cycle = 0
MOTOR_R_PWM.duty_cycle = 0