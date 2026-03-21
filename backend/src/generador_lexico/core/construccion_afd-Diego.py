# construccion directa del AFD a partir del arbol sintactico aumentado

from generador_lexico.core.tokens import es_literal, es_marker


def construirAfd(raiz, hojas, alfabeto):
    if raiz is None:
        raise ValueError('No se puede construir un AFD a partir de un arbol vacio.')

    idMarcador = next(hid for hid, hoja in hojas.items() if es_marker(hoja.valor))
    inicial = frozenset(raiz.primeraPos)

    nombresEstados = {inicial: 'S0'}
    porProcesar = [inicial]
    trans = {}
    aceptacion = set()
    cont = 1

    if idMarcador in inicial:
        aceptacion.add('S0')

    while porProcesar:
        actual = porProcesar.pop(0)
        nomActual = nombresEstados[actual]
        trans.setdefault(nomActual, {})

        for symbol in alfabeto:
            nuevo = set()
            for pos in actual:
                hoja = hojas[pos]
                if es_literal(hoja.valor) and hoja.valor.value == symbol:
                    nuevo |= hoja.siguientePos

            if not nuevo:
                continue

            nuevoFs = frozenset(nuevo)
            if nuevoFs not in nombresEstados:
                nuevoNombre = f'S{cont}'
                nombresEstados[nuevoFs] = nuevoNombre
                porProcesar.append(nuevoFs)
                if idMarcador in nuevoFs:
                    aceptacion.add(nuevoNombre)
                cont += 1

            trans[nomActual][symbol] = nombresEstados[nuevoFs]

    return {
        'estados': sorted(nombresEstados.values(), key=lambda estado: int(estado[1:])),
        'alfabeto': alfabeto,
        'transiciones': trans,
        'estadoInicial': 'S0',
        'estadosAceptacion': aceptacion,
        'conjuntos': {nombre: conjunto for conjunto, nombre in nombresEstados.items()},
    }
