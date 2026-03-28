import time
import board
from analogio import AnalogIn
import wifi_verbinding
from route_volger import volg_route
from manueel_besturing import draai_manueel_links, draai_manueel_rechts, rijd_manueel_rechtdoor, rijd_manueel_achteruit

wifi_verbinding.start_wifi()

reftijd = time.monotonic()

while True:
    wifi_verbinding.wifi_loop()

    nu = time.monotonic()

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