# tokenizacion, formato y conversion de expresiones regulares a postfijo

from laboratorio.tokens import (
    BINARY_OPERATORS,
    EPSILON,
    Token,
    es_binario,
    es_epsilon,
    es_literal,
    es_operador,
    es_unario,
    epsilon,
    literal,
    operador,
    puede_iniciar_termino,
    puede_terminar_termino,
    simbolo_a_texto,
    token_a_texto,
    tokens_a_texto,
)


precedencia = {'|': 1, '.': 2}


class RegexSyntaxError(ValueError):
    pass


def tokenizar(expr):
    # transforma la cadena de expresion en una lista de tokens internos
    if expr == '':
        raise RegexSyntaxError('La expresion regular esta vacia.')

    toks = []
    i = 0
    while i < len(expr):
        char = expr[i]
        if char == '\\':
            if i + 1 >= len(expr):
                raise RegexSyntaxError('Escape incompleto al final de la expresion.')
            toks.append(literal(expr[i + 1], escaped=True))
            i += 2
            continue
        if char in {'|', '*', '+', '?', '(', ')'}:
            toks.append(operador(char))
        elif char == EPSILON:
            toks.append(epsilon())
        else:
            toks.append(literal(char))
        i += 1
    return toks


def validarTokens(toks):
    # valida forma sintactica basica antes de insertar concatenaciones
    if not toks:
        raise RegexSyntaxError('La expresion regular esta vacia.')

    balance = 0
    necesita_operando = True
    previo = None

    for token in toks:
        if es_literal(token) or es_epsilon(token):
            necesita_operando = False
        elif es_operador(token, '('):
            balance += 1
            necesita_operando = True
        elif es_operador(token, ')'):
            if balance == 0:
                raise RegexSyntaxError('Hay un parentesis de cierre sin apertura.')
            if previo is not None and es_operador(previo, '('):
                raise RegexSyntaxError('No se permiten grupos vacios.')
            if necesita_operando:
                raise RegexSyntaxError('Falta una expresion antes de cerrar parentesis.')
            balance -= 1
            necesita_operando = False
        elif es_operador(token, '|'):
            if necesita_operando:
                raise RegexSyntaxError("El operador '|' requiere una expresion a la izquierda.")
            necesita_operando = True
        elif es_unario(token):
            if necesita_operando:
                raise RegexSyntaxError(
                    f"El operador unario '{token.value}' no tiene un operando valido a la izquierda."
                )
            necesita_operando = False
        else:
            raise RegexSyntaxError(f'Token no soportado: {token!r}')
        previo = token

    if balance != 0:
        raise RegexSyntaxError('Los parentesis estan desbalanceados.')
    if necesita_operando:
        raise RegexSyntaxError('La expresion termina de forma incompleta.')


def insertarConcat(toks):
    # inserta el operador explicito '.' donde sea necesario para concatenacion
    salida = []
    for index, token in enumerate(toks):
        salida.append(token)
        if index + 1 < len(toks) and puede_terminar_termino(token) and puede_iniciar_termino(toks[index + 1]):
            salida.append(operador('.'))
    return salida


def aPostfijo(toks):
    # convierte la lista de tokens a notacion postfija
    salida = []
    pila = []

    for token in toks:
        if es_literal(token) or es_epsilon(token):
            salida.append(token)
        elif es_operador(token, '('):
            pila.append(token)
        elif es_operador(token, ')'):
            while pila and not es_operador(pila[-1], '('):
                salida.append(pila.pop())
            if not pila:
                raise RegexSyntaxError('Hay un parentesis de cierre sin apertura.')
            pila.pop()
        elif es_unario(token):
            salida.append(token)
        elif es_binario(token):
            while pila and es_binario(pila[-1]) and precedencia[pila[-1].value] >= precedencia[token.value]:
                salida.append(pila.pop())
            pila.append(token)
        else:
            raise RegexSyntaxError(f'Token no soportado en postfijo: {token!r}')

    while pila:
        token = pila.pop()
        if es_operador(token, '('):
            raise RegexSyntaxError('Los parentesis estan desbalanceados.')
        salida.append(token)
    return salida


def obtenerAlfabeto(toks):
    # devuelve el alfabeto de simbolos literales, excluyendo epsilon y marcador
    return sorted({token.value for token in toks if es_literal(token)}, key=lambda value: (simbolo_a_texto(value), value))


def formatearTokens(toks):
    return tokens_a_texto(toks)


def formatearSimbolo(symbol):
    return simbolo_a_texto(symbol)


def formatearToken(token: Token):
    return token_a_texto(token)


def prepararExpresion(expr):
    # prepara la expresion: tokeniza, valida, inserta concat, convierte a postfijo y obtiene el alfabeto
    toks = tokenizar(expr)
    validarTokens(toks)
    con_concat = insertarConcat(toks)
    postfijo = aPostfijo(con_concat)
    alfa = obtenerAlfabeto(toks)
    return postfijo, alfa, con_concat
