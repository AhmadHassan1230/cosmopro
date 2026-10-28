// Builds every page from data.js into static HTML. Run: node tools/build.mjs
import { cpSync, existsSync, mkdirSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const D = await import(join(ROOT, 'data.js') + `?t=${Date.now()}`);
const { site, nav, home, stats, audiences, services, capabilities, process, why, credentials, categories, about, enquire } = D;
const V = Date.now().toString(36); // cache-busting for css/js

// Original Cosmo Pro logo, rebuilt as SVG by tools/build-logo.py. Width/height come from each file's viewBox.
const svgBox = (f) => readFileSync(join(ROOT, f), 'utf8').match(/viewBox="0 0 ([\d.]+) ([\d.]+)"/).slice(1).map(Number);
const logoImg = (f, cls, alt, h) => { const [w, hh] = svgBox(f); return `<img class="${cls}" src="${ver(f)}" alt="${alt}" width="${Math.round((w / hh) * h)}" height="${h}" decoding="async">`; };

// ---------- helpers ----------
const esc = (s = '') => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const words = (s) => esc(s).split(' ').map((w) => `<span class="w"><span>${w}</span></span>`).join(' ');
const lines = (arr) => arr.map((l) => `<span class="ln">${words(l)}</span>`).join('');
const tel = (p) => 'tel:' + p.replace(/[^\d+]/g, '');
const wa = (text = '') => `https://wa.me/${site.whatsapp}${text ? '?text=' + encodeURIComponent(text) : ''}`;
const count = categories.reduce((n, c) => n + c.lines.reduce((m, l) => m + l.items.length, 0), 0);
const catCount = (c) => c.lines.reduce((m, l) => m + l.items.length, 0);
const catMin = (c) => c.lines.map((l) => parseInt(l.moq)).sort((a, b) => a - b)[0] + ' kg';
const svcBySlug = Object.fromEntries(services.map((s) => [s.slug, s]));

// Version each asset URL by its modified time, so replacing a file under the same name busts caches.
const ver = (src) => { try { return src + '?v=' + Math.round(statSync(join(ROOT, src)).mtimeMs).toString(36); } catch { return src; } };
const img = (src, alt = '', { cls = '', sizes = '', eager = false } = {}) =>
  `<img src="${ver(src)}" alt="${esc(alt)}"${cls ? ` class="${cls}"` : ''} ${eager ? 'fetchpriority="high"' : 'loading="lazy"'} decoding="async"${sizes ? ` sizes="${sizes}"` : ''}>`;

// Flow loops are only wired in once the file exists in assets/video (name.mp4, optional name-mobile.mp4).
const vid = (base, extra = '') => existsSync(join(ROOT, base + '.mp4'))
  ? `<video muted playsinline loop preload="none" aria-hidden="true" data-video="${base}" data-v="${ver(base + '.mp4').split('?v=')[1]}"${existsSync(join(ROOT, base + '-mobile.mp4')) ? ' data-m' : ''}${extra}></video>`
  : '';

// A media frame: poster image, with an optional Flow loop layered on top once it can play.
const media = ({ poster, alt = '', video = '', ratio = '', cls = '', eager = false, reveal = true }) => `
<figure class="media${ratio ? ' r-' + ratio : ''}${cls ? ' ' + cls : ''}"${reveal ? ' data-media' : ''}>
  ${img(poster, alt, { eager })}
  ${video ? vid(video) : ''}
</figure>`;

const btn = (href, label, cls = '') => `<a class="btn${cls ? ' ' + cls : ''}" href="${href}"><span>${esc(label)}</span></a>`;
const link = (href, label, cls = '') => `<a class="link${cls ? ' ' + cls : ''}" href="${href}">${esc(label)}</a>`;

// ---------- chrome ----------
const logo = () => `<a class="logo" href="./" aria-label="Cosmo Pro (Pvt) Ltd, home">${logoImg('assets/brand/logo-h.svg', 'logo-c', '', 40)}${logoImg('assets/brand/logo-h-white.svg', 'logo-w', '', 40)}</a>`;

const header = (path) => `
<a class="skip" href="#main">Skip to content</a>
<header class="hd" data-hd>
  <div class="hd-in">
    ${logo()}
    <nav class="hd-nav" aria-label="Main">
      ${nav.map((n) => `<a href="${n.href}"${path === n.href || (n.href === 'range.html' && categories.some((c) => c.slug + '.html' === path)) ? ' aria-current="page"' : ''}>${n.label}</a>`).join('')}
    </nav>
    <div class="hd-end">
      ${btn('enquire.html', 'Start a project', 'btn-sm')}
      <button class="hd-menu" type="button" aria-expanded="false" aria-controls="menu" data-menu-btn><span class="hd-menu-l">Menu</span><span class="hd-menu-i" aria-hidden="true"><i></i><i></i></span></button>
    </div>
  </div>
</header>
<div class="menu" id="menu" data-menu aria-hidden="true">
  <nav class="menu-nav" aria-label="Mobile">
    <a href="./">Home</a>
    ${nav.map((n) => `<a href="${n.href}">${n.label}</a>`).join('')}
    <a href="enquire.html">Start a project</a>
  </nav>
  <div class="menu-foot">
    <a href="${tel(site.phones[0])}">${site.phones[0]}</a>
    <a href="mailto:${site.emails[0]}">${site.emails[0]}</a>
  </div>
</div>`;

const cta = () => `
<section class="cta band-ink" aria-labelledby="cta-t">
  <div class="wrap cta-in">
    <h2 class="d1 cta-t" id="cta-t" data-split>${words('Have a product in mind?')}</h2>
    <div class="cta-side" data-reveal>
      <p class="lead">Tell us what you want to create. Our team will guide it from concept to finished product.</p>
      <div class="btns">${btn('enquire.html', 'Start a project', 'btn-light')}${link(wa('Hello Cosmopro, I would like to discuss a product.'), 'WhatsApp us', 'link-light')}</div>
    </div>
  </div>
</section>`;

const footer = () => `
<footer class="ft band-ink">
  <div class="wrap">
    <div class="ft-grid">
      <div class="ft-brand">
        <a class="ft-logo" href="./" aria-label="Cosmo Pro (Pvt) Ltd, home">${logoImg('assets/brand/logo-v-white.svg', '', '', 132)}</a>
        <p>Toll manufacturer of cosmetics and toiletries. Private label, contract and toll manufacturing from Islamabad.</p>
      </div>
      <nav class="ft-col" aria-label="Company">
        <p class="ft-h">Company</p>
        <a href="about.html">About</a><a href="services.html">Services</a><a href="range.html">Range</a><a href="enquire.html">Start a project</a><a href="contact.html">Contact</a>
      </nav>
      <nav class="ft-col" aria-label="Range">
        <p class="ft-h">Range</p>
        ${categories.map((c) => `<a href="${c.slug}.html">${esc(c.name)}</a>`).join('')}
      </nav>
      <div class="ft-col">
        <p class="ft-h">Contact</p>
        ${site.phones.map((p) => `<a href="${tel(p)}">${p}</a>`).join('')}
        <a href="${tel(site.landline)}">${site.landline}</a>
        <a href="mailto:${site.emails[0]}">${site.emails[0]}</a>
        <a href="${site.mapUrl}" target="_blank" rel="noopener">${site.address.join(', ')}</a>
      </div>
    </div>
    <div class="ft-bottom">
      <span>© <span data-year>2026</span> ${esc(site.legal)}</span>
      <span>ISO 9001:2015 certified</span>
      ${site.socials.length ? `<span class="ft-social">${site.socials.map((s) => `<a href="${s.url}" target="_blank" rel="noopener">${esc(s.label)}</a>`).join('')}</span>` : ''}
    </div>
  </div>
</footer>`;

const jsonld = () => JSON.stringify({
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: site.legal,
  alternateName: 'Cosmo Pro',
  url: site.url,
  logo: site.url + '/assets/brand/cosmopro-logo-original.png',
  email: site.emails[0],
  telephone: site.phones[0],
  address: { '@type': 'PostalAddress', streetAddress: 'Plot 145, Street 9, Sector I-10/3', addressLocality: 'Islamabad', addressCountry: 'PK' },
  description: 'Cosmetics and personal care manufacturer in Islamabad offering private label, contract and toll manufacturing.',
});

const layout = ({ path, title, description, body, cls = '', three = false, cta: withCta = true, ogImage = 'assets/img/poster-hero.jpg' }) => {
  const url = site.url + '/' + (path === 'index.html' ? '' : path);
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
<link rel="canonical" href="${url}">
<meta property="og:type" content="website">
<meta property="og:site_name" content="Cosmopro">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(description)}">
<meta property="og:url" content="${url}">
<meta property="og:image" content="${site.url}/${ogImage}">
<meta name="twitter:card" content="summary_large_image">
<meta name="theme-color" content="#EFE8F6">
<link rel="icon" href="assets/brand/favicon.svg" type="image/svg+xml">
<link rel="icon" href="favicon.ico" sizes="any">
<link rel="apple-touch-icon" href="assets/brand/apple-touch-icon.png">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Geist+Mono:wght@400;500&family=Host+Grotesk:wght@400;500&display=swap">
<link rel="stylesheet" href="styles.css?v=${V}">
<script>document.documentElement.classList.add('js')</script>
${three ? `<script type="importmap">{"imports":{"three":"./assets/vendor/three.module.min.js"}}</script>` : ''}
<script type="application/ld+json">${jsonld()}</script>
</head>
<body class="${cls}">
${header(path)}
<main id="main">
${body}
${withCta ? cta() : ''}
</main>
${footer()}
<div class="lb" data-lb aria-hidden="true"><button class="lb-x" type="button" data-lb-close aria-label="Close">Close</button><img alt=""></div>
<script type="application/json" id="cfg">${JSON.stringify({ endpoint: site.formEndpoint, email: site.emails[0], whatsapp: site.whatsapp })}</script>
<script src="assets/vendor/gsap.min.js?v=3125" defer></script>
<script src="assets/vendor/ScrollTrigger.min.js?v=3125" defer></script>
<script src="assets/vendor/lenis.min.js?v=1" defer></script>
<script src="main.js?v=${V}" type="module"></script>
</body>
</html>
`;
};

// ---------- shared sections ----------
const pageHead = ({ crumb, title, lead, aside = '' }) => `
<section class="ph wrap">
  ${crumb ? `<nav class="crumb" aria-label="Breadcrumb"><a href="./">Home</a>${crumb.map((c) => c.href ? `<span>/</span><a href="${c.href}">${esc(c.label)}</a>` : `<span>/</span><span aria-current="page">${esc(c.label)}</span>`).join('')}</nav>` : ''}
  <h1 class="d1 ph-t" data-split>${words(title)}</h1>
  <div class="ph-side" data-reveal>
    ${lead ? `<p class="lead">${esc(lead)}</p>` : ''}
    ${aside}
  </div>
</section>`;

const statsBlock = () => `
<dl class="stats">
  ${stats.map((s) => `<div class="stat" data-reveal><dt>${esc(s.label)}</dt><dd>${esc(s.value.replace('{count}', count))}</dd></div>`).join('')}
</dl>`;

const credList = () => `
<ul class="creds">
  ${credentials.map((c) => `<li data-reveal><button class="cred" type="button" data-lb-open="${ver(c.img)}" aria-label="View ${esc(c.name)} certificate">
    <span class="cred-doc">${img(c.img, '')}</span>
    <span class="cred-txt"><span class="cred-n">${esc(c.name)}</span><span class="cred-b">${esc(c.body)}</span></span>
  </button></li>`).join('')}
</ul>`;

// ---------- home ----------
const homeBody = () => `
<section class="hero" data-hero>
  <div class="hero-frame" data-hero-frame>
    <div class="hero-media" data-hero-media>
      <picture>
        <source media="(max-width: 759px)" srcset="${ver('assets/img/poster-hero-mobile.jpg')}">
        ${img('assets/img/poster-hero.jpg', 'Frosted serum bottles on a stone plinth in soft lilac light', { eager: true })}
      </picture>
      ${vid('assets/video/hero')}
    </div>
    <div class="hero-shade" aria-hidden="true"></div>
    <div class="hero-in">
      <p class="hero-k" data-hero-side>${esc(home.hero.kicker)}</p>
      <h1 class="hero-t" data-hero-title>${lines(home.hero.title)}</h1>
      <p class="hero-lead" data-hero-side>${esc(home.hero.lead)}</p>
      <div class="btns" data-hero-side>${btn('enquire.html', 'Start a project', 'btn-light')}${link('services.html', 'Explore services', 'link-light')}</div>
    </div>
    <div class="hero-foot" data-hero-side>
      <span>ISO 9001:2015 certified</span>
      <span class="hero-scroll" aria-hidden="true"><i></i></span>
      <span>Islamabad, Pakistan</span>
    </div>
  </div>
</section>

<section class="sec stmt wrap" aria-labelledby="stmt-t">
  <h2 class="d2 stmt-t" id="stmt-t" data-split>${words(home.statement.title)}</h2>
  <div class="stmt-side" data-reveal>
    <p class="lead">${esc(home.statement.body)}</p>
    ${link('about.html', 'About Cosmopro')}
  </div>
  ${statsBlock()}
</section>

<section class="sec aud band-paper" aria-labelledby="aud-t">
  <div class="wrap">
    <h2 class="d2 aud-t" id="aud-t" data-split>${words(home.audiences.title)}</h2>
    <div class="aud-grid">
      ${audiences.map((a, i) => `<article class="aud-i" data-reveal style="--d:${i * 0.08}s">
        ${media({ poster: a.img, alt: a.tag, ratio: '4x3' })}
        <p class="tag">${esc(a.tag)}</p>
        <h3 class="d3">${esc(a.q)}</h3>
        <p>${esc(a.body)}</p>
        ${link('services.html#' + a.service, svcBySlug[a.service].name)}
      </article>`).join('')}
    </div>
  </div>
</section>

<section class="sec svc band-ink" aria-labelledby="svc-t">
  <div class="wrap">
    <div class="svc-head">
      <h2 class="d2" id="svc-t" data-split>${words(home.services.title)}</h2>
      <p class="lead" data-reveal>${esc(home.services.lead)}</p>
    </div>
    <div class="svc-rows">
      ${services.map((s) => `<a class="svc-row" href="services.html#${s.slug}" data-reveal>
        <span class="svc-n d3">${esc(s.name)}</span>
        <span class="svc-c"><span class="k">You bring</span><span>${esc(s.you)}</span></span>
        <span class="svc-c"><span class="k">We handle</span><span>${esc(s.we)}</span></span>
        <span class="svc-c"><span class="k">Ideal for</span><span>${esc(s.ideal)}</span></span>
        <svg class="svc-go" viewBox="0 0 28 28" aria-hidden="true"><path d="M5 14h17M15.5 7.5 22 14l-6.5 6.5" fill="none" stroke="currentColor" stroke-width="1.5"/></svg>
      </a>`).join('')}
    </div>
  </div>
</section>

<section class="sec rng wrap" aria-labelledby="rng-t" data-rng>
  <div class="rng-head">
    <h2 class="d2" id="rng-t" data-split>${words(home.range.title)}</h2>
    <p class="lead" data-reveal>${esc(home.range.lead)}</p>
  </div>
  <div class="rng-body">
    <ul class="rng-list">
      ${categories.map((c, i) => `<li data-reveal><a href="${c.slug}.html" data-rng-i="${i}"${i === 0 ? ' class="is-on"' : ''}>
        <span class="rng-n">${esc(c.name)}</span>
        <span class="rng-m">${catCount(c)} formulations · from ${catMin(c)}</span>
        <span class="rng-l">${esc(c.lines.map((l) => l.name).join(', '))}</span>
        <span class="rng-mob">${media({ poster: c.poster, alt: c.name, ratio: '4x5', reveal: false })}</span>
      </a></li>`).join('')}
    </ul>
    <div class="rng-stage" aria-hidden="true">
      ${categories.map((c, i) => `<div class="rng-f${i === 0 ? ' is-on' : ''}" data-rng-f="${i}">${media({ poster: c.poster, video: c.video, reveal: false })}</div>`).join('')}
    </div>
  </div>
  <div class="rng-all" data-reveal>${btn('range.html', 'View the full range')}</div>
</section>

<section class="proc band-stone" id="process" aria-labelledby="proc-t" data-proc>
  <div class="proc-pin" data-proc-pin>
    <div class="proc-copy">
      <h2 class="d2" id="proc-t">${esc(home.process.title)}</h2>
      <p class="proc-lead">${esc(home.process.lead)}</p>
      <ol class="proc-steps">
        ${process.map((p, i) => `<li class="proc-s${i === 0 ? ' is-on' : ''}" data-proc-s="${i}">
          <span class="proc-k">${String(i + 1).padStart(2, '0')}</span>
          <span class="proc-b"><span class="proc-h">${esc(p.long)}</span><span class="proc-p"><span>${esc(p.body)}</span></span></span>
        </li>`).join('')}
      </ol>
      <div class="proc-bar" aria-hidden="true"><span data-proc-bar></span></div>
    </div>
    <div class="proc-view" data-proc-view>
      <canvas data-proc-canvas aria-label="A serum bottle moves through formulation, manufacturing, filling, labelling and packaging" role="img"></canvas>
      <div class="proc-fallback">${img('assets/img/factory-filling.jpg', 'Filling line on the Cosmopro production floor')}</div>
      <p class="proc-count" aria-hidden="true"><span data-proc-num>01</span> / 06</p>
    </div>
  </div>
</section>

<section class="sec qual wrap" aria-labelledby="qual-t">
  ${media({ poster: 'assets/img/factory-filling.jpg', alt: 'Stainless steel filling heads on the production line', ratio: '4x5', cls: 'qual-m' })}
  <div class="qual-c">
    <h2 class="d2" id="qual-t" data-split>${words(home.quality.title)}</h2>
    <div data-reveal>${home.quality.body.map((p) => `<p>${esc(p)}</p>`).join('')}</div>
    ${credList()}
  </div>
</section>`;

// ---------- about ----------
const aboutBody = () => `
${pageHead({ crumb: [{ label: 'About' }], title: about.title, lead: about.lead })}
<div class="wrap">${media({ poster: 'assets/img/factory-line.jpg', alt: 'Conveyor line in the Cosmopro production hall', ratio: 'wide', eager: true })}</div>

<section class="sec ab wrap">
  <div class="ab-l">
    <p class="tag">What we do</p>
    <ul class="biglist">
      ${['Formulation and product development', 'Manufacturing', 'Filling', 'Labelling', 'Packaging', 'Private label solutions', 'Contract manufacturing', 'Toll manufacturing'].map((x) => `<li data-reveal>${esc(x)}</li>`).join('')}
    </ul>
  </div>
  <div class="ab-r" data-reveal>
    ${about.body.map((p) => `<p class="lead">${esc(p)}</p>`).join('')}
    <p class="d3 ab-goal">${esc(about.goal)}</p>
  </div>
</section>

<section class="sec band-paper">
  <div class="wrap">
    <h2 class="d2 why-t" data-split>${words('Why brands choose Cosmopro.')}</h2>
    <dl class="why">
      ${why.map((w) => `<div class="why-r" data-reveal><dt class="d3">${esc(w.title)}</dt><dd>${esc(w.body)}</dd></div>`).join('')}
    </dl>
    ${statsBlock()}
  </div>
</section>

<section class="sec wrap cert-sec" aria-labelledby="cert-t">
  <div class="cert-head">
    <h2 class="d2" id="cert-t" data-split>${words('Certified, licensed and audited.')}</h2>
    <p class="lead" data-reveal>Select a certificate to view it in full.</p>
  </div>
  ${credList()}
</section>

<section class="sec band-stone visit">
  <div class="wrap visit-in">
    <div>
      <h2 class="d2" data-split>${words('Visit the factory.')}</h2>
      <p class="lead" data-reveal>${site.address.map(esc).join('<br>')}</p>
      <div class="btns" data-reveal>${link(site.mapUrl, 'Open in Google Maps')}${link('contact.html', 'Contact the team')}</div>
    </div>
    ${media({ poster: 'assets/img/factory-machinery.jpg', alt: 'Production machinery at Cosmopro', ratio: '3x2' })}
  </div>
</section>`;

// ---------- services ----------
const servicesBody = () => `
${pageHead({ crumb: [{ label: 'Services' }], title: 'One factory, three ways in.', lead: 'Every brand needs something different. Choose a ready formula, a product built to your brief, or production of your own formulation.' })}

<nav class="jump wrap" aria-label="Services" data-reveal>
  ${services.map((s) => `<a href="#${s.slug}">${esc(s.name)}</a>`).join('')}
</nav>

${services.map((s, i) => `
<section class="sec sv wrap${i % 2 ? ' sv-flip' : ''}" id="${s.slug}" aria-labelledby="sv-${s.slug}">
  ${media({ poster: s.img, alt: s.name, ratio: '4x5', cls: 'sv-m' })}
  <div class="sv-c">
    <p class="tag" data-reveal>${esc(s.tagline)}</p>
    <h2 class="d2" id="sv-${s.slug}" data-split>${words(s.name)}</h2>
    <div data-reveal>${s.body.map((p) => `<p>${esc(p)}</p>`).join('')}</div>
    <dl class="spec" data-reveal>
      <div><dt>You bring</dt><dd>${esc(s.you)}</dd></div>
      <div><dt>We handle</dt><dd>${esc(s.we)}</dd></div>
      <div><dt>Ideal for</dt><dd>${esc(s.ideal)}</dd></div>
    </dl>
    <div class="btns" data-reveal>${btn('enquire.html?service=' + s.slug, 'Enquire about ' + s.name.toLowerCase())}</div>
  </div>
</section>`).join('')}

<section class="sec band-ink caps">
  <div class="wrap caps-in">
    <h2 class="d2" data-split>${words('Everything under one roof.')}</h2>
    <ul class="biglist biglist-light">
      ${capabilities.map((c) => `<li data-reveal>${esc(c)}</li>`).join('')}
    </ul>
  </div>
</section>

<section class="sec wrap steps-sec" aria-labelledby="steps-t">
  <div class="cert-head">
    <h2 class="d2" id="steps-t" data-split>${words('Our process.')}</h2>
    <p class="lead" data-reveal>Six stages, one team, from the first formula to finished stock.</p>
  </div>
  <ol class="steps">
    ${process.map((p, i) => `<li data-reveal style="--d:${(i % 3) * 0.08}s"><span class="proc-k">${String(i + 1).padStart(2, '0')}</span><h3 class="d3">${esc(p.long)}</h3><p>${esc(p.body)}</p></li>`).join('')}
  </ol>
</section>`;

// ---------- range ----------
const rangeBody = () => `
${pageHead({ crumb: [{ label: 'Range' }], title: 'The formulation library.', lead: `${count} formulations across skincare, haircare, hair colour, toiletries and homecare. Each can be adjusted to your brief and made under your brand.` })}

<div class="cats wrap">
  ${categories.map((c, i) => `
  <section class="cat${i % 2 ? ' cat-flip' : ''}" aria-labelledby="cat-${c.slug}">
    <a class="cat-m" href="${c.slug}.html" tabindex="-1" aria-hidden="true">${media({ poster: c.poster, video: c.video, ratio: '4x5', alt: '' })}</a>
    <div class="cat-c">
      <p class="tag" data-reveal>${catCount(c)} formulations · from ${catMin(c)}</p>
      <h2 class="d2" id="cat-${c.slug}" data-split>${words(c.name)}</h2>
      <p class="lead" data-reveal>${esc(c.blurb)}</p>
      <ul class="lines" data-reveal>
        ${c.lines.map((l) => `<li><span>${esc(l.name)}</span><span class="moq">MOQ ${esc(l.moq)}</span></li>`).join('')}
      </ul>
      <div class="btns" data-reveal>${btn(c.slug + '.html', 'View ' + c.name.toLowerCase())}</div>
    </div>
  </section>`).join('')}
</div>`;

// ---------- category ----------
const categoryBody = (c) => {
  const others = categories.filter((o) => o.slug !== c.slug);
  return `
${pageHead({ crumb: [{ label: 'Range', href: 'range.html' }, { label: c.name }], title: c.name, lead: c.blurb, aside: `<p class="ph-meta">${catCount(c)} formulations · minimum orders from ${catMin(c)}</p>` })}
<div class="wrap">${media({ poster: c.poster, video: c.video, alt: c.name, ratio: 'wide', eager: true })}</div>

<div class="wrap lns">
  ${c.lines.map((l) => `
  <section class="ln-s" aria-labelledby="ln-${c.slug}-${l.name.replace(/\W+/g, '-').toLowerCase()}">
    <div class="ln-h">
      <h2 class="d2" id="ln-${c.slug}-${l.name.replace(/\W+/g, '-').toLowerCase()}" data-split>${words(l.name)}</h2>
      <p class="moq-l" data-reveal>Minimum order <strong>${esc(l.moq)}</strong> per formulation</p>
      <div data-reveal>${link('enquire.html?product=' + encodeURIComponent(l.name), 'Enquire about ' + l.name.toLowerCase())}</div>
    </div>
    <ol class="items">
      ${l.items.map((it) => `<li data-reveal><span>${esc(it)}</span></li>`).join('')}
    </ol>
    ${media({ poster: l.img, alt: l.name, ratio: '4x5', cls: 'ln-m' })}
  </section>`).join('')}
</div>

<section class="sec band-paper more">
  <div class="wrap">
    <p class="tag">More from the range</p>
    <ul class="more-l">
      ${others.map((o) => `<li data-reveal><a href="${o.slug}.html">${media({ poster: o.poster, alt: '', ratio: '4x3', reveal: false })}<span class="d3">${esc(o.name)}</span><span class="rng-m">${catCount(o)} formulations · from ${catMin(o)}</span></a></li>`).join('')}
    </ul>
  </div>
</section>`;
};

// ---------- forms ----------
const field = ({ name, label, type = 'text', req = true, ph = '', auto = '', full = false, opts = null, hint = '' }) => {
  const id = 'f-' + name;
  const attrs = `id="${id}" name="${name}"${req ? ' required' : ''}${auto ? ` autocomplete="${auto}"` : ''}`;
  let control;
  if (opts) control = `<select ${attrs}><option value="">Select</option>${opts.map((o) => `<option>${esc(o)}</option>`).join('')}</select>`;
  else if (type === 'textarea') control = `<textarea ${attrs} rows="5"${ph ? ` placeholder="${esc(ph)}"` : ''}></textarea>`;
  else control = `<input type="${type}" ${attrs}${ph ? ` placeholder="${esc(ph)}"` : ''}>`;
  return `<div class="f${full ? ' f-full' : ''}"><label for="${id}">${esc(label)}${req ? '' : ' <span class="opt">(optional)</span>'}</label>${control}${hint ? `<p class="f-hint">${esc(hint)}</p>` : ''}<p class="f-err" aria-live="polite"></p></div>`;
};
const checks = (name, legend, opts, req = false) => `
<fieldset class="f f-full checks"${req ? ' data-req-group' : ''}>
  <legend>${esc(legend)}</legend>
  <div class="checks-g">${opts.map((o, i) => `<label class="chk"><input type="checkbox" name="${name}" value="${esc(o)}"><span>${esc(o)}</span></label>`).join('')}</div>
  <p class="f-err" aria-live="polite"></p>
</fieldset>`;
const radios = (name, legend, opts) => `
<fieldset class="f f-full checks">
  <legend>${esc(legend)}</legend>
  <div class="checks-g">${opts.map((o, i) => `<label class="chk chk-r"><input type="radio" name="${name}" value="${esc(o)}"${i === 0 ? ' required' : ''}><span>${esc(o)}</span></label>`).join('')}</div>
  <p class="f-err" aria-live="polite"></p>
</fieldset>`;

const formDone = `<div class="form-done" data-form-done hidden tabindex="-1"><h2 class="d3">Thank you.</h2><p data-form-done-msg></p></div>`;

const enquireBody = () => `
${pageHead({ crumb: [{ label: 'Start a project' }], title: enquire.title, lead: enquire.lead, aside: `<div class="direct"><a href="${wa('Hello Cosmopro, I would like to discuss a product.')}">WhatsApp ${site.phones[0]}</a><a href="mailto:${site.emails[0]}">${site.emails[0]}</a></div>` })}
<section class="sec-s wrap">
  <form class="form" data-form="enquiry" novalidate>
    <div class="fs" data-reveal>
      <div class="fs-h"><span class="proc-k">01</span><h2 class="d3">About you</h2></div>
      <div class="fs-g">
        ${field({ name: 'first_name', label: 'First name', auto: 'given-name' })}
        ${field({ name: 'last_name', label: 'Last name', auto: 'family-name' })}
        ${field({ name: 'company', label: 'Company', auto: 'organization' })}
        ${field({ name: 'role', label: 'Your role', ph: 'Founder, Brand manager', auto: 'organization-title' })}
        ${field({ name: 'phone', label: 'Phone or WhatsApp', type: 'tel', auto: 'tel', ph: '+92 300 0000000' })}
        ${field({ name: 'email', label: 'Email', type: 'email', auto: 'email', ph: 'name@company.com' })}
        ${field({ name: 'country', label: 'Country', auto: 'country-name', ph: 'Pakistan' })}
        ${field({ name: 'brand', label: 'Brand name', req: false, ph: 'If you have one' })}
      </div>
    </div>
    <div class="fs" data-reveal>
      <div class="fs-h"><span class="proc-k">02</span><h2 class="d3">Your project</h2></div>
      <div class="fs-g">
        ${radios('status', 'Where is your business today?', ['Startup, pre-launch', 'Existing brand owner', 'Retailer or distributor'])}
        ${field({ name: 'service', label: 'Way of working', opts: services.map((s) => s.name).concat(['Not sure yet']) })}
        ${radios('formulation', 'Formulation', ['To be developed by Cosmopro', 'I have a finalised formulation'])}
        ${checks('services', 'What do you need from us?', ['Product development (formulation or optimisation)', 'Bulk production', 'Filling', 'Printing of packaging material', 'Packaging', 'Packaging material purchased on my behalf'], true)}
      </div>
    </div>
    <div class="fs" data-reveal>
      <div class="fs-h"><span class="proc-k">03</span><h2 class="d3">Products and quantities</h2></div>
      <div class="fs-g">
        ${field({ name: 'category', label: 'Category', opts: categories.map((c) => c.name).concat(['More than one']) })}
        ${field({ name: 'product', label: 'Products', ph: 'Vitamin C serum, SPF 50 sunscreen' })}
        ${field({ name: 'skus', label: 'Number of SKUs', type: 'number', ph: '3' })}
        ${field({ name: 'pack_sizes', label: 'Pack sizes', ph: '30 ml, 50 ml' })}
        ${field({ name: 'initial_qty', label: 'Initial order per SKU', ph: '100 kg or 2,000 units' })}
        ${field({ name: 'ongoing', label: 'Expected ongoing volume', ph: 'Monthly or quarterly', req: false })}
        ${field({ name: 'budget', label: 'Budget or budget range', ph: 'PKR' })}
        ${field({ name: 'launch', label: 'Target launch date', type: 'month', req: false })}
        ${radios('packaging', 'Packaging material', ['To be purchased by Cosmopro (cost plus service charge)', 'Supplied by me'])}
        ${field({ name: 'message', label: 'Anything else we should know', type: 'textarea', req: false, full: true, ph: 'References, ingredients you want or want to avoid, timelines.' })}
      </div>
    </div>
    <div class="form-end" data-reveal>
      <label class="chk chk-s"><input type="checkbox" name="marketing" value="yes"><span>Send me occasional updates on new formulations and services.</span></label>
      <p class="f-note">Minimum order quantities apply per formulation. Payment terms are agreed with you in the quotation.</p>
      <div class="btns"><button class="btn" type="submit"><span>Send enquiry</span></button><button class="link" type="button" data-form-wa>Send on WhatsApp instead</button></div>
      <p class="f-err f-err-form" aria-live="polite"></p>
    </div>
    ${formDone}
  </form>
</section>`;

const contactBody = () => `
${pageHead({ crumb: [{ label: 'Contact' }], title: 'Talk to our team.', lead: 'Questions, pre-sales support or an existing order. Call, write or send a message and the right person will reply.' })}
<section class="sec-s wrap ct">
  <div class="ct-info">
    <div class="ct-b" data-reveal><p class="tag">Phone</p>${site.phones.map((p) => `<a class="d3" href="${tel(p)}">${p}</a>`).join('')}<a class="d3" href="${tel(site.landline)}">${site.landline}</a></div>
    <div class="ct-b" data-reveal><p class="tag">Email</p>${site.emails.map((e) => `<a class="d3" href="mailto:${e}">${e}</a>`).join('')}</div>
    <div class="ct-b" data-reveal><p class="tag">Factory and office</p><p class="d3">${site.address.map(esc).join('<br>')}</p>${link(site.mapUrl, 'Open in Google Maps')}</div>
    <div class="ct-b" data-reveal><p class="tag">Hours</p><p class="d3">${esc(site.hours)}</p><p class="f-note">Messages and email are welcome any time.</p></div>
  </div>
  <form class="form form-s" data-form="contact" novalidate data-reveal>
    <div class="fs-g">
      ${field({ name: 'name', label: 'Name', auto: 'name' })}
      ${field({ name: 'email', label: 'Email', type: 'email', auto: 'email', ph: 'name@company.com' })}
      ${field({ name: 'phone', label: 'Phone', type: 'tel', auto: 'tel', req: false })}
      ${field({ name: 'subject', label: 'Subject', opts: ['Product enquiry', 'Existing order', 'Delivery', 'Payments', 'Something else'] })}
      ${field({ name: 'message', label: 'Message', type: 'textarea', full: true })}
    </div>
    <div class="btns"><button class="btn" type="submit"><span>Send message</span></button></div>
    <p class="f-err f-err-form" aria-live="polite"></p>
    ${formDone}
  </form>
</section>`;

const notFoundBody = () => `
${pageHead({ title: 'This page is not on the shelf.', lead: 'The link may be old or mistyped.', aside: `<div class="btns">${btn('./', 'Back to home')}${link('range.html', 'Browse the range')}</div>` })}`;

// ---------- write ----------
const pages = [
  { path: 'index.html', cls: 'p-home', three: true, title: 'Cosmopro | Private label and contract cosmetics manufacturer, Islamabad', description: `Cosmopro formulates, manufactures, fills and packs skincare, haircare and personal care for brands. ISO 9001:2015 certified, ${count} ready formulations, orders from 25 kg.`, body: homeBody() },
  { path: 'about.html', title: 'About | Cosmopro', description: 'Cosmopro (Pvt) Ltd is an ISO 9001:2015 certified cosmetics and personal care manufacturer in Islamabad with more than twenty years of experience.', body: aboutBody() },
  { path: 'services.html', title: 'Private label, contract and toll manufacturing | Cosmopro', description: 'Three ways to manufacture with Cosmopro: private label from ready formulations, contract manufacturing to your brief, or toll manufacturing of your own formula.', body: servicesBody() },
  { path: 'range.html', title: 'Product range | Cosmopro', description: `${count} ready formulations across skincare, haircare, hair colour, toiletries and homecare, with minimum orders from 25 kg.`, body: rangeBody() },
  ...categories.map((c) => ({ path: c.slug + '.html', title: `${c.name} manufacturing | Cosmopro`, description: `${c.blurb} ${catCount(c)} formulations, minimum orders from ${catMin(c)}.`, body: categoryBody(c), ogImage: c.poster })),
  { path: 'enquire.html', cta: false, title: 'Start a project | Cosmopro', description: 'Tell Cosmopro about the product you want to make: services, quantities, pack sizes and timeline.', body: enquireBody() },
  { path: 'contact.html', cta: false, title: 'Contact | Cosmopro', description: `Call ${site.phones[0]}, email ${site.emails[0]} or visit us at ${site.address.join(', ')}.`, body: contactBody() },
  { path: '404.html', cta: false, title: 'Page not found | Cosmopro', description: 'Page not found.', body: notFoundBody() },
];

for (const p of pages) writeFileSync(join(ROOT, p.path), layout(p));

const today = new Date().toISOString().slice(0, 10);
writeFileSync(join(ROOT, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pages.filter((p) => p.path !== '404.html').map((p) => `  <url><loc>${site.url}/${p.path === 'index.html' ? '' : p.path}</loc><lastmod>${today}</lastmod></url>`).join('\n')}
</urlset>
`);
writeFileSync(join(ROOT, 'robots.txt'), `User-agent: *\nAllow: /\nSitemap: ${site.url}/sitemap.xml\n`);
// dist/ holds only what the site serves (deployed by Vercel, see vercel.json).
const DIST = join(ROOT, 'dist');
rmSync(DIST, { recursive: true, force: true });
mkdirSync(DIST);
for (const f of [...pages.map((p) => p.path), 'styles.css', 'main.js', 'process3d.js', 'favicon.ico', 'robots.txt', 'sitemap.xml']) cpSync(join(ROOT, f), join(DIST, f));
cpSync(join(ROOT, 'assets'), join(DIST, 'assets'), { recursive: true, filter: (src) => !src.endsWith('.DS_Store') });

console.log(`Built ${pages.length} pages · ${count} formulations → dist/`);
