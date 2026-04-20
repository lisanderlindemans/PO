import time
import wifi_verbinding
from wifi_verbinding import debug
from besturing import draai_links, draai_rechts, rijd_rechtdoor, plaats_toren
from status_led import LED_loop
from wifi_verbinding import wifi_loop

# Richtingen
NOORD = 0
OOST = 1
ZUID = 2
WEST = 3

richting_namen = {
    NOORD: "NOORD",
    OOST: "OOST",
    ZUID: "ZUID",
    WEST: "WEST"
}

huidige_richting = None

terugroute = False
toren_aan_het_plaatsen = False

def bepaal_richting(huidige, volgende):
    verschil_x = volgende[0] - huidige[0]
    verschil_y = volgende[1] - huidige[1]

    if verschil_x == 1:
        return OOST
    elif verschil_x == -1:
        return WEST
    if verschil_y == 1:
        return NOORD
    elif verschil_y == -1:
        return ZUID
    
def draai_naar(richting):
    global huidige_richting

    verschil_richting = (richting - huidige_richting) % 4
    
    if verschil_richting == 1:
        debug("Step: Draai naar rechts")

        draai_rechts([LED_loop, wifi_loop])
    elif verschil_richting == 2:
        debug("Step: keer om")

        draai_rechts([LED_loop, wifi_loop])
        draai_rechts([LED_loop, wifi_loop])
    elif verschil_richting == 3:
        debug("Step: Draai naar links")

        draai_links([LED_loop, wifi_loop])
    
    huidige_richting = richting

def bepaal_start_richting(route):
    global huidige_richting

    start = route[0]
    volgende = route[1]

    richting = bepaal_richting(start, volgende)

    huidige_richting = richting
    debug("Start richting ingesteld op: " + richting_namen[richting])

def volg_route(route, groenpunten):
    global terugroute, toren_aan_het_plaatsen

    if huidige_richting == None:
        bepaal_start_richting(route)

    for i in range(len(route) - 1):
        wifi_verbinding.wifi_loop()

        if wifi_verbinding.noodstop:
            debug("Noodstop ingedrukt, exiting code")
            exit()
            
        huidige = route[i]
        debug("Huidige positie: x=" + str(huidige[0]) + ", y=" + str(huidige[1]))
        volgende = route[i + 1]

        richting = bepaal_richting(huidige, volgende)
        debug("Nieuwe richting: " + richting_namen[richting])

        draai_naar(richting)

        rijd_rechtdoor([LED_loop, wifi_loop])

        if volgende in groenpunten:
            debug("Step: Toren plaatsen")
            plaats_toren([LED_loop, wifi_loop])
            toren_aan_het_plaatsen = True
        else:
            toren_aan_het_plaatsen = False
        
        if len(groenpunten) == 0:
            terugroute = True
        else:
            terugroute = False
        
        time.sleep(0.1)