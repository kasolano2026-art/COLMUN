COLMUN — GUÍA RÁPIDA

1. Abrir en PC
- Instala Visual Studio Code.
- Abre esta carpeta completa.
- Instala la extensión "Live Server".
- Haz clic derecho en index.html > Open with Live Server.
- La app se abrirá en el navegador.

IMPORTANTE: no abras index.html con doble clic si quieres probar la instalación PWA. El Service Worker necesita HTTP/HTTPS.

2. Probar
- Selecciona Constitución, Carta ONU o Declaración Universal.
- Escribe: "derecho a la igualdad", "libre empresa", "derecho a la vida", etc.
- Usa Favoritos, Historial, Copiar, Compartir y Modo oscuro.

3. Instalar en PC
- Publica el proyecto con HTTPS.
- Abre el sitio en un navegador compatible.
- Usa la opción de instalar/añadir a aplicaciones.

4. Instalar en Android
- Abre el sitio publicado en Chrome.
- Menú > Instalar aplicación / Añadir a pantalla de inicio (el texto puede variar).
- La app quedará como aplicación.

5. iPhone/iPad
- Abre el sitio publicado en Safari.
- Compartir > Añadir a pantalla de inicio.
- Confirma.
- La PWA se abrirá como aplicación.

6. Publicar
Una forma sencilla es usar GitHub Pages:
- Crea una cuenta de GitHub.
- Crea un repositorio público, por ejemplo: COLMUN.
- Sube TODOS los archivos y carpetas manteniendo la estructura.
- En Settings > Pages selecciona Deploy from a branch.
- Selecciona la rama principal y la carpeta raíz.
- Guarda.
- GitHub generará una dirección HTTPS.
- Abre esa dirección en PC y teléfono.

7. Actualizar documentos
Los archivos de datos están en:
datos/constitucion.json
datos/onu.json
datos/ddhh.json

No confundas texto oficial con explicación. El campo "texto" debe corresponder al documento fuente y "explicacion" debe ser una explicación educativa propia.

8. Fuentes
Constitución de Colombia:
https://www.funcionpublica.gov.co/eva/gestornormativo/norma.php?i=4125

Carta de Naciones Unidas:
https://www.un.org/es/about-us/un-charter/full-text

Declaración Universal:
https://www.un.org/es/about-us/universal-declaration-of-human-rights

9. Importante
Esta versión es un buscador local: no necesita API ni pago. La búsqueda "inteligente" usa coincidencias, temas y sinónimos definidos en app.js.
Para una IA real que responda preguntas abiertas habría que conectar un servicio de IA mediante un backend seguro; NO se debe poner una clave secreta directamente en app.js.
