from dataclasses import dataclass


EPSILON = 'ε'
MARKER = '#'
OPERATORS = {'|', '.', '*', '+', '?', '(', ')'}
UNARY_OPERATORS = {'*', '+', '?'}
BINARY_OPERATORS = {'|', '.'}


@dataclass(frozen=True)
class Token:
    kind: str
    value: str
    escaped: bool = False


def operador(value: str) -> Token:
    return Token('operator', value)


def literal(value: str, escaped: bool = False) -> Token:
    return Token('literal', value, escaped=escaped)


def epsilon() -> Token:
    return Token('epsilon', EPSILON)


def marker() -> Token:
    return Token('marker', MARKER)


def es_operador(token: Token, value: str | None = None) -> bool:
    return token.kind == 'operator' and (value is None or token.value == value)


def es_literal(token: Token) -> bool:
    return token.kind == 'literal'


def es_epsilon(token: Token) -> bool:
    return token.kind == 'epsilon'


def es_marker(token: Token) -> bool:
    return token.kind == 'marker'


def es_unario(token: Token) -> bool:
    return es_operador(token) and token.value in UNARY_OPERATORS


def es_binario(token: Token) -> bool:
    return es_operador(token) and token.value in BINARY_OPERATORS


def puede_iniciar_termino(token: Token) -> bool:
    return es_literal(token) or es_epsilon(token) or es_operador(token, '(')


def puede_terminar_termino(token: Token) -> bool:
    return es_literal(token) or es_epsilon(token) or es_operador(token, ')') or es_unario(token)


def simbolo_a_texto(symbol: str) -> str:
    if symbol in OPERATORS or symbol in {EPSILON, '\\', MARKER}:
        return '\\' + symbol
    return symbol


def token_a_texto(token: Token) -> str:
    if token.kind == 'operator':
        return token.value
    if token.kind == 'epsilon':
        return EPSILON
    if token.kind == 'marker':
        return MARKER
    if token.escaped:
        return '\\' + token.value
    return simbolo_a_texto(token.value) if token.value in {EPSILON, '\\'} else token.value


def tokens_a_texto(tokens: list[Token]) -> list[str]:
    return [token_a_texto(token) for token in tokens]
