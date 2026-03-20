# Proyecto 01

Implementacion de construccion de AFD por metodo directo, minimizacion de AFD, compilacion YALex e interfaz integrada para analisis, generacion y validacion.

La fuente normativa principal del proyecto es `docs/instrucciones_generales.md`.

El proyecto evita librerias regex para el matching lexico.

## Estructura actual

- `backend/`: backend Python, API FastAPI y pruebas del backend.
- `frontend/`: aplicacion Next.js + React + TypeScript.
- `fixtures/`: catalogo declarativo, especificaciones YALex e inputs de prueba.
- `legacy/`: referencia historica de entrypoints Python e interfaz web estatica.
- `docs/`: documentacion tecnica y academica.
- `e2e/`: pruebas end-to-end y soporte de validacion visual.

El nucleo Python vigente vive en `backend/src/laboratorio/`.

## Ejecutar la aplicacion integrada

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

Abrir:

```text
http://localhost:3000
```

## Pruebas

Backend:

```bash
python -m pytest -q backend/tests
```

Frontend:

```bash
cd frontend
npm test
npm run build
```

End-to-end:

```bash
cd frontend
npm run test:e2e
```

La suite E2E valida:

- shell integrado sin `iframe`
- panel general con datos reales
- analisis lexico con entrada valida e invalida
- generador lexico con compilacion valida, error de compilacion y descarga de lexer
- gestor de pruebas con ejecucion individual, ejecucion total y cobertura de todos los casos de la rubrica

Actualizacion de snapshots visuales:

```bash
cd frontend
npm run test:e2e:update
```

## Estructura relevante

- `docs/instrucciones_generales.md`: fuente normativa principal.
- `docs/manual_validation.md`: checklist manual de validacion.
- `backend/src/laboratorio/`: implementacion Python del nucleo.
- `frontend/src/`: shell, features, hooks, tipos y utilidades del frontend.
- `fixtures/catalog.json`: catalogo declarativo de fixtures y casos.
- `legacy/`: referencia historica preservada para comparacion.
