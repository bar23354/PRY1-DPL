## Descripción

Esta actividad consiste en la implementación de un generador de analizadores léxicos, el cual, tomando como entrada un archivo escrito en YALex, generará un analizador léxico que será capaz de reconocer los tokens especificados, o en su defecto, informar de los errores léxicos encontrados.

Para trabajar con YaLex, revise el siguiente documento:

[Consideraciones de YALex.pdf](https://uvg.instructure.com/courses/43731/files/11011282?wrap=1 "Enlace")[Descargar Consideraciones de YALex.pdf](https://uvg.instructure.com/courses/43731/files/11011282/download?download_frd=1)

[Minimice la vista previa del archivo](https://uvg.instructure.com/courses/43731/assignments/834620#)

<iframe aria-label="Vista previa del archivo de Consideraciones de YALex.pdf" src="https://uvg.instructure.com/api/v1/canvadoc_session?blob=%7B%22user_id%22:111400000000027281,%22attachment_id%22:11011282,%22type%22:%22canvadoc%22%7D&hmac=9880c5b7cafb1679b994029d019b0d300920ef01" width="100%" allowfullscreen="1" id="undefined"></iframe>

Objetivos

**Objetivo general**

* Implementar un generador de analizadores léxicos.

**Objetivos específicos**

* Aplicar la teoría de analizadores léxicos en la construcción de una herramienta de software generadora de dichos componentes.
* Implementar una herramienta de software que sea capaz de generar analizadores léxicos funcionales basados en la especificación de componentes léxicos.
* Utilizar la teoría de autómatas finitos para implementar analizadores léxicos.

## Especificación del funcionamiento del generador de analizadores léxicos

**Entrada**

* Un archivo que contiene la especificación del analizador léxico a generar, escrita en el lenguaje YALex.

**Salida**

* Diagrama de transición de estados que representa la especificación de componentes léxicos definida.
* Un programa fuente que implementa un analizador léxico con base en la especificación ingresada en lenguaje YALex.

## Especificación del funcionamiento del analizador léxico

**Entrada**

* Un archivo de texto plano con cadenas de caracteres.

**Salida**

* La impresión en pantalla de los tokens identificados, o en su defecto, los mensajes de los errores léxicos detectados.

## Entregables

Un documento que incluya:

* El nombre de los integrantes del grupo que colaboraron activamente en el proyecto y que tendrán derecho a nota.
* Diseño del software.
* Enlace a repositorio de GitHub con el código de la implementación.
* Documentación y explicación del código.

## Observaciones y restricciones

* La actividad deberá realizarse en los grupos que se conformaron al principio del semestre.
* El lenguaje de programación a utilizar para desarrollar el generador de analizadores léxicos queda a elección del grupo.
* El software deberá contar con una interfaz gráfica amigable y estética. El incumplimiento de esta restricción se penalizará restando 3 puntos a la nota obtenida.
* El funcionamiento del analizador léxico generado deberá ser independiente del generador de analizadores léxicos. El incumplimiento de esta restricción se penalizará restando 3 puntos a la nota obtenida.
* El uso de librerías para expresiones regulares está estrictamente prohibido; esta funcionalidad se deberá desarrollar por medio de autómatas finitos. El incumplimiento de esta restricción se penalizará colocando 0 puntos de nota.
* Cada grupo deberá escribir los archivos de prueba que se utilizarán en la
  calificación (tanto para la especificación del analizador léxico como
  para el archivo de texto plano de entrada); al menos tres pares: uno
  con complejidad baja, otro con complejidad media y otro con complejidad
  alta. El incumplimiento de este requerimiento se penalizará colocando 0 puntos de nota.
* A cada estudiante se le realizarán al menos dos preguntas directas, las cuales podrán ser preguntas teóricas o explicaciones sobre el código fuente.
