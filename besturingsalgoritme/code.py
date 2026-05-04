import time
import wifi_verbinding
from wifi_verbinding import debug
from route_volger import volg_route, reset_route
from manueel_besturing import manueel_loop

wifi_verbinding.start_wifi()

reftijd = time.monotonic()

while True:
    wifi_verbinding.wifi_loop()

    nu = time.monotonic()

    if manueel_loop():
        continue

    elif wifi_verbinding.route_data is not None:
        heenroute = wifi_verbinding.route_data["heenroute"]
        terugroute = wifi_verbinding.route_data["terugroute"]
        groenpunten = wifi_verbinding.route_data["groenpunten"]

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

        terug_groen = []
        for punt in groenpunten:
            if punt in terugroute:
                terug_groen.append(punt)
            
        volg_route(heenroute, heen_groen, False)
        volg_route(terugroute, terug_groen, True)

        wifi_verbinding.route_data = None
        reset_route()

    time.sleep(0.01)