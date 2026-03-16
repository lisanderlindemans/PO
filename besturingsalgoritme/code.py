import time
import board
from analogio import AnalogIn
from wifi_verbinding import wifi_loop, start_wifi, route_data, debug
from route_volger import volg_route

start_wifi()

reftijd = time.monotonic()

while True:
    wifi_loop()

    nu = time.monotonic()
    
    if route_data is not None:
        heenroute = route_data["heenroute"]
        terugroute = route_data["terugroute"]
        groenpunten = route_data["groenpunten"]

        debug("Heenroute ontvangen:")
        debug(heenroute)
        debug("Terugroute ontvangen:")
        debug(terugroute)
        debug("Groenpunten ontvangen:")
        debug(groenpunten)

        heen_groen = []
        for punt in groenpunten:
            if punt not in terugroute:
                heen_groen.append(punt)

        terug_groen = groenpunten.copy()
            
        volg_route(heenroute, heen_groen)
        volg_route(terugroute, terug_groen)

    time.sleep(0.01)