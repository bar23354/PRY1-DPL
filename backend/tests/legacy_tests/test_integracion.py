import pytest

from generador_lexico.core.analizador import prepararExpresion
from generador_lexico.core.arbol import construirArbolDirecto
from generador_lexico.core.construccion_afd import construirAfd
from generador_lexico.core.simulador import simularAfd


def construir_pipeline(expr):
    postfijo, alfa, infijo = prepararExpresion(expr)
    raiz, hojas = construirArbolDirecto(postfijo)
    afd = construirAfd(raiz, hojas, alfa)
    return postfijo, alfa, infijo, hojas, afd


@pytest.mark.parametrize(
    ('expr', 'aceptadas', 'rechazadas'),
    [
        ('a(b|c)*', ['a', 'ab', 'acbc'], ['', 'b', 'ad']),
        ('ab+c?', ['ab', 'abb', 'abbc'], ['a', 'ac', 'abcc']),
        ('(a|b)*c+d?', ['c', 'abcd', 'bbccd'], ['', 'ab', 'dd']),
        ('a?', ['', 'a'], ['aa', 'b']),
        ('ε', [''], ['a', 'ε']),
        (r'a\*b', ['a*b'], ['ab', 'aaab']),
        ('(a|ε)b', ['b', 'ab'], ['', 'a', 'bb']),
    ],
)
def test_pipeline_completo(expr, aceptadas, rechazadas):
    _, _, _, _, afd = construir_pipeline(expr)

    for cadena in aceptadas:
        resultado, _ = simularAfd(afd, cadena)
        assert resultado, (expr, cadena)

    for cadena in rechazadas:
        resultado, _ = simularAfd(afd, cadena)
        assert not resultado, (expr, cadena)


def test_regresion_literal_escapado_no_se_comporta_como_kleene():
    _, _, _, _, afd = construir_pipeline(r'a\*b')
    assert simularAfd(afd, 'a*b')[0] is True
    assert simularAfd(afd, 'aaab')[0] is False


def test_representacion_minima_del_afd():
    _, alfa, _, _, afd = construir_pipeline('a?')
    assert alfa == ['a']
    assert afd['estadoInicial'] == 'S0'
    assert afd['estadoInicial'] in afd['estadosAceptacion']
    assert afd['estadosAceptacion'] == {'S0', 'S1'}
