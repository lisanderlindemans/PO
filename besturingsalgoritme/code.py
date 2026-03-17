import time
import board
from analogio import AnalogIn
import wifi_verbinding
from route_volger import volg_route

wifi_verbinding.start_wifi()

reftijd = time.monotonic()

while True:
    wifi_verbinding.wifi_loop()

    nu = time.monotonic()
    
    if wifi_verbinding.route_data is not None:
        heenroute = wifi_verbinding.route_data["heenroute"]
        terugroute = wifi_verbinding.route_data["terugroute"]
        groenpunten = wifi_verbinding.route_data["groenpunten"]

        wifi_verbinding.debug("Heenroute ontvangen:")
        wifi_verbinding.debug(heenroute)
        wifi_verbinding.debug("Terugroute ontvangen:")
        wifi_verbinding.debug(terugroute)
        wifi_verbinding.debug("Groenpunten ontvangen:")
        wifi_verbinding.debug(groenpunten)

        heen_groen = []
        for punt in groenpunten:
            if punt not in terugroute:
                heen_groen.append(punt)

        terug_groen = groenpunten.copy()
            
        volg_route(heenroute, heen_groen)
        volg_route(terugroute, terug_groen)

    time.sleep(0.01)