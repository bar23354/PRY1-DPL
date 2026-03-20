# Inventario Actual del Repositorio

## Fuente normativa principal

La fuente normativa principal de este proyecto es `docs/instrucciones_generales.md`.

Documentos académicos complementarios:

- `docs/Consideraciones de YALex.pdf`
- `docs/Proyecto 01 - Rúbrica de evaluación.pdf`

## Estado actual clasificado

### Núcleo activo actual

- `backend/src/laboratorio/`: implementación Python vigente del núcleo léxico.

### Legacy preservado

- `legacy/python/`: entrypoints históricos del proyecto.
- `legacy/web/interfaz/`: HTMLs estáticos y capturas usados como baseline visual.

### Fixtures

- `fixtures/legacy/yalex/`: especificaciones YALex legacy.
- `fixtures/legacy/inputs/`: entradas de texto plano legacy.

### Pruebas

- `backend/tests/legacy_tests/`: suite automatizada reubicada para validar el comportamiento actual.

### Estructura preparada para el refactor mayor

- `backend/`: backend Python productivo, empaquetado y pruebas.
- `frontend/`: espacio reservado para la futura app Next.js.
- `e2e/`: espacio reservado para validación end-to-end.
- `artifacts/`: espacio reservado para salidas generadas.
- `scripts/`: espacio reservado para automatización local y CI.

### Soporte y operación

- `README.md`: documentación operativa actualizada al nuevo layout.
- `.gitignore`: reglas de exclusión locales y de herramientas.
- `.pytest_cache/`: artefactos de ejecución local, no parte del producto.

## Observaciones relevantes

- La raíz ya no mezcla entrypoints legacy, interfaz HTML y fixtures operativos.
- El núcleo Python ya vive en `backend/src/laboratorio/`.
- Los imports públicos del paquete siguen siendo `laboratorio.*`, pero ahora resuelven desde `backend/src`.
- `legacy/` se conserva para comparación y compatibilidad transicional.
- La documentación académica quedó consolidada en `docs/`.
- El siguiente refactor grande podrá trabajar sobre `backend/` y `frontend/` sin otra reorganización previa de alto nivel.
