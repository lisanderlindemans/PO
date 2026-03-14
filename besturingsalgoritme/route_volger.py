import time

# Richtingen
NOORD = 0
OOST = 1
ZUID = 2
WEST = 3

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
        draai("rechts")
    elif verschil_richting == 2:
        draai("rechts")
        draai("rechts")
    elif verschil_richting == 3:
        draai("links")
    
    huidige_richting = richting
        

def volg_route(route, groenpunten):
    for i in range(len(route) - 1):
        huidige = route[i]
        volgende = route[i + 1]

        richting = bepaal_richting(huidige, volgende)

        draai_naar(richting)

        rij_rechtdoor()

        if volgende in groenpunten:
            plaats_toren()
        
        time.sleep(0.1)