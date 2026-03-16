from collections import defaultdict


def contarMetricas(afd):
    return {
        'estados': len(afd['estados']),
        'transiciones': sum(len(transiciones) for transiciones in afd['transiciones'].values()),
    }


def _indice_estado(estado):
    try:
        return int(estado[1:])
    except (ValueError, IndexError):
        return estado


def _ordenar_estados(estados):
    return sorted(estados, key=_indice_estado)


def _particion_inicial(afd):
    finales = set(afd['estadosAceptacion'])
    no_finales = set(afd['estados']) - finales
    particiones = []

    if no_finales:
        particiones.append(frozenset(_ordenar_estados(no_finales)))
    if finales:
        particiones.append(frozenset(_ordenar_estados(finales)))

    return particiones


def _firma_estado(estado, particiones, afd):
    transiciones = afd['transiciones'].get(estado, {})
    firma = []

    for simbolo in afd['alfabeto']:
        destino = transiciones.get(simbolo)
        indice_destino = None
        if destino is not None:
            for idx, particion in enumerate(particiones):
                if destino in particion:
                    indice_destino = idx
                    break
        firma.append(indice_destino)

    return tuple(firma)


def _refinar_particiones(particiones, afd):
    nuevas_particiones = []
    cambio = False

    for particion in particiones:
        cubetas = defaultdict(list)
        for estado in _ordenar_estados(particion):
            cubetas[_firma_estado(estado, particiones, afd)].append(estado)

        grupos = [frozenset(grupo) for grupo in cubetas.values()]
        if len(grupos) > 1:
            cambio = True

        nuevas_particiones.extend(sorted(grupos, key=lambda grupo: tuple(_ordenar_estados(grupo))))

    return nuevas_particiones, cambio


def _normalizar_particiones(particiones, estado_inicial):
    return sorted(
        particiones,
        key=lambda particion: (
            0 if estado_inicial in particion else 1,
            tuple(_ordenar_estados(particion)),
        ),
    )


def minimizarAfd(afd):
    if not afd['estados']:
        raise ValueError('No se puede minimizar un AFD sin estados.')

    particiones = _particion_inicial(afd)

    cambio = True
    while cambio:
        particiones, cambio = _refinar_particiones(particiones, afd)

    particiones = _normalizar_particiones(particiones, afd['estadoInicial'])

    nombres = {particion: f'M{idx}' for idx, particion in enumerate(particiones)}
    estado_a_particion = {}
    for particion in particiones:
        for estado in particion:
            estado_a_particion[estado] = particion

    transiciones = {}
    estados_aceptacion = set()

    for particion in particiones:
        nombre = nombres[particion]
        representante = _ordenar_estados(particion)[0]
        transiciones[nombre] = {}

        for simbolo, destino in afd['transiciones'].get(representante, {}).items():
            transiciones[nombre][simbolo] = nombres[estado_a_particion[destino]]

        if set(particion) & set(afd['estadosAceptacion']):
            estados_aceptacion.add(nombre)

    return {
        'estados': [nombres[particion] for particion in particiones],
        'alfabeto': list(afd['alfabeto']),
        'transiciones': transiciones,
        'estadoInicial': nombres[estado_a_particion[afd['estadoInicial']]],
        'estadosAceptacion': estados_aceptacion,
        'conjuntos': {nombres[particion]: particion for particion in particiones},
    }
