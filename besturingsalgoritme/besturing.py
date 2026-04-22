import board
import digitalio
import analogio
import pwmio
import time
from adafruit_motor import servo
import botsing_sensor

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

GRENSWAARDE_LDR = (
    0.28  # LDR-voltage moet BOVEN deze waarde liggen om zwart te detecteren
)
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


def draai_rechts(functies: list[Callable] = []):
    MOTOR_R_DIR.value = not MOTOR_R_FORWARD
    MOTOR_L_DIR.value = MOTOR_L_FORWARD
    MOTOR_R_PWM.duty_cycle = round(MOTOR_R_DUTY * 0.8)
    MOTOR_L_PWM.duty_cycle = round(MOTOR_L_DUTY * 0.8)

    start = time.monotonic()
    while time.monotonic() - start < 1.5:
        for func in functies:
            func()

    while calculate_voltage(LDR_L.value) < GRENSWAARDE_LDR:
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

    while calculate_voltage(LDR_R.value) < GRENSWAARDE_LDR:
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
    MOTOR_R_PWM.duty_cycle = round(MOTOR_R_DUTY * 1.5)

    start = time.monotonic()
    while time.monotonic() - start < 1.0:
        for func in functies:
            func()

    while calculate_voltage(LDR_A.value) < GRENSWAARDE_LDR:
        for func in functies:
            func()
        if (
            calculate_voltage(LDR_R.value) - calculate_voltage(LDR_L.value)
            > THRESHOLD_AUTOCORRECT
        ):  # Stuur NAAR rechts bij
            MOTOR_R_PWM.duty_cycle = round(MOTOR_R_DUTY * 0.8)
            MOTOR_L_PWM.duty_cycle = round(MOTOR_L_DUTY * 1.5)
        elif (
            calculate_voltage(LDR_L.value) - calculate_voltage(LDR_R.value)
            > THRESHOLD_AUTOCORRECT
        ):  # Stuur NAAR links bij
            MOTOR_L_PWM.duty_cycle = round(MOTOR_L_DUTY * 0.8)
            MOTOR_R_PWM.duty_cycle = round(MOTOR_R_DUTY * 1.5)
        else:
            MOTOR_L_PWM.duty_cycle = round(MOTOR_L_DUTY * 1.5)
            MOTOR_R_PWM.duty_cycle = round(MOTOR_R_DUTY * 1.5)
        time.sleep(0.01)
    MOTOR_L_PWM.duty_cycle = 0
    MOTOR_R_PWM.duty_cycle = 0


def plaats_toren(functies: list[Callable] = []):
    old_angle = servo_motor.angle
    servo_motor.angle += 60
    start = time.monotonic()
    wigglestart = start
    # eerste wiggle
    while time.monotonic() - start < 2.0:
        if time.monotonic() - wigglestart > 0.3:
            servo_motor.angle += 2
            wigglestart = time.monotonic()
        for func in functies:
            func()
    # heen-en-weer-wiggle
    wigglestart = time.monotonic()
    wiggle_forward = -1
    while time.monotonic() - start < 3.0:
        if time.monotonic() - wigglestart > 0.2:
            servo_motor.angle += 5 * wiggle_forward
            wigglestart = time.monotonic()
            wiggle_forward *= -1
    servo_motor.angle = old_angle + 72


def reset_servo(functies: list[Callable] = []):
    servo_motor.angle = 0
    start = time.monotonic()
    while time.monotonic() - start < 2.0:
        for func in functies:
            func()

reset_servo()
