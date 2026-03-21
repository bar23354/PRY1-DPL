# construccion del arbol sintactico y calculo de anulable, primeraPos, ultimaPos, siguientePos

from generador_lexico.core.tokens import Token, es_epsilon, es_marker, es_operador, es_unario, marker, operador


_contadorHojas = 0


class Nodo:
    def __init__(self, valor, izq=None, der=None):
        self.valor = valor
        self.izq = izq
        self.der = der
        self.idHoja = None
        self.anulable = False
        self.primeraPos = set()
        self.ultimaPos = set()
        self.siguientePos = set()


def _nuevoId():
    global _contadorHojas
    _contadorHojas += 1
    return _contadorHojas


def _crearNodoUnario(token, hijo):
    n = Nodo(token, hijo)
    n.anulable = token.value in ('*', '?') or hijo.anulable
    n.primeraPos = hijo.primeraPos.copy()
    n.ultimaPos = hijo.ultimaPos.copy()
    return n


def _crearHoja(token, hojas):
    n = Nodo(token)
    if es_epsilon(token):
        n.anulable = True
        return n

    n.idHoja = _nuevoId()
    n.primeraPos = {n.idHoja}
    n.ultimaPos = {n.idHoja}
    hojas[n.idHoja] = n
    return n


def construirArbol(postfijo):
    global _contadorHojas
    _contadorHojas = 0
    pila = []
    hojas = {}

    for token in postfijo:
        if es_operador(token, '|'):
            if len(pila) < 2:
                raise ValueError("La expresion no tiene suficientes operandos para '|'.")
            der, izq = pila.pop(), pila.pop()
            n = Nodo(token, izq, der)
            n.anulable = izq.anulable or der.anulable
            n.primeraPos = izq.primeraPos | der.primeraPos
            n.ultimaPos = izq.ultimaPos | der.ultimaPos
            pila.append(n)
        elif es_operador(token, '.'):
            if len(pila) < 2:
                raise ValueError("La expresion no tiene suficientes operandos para concatenacion.")
            der, izq = pila.pop(), pila.pop()
            n = Nodo(token, izq, der)
            n.anulable = izq.anulable and der.anulable
            n.primeraPos = (izq.primeraPos | der.primeraPos) if izq.anulable else izq.primeraPos.copy()
            n.ultimaPos = (izq.ultimaPos | der.ultimaPos) if der.anulable else der.ultimaPos.copy()
            pila.append(n)
        elif es_unario(token):
            if not pila:
                raise ValueError(f"La expresion no tiene operando para '{token.value}'.")
            pila.append(_crearNodoUnario(token, pila.pop()))
        else:
            pila.append(_crearHoja(token, hojas))

    if len(pila) != 1:
        raise ValueError('La expresion no pudo convertirse a un arbol sintactico valido.')
    return pila.pop(), hojas


def _calcSiguientePos(nodo, hojas):
    if nodo is None:
        return

    _calcSiguientePos(nodo.izq, hojas)
    _calcSiguientePos(nodo.der, hojas)

    if es_operador(nodo.valor, '.'):
        for pos in nodo.izq.ultimaPos:
            hojas[pos].siguientePos |= nodo.der.primeraPos
    elif es_operador(nodo.valor) and nodo.valor.value in ('*', '+'):
        for pos in nodo.ultimaPos:
            hojas[pos].siguientePos |= nodo.primeraPos


def construirArbolDirecto(postfijo):
    raiz, hojas = construirArbol(postfijo + [marker(), operador('.')])
    _calcSiguientePos(raiz, hojas)
    return raiz, hojas
