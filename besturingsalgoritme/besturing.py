import board
import digitalio
import analogio
from analogio import AnalogIn
import pwmio
import time
from botsing_sensor import check_botsing_sensor
from wifi_verbinding import wifi_loop, debug
from adafruit_motor import servo

global MOTOR_L_PWM
global MOTOR_L_DIR
global MOTOR_R_PWM
global MOTOR_R_DIR

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
    2.9  # LDR-voltage moet onder deze waarde liggen om zwart te detecteren
)

global MOTOR_R_DUTY
global MOTOR_L_DUTY

MOTOR_R_DUTY = round(18000 * 1.5)
MOTOR_L_DUTY = round(15000 * 1.5)

THRESHOLD_AUTOCORRECT = 0.027177
metingnummer = 0

def meet_data():
    global metingnummer
    metingnummer += 1

    links = LDR_L.value
    rechts = LDR_R.value
    achter = LDR_A.value

    verschil = links - rechts
    gemiddelde = (links + rechts) / 2

    print((metingnummer, links, rechts, achter, verschil, gemiddelde))

def calculate_voltage(value):
    return (value * 3.3) / 65535

def draai_rechts():
    MOTOR_R_DIR.value = False
    MOTOR_R_PWM.duty_cycle = round(MOTOR_R_DUTY * 0.67)
    MOTOR_L_PWM.duty_cycle = round(MOTOR_L_DUTY * 0.67)

    start = time.monotonic()

    # vervangt time.sleep(3)
    while time.monotonic() - start < 3:
        wifi_loop()

    while calculate_voltage(LDR_L.value) > GRENSWAARDE_LDR:
        wifi_loop()
        meet_data()
        debug("Naar rechts aan het draaien!")
        time.sleep(0.1)

    MOTOR_R_DIR.value = True
    MOTOR_R_PWM.duty_cycle = 0
    MOTOR_L_PWM.duty_cycle = 0

def draai_links():
    MOTOR_L_DIR.value = False
    MOTOR_R_PWM.duty_cycle = round(MOTOR_R_DUTY * 0.67)
    MOTOR_L_PWM.duty_cycle = round(MOTOR_L_DUTY * 0.67)

    start = time.monotonic()

    while time.monotonic() - start < 3:
        wifi_loop()

    while calculate_voltage(LDR_R.value) > GRENSWAARDE_LDR:
        wifi_loop()
        meet_data()
        debug("Naar links aan het draaien!")
        time.sleep(0.1)

    MOTOR_L_DIR.value = True
    MOTOR_R_PWM.duty_cycle = 0
    MOTOR_L_PWM.duty_cycle = 0

def rijd_rechtdoor():
    MOTOR_L_DIR.value = True
    MOTOR_R_DIR.value = True
    MOTOR_L_PWM.duty_cycle = MOTOR_L_DUTY
    MOTOR_R_PWM.duty_cycle = MOTOR_R_DUTY

    start = time.monotonic()

    # vervangt time.sleep(1.5)
    while time.monotonic() - start < 1.5:
        wifi_loop()

    while calculate_voltage(LDR_A.value) > GRENSWAARDE_LDR:
        wifi_loop()
        meet_data()

        """if check_botsing_sensor():
            debug("Rij rechtdoor gestopt voor botsing preventie")
            exit()"""

        if calculate_voltage(LDR_R.value) - GRENSWAARDE_LDR > THRESHOLD_AUTOCORRECT:
            MOTOR_R_PWM.duty_cycle = round(MOTOR_R_DUTY * 0.6)

        elif calculate_voltage(LDR_L.value) - GRENSWAARDE_LDR > THRESHOLD_AUTOCORRECT:
            MOTOR_L_PWM.duty_cycle = round(MOTOR_L_DUTY * 0.6)

        else:
            MOTOR_L_PWM.duty_cycle = MOTOR_L_DUTY
            MOTOR_R_PWM.duty_cycle = MOTOR_R_DUTY

        time.sleep(0.1)

    MOTOR_L_PWM.duty_cycle = 0
    MOTOR_R_PWM.duty_cycle = 0

pwm = pwmio.PWMOut(board.GP13, frequency=50)
servo_motor = servo.Servo(pwm, min_pulse=350, max_pulse=2650)

#door tandwiel verdubbeld hoek

hoek = 0
#servo_motor.angle = 0 zet dit in beging
def servo_draai():
    global hoek
    
    for i in range(hoek, hoek+36, 2):
        servo_motor.angle = i
        time.sleep(0.01)
    
    hoek = (hoek + 36) % 180
    return hoek

"""
#testen
print(servo_draai())
time.sleep(1)
print(servo_draai())
time.sleep(1)
print(servo_draai())
time.sleep(1)
print(servo_draai())
time.sleep(1)
print(servo_draai())
time.sleep(1)
servo_motor.angle = 0
time.sleep(1)
"""


MOTOR_L_DIR.value = True
MOTOR_R_DIR.value = True
MOTOR_L_PWM.duty_cycle = 0
MOTOR_R_PWM.duty_cycle = 0
