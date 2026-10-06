# Reportes Home y Móvil

Página adaptable al celular para revisar el último reporte y copiar voluntariamente el texto a WhatsApp.

## Publicación

El archivo `index.html` funciona sin compilación. En GitHub Pages, elegir la rama destinada a publicación y la carpeta raíz como fuente. Mantener `.nojekyll` en la raíz.

La página contiene los últimos reportes guardados y no consulta Google Sheets automáticamente. Una nueva ejecución de corte debe actualizar los datos incluidos en `index.html` y publicar el cambio.

## Acceso

El archivo contiene reportes de negocio. Definir quién puede verlos antes de publicar. Un repositorio privado no implica que GitHub Pages sea privado. Para acceso privado nativo en GitHub Pages se requiere una organización con GitHub Enterprise Cloud.

No incluir credenciales ni claves de Google Sheets en el navegador. Cualquier integración futura con un Sheet privado requiere autenticación adecuada.
