from laboratorio.analizador import prepararExpresion
from laboratorio.arbol import construirArbolDirecto
from laboratorio.construccion_afd import construirAfd


def test_arbol_directo_calcula_followpos_para_kleene():
    postfijo, alfa, _ = prepararExpresion('a*')
    raiz, hojas = construirArbolDirecto(postfijo)
    afd = construirAfd(raiz, hojas, alfa)

    hojas_a = [hoja for hoja in hojas.values() if getattr(hoja.valor, 'value', None) == 'a']
    assert len(hojas_a) == 1
    assert hojas_a[0].siguientePos == {hojas_a[0].idHoja, max(hojas.keys())}
    assert afd['estadoInicial'] in afd['estadosAceptacion']


def test_afd_para_ab_tiene_transiciones_esperadas():
    postfijo, alfa, _ = prepararExpresion('ab')
    raiz, hojas = construirArbolDirecto(postfijo)
    afd = construirAfd(raiz, hojas, alfa)

    assert afd['alfabeto'] == ['a', 'b']
    assert afd['transiciones']['S0']['a'] == 'S1'
    assert afd['transiciones']['S1']['b'] == 'S2'
    assert afd['estadosAceptacion'] == {'S2'}


def test_afd_con_epsilon_acepta_cadena_vacia_desde_inicio():
    postfijo, alfa, _ = prepararExpresion('ε')
    raiz, hojas = construirArbolDirecto(postfijo)
    afd = construirAfd(raiz, hojas, alfa)

    assert afd['alfabeto'] == []
    assert afd['estadoInicial'] in afd['estadosAceptacion']
    assert afd['transiciones']['S0'] == {}
