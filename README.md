# Proyecto 01

Implementación de construcción de AFD por método directo, minimización de AFD y compilación YALex.

La fuente normativa principal del proyecto es `docs/instrucciones_generales.md`.

El proyecto evita librerías regex para el matching léxico.

## Estado actual del repositorio

La estructura ya fue preparada para el refactor grande:

- `backend/`: espacio reservado para el backend Python y sus pruebas.
- `frontend/`: espacio reservado para la futura app en Next.js + React + TypeScript.
- `fixtures/`: fixtures legacy de YALex e inputs.
- `legacy/`: referencia histórica de entrypoints Python e interfaz web estática.
- `docs/`: documentación oficial y técnica.

En esta etapa, el núcleo Python vigente todavía permanece en `laboratorio/`.

## Ejecutar flujo legacy del curso

Comando principal legacy:

```bash
python legacy/python/main.py
```

Entrada legacy equivalente:

```bash
python legacy/python/programa_afd.py
```

CLI legacy de compilación YALex:

```bash
python legacy/python/yalex.py fixtures/legacy/yalex/yalex_baja.yal -o thelexer
```

## Pruebas

Suite legacy reubicada:

```bash
python -m pytest -q backend/tests/legacy_tests
```

## Estructura relevante

- `docs/instrucciones_generales.md`: fuente normativa principal.
- `docs/Consideraciones de YALex.pdf`: especificación complementaria de YALex.
- `docs/Proyecto 01 - Rúbrica de evaluación.pdf`: rúbrica académica.
- `laboratorio/`: implementación Python vigente del núcleo actual.
- `legacy/python/`: entrypoints históricos del proyecto.
- `legacy/web/interfaz/`: baseline visual HTML estático para comparación 1:1.
- `fixtures/legacy/`: insumos legacy de YALex e inputs de validación.
- `backend/tests/legacy_tests/`: suite automatizada heredada.
