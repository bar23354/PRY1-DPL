# Proyecto 01

Implementacion de construccion de AFD por metodo directo, minimizacion de AFD y compilacion YALex.

La interfaz oficial del proyecto para presentacion esta en [interfaz/index.html](interfaz/index.html).

El proyecto evita librerias regex para el matching lexico.

## Ejecutar flujo original del curso

Comando principal:

python main.py

Entrada legacy equivalente:

python programa_afd.py

CLI de compilacion YALex:

python yalex.py examples/yalex_baja.yal -o thelexer

## Pruebas

python -m pytest -q

## Estructura relevante

- [main.py](main.py): lanzador consola e interfaz estatica
- [yalex.py](yalex.py): generador de lexer desde .yal
- [laboratorio](laboratorio): implementacion base del proyecto y rubrica
- [examples](examples): insumos baja/media/alta
- [tests](tests): suite automatizada
- [interfaz/index.html](interfaz/index.html): interfaz unificada para presentacion

