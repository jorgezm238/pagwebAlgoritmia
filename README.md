# Estudio de Algoritmia

Web de estudio estática (HTML + CSS + JavaScript, sin build ni dependencias): carga tus PDF y notebooks `.ipynb`, practica con tests A/B/C/D y verdadero/falso, y ejecuta el código de los notebooks en el navegador con Python (Pyodide).

## Uso en local
Abre la carpeta en VS Code → clic derecho en `index.html` → **Open with Live Server**.

## Despliegue en Vercel (página de testeo)
1. Sube este repositorio a GitHub (ver abajo).
2. En <https://vercel.com/new> pulsa **Import** sobre el repositorio.
3. Configuración: **Framework Preset: Other**, *Build Command* vacío, *Output Directory* vacío (raíz). Pulsa **Deploy**.
4. Cada `git push` a `main` redespliega automáticamente; las ramas y pull requests generan URLs de preview.

No hay variables de entorno, backend ni claves.

## Subir a GitHub
```
git remote add origin https://github.com/TU_USUARIO/estudio-algoritmia.git
git push -u origin main
```

## Estructura
| Archivo | Contenido |
|---|---|
| `index.html` | Estructura de la página |
| `style.css` | Diseño (modo oscuro, adaptable) |
| `script.js` | Lógica: PDF, tests, intentos, notebooks, kernel Python |
| `data.js` | Temario, banco de preguntas y V/F (aquí se añaden preguntas) |
| `vercel.json` | Configuración de Vercel (URLs limpias y caché) |

## Internet necesario en el navegador
PDF.js (cdnjs), Pyodide (jsDelivr, ~10 MB la primera vez) y las fuentes de Google se cargan desde CDN. Tus PDF y notebooks **no se suben a ningún servidor**: se procesan en tu navegador. El progreso se guarda en `localStorage` de cada navegador.

## Límites
- No hay IA: las preguntas generadas se crean con plantillas a partir de las definiciones del temario y de tus PDF.
- Python en el navegador: `input()` no funciona y los gráficos de matplotlib no se muestran.
