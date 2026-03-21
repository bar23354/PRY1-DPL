import pytest

from generador_lexico.core.analizador import RegexSyntaxError, formatearTokens, prepararExpresion, tokenizar


def test_tokeniza_operador_escapado_como_literal():
    tokens = tokenizar(r'a\*b')
    assert formatearTokens(tokens) == ['a', r'\*', 'b']


def test_preparar_expresion_inserta_concatenacion_y_postfijo():
    postfijo, alfa, infijo = prepararExpresion('a(b|c)*')
    assert formatearTokens(infijo) == ['a', '.', '(', 'b', '|', 'c', ')', '*']
    assert formatearTokens(postfijo) == ['a', 'b', 'c', '|', '*', '.']
    assert alfa == ['a', 'b', 'c']


def test_preparar_expresion_con_epsilon():
    postfijo, alfa, infijo = prepararExpresion('(a|ε)b')
    assert formatearTokens(infijo) == ['(', 'a', '|', 'ε', ')', '.', 'b']
    assert formatearTokens(postfijo) == ['a', 'ε', '|', 'b', '.']
    assert alfa == ['a', 'b']


@pytest.mark.parametrize(
    'expr',
    ['a(', '(a|b', 'a|', '*a', '\\', '()'],
)
def test_regex_invalidas_lanzan_error(expr):
    with pytest.raises(RegexSyntaxError):
        prepararExpresion(expr)
