# Validación Manual

## Preparación

1. Iniciar el backend:
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

### Shell y Dashboard

1. Verificar que la vista inicial sea `Dashboard General`.
2. Confirmar que no exista ningún `iframe` dentro de la interfaz.
3. Validar que el dashboard muestre:
   - `totalFixtures`
   - `totalTestCases`
   - distribución `Low / Medium / High`
   - inventario de módulos

### Lexical Analysis

1. Entrar a `Lexical Analysis`.
2. Seleccionar `Low`.
3. Ejecutar `Run Analysis` con el editor vacío.
4. Confirmar que aparezcan tokens en la tabla.
5. Cargar `fixtures/legacy/inputs/yalex_baja_invalid_input.txt`.
6. Ejecutar `Run Analysis` y verificar que aparezca un error léxico.
7. Ejecutar `Export Tokens` después de una corrida exitosa y confirmar descarga.

### Lexical Generator

1. Entrar a `Lexical Generator`.
2. Ejecutar `Generate Diagram`.
3. Confirmar que aparezcan:
   - regla activa
   - autómata SVG
   - matriz de transiciones
4. Descargar `Download Lexer` y verificar que el archivo sea `thelexer.py`.
5. Descargar `Download Automaton`.
6. Reemplazar el contenido del editor con una especificación inválida, por ejemplo:
   ```text
   let digit = ['0'-'9']
   ```
7. Ejecutar `Generate Diagram` y confirmar que se muestre el error.

### Test Case Manager

1. Entrar a `Test Case Manager`.
2. Ejecutar `Run Case` sobre `Low valid input`.
3. Confirmar que el estado cambie a `Passed`.
4. Ejecutar `Run All Tests`.
5. Verificar que el porcentaje de éxito y el total de ejecuciones se actualicen.

## Validación adicional

- Ejecutar `python -m pytest -q backend/tests`
- Ejecutar `cd frontend && npm test`
- Ejecutar `cd frontend && npm run build`
- Ejecutar `cd frontend && npm run test:e2e`
