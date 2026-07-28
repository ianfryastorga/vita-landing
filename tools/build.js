#!/usr/bin/env node
/*
 * Generates the two static pages from a single bilingual source.
 *
 *   src/body.html  (Spanish visible + data-en / data-en-html overrides)
 *        -> index.html      Spanish, canonical https://vita.lat/
 *        -> en/index.html   English, canonical https://vita.lat/en/
 *
 * Run: node tools/build.js
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const ORIGIN = 'https://vita.lat';
const DEMO_URL = ORIGIN + '/#agenda';

const META = {
  es: {
    dir: '.',
    assets: 'assets',
    url: ORIGIN + '/',
    locale: 'es_CL',
    title: 'Vita | El equipo que opera tu gimnasio o centro wellness',
    description:
      'No es un software más ni una agencia: operamos tu centro completo. Recepción, ventas, cobros, boletas SII y marketing. +70 centros en Chile.',
    keywords:
      'software para gimnasios, software para centros wellness, sistema de reservas para gimnasios, software estudio de pilates, agenda online centro deportivo, CRM para gimnasios, cobro recurrente gimnasio, boleta electrónica gimnasio, app para gimnasios Chile',
    ogImage: '/assets/og-image.jpg',
    ogAlt: 'Vita, operamos tu centro wellness. Menos la clase.',
    siteName: 'Vita',
  },
  en: {
    dir: 'en',
    assets: '../assets',
    url: ORIGIN + '/en/',
    locale: 'en_US',
    title: 'Vita | The team that runs your gym or wellness center',
    description:
      'Not another piece of software, not an agency: we run your center. Front desk, sales, billing, invoicing and marketing. 70+ centers across Latin America.',
    keywords:
      'gym management software, wellness center software, pilates studio software, class booking system, gym CRM, recurring billing for gyms, WhatsApp booking, white label gym app',
    ogImage: '/assets/og-image.jpg',
    ogAlt: 'Vita, we run your wellness center. Except the class.',
    siteName: 'Vita',
  },
};

const src = fs.readFileSync(path.join(ROOT, 'src', 'body.html'), 'utf8');

/* ---------- tiny tag-aware inner-content replacer ---------- */

const escapeHtml = (s) =>
  s.replace(/&(?!(?:[a-zA-Z][a-zA-Z0-9]*|#\d+|#x[0-9a-fA-F]+);)/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

function findMatchingClose(html, tag, from) {
  const re = new RegExp(`<(/?)${tag}\\b`, 'gi');
  re.lastIndex = from;
  let depth = 1;
  let m;
  while ((m = re.exec(html))) {
    if (m[1] === '/') {
      if (--depth === 0) return m.index;
    } else {
      const close = html.indexOf('>', m.index);
      if (close !== -1 && html[close - 1] !== '/') depth++;
    }
  }
  throw new Error(`Unclosed <${tag}> near index ${from}`);
}

function localize(html, lang) {
  const attrs = lang === 'en' ? ['data-en-html', 'data-en'] : [];
  for (const attr of attrs) {
    let out = '';
    let cursor = 0;
    const open = new RegExp(`<([a-zA-Z][\\w-]*)\\b[^>]*?\\s${attr}="([^"]*)"[^>]*>`, 'g');
    let m;
    while ((m = open.exec(html))) {
      const [tagHtml, tag, value] = m;
      const innerStart = m.index + tagHtml.length;
      const innerEnd = findMatchingClose(html, tag, innerStart);
      const replacement = attr === 'data-en-html' ? value : escapeHtml(value);
      out += html.slice(cursor, m.index) + tagHtml + replacement;
      cursor = innerEnd;
      open.lastIndex = innerEnd;
    }
    html = out + html.slice(cursor);
  }
  // strip the translation attributes from the shipped markup
  html = html.replace(/\s+data-en(?:-html)?="[^"]*"/g, '');
  return html;
}

/* ---------- structured data ---------- */

function faqSchema(html) {
  const items = [];
  const qRe = /<span class="faq-qt"[^>]*>([\s\S]*?)<\/span>/g;
  const aRe = /<div class="faq-a-inner"[^>]*>([\s\S]*?)<\/div>/g;
  const strip = (s) => s.replace(/<[^>]+>/g, '').trim();
  let q, a;
  while ((q = qRe.exec(html)) && (a = aRe.exec(html))) {
    items.push({
      '@type': 'Question',
      name: strip(q[1]),
      acceptedAnswer: { '@type': 'Answer', text: strip(a[1]) },
    });
  }
  return { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: items };
}

function orgSchema(lang) {
  const m = META[lang];
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': ORIGIN + '/#organization',
        name: 'Vita',
        url: ORIGIN + '/',
        logo: { '@type': 'ImageObject', url: ORIGIN + '/assets/icon-512.png', width: 512, height: 512 },
        description: m.description,
        email: 'hola@vita.lat',
        areaServed: [
          { '@type': 'Country', name: 'Chile' },
          { '@type': 'Place', name: 'Latin America' },
        ],
        sameAs: [
          'https://www.instagram.com/vita_software/',
          'https://www.linkedin.com/company/usevita',
        ],
      },
      {
        '@type': 'WebSite',
        '@id': ORIGIN + '/#website',
        url: ORIGIN + '/',
        name: 'Vita',
        inLanguage: lang === 'es' ? 'es-CL' : 'en',
        publisher: { '@id': ORIGIN + '/#organization' },
      },
      {
        '@type': 'SoftwareApplication',
        '@id': ORIGIN + '/#software',
        name: 'Vita',
        applicationCategory: 'BusinessApplication',
        operatingSystem: 'Web, iOS, Android',
        url: m.url,
        inLanguage: lang === 'es' ? 'es-CL' : 'en',
        description: m.description,
        provider: { '@id': ORIGIN + '/#organization' },
        featureList:
          lang === 'es'
            ? [
                'Agenda y reservas online',
                'Cobros recurrentes y links de pago',
                'Boletas electrónicas automáticas',
                'Atención y ventas por WhatsApp e Instagram',
                'CRM y campañas de Meta y Google',
                'Fidelización y puntos',
                'Reportes y metas por sucursal',
                'App white-label para clientes',
              ]
            : [
                'Online scheduling and bookings',
                'Recurring billing and payment links',
                'Automatic electronic invoicing',
                'WhatsApp and Instagram sales support',
                'CRM with Meta and Google campaigns',
                'Loyalty and rewards',
                'Reporting and targets per location',
                'White-label client app',
              ],
        offers: {
          '@type': 'Offer',
          priceCurrency: 'CLP',
          availability: 'https://schema.org/InStock',
          url: DEMO_URL,
        },
      },
    ],
  };
}

/* ---------- head ---------- */

function head(lang, body) {
  const m = META[lang];
  const a = m.assets;
  return `<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>${m.title}</title>
<meta name="description" content="${m.description}" />
<meta name="keywords" content="${m.keywords}" />
<meta name="author" content="Vita" />
<meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
<meta name="theme-color" content="#016075" />
<meta name="format-detection" content="telephone=no" />
<link rel="canonical" href="${m.url}" />
<link rel="alternate" hreflang="es" href="${ORIGIN}/" />
<link rel="alternate" hreflang="es-CL" href="${ORIGIN}/" />
<link rel="alternate" hreflang="en" href="${ORIGIN}/en/" />
<link rel="alternate" hreflang="x-default" href="${ORIGIN}/" />

<meta property="og:type" content="website" />
<meta property="og:site_name" content="${m.siteName}" />
<meta property="og:locale" content="${m.locale}" />
<meta property="og:url" content="${m.url}" />
<meta property="og:title" content="${m.title}" />
<meta property="og:description" content="${m.description}" />
<meta property="og:image" content="${ORIGIN}${m.ogImage}" />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />
<meta property="og:image:alt" content="${m.ogAlt}" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="${m.title}" />
<meta name="twitter:description" content="${m.description}" />
<meta name="twitter:image" content="${ORIGIN}${m.ogImage}" />

<link rel="icon" href="${a}/favicon-32.png" sizes="32x32" type="image/png" />
<link rel="icon" href="${a}/icon-192.png" sizes="192x192" type="image/png" />
<link rel="apple-touch-icon" href="${a}/apple-touch-icon.png" />
<link rel="manifest" href="/site.webmanifest" />

<link rel="preload" as="font" type="font/woff2" href="${a}/fonts/dmsans-latin.woff2" crossorigin />
<link rel="preload" as="image" href="${a}/hero-mesh.webp" fetchpriority="high" />
<link rel="stylesheet" href="${a}/vita.css" />

<script type="application/ld+json">${JSON.stringify(orgSchema(lang))}</script>
<script type="application/ld+json">${JSON.stringify(faqSchema(body))}</script>`;
}

/* ---------- language auto-detect (root page only) ---------- */

const AUTO_LANG = `<script>(function(){try{
var BOT=/bot|crawl|spider|slurp|bingpreview|facebookexternalhit|embedly|quora|pinterest|whatsapp|telegram|preview/i;
if(BOT.test(navigator.userAgent))return;
var p=localStorage.getItem('vita-lang');
if(p==='en'){location.replace('/en/');return;}
if(p)return;
var l=(navigator.languages&&navigator.languages[0])||navigator.language||'es';
if(!/^es/i.test(l))location.replace('/en/');
}catch(e){}})();</script>`;

/* ---------- emit ---------- */

function build(lang) {
  const m = META[lang];
  let body = localize(src, lang);
  if (lang === 'en') {
    body = body.replace(/(src|href)="assets\//g, '$1="../assets/');
    body = body
      .replace('<a href="/" class="on" hreflang="es"', '<a href="/" hreflang="es"')
      .replace('<a href="/en/" hreflang="en"', '<a href="/en/" class="on" hreflang="en"');
  }
  body = body.replace(/\s+data-lang-(?:es|en)(?=[\s>])/g, '');
  if (lang === 'en') {
    const ATTRS = {
      'aria-label="Idioma"': 'aria-label="Language"',
      'aria-label="Principal"': 'aria-label="Main"',
      'aria-label="Menú"': 'aria-label="Menu"',
    };
    for (const [from, to] of Object.entries(ATTRS)) body = body.split(from).join(to);
  }

  const doc = `<!DOCTYPE html>
<html lang="${lang === 'es' ? 'es-CL' : 'en'}">
<head>
${head(lang, body)}
</head>
<body>
${lang === 'es' ? AUTO_LANG + '\n' : ''}${body.trim()}

<script src="${m.assets}/vita.js" defer></script>
</body>
</html>
`;

  const dir = path.join(ROOT, m.dir);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'index.html'), doc);
  console.log(`  ${path.relative(ROOT, path.join(dir, 'index.html'))}  ${(doc.length / 1024).toFixed(1)} KB`);
}

/* ---------- sitemap ---------- */

function sitemap() {
  const today = process.env.BUILD_DATE || new Date().toISOString().slice(0, 10);
  const urls = [
    { loc: ORIGIN + '/', priority: '1.0' },
    { loc: ORIGIN + '/en/', priority: '0.8' },
  ];
  const alt = `    <xhtml:link rel="alternate" hreflang="es" href="${ORIGIN}/"/>
    <xhtml:link rel="alternate" hreflang="en" href="${ORIGIN}/en/"/>
    <xhtml:link rel="alternate" hreflang="x-default" href="${ORIGIN}/"/>`;
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urls
  .map(
    (u) => `  <url>
    <loc>${u.loc}</loc>
${alt}
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>${u.priority}</priority>
  </url>`
  )
  .join('\n')}
</urlset>
`;
  fs.writeFileSync(path.join(ROOT, 'sitemap.xml'), xml);
  console.log('  sitemap.xml');
}

console.log('Building vita.lat …');
build('es');
build('en');
sitemap();
console.log('Done.');
