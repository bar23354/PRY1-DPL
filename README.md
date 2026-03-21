# Proyecto 01 - Generador de analizadores lexicos

Implementacion de un generador de analizadores lexicos basado en YALex, con construccion de AFD por metodo directo, minimizacion de automatas, generacion de codigo fuente del lexer y una interfaz grafica web para analisis, generacion y validacion.

Integrantes: `Diego Lopez#23747`, `Jennifer Toxcon#21276`, `Roberto Barreda#23354`.

Fuente normativa del proyecto: `docs/instrucciones_generales.md`.

## Cumplimiento de requisitos

- **Entrada del generador**: acepta especificaciones YALex (`.yal`) desde UI y backend.
- **Salida del generador**:
  - diagrama de transicion por regla (vista grafica + matriz de transiciones),
  - codigo fuente de lexer Python descargable.
- **Analizador lexico**:
  - reconoce tokens definidos en la especificacion,
  - reporta errores lexicos con posicion.
- **Sin librerias regex**: no se usa `re` para reconocimiento lexico; la tokenizacion se hace con AFD.
- **Interfaz grafica amigable y estetica**: modulo web en `frontend/` con paneles de analisis, generador y gestor de pruebas.
- **Independencia del lexer generado**: se puede generar archivo Python standalone y ejecutarlo sin depender del servidor web.
- **Casos baja/media/alta + modificados**: catalogados en `fixtures/catalog.json` con entradas validas e invalidas.

## Estructura del repositorio

- `backend/`: API FastAPI, compilador YALex, runtime de escaneo y CLI.
- `frontend/`: aplicacion Next.js + React + TypeScript.
- `fixtures/`: especificaciones YALex e inputs de prueba de la rubrica.
- `docs/`: documentacion tecnica y academica.

El nucleo del generador/analizador vive en `backend/src/laboratorio/`.

## Ejecucion local

Backend:

```powershell
$env:PYTHONPATH="backend/src"
python -m laboratorio.cli.serve
```

Frontend:

```powershell
cd frontend
$env:BACKEND_API_ORIGIN="http://127.0.0.1:8000"
npm run dev
```

Abrir `http://localhost:3000`.

## Demostracion de independencia del analizador generado

Generar lexer standalone desde un `.yal`:

```powershell
$env:PYTHONPATH="backend/src"
python -m laboratorio.cli.generate fixtures/cases/yalex/yalex_baja.yal artifacts/lexer_baja.py
```

Luego se puede importar y ejecutar `gettoken` (o el entrypoint definido en el YALex) directamente desde `artifacts/lexer_baja.py`, sin levantar la UI ni la API.

## Casos de prueba de la rubrica

Los pares de especificacion + input estan declarados en `fixtures/catalog.json`:

- Baja: validacion base, error lexico y version modificada.
- Media: validacion base, error lexico y version modificada.
- Alta: validacion base, error lexico y version modificada.

Archivos clave:

- Especificaciones: `fixtures/cases/yalex/` y `fixtures/cases/yalex/variants/`.
- Entradas: `fixtures/cases/inputs/`.

## Validacion rapida

```powershell
python -m pytest -q backend/tests
cd frontend
npm test
npm run build
npm run test:e2e
```

## Referencias tecnicas

- `backend/src/laboratorio/yalex_parser.py`: parser de YALex.
- `backend/src/laboratorio/yalex_compiler.py`: compilacion a reglas con AFD.
- `backend/src/laboratorio/yalex_runtime.py`: escaneo de texto con estrategia de prefijo mas largo.
- `backend/src/laboratorio/yalex_codegen.py`: generacion de codigo del lexer.
- `frontend/src/`: interfaz grafica de analisis/generacion/pruebas.
