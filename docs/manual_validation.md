# Validacion Manual

## Preparacion

1. Iniciar el backend desde la raiz del proyecto:
   ```powershell
   $env:PYTHONPATH="backend/src"
   python -m laboratorio.cli.serve
   ```
2. Iniciar el frontend en otra terminal:
   ```powershell
   cd frontend
   $env:BACKEND_API_ORIGIN="http://127.0.0.1:8000"
   npm run dev
   ```
3. Abrir `http://localhost:3000`.

## Checklist

### Shell y panel general

1. Verificar que la vista inicial sea `Panel general`.
2. Confirmar que no exista ningun `iframe` dentro de la interfaz.
3. Validar que el panel general muestre:
   - `Casos base`
   - `Casos de prueba`
   - distribucion `Baja / Media / Alta`
   - inventario de modulos

### Analisis lexico

1. Entrar a `Analisis lexico`.
2. Seleccionar `Baja`.
3. Ejecutar `Ejecutar analisis` con el editor vacio.
4. Confirmar que aparezcan tokens en la tabla.
5. Cargar `fixtures/cases/inputs/yalex_baja_invalid_input.txt`.
6. Ejecutar `Ejecutar analisis` y verificar que aparezca un error lexico.
7. Ejecutar `Exportar tokens` despues de una corrida exitosa y confirmar descarga de `tokens_analisis.tsv`.

### Generador lexico

1. Entrar a `Generador lexico`.
2. Ejecutar `Generar diagrama`.
3. Confirmar que aparezcan:
   - regla activa
   - automata SVG
   - matriz de transicion
4. Descargar `Descargar lexer` y verificar que el archivo sea `lexer_generado.py`.
5. Descargar `Descargar automata` y verificar que el archivo sea `automata.svg`.
6. Reemplazar el contenido del editor con una especificacion invalida, por ejemplo:
   ```text
   let digit = ['0'-'9']
   ```
7. Ejecutar `Generar diagrama` y confirmar que se muestre el error.

### Gestor de pruebas

1. Entrar a `Gestor de pruebas`.
2. Ejecutar `Ejecutar caso` sobre `Entrada valida de baja`.
3. Confirmar que el estado cambie a `Aprobado`.
4. Ejecutar `Ejecutar todas las pruebas`.
5. Verificar que el porcentaje de exito y el total de ejecuciones se actualicen.
6. Confirmar que las filas de todos los casos de la rubrica queden en estado `Aprobado`:
   - `Entrada valida de baja`
   - `Entrada invalida de baja`
   - `Entrada valida modificada de baja`
   - `Entrada invalida modificada de baja`
   - `Entrada valida de media`
   - `Entrada invalida de media`
   - `Entrada valida modificada de media`
   - `Entrada invalida modificada de media`
   - `Entrada valida de alta`
   - `Entrada invalida de alta`
   - `Entrada valida modificada de alta`
   - `Entrada invalida modificada de alta`

## Validacion automatizada adicional

- Ejecutar `python -m pytest -q backend/tests`
- Ejecutar `cd frontend && npm test`
- Ejecutar `cd frontend && npm run build`
- Ejecutar `cd frontend && npm run test:e2e`
