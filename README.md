# Vita — Landing Page

El sitio de **Vita**, el equipo que opera centros wellness: recepción, ventas, cobros y marketing.

Sitio estático. HTML, CSS y JS a mano, sin framework ni dependencias.

## Cómo se edita

**Todo el contenido vive en `src/body.html`.** Es un único archivo bilingüe: el español es el texto visible y el inglés va en los atributos `data-en` / `data-en-html`.

```html
<h3 data-en="Front desk and scheduling">Recepción y agenda</h3>
```

Después de editar, generas las dos páginas:

```bash
node tools/build.js
```

Eso escribe `index.html` (español), `en/index.html` (inglés) y `sitemap.xml`. **Nunca edites esos tres a mano**: se sobrescriben en cada build.

## Cómo se previsualiza

```bash
node tools/build.js && python3 tools/serve.py
# http://localhost:8899
```

`tools/serve.py` responde con `Cache-Control: no-store`, así que cada rebuild se ve al toque. Si usas `python3 -m http.server` el navegador te va a servir el HTML y el CSS viejos desde caché.

## Estructura

```
src/body.html        Fuente única, bilingüe. Acá se edita todo.
tools/build.js       Genera index.html, en/index.html y sitemap.xml
tools/serve.py       Servidor local sin caché
index.html           GENERADO — español, canonical https://vita.lat/
en/index.html        GENERADO — inglés,  canonical https://vita.lat/en/
sitemap.xml          GENERADO
404.html             Página de error
robots.txt           Permite todo salvo /centers/, apunta al sitemap
site.webmanifest     Manifest PWA
assets/
  vita.css           Estilos. Los bloques del final sobrescriben a los de arriba.
  vita.js            Menú, FAQ, reveals y el cuestionario de demo
  fonts/             DM Sans autohospedada (woff2, licencia OFL)
  photos/            Las tres fotos de las bandas a sangre
  logos/             Logos de clientes
  og-image.jpg       Tarjeta de link preview, 1200x630
centers/             Páginas por vertical, WIP, en noindex y sin enlazar
```

## Idiomas y SEO

`vita.lat/` es español y `vita.lat/en/` es inglés, cada una monolingüe y con su propio `<title>`, meta description y canonical. Están enlazadas con `hreflang` (`es`, `es-CL`, `en`, `x-default`).

En la raíz hay un script que redirige a `/en/` si el navegador no está en español. **No redirige a los bots**, para no romper la indexación del español.

El `<head>` lo arma `tools/build.js`: Open Graph, Twitter cards, favicons y el JSON-LD (Organization, WebSite, SoftwareApplication y FAQPage). El FAQPage se genera solo leyendo las preguntas del HTML, así que si agregas una FAQ el structured data se actualiza en el siguiente build.

Los textos de `<title>`, meta description y keywords están en el objeto `META` de `tools/build.js`, no en el HTML.

## El cuestionario de demo

Los botones "Agenda una demo" abren un formulario de seis pasos. **No hay link a calendario**: el lead llega y ventas coordina.

Los envíos van a **Web3Forms** desde el navegador. La access key está en `assets/vita.js` (`ACCESS_KEY`) — es una clave pública, va en el cliente por diseño. Si la petición falla, cae a abrir un correo prellenado a hola@vita.lat.

Web3Forms en plan gratuito **solo acepta envíos desde el navegador**, no desde servidor. Un `curl` al endpoint devuelve `This method is not allowed`.

## Las fotos

Las tres bandas a sangre usan fotos de Unsplash (licencia comercial) de centros que no son clientes de Vita. Lo natural es reemplazarlas por material propio.

Para hacerlo, sobrescribe el archivo respetando nombre y proporción, y no hay que tocar código:

| Archivo | Proporción | Dónde aparece |
|---|---|---|
| `assets/photos/estudio.webp` | 2400×1000 | Banda "Grabamos en tu local" |
| `assets/photos/f-boxeo.webp` | 1400×1200 | Banda "Un box no se opera como un estudio de pilates" |
| `assets/photos/yoga.webp` | 2400×1000 | Fondo del testimonio |

Todo el peso de imágenes va en WebP. Si agregas una, pásala por `cwebp` antes de commitear.

## Deploy

GitHub Pages sobre `main`, dominio `vita.lat` vía el archivo `CNAME`. Push a `main` publica.

Acuérdate de correr `node tools/build.js` **antes** de commitear: los HTML generados están versionados y si no los regeneras, publicas la versión anterior.
