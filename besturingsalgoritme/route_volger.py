import time
from wifi_verbinding import noodstop, debug
from besturing import draai_links, draai_rechts, rijd_rechtdoor

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

huidige_richting = WEST

def bepaal_richting(huidige, volgende):
    verschil_x = huidige[0] - volgende[0]
    verschil_y = huidige[1] - volgende[1]

    if verschil_x == 1:
        return OOST
    elif verschil_x == -1:
        return WEST
    if verschil_y == 1:
        return NOORD
    elif verschil_y == 1:
        return ZUID
    
def draai_naar(richting):
    global huidige_richting

    verschil_richting = (richting - huidige_richting) % 4
    
    if verschil_richting == 1:
        debug("Step: Draai naar rechts")

        draai_rechts()
    elif verschil_richting == 2:
        debug("Step: keer om")

        draai_rechts()
        draai_rechts()
    elif verschil_richting == 3:
        debug("Step: Draai naar links")

        draai_links()
    
    huidige_richting = richting
        
def volg_route(route, groenpunten):
    for i in range(len(route) - 1):
        if noodstop:
            debug("Noodstop ingedrukt, exiting code")
            exit()
        huidige = route[i]
        debug("Huidige positie: x=" + huidige[0] + ", y=" + huidige[1])
        volgende = route[i + 1]

        richting = bepaal_richting(huidige, volgende)
        debug("Nieuwe richting: " + richting_namen[richting])

        draai_naar(richting)

        rijd_rechtdoor()

        if volgende in groenpunten:
            debug("Step: Toren plaatsen")
            plaats_toren()
        
        time.sleep(0.1)