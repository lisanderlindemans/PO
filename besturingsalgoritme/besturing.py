import board
import digitalio
import analogio
import pwmio
import time
from adafruit_motor import servo

global MOTOR_L_DIR, MOTOR_L_PWM, MOTOR_L_DUTY, MOTOR_R_DIR, MOTOR_R_PWM, MOTOR_R_DUTY
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

GRENSWAARDE_LDR_R = 0.32  # LDR-voltage moet BOVEN deze waarde liggen om zwart te detecteren
GRENSWAARDE_LDR_L = 0.24
GRENSWAARDE_LDR_A = 0.32

MOTOR_R_DUTY = 30000
MOTOR_L_DUTY = 33000

THRESHOLD_AUTOCORRECT = 0.06
MOTOR_R_FORWARD = True
MOTOR_L_FORWARD = False

# Servo
servo_pin = pwmio.PWMOut(board.GP12, duty_cycle=2 ** 15, frequency=50)
servo_motor = servo.Servo(servo_pin, min_pulse=500, max_pulse=2500, actuation_range=360)


def calculate_voltage(value):
    return (value * 3.3) / 65535

def reset_motoren():
    MOTOR_R_PWM.duty_cycle = 0
    MOTOR_L_PWM.duty_cycle = 0
    MOTOR_R_DIR.value = MOTOR_R_FORWARD
    MOTOR_L_DIR.value = MOTOR_L_FORWARD

def draai_rechts(functies: list[Callable] = []):
    MOTOR_R_DIR.value = not MOTOR_R_FORWARD
    MOTOR_L_DIR.value = MOTOR_L_FORWARD
    MOTOR_R_PWM.duty_cycle = round(MOTOR_R_DUTY * 0.8)
    MOTOR_L_PWM.duty_cycle = round(MOTOR_L_DUTY * 0.8)

    start = time.monotonic()
    while time.monotonic() - start < 1.5:
        for func in functies:
            func()

    while calculate_voltage(LDR_L.value) < GRENSWAARDE_LDR_L:
        for func in functies:
            func()
        time.sleep(0.01)
    MOTOR_R_PWM.duty_cycle = 0
    MOTOR_L_PWM.duty_cycle = 0
    MOTOR_R_DIR.value = MOTOR_R_FORWARD
    MOTOR_L_DIR.value = MOTOR_L_FORWARD


def draai_links(functies: list[Callable] = []):
    MOTOR_L_DIR.value = not MOTOR_L_FORWARD
    MOTOR_R_DIR.value = MOTOR_R_FORWARD
    MOTOR_R_PWM.duty_cycle = round(MOTOR_R_DUTY * 0.8)
    MOTOR_L_PWM.duty_cycle = round(MOTOR_L_DUTY * 0.8)

    start = time.monotonic()
    while time.monotonic() - start < 1.5:
        for func in functies:
            func()

    while calculate_voltage(LDR_R.value) < GRENSWAARDE_LDR_R:
        for func in functies:
            func()
        time.sleep(0.01)
    MOTOR_R_PWM.duty_cycle = 0
    MOTOR_L_PWM.duty_cycle = 0
    MOTOR_L_DIR.value = MOTOR_L_FORWARD
    MOTOR_R_DIR.value = MOTOR_R_FORWARD


def rijd_rechtdoor(functies: list[Callable] = []):
    MOTOR_L_DIR.value = MOTOR_L_FORWARD
    MOTOR_R_DIR.value = MOTOR_R_FORWARD
    MOTOR_L_PWM.duty_cycle = round(MOTOR_L_DUTY * 1.5)
    MOTOR_R_PWM.duty_cycle = round(MOTOR_R_DUTY * 1.7)

    def correctie():
        l = calculate_voltage(LDR_L.value)
        r = calculate_voltage(LDR_R.value)

        if r - l > THRESHOLD_AUTOCORRECT:
            MOTOR_L_PWM.duty_cycle = round(MOTOR_L_DUTY * 1.5)
            MOTOR_R_PWM.duty_cycle = round(MOTOR_R_DUTY * 0.8)

        elif l - r > THRESHOLD_AUTOCORRECT:
            MOTOR_L_PWM.duty_cycle = round(MOTOR_L_DUTY * 0.8)
            MOTOR_R_PWM.duty_cycle = round(MOTOR_R_DUTY * 1.5)

        else:
            MOTOR_L_PWM.duty_cycle = round(MOTOR_L_DUTY * 1.5)
            MOTOR_R_PWM.duty_cycle = round(MOTOR_R_DUTY * 1.7)

    start = time.monotonic()
    while time.monotonic() - start < 1.0:
        for func in functies:
            func()
        correctie()
        time.sleep(0.01)

    while calculate_voltage(LDR_A.value) < GRENSWAARDE_LDR_A:
        for func in functies:
            func()
        correctie()
        time.sleep(0.01)

    start = time.monotonic()
    while time.monotonic() - start < 0.2:
        for func in functies:
            func()
        correctie()
        time.sleep(0.01)

    MOTOR_L_PWM.duty_cycle = 0
    MOTOR_R_PWM.duty_cycle = 0

torens_geplaatst = 0
def plaats_toren(functies: list[Callable] = []):
    global torens_geplaatst

    # rijd eerst al wat vooruit
    MOTOR_L_DIR.value = MOTOR_L_FORWARD
    MOTOR_R_DIR.value = MOTOR_R_FORWARD
    MOTOR_L_PWM.duty_cycle = round(MOTOR_L_DUTY * 1.5)
    MOTOR_R_PWM.duty_cycle = round(MOTOR_R_DUTY * 1.5)
    
    start = time.monotonic()
    while time.monotonic() - start < 0.5:
        for func in functies:
            func()
            
    MOTOR_L_PWM.duty_cycle = 0
    MOTOR_R_PWM.duty_cycle = 0
    
    start = time.monotonic()
    while time.monotonic() - start < 0.4:
        for func in functies:
            func()
    
    old_angle = servo_motor.angle
    target_angle = old_angle + 75 + torens_geplaatst
    current_angle = old_angle

    torens_geplaatst += 1
    
    while current_angle < target_angle:
        current_angle += 2
        servo_motor.angle = current_angle

        time.sleep(0.02)
        
    servo_motor.angle = target_angle

    time.sleep(0.01)


def reset_servo(functies: list[Callable] = []):
    servo_motor.angle = 53
    time.sleep(1)
    servo_motor.angle = 43
    time.sleep(1)
    servo_motor.angle = 53
    
    start = time.monotonic()
    while time.monotonic() - start < 2.0:
        for func in functies:
            func()

reset_servo()
