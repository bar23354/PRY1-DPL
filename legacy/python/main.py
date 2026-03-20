#entrada principal del programa

import sys
import webbrowser
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parents[2]
if str(REPO_ROOT) not in sys.path:
    sys.path.insert(0, str(REPO_ROOT))

from laboratorio.analizador import formatearSimbolo, formatearTokens, prepararExpresion
from laboratorio.arbol import construirArbolDirecto
from laboratorio.construccion_afd import construirAfd
from laboratorio.minimizacion import minimizarAfd
from laboratorio.simulador import simularAfd
from laboratorio.tabla import mostrarComparacion, mostrarDetalle, mostrarDetalleMinimizacion, mostrarTabla

def procesarRegex(expresion):
    print(f'\nExpresion regular: {expresion}')
    postfijo, alfa, infijo = prepararExpresion(expresion)
    print(f'Con concatenacion explicita: {" ".join(formatearTokens(infijo))}')
    print(f'Postfijo: {" ".join(formatearTokens(postfijo))}')
    print(f'Alfabeto: {{{", ".join(formatearSimbolo(symbol) for symbol in alfa)}}}')

    raiz, hojas = construirArbolDirecto(postfijo)
    afd_directo = construirAfd(raiz, hojas, alfa)
    afd_minimizado = minimizarAfd(afd_directo)
    mostrarDetalle(hojas, afd_directo, titulo='AFD directo')
    mostrarTabla(afd_directo, titulo='AFD DIRECTO')
    mostrarDetalleMinimizacion(afd_minimizado)
    mostrarTabla(afd_minimizado, titulo='AFD MINIMIZADO')
    mostrarComparacion(afd_directo, afd_minimizado)
    return afd_directo, afd_minimizado

def validarCadena(afd):
    cadena = input('Ingrese la cadena a validar: ')
    resultado, recorrido = simularAfd(afd, cadena)
    print(f'  Cadena: "{cadena}"')
    print(f'  Recorrido: {" -> ".join(recorrido)}')
    print(f'  Resultado: {"ACEPTADA" if resultado else "RECHAZADA"}')
    return resultado

def ejecutar_consola_regex():
    if hasattr(sys.stdout, 'reconfigure'):
        sys.stdout.reconfigure(encoding='utf-8')
    if hasattr(sys.stderr, 'reconfigure'):
        sys.stderr.reconfigure(encoding='utf-8')

    print('=' * 55)
    print('  Conversion Directa de Expresion Regular a AFD')
    print('=' * 55)
    print('Operadores: | (union)  * (Kleene)  + (positiva)  ? (opcional)  () (agrupacion)  \\ (escape)')

    while True:
        print('\n' + '-' * 55)
        opcion = input('[1] Nueva expresion  [2] Salir : ').strip()

        if opcion == '1':
            expresion = input('Expresion regular: ').strip()
            if not expresion:
                print('Error: expresion vacia.')
                continue
            try:
                afd_directo, afd_minimizado = procesarRegex(expresion)
            except Exception as e:
                print(f'Error: {e}')
                continue

            while True:
                sub = input(
                    '\n  [a] Validar con AFD minimizado  [b] Ver tabla directa  '
                    '[c] Ver tabla minimizada  [d] Ver comparacion  [e] Volver : '
                ).strip().lower()
                if sub == 'a':
                    validarCadena(afd_minimizado)
                elif sub == 'b':
                    mostrarTabla(afd_directo, titulo='AFD DIRECTO')
                elif sub == 'c':
                    mostrarTabla(afd_minimizado, titulo='AFD MINIMIZADO')
                elif sub == 'd':
                    mostrarComparacion(afd_directo, afd_minimizado)
                elif sub == 'e':
                    break

        elif opcion == '2':
            print('Finalizado.')
            break

def abrir_interfaz() -> bool:
    base_dir = REPO_ROOT / 'legacy' / 'web' / 'interfaz'
    required_files = [
        base_dir / 'index.html',
        base_dir / 'dashboard_project_01' / 'code.html',
        base_dir / 'analysis_tool' / 'code.html',
        base_dir / 'lexical_generator' / 'code.html',
        base_dir / 'test_case_manager' / 'code.html',
    ]

    missing = [str(path.relative_to(base_dir.parent)) for path in required_files if not path.exists()]
    if missing:
        print('Error: faltan archivos de interfaz:')
        for rel_path in missing:
            print(f'  - {rel_path}')
        return False

    webbrowser.open((base_dir / 'index.html').resolve().as_uri())
    print('Interfaz abierta en el navegador predeterminado.')
    return True

def main():
    if hasattr(sys.stdout, 'reconfigure'):
        sys.stdout.reconfigure(encoding='utf-8')
    if hasattr(sys.stderr, 'reconfigure'):
        sys.stderr.reconfigure(encoding='utf-8')

    print('=' * 55)
    print('  Proyecto 01 - Lanzador principal')
    print('=' * 55)

    while True:
        print('\n' + '-' * 55)
        opcion = input('[1] Consola AFD  [2] Interfaz Web  [3] Salir : ').strip()

        if opcion == '1':
            ejecutar_consola_regex()
        elif opcion == '2':
            abrir_interfaz()
        elif opcion == '3':
            print('Finalizado.')
            break

if __name__ == '__main__':
    main()
