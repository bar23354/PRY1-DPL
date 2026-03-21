# visualizacion de la tabla de transiciones y detalles de la construccion

from generador_lexico.core.analizador import formatearSimbolo, formatearToken
from generador_lexico.core.minimizacion import contarMetricas


def _indice_estado(estado):
    try:
        return int(estado[1:])
    except (ValueError, IndexError):
        return estado


def _ordenar_estados(estados):
    return sorted(estados, key=_indice_estado)


def mostrarTabla(afd, titulo='AFD'):
    estados = afd['estados']
    alfa = afd['alfabeto']
    trans = afd['transiciones']
    acept = afd['estadosAceptacion']
    ini = afd['estadoInicial']

    alfa_formateado = [formatearSimbolo(symbol) for symbol in alfa]
    anchoEst = max(len(estado) for estado in estados) + 4
    anchoCol = max(max((len(symbol) for symbol in alfa_formateado), default=3), 6) + 2

    enc = 'Estado'.ljust(anchoEst) + ''.join(symbol.center(anchoCol) for symbol in alfa_formateado) + '  Tipo'
    sep = '-' * len(enc)

    print('\n' + sep)
    print(f'  TABLA DE TRANSICIONES DEL {titulo}')
    print(sep)
    print(enc)
    print(sep)

    for estado in estados:
        marca = ('->' if estado == ini else '') + ('*' if estado in acept else '')
        fila = (marca + estado).ljust(anchoEst)
        for symbol in alfa:
            fila += trans.get(estado, {}).get(symbol, '-').center(anchoCol)

        if estado == ini and estado in acept:
            tipo = 'Inicio/Aceptacion'
        elif estado == ini:
            tipo = 'Inicio'
        elif estado in acept:
            tipo = 'Aceptacion'
        else:
            tipo = ''
        print(fila + '  ' + tipo)

    metricas = contarMetricas(afd)
    print(sep)
    print(f'  Total de estados: {metricas["estados"]}')
    print(f'  Total de transiciones: {metricas["transiciones"]}')
    print(f'  Estados de aceptacion: {", ".join(_ordenar_estados(acept))}')
    print(f'  Alfabeto: {{{", ".join(alfa_formateado)}}}')
    print(sep + '\n')


def mostrarDetalle(hojas, afd, titulo='AFD directo'):
    print('\n--- Detalle del calculo por posicion ---')
    print(f'{"Pos":<6}{"Simbolo":<10}{"SiguientePos"}')
    print('-' * 40)
    for hid in sorted(hojas.keys()):
        hoja = hojas[hid]
        siguiente = '{' + ', '.join(str(x) for x in sorted(hoja.siguientePos)) + '}'
        print(f'{hid:<6}{formatearToken(hoja.valor):<10}{siguiente}')
    print()

    print(f'--- Conjuntos de posiciones por estado ({titulo}) ---')
    for nombre in _ordenar_estados(afd['conjuntos'].keys()):
        posiciones = '{' + ', '.join(str(x) for x in sorted(afd['conjuntos'][nombre])) + '}'
        print(f'  {nombre}: {posiciones}')
    print()


def mostrarDetalleMinimizacion(afd):
    print('\n--- Estados del AFD minimizado ---')
    for nombre in _ordenar_estados(afd['conjuntos'].keys()):
        estados_originales = '{' + ', '.join(_ordenar_estados(afd['conjuntos'][nombre])) + '}'
        print(f'  {nombre}: {estados_originales}')
    print()


def mostrarComparacion(afd_directo, afd_minimizado):
    metricas_directo = contarMetricas(afd_directo)
    metricas_min = contarMetricas(afd_minimizado)

    print('\n--- Comparacion de automatas ---')
    print(f'  AFD directo     -> estados: {metricas_directo["estados"]}, transiciones: {metricas_directo["transiciones"]}')
    print(f'  AFD minimizado  -> estados: {metricas_min["estados"]}, transiciones: {metricas_min["transiciones"]}')
    print(
        '  Reduccion       -> estados: '
        f'{metricas_directo["estados"] - metricas_min["estados"]}, '
        'transiciones: '
        f'{metricas_directo["transiciones"] - metricas_min["transiciones"]}'
    )
    print()
