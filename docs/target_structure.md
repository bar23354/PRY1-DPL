# Estructura Objetivo y Mapa de Transición

## Estructura objetivo de nivel superior

La estructura objetivo del repositorio es la siguiente:

- `docs/`: documentación oficial y técnica.
- `legacy/`: referencia histórica y baseline visual/funcional.
- `backend/`: producto Python y pruebas del backend.
- `frontend/`: futura aplicación Next.js + React + TypeScript.
- `fixtures/`: casos de ejemplo, entradas y datos de validación.
- `e2e/`: validación end-to-end.
- `artifacts/`: salidas generadas y reportes.
- `scripts/`: comandos operativos y automatización local/CI.

## Estado de transición actual

Ya fue completado el aislamiento inicial:

- `main.py` -> `legacy/python/main.py`
- `programa_afd.py` -> `legacy/python/programa_afd.py`
- `yalex.py` -> `legacy/python/yalex.py`
- `interfaz/` -> `legacy/web/interfaz/`
- `examples/examples/` -> `fixtures/legacy/`
- `examples/tests/` -> `backend/tests/legacy_tests/`

Pendiente para el refactor grande:

- implementación real de `frontend/` en Next.js
- definición de integración entre frontend y backend
- validación E2E del producto final integrado

## Criterios de transición

- Ningún archivo legacy se elimina en esta etapa; primero se preserva y documenta.
- La estructura nueva ya existe y puede recibir el refactor grande sin otra reorganización previa.
- Las referencias del repositorio deben apuntar a las rutas nuevas y evitar rutas obsoletas.
- El backend seguirá manteniendo la lógica Python existente; esta reorganización no implica reescritura a TypeScript.
