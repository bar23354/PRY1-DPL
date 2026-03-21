# Proyecto 01

Implementacion de construccion de AFD por metodo directo, minimizacion de AFD, compilacion YALex e interfaz integrada para analisis, generacion y validacion.

Hecho por: `DiegoLop ez#23747`, `JenniferToxcon#21276` y `Rob ertoBarreda#23354`.

La fuente normativa principal del proyecto es `docs/instrucciones_generales.md`.

El proyecto evita librerias regex para el matching lexico.

## Estructura actual

```text
PRY1-DPL/
|-- backend/                  # Backend Python, API FastAPI y pruebas del backend
|   |-- src/generador_lexico/ # Nucleo del generador, analizador y casos de uso
|   `-- tests/                # Pruebas unitarias, de contrato y de regresion
|-- frontend/                 # Aplicacion Next.js + React + TypeScript
|   |-- app/                  # App Router de Next.js
|   |-- src/                  # Features, hooks, tipos, i18n y utilidades
|   |-- e2e/                  # Pruebas Playwright y snapshots visuales
|   `-- scripts/              # Scripts auxiliares del frontend
|-- fixtures/                 # Casos y especificaciones usadas por backend y frontend
|   |-- cases/                # Inputs y archivos YALex base/modificados
|   `-- catalog.json          # Catalogo declarativo de fixtures y casos
|-- docs/                     # Informe, instrucciones y guia manual de validacion
|-- e2e/                      # Recursos auxiliares de automatizacion end-to-end
|-- artifacts/                # Reportes y salidas generadas por pruebas y herramientas
`-- README.md                 # Guia principal del proyecto
```

El nucleo Python vigente vive en `backend/src/generador_lexico/`.

## Probar el proyecto

Backend:

```powershell
$env:PYTHONPATH="backend/src"
python -m generador_lexico.cli.serve
```

Frontend:

```powershell
cd frontend
$env:BACKEND_API_ORIGIN="http://127.0.0.1:8000"
npm run dev
```

Abrir en el navegador:

```text
http://localhost:3000
```

Guia rapida de uso:

- `Panel general`: valida que carguen los conteos y modulos integrados.
- `Analisis lexico`:
  - deja el editor vacio y ejecuta `Baja`, `Media` o `Alta` para usar el caso base del catalogo
  - si quieres probar upload manual, usa por ejemplo:
    - `fixtures/cases/inputs/yalex_baja_input.txt`
    - `fixtures/cases/inputs/yalex_media_input.txt`
    - `fixtures/cases/inputs/yalex_alta_input.txt`
  - para error lexico, usa:
    - `fixtures/cases/inputs/yalex_baja_invalid_input.txt`
    - `fixtures/cases/inputs/yalex_media_invalid_input.txt`
    - `fixtures/cases/inputs/yalex_alta_invalid_input.txt`
- `Generador lexico`:
  - puedes dejar el editor como viene y ejecutar `Generar diagrama`
  - si quieres cargar un archivo `.yal`, usa por ejemplo:
    - `fixtures/cases/yalex/yalex_baja.yal`
    - `fixtures/cases/yalex/yalex_media.yal`
    - `fixtures/cases/yalex/yalex_alta.yal`
    - `fixtures/cases/yalex/yalex_full_features.yal`
  - para probar variantes modificadas:
    - `fixtures/cases/yalex/variants/yalex_baja_minus.yal`
    - `fixtures/cases/yalex/variants/yalex_media_for.yal`
    - `fixtures/cases/yalex/variants/yalex_alta_bang.yal`
  - para error de compilacion, pega algo invalido como:
    ```text
    let digit = ['0'-'9']
    ```
- `Gestor de pruebas`:
  - usa `Ejecutar caso` para una fila puntual
  - usa `Ejecutar todas las pruebas` para correr todos los casos de la rubrica desde la interfaz

Validacion rapida:

```bash
python -m pytest -q backend/tests
cd frontend
npm test
npm run build
npm run test:e2e
```

Si necesitas regenerar snapshots visuales:

```bash
cd frontend
npm run test:e2e:update
```

## Estructura relevante

- `docs/instrucciones_generales.md`: fuente normativa principal.
- `docs/manual_validation.md`: checklist manual de validacion.
- `backend/src/generador_lexico/`: implementacion Python del nucleo.
- `frontend/src/`: shell, features, hooks, tipos y utilidades del frontend.
- `fixtures/catalog.json`: catalogo declarativo de fixtures y casos.
