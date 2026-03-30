import board
import digitalio
import analogio
from analogio import AnalogIn
import pwmio
import time

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