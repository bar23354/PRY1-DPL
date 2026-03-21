#simulacion del AFD sobre una cadena de entrada

def simularAfd(afd, cadena):
    estado = afd['estadoInicial']
    trans = afd['transiciones']
    recorrido = [estado]

    for c in cadena:
        if estado in trans and c in trans[estado]:
            estado = trans[estado][c]
            recorrido.append(estado)
        else:
            return False, recorrido

    return estado in afd['estadosAceptacion'], recorrido
