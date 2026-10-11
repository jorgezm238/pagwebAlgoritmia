WEB DE ESTUDIO - ALGORITMIA
===========================

CÓMO ABRIRLA
1. Abre la carpeta "estudio-algoritmia" en Visual Studio Code.
2. Instala la extensión "Live Server" (solo si no la tienes).
3. Clic derecho sobre index.html > "Open with Live Server".

ARCHIVOS
- index.html : estructura
- style.css  : diseño (modo oscuro, adaptable)
- script.js  : funcionamiento
- data.js    : banco de preguntas, definiciones y teoría (aquí añades contenido)

INTERNET
Solo hace falta para cargar PDF.js desde el CDN de cdnjs (lectura de PDF). Tests, teoría,
V/F y notebooks funcionan sin conexión. Sin Internet, la sección "Mis PDF" avisa del error.

QUÉ HACE CADA SECCIÓN
- Mis PDF: lee el texto en tu navegador, muestra nombre y páginas, avisa si un PDF no se puede
  leer (p. ej. escaneado), permite elegir documentos, buscar texto y ver definiciones detectadas
  con patrón "Término: explicación" (con página). Es detección simple, NO análisis con IA.
- Teoría: resúmenes, definiciones, diferencias y flashcards (con PDF y página de origen).
- Test A/B/C/D y Verdadero/Falso: filtro por tema, dificultad y número; modo examen y modo
  práctica con corrección inmediata; nota sobre 10, aciertos, fallos, %; repetir falladas.
- Prácticas .ipynb: lee el JSON del notebook (sin ejecutar Python): celdas Markdown, código,
  salidas guardadas, explicación línea a línea (por reglas), errores habituales, ideas para
  modificar, "¿qué resultado produce?" con pistas, "completa el código" y modo examen.
- El progreso y las falladas se guardan en localStorage del navegador.

PREGUNTAS GENERADAS AL AZAR
En Test A/B/C/D, elige Fuente = "Generadas al azar". Se crean con plantillas a partir de las
definiciones del temario y de las detectadas en los PDF cargados (concepto <-> definición, con 3
distractores de otros conceptos). Son preguntas de memorización de definiciones, no de razonamiento
(T(n), casos, costes...): para eso usa el banco preparado. No es IA.

CÓMO AÑADIR PREGUNTAS (data.js)
Test, dentro de QUIZ:
 {t:'opt', d:2, q:'Pregunta', o:['A','B','C','D'], a:1, e:'Explicación'},
 (t = id de tema de TOPICS, d = 1 fácil / 2 media / 3 difícil, a = posición correcta 0-3)
V/F, dentro de VF:
 {t:'tn', d:1, s:'Afirmación', v:false, fix:'Versión verdadera', e:'Explicación'},
Mantén el orden: las falladas guardadas se identifican por posición, así que añade siempre al
final de la lista.

LIMITACIONES (HONESTAS)
- No hay IA: no se generan preguntas nuevas ni se analiza la teoría automáticamente.
  El banco está preparado a mano a partir de tus 3 PDF (sesiones 1, 2 y 3).
  Esas funciones requerirían una API de IA y un backend; quedan marcadas como opcionales.
- Prácticas .ipynb: el código SÍ se ejecuta (Python real con Pyodide, en un Web Worker), pero Pyodide
  se descarga del CDN (~10 MB, necesita Internet la primera vez). input() no está disponible y los
  gráficos de matplotlib no se muestran. Detener/Reiniciar reinicia las variables.
- Las explicaciones del código son por reglas (palabras clave), útiles para conceptos básicos
  pero no entienden cualquier código.
- Ejercicio "detectar errores": se muestran las celdas del notebook que lo plantean y los errores
  habituales; no hay corrector automático de código escrito por ti.
