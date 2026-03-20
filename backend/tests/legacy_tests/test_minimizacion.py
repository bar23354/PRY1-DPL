from laboratorio.analizador import prepararExpresion
from laboratorio.arbol import construirArbolDirecto
from laboratorio.construccion_afd import construirAfd
from laboratorio.minimizacion import (
    _particion_inicial,
    _refinar_particiones,
    contarMetricas,
    minimizarAfd,
)
from laboratorio.simulador import simularAfd


def construir_afds(expr):
    postfijo, alfa, _ = prepararExpresion(expr)
    raiz, hojas = construirArbolDirecto(postfijo)
    afd_directo = construirAfd(raiz, hojas, alfa)
    afd_minimizado = minimizarAfd(afd_directo)
    return afd_directo, afd_minimizado


def test_particion_inicial_separa_finales_y_no_finales():
    afd_directo, _ = construir_afds('ab')
    particiones = _particion_inicial(afd_directo)
    assert len(particiones) == 2
    assert frozenset({'S2'}) in particiones
    assert frozenset({'S0', 'S1'}) in particiones


def test_refinamiento_distingue_estados_no_finales():
    afd_directo, _ = construir_afds('ab')
    particiones = _particion_inicial(afd_directo)
    nuevas_particiones, cambio = _refinar_particiones(particiones, afd_directo)
    assert cambio is True
    assert len(nuevas_particiones) == 3


def test_minimizacion_conserva_afd_ya_minimo():
    afd_directo, afd_minimizado = construir_afds('a(b|c)*')
    assert contarMetricas(afd_directo) == {'estados': 2, 'transiciones': 3}
    assert contarMetricas(afd_minimizado) == {'estados': 2, 'transiciones': 3}


def test_minimizacion_reduce_afd_reducible():
    afd_directo, afd_minimizado = construir_afds('(a|b)*(aa|ab|ba|bb)')
    assert contarMetricas(afd_directo) == {'estados': 5, 'transiciones': 10}
    assert contarMetricas(afd_minimizado) == {'estados': 3, 'transiciones': 6}


def test_minimizacion_reduce_segundo_caso_respaldo():
    afd_directo, afd_minimizado = construir_afds('(a|b)*ab(a|b)*')
    assert contarMetricas(afd_directo) == {'estados': 4, 'transiciones': 8}
    assert contarMetricas(afd_minimizado) == {'estados': 3, 'transiciones': 6}


def test_minimizacion_conserva_estado_inicial_y_finales():
    afd_directo, afd_minimizado = construir_afds('a?')
    assert afd_minimizado['estadoInicial'] == 'M0'
    assert afd_minimizado['estadoInicial'] in afd_minimizado['estadosAceptacion']
    assert afd_minimizado['estadosAceptacion'] == {'M0', 'M1'}
    assert afd_directo['estadoInicial'] in afd_minimizado['conjuntos']['M0']


def test_minimizacion_maneja_afd_de_un_solo_estado():
    afd_directo, afd_minimizado = construir_afds('a*')
    assert contarMetricas(afd_directo) == {'estados': 1, 'transiciones': 1}
    assert contarMetricas(afd_minimizado) == {'estados': 1, 'transiciones': 1}


def test_minimizacion_maneja_estado_inicial_de_aceptacion_con_epsilon():
    afd_directo, afd_minimizado = construir_afds('ε')
    assert afd_directo['estadoInicial'] in afd_directo['estadosAceptacion']
    assert afd_minimizado['estadoInicial'] in afd_minimizado['estadosAceptacion']
    assert contarMetricas(afd_minimizado) == {'estados': 1, 'transiciones': 0}


def test_equivalencia_directo_vs_minimizado():
    expr = '(a|b)*(aa|ab|ba|bb)'
    afd_directo, afd_minimizado = construir_afds(expr)
    cadenas = ['', 'a', 'aa', 'abba', 'bbb', 'abab', 'abc']

    for cadena in cadenas:
        assert simularAfd(afd_directo, cadena)[0] == simularAfd(afd_minimizado, cadena)[0]
