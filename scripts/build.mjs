import { copyFileSync, cpSync, existsSync, mkdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { readDatabase, unserialize } from './database.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const output = path.join(root, 'dist');
const database = readDatabase(path.join(root, 'smotradb.sql'));
const options = Object.fromEntries(database.wp_options.map(row => [row.option_name, row.option_value]));
const theme = unserialize(options.fusion_options);
const posts = new Map(database.wp_posts.map(post => [post.ID, post]));
const metadata = new Map();
for (const row of database.wp_postmeta) {
  if (!metadata.has(row.post_id)) metadata.set(row.post_id, {});
  metadata.get(row.post_id)[row.meta_key] = row.meta_value;
}
const meta = id => metadata.get(Number(id)) || {};
const pages = database.wp_posts.filter(post => post.post_status === 'publish' && ['page', 'post'].includes(post.post_type));
const home = Number(options.page_on_front);
const routes = Object.fromEntries(pages.map(page => [page.ID, page.ID === home ? '/' : `/${page.ID === 223 ? 'smotre' : page.post_name}/`]));
const aliases = { 2: 'o-nama', 71: 'studiji', 74: 'prehrambena-tehnologija' };
const media = new Set();
const missing = new Set();
const warnings = new Set();
const escaped = value => String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
const plain = html => html.replace(/<[^>]*>/g, '').trim();
const attributes = text => Object.fromEntries([...text.matchAll(/([\w-]+)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s]+))/g)].map(([, key, a, b, c]) => [key, a ?? b ?? c]));

function save(relative, content) {
  const filename = path.join(output, relative);
  mkdirSync(path.dirname(filename), { recursive: true });
  writeFileSync(filename, content);
}

function asset(relative) {
  const clean = decodeURIComponent(relative.split(/[?#]/)[0]).replace(/^\/+/, '');
  if (clean.split('/').includes('..')) throw new Error(`Invalid media path: ${relative}`);
  if (!existsSync(path.join(root, 'uploads', clean))) {
    missing.add(clean);
  } else {
    media.add(clean);
  }
  return `/wp-content/uploads/${clean.split('/').map(encodeURIComponent).join('/')}`;
}

function attachment(id, preferredSize) {
  const details = meta(id);
  if (!details._wp_attached_file) throw new Error(`Missing attachment ${id}`);
  const data = details._wp_attachment_metadata ? unserialize(details._wp_attachment_metadata) : {};
  const size = preferredSize && data.sizes?.[preferredSize];
  return asset(size ? `${path.posix.dirname(details._wp_attached_file)}/${size.file}` : details._wp_attached_file);
}

function localize(html) {
  return html
    .replace(/(?:https?:)?\/\/(?:www\.)?smotra\.pbf\.hr\/wp-content\/uploads\/([^\s"'<>]+)/gi, (_, relative) => asset(relative))
    .replace(/(?:https?:)?\/\/(?:www\.)?smotra\.pbf\.hr\/\?((?:page_id|p|attachment_id)=(\d+))(?:&amp;[^"'<>]*)?/gi, (url, query, id) => {
      if (routes[id]) return routes[id];
      if (query.startsWith('attachment_id=') && meta(id)._wp_attached_file) return attachment(id);
      warnings.add(`Unresolved internal link: ${url}`);
      return url;
    })
    .replace(/(?:https?:)?\/\/(?:www\.)?smotra\.pbf\.hr\/(?=["'#<\s]|$)/gi, '/');
}

function gallery(attrs) {
  const ids = (attrs.ids || '').split(',').filter(Boolean).map(Number);
  const columns = Math.min(6, Math.max(1, Number(attrs.columns) || 3));
  return `<figure class="wp-block-gallery columns-${columns} is-cropped"><ul class="blocks-gallery-grid">${
    ids.map(id => {
      const post = posts.get(id);
      const description = meta(id)._wp_attachment_image_alt || post?.post_excerpt || '';
      return `<li class="blocks-gallery-item"><figure><a href="${attachment(id)}" data-lightbox><img src="${attachment(id, 'medium_large')}" alt="${escaped(plain(description))}" loading="lazy" decoding="async"></a>${post?.post_excerpt ? `<figcaption>${escaped(plain(post.post_excerpt))}</figcaption>` : ''}</figure></li>`;
    }).join('')
  }</ul></figure>`;
}

function accordion(id) {
  const value = meta(id).sp_eap_upload_options;
  if (!value) throw new Error(`Missing accordion ${id}`);
  const settings = unserialize(value);
  return `<section class="accordion" aria-label="${escaped(posts.get(Number(id)).post_title)}">${
    Object.values(settings.accordion_content_source).map(item =>
      `<details name="accordion-${id}"><summary>${escaped(item.accordion_content_title)}</summary><div class="accordion-content">${content(item.accordion_content_description)}</div></details>`
    ).join('')
  }</section>`;
}

function smotra2026() {
  const activities = [
    {
      title: 'Kahoot kviz o fermentaciji',
      description: 'Koliko znaš o fermentaciji i hrani koju svakodnevno jedemo? Pridruži se kvizu koji igramo svakih sat vremena. Pobjednika svakog kruga čeka nagrada!'
    },
    {
      title: 'Otkrij svoj PBF smjer',
      description: 'Alisa je prošla kroz ogledalo. Pođi i ti! Odgovori na nekoliko kratkih pitanja i otkrij je li tvoja znatiželja trenutačno najbliža biotehnologiji, prehrambenoj tehnologiji ili nutricionizmu.',
      image: 'otkrij-svoj-pbf-smjer.png',
      alt: 'Početni zaslon kviza Otkrij svoj PBF smjer.'
    },
    {
      title: 'Pogodi miris',
      description: 'Pred tobom su numerirane Petrijeve zdjelice s različitim mirisima. Pomiriši ih, pokušaj pogoditi što se u njima krije i provjeri koliko si ih prepoznao.'
    },
    {
      title: 'Spoji niz',
      description: 'Koji mikroorganizam pomaže da od mlijeka nastane jogurt? A koji sudjeluje u zrenju camemberta? Složi magnetske kartice u niz koji povezuje sirovinu, mikroorganizam i gotov proizvod.',
      image: 'spoji-niz.jpeg',
      alt: 'Kartice za povezivanje sirovina, mikroorganizama i fermentiranih proizvoda.'
    },
    {
      title: 'Što se krije u bombonima?',
      description: 'Izvuci kuglicu sa zadatkom i među ponuđenim sastojcima pronađi one koji pripadaju tvojoj slastici. Možeš li pogoditi što žele bombonima daje njihovu teksturu, a marcipanu prepoznatljiv okus?',
      image: 'bomboni.png',
      alt: 'Različite vrste šarenih bombona.'
    },
    {
      title: 'Mikroinkapsulacija – kako zaštititi bakterije?',
      description: 'Pogledaj kako od kapljica nastaju male gelaste kapsule u koje možemo smjestiti probiotičke bakterije. Saznaj zašto ih želimo zaštititi i kako nam u tome pomaže alginat.',
      image: 'mikroinkapsulacija.png',
      alt: 'Obojene kapljice u laboratorijskoj čaši tijekom pokusa mikroinkapsulacije.'
    },
    {
      title: 'Kolika je tvoja porcija?',
      description: 'Poredaj fotografije četiriju porcija istog tradicionalnog jela, od najmanje do najveće. Odaberi onu koja je najsličnija porciji koju inače pojedeš, procijeni koliko grama ima i provjeri koliko si blizu.',
      image: 'porcija.png',
      alt: 'Četiri kartice s različitim veličinama porcije bureka.'
    },
    {
      title: 'Zaviri u svijet mikroorganizama',
      description: 'Kako izbliza izgledaju bakterije iz jogurta, pekarski kvasac i plijesan s kruha? Pogledaj njihove preparate pod mikroskopom i usporedi oblike i veličine koje golim okom ne možemo razaznati.',
      image: 'mikroorganizmi.jpeg',
      alt: 'Mikroorganizmi promatrani pod mikroskopom.'
    },
    {
      title: 'Pipette Art – slika kap po kap',
      description: 'Isprobaj mikropipetu, alat kojim u laboratoriju precizno prenosimo vrlo male količine tekućine. Kap po kap ispuni predložak bojama i napravi vlastitu malu sliku.',
      image: 'pipette-art.png',
      alt: 'Šareni uzorak napravljen kapljicama tekućine na laboratorijskoj podlozi.'
    },
    {
      title: 'DNA detektivi – koji je kvasac za pšenično pivo?',
      description: 'Dva uzorka kvasca i tragovi na gelu. Pogledaj kako se pod plavim svjetlom vide vrpce DNA i pokušaj otkriti koji se uzorak koristi za proizvodnju pšeničnog piva.',
      image: 'dna-detektivi.jpeg',
      alt: 'Laboratorijski uzorci osvijetljeni plavim svjetlom tijekom analize DNA.'
    }
  ];
  const exhibits = [
    {
      title: 'Fermentirani proizvodi',
      description: 'Od jogurta i kiselih krastavaca do vina i piva, upoznaj proizvode u čijem nastanku sudjeluju mikroorganizmi. Pogledaj i od čega se radi pivo te koju ulogu u njegovoj proizvodnji ima kvasac.'
    },
    {
      title: 'Bakterije mliječne kiseline i djelovanje antibiotika',
      description: 'Pogledaj kako izgledaju kolonije bakterija mliječne kiseline i kako se bakterijske kulture mogu čuvati u osušenom obliku. Na Petrijevoj zdjelici potraži prozirni krug oko diska s antibiotikom i saznaj što nam on govori o rastu bakterija.'
    },
    {
      title: 'Što fermentacija radi kavi i kakau?',
      description: 'Svježe kakaovo zrno još nema prepoznatljivu aromu čokolade. Otkrij što se događa sa zrnima kave i kakaa tijekom fermentacije i kako taj korak utječe na aromu koja se razvija prženjem.',
      image: 'fermentacija-kava-kakao.jpeg',
      alt: 'Kakaova zrna i sastojci koji se koriste u pripremi čokolade.'
    }
  ];
  const card = item => `<article class="smotra-card"><div><h4>${escaped(item.title)}</h4><p>${escaped(item.description)}</p></div>${item.image ? `<figure><img src="${asset(`2026/11/${item.image}`)}" alt="${escaped(item.alt)}" loading="lazy" decoding="async"></figure>` : ''}</article>`;

  return `<section class="smotra-2026" aria-labelledby="smotra-2026-title">
    <header class="smotra-intro">
      <img class="smotra-brand" src="${asset('2026/11/pbf-zemlji-cudesa.png')}" alt="PBF Zemlji Čudesa – istražuj, eksperimentiraj, stvaraj." loading="lazy" decoding="async">
      <div><h2 id="smotra-2026-title">31. Smotra Sveučilišta u Zagrebu</h2><p class="smotra-event-date">Od 12. do 14. studenoga 2026., svaki dan od 10 do 19 sati</p><p>Čekamo te na štandu Prehrambeno-biotehnološkog fakulteta u Kongresnoj dvorani Zagrebačkog velesajma.</p><p>Što povezuje kruh, jogurt i čokoladu? Zašto su neki bomboni gumeni, a drugi pjenasti? I što se sve može nacrtati mikropipetom? U našoj PBF Zemlji Čudesa možeš zaviriti pod mikroskop, okušati se u laboratorijskim vještinama i provjeriti koliko znaš o fermentaciji. Usput pitaj naše studente kako izgleda studij na PBF-u i što se uči na Biotehnologiji, Prehrambenoj tehnologiji i Nutricionizmu.</p></div>
    </header>
    <h3>Isprobaj na štandu</h3>
    <div class="smotra-card-grid">${activities.map(card).join('')}</div>
    <h3>Pogledaj što smo izložili</h3>
    <div class="smotra-card-grid">${exhibits.map(card).join('')}</div>
    <p class="smotra-closing">Vidimo se na štandu PBF-a!</p>
  </section>`;
}

function smotra2026Gallery() {
  const photos = [
    'IMG-20261111-WA0026.jpg',
    'IMG-20261111-WA0032.jpg',
    'IMG-20261111-WA0040.jpg',
    'IMG-20261113-WA0071.jpg',
    'IMG-20261113-WA0075.jpg',
    'IMG-20261113-WA0095.jpg',
    'IMG-20261113-WA0113.jpg',
    '20261114_151551.jpg',
    '20261114_170809.jpg',
    '20261114_173701.jpg',
    '20261114_181443.jpg',
    '20261114_182006.jpg',
    '20261114_182022.jpg'
  ];
  return `<section class="smotra-photo-gallery" aria-labelledby="smotra-2026-gallery-title">
    <h2 id="smotra-2026-gallery-title">Smotra 2026. u fotografijama</h2>
    <div class="wp-block-gallery columns-3 is-cropped"><ul class="blocks-gallery-grid">${
      photos.map((photo, index) => {
        const src = asset(`2026/12/${photo}`);
        const alt = `Fotografija ${index + 1} s 31. Smotre Sveučilišta u Zagrebu.`;
        return `<li class="blocks-gallery-item"><figure><a href="${src}" data-lightbox><img src="${src}" alt="${escaped(alt)}" loading="lazy" decoding="async"></a><figcaption>Fotografija ${index + 1}</figcaption></figure></li>`;
      }).join('')
    }</ul></div>
  </section>`;
}

function interactiveVideo(id) {
  const record = database.wp_h5p_contents.find(row => row.id === Number(id));
  if (!record) throw new Error(`Missing interactive content ${id}`);
  const params = JSON.parse(record.parameters);
  if (!params.interactiveVideo) throw new Error(`Unsupported referenced H5P content: ${id}`);
  const video = params.interactiveVideo;
  const file = video.video.files[0];
  if (file.mime !== 'video/YouTube') throw new Error(`Unsupported referenced video: ${id}`);
  const url = new URL(file.path);
  const videoId = url.hostname === 'youtu.be' ? url.pathname.slice(1) : url.searchParams.get('v');
  const interactions = video.assets.interactions.filter(item => item.action.library !== 'H5P.Nil 1.0');
  for (const item of interactions) {
    if (!/^H5P\.(Text|MultiChoice) /.test(item.action.library)) throw new Error(`Unsupported video interaction: ${item.action.library}`);
  }
  const data = { videoId, interactions, summary: video.summary?.task.params, title: record.title };
  save(`assets/video-${id}.json`, JSON.stringify(data));
  const questions = interactions.filter(item => item.action.library.startsWith('H5P.MultiChoice'));
  return `<section class="interactive-video" data-interactive-video="/assets/video-${id}.json" aria-label="${escaped(record.title)}">
    <h2>${escaped(record.title)}</h2><p>${escaped(video.video.startScreenOptions.shortStartDescription)}</p>
    <div class="interactive-stage"><iframe title="${escaped(record.title)}" src="https://www.youtube.com/embed/${escaped(videoId)}?enablejsapi=1&amp;rel=0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen loading="lazy"></iframe><div class="video-overlay" hidden></div></div>
    <p class="video-status" role="status">Video i automatsko zaustavljanje zahtijevaju vezu s YouTubeom. Pitanja su dostupna i u nastavku.</p>
    <details class="video-exercises"><summary>Pitanja uz video (${questions.length})</summary><div class="exercise-list">${
      questions.map((item, index) => `<section class="exercise" data-exercise="${index}"><p class="timestamp">${Math.floor(item.duration.from / 60)}:${String(Math.floor(item.duration.from % 60)).padStart(2, '0')}</p>${item.action.params.question}<div class="exercise-answers">${item.action.params.answers.map((answer, answerIndex) => `<label><input type="${item.action.params.answers.filter(a => a.correct).length > 1 ? 'checkbox' : 'radio'}" name="exercise-${id}-${index}" value="${answerIndex}"><span>${answer.text}</span></label>`).join('')}</div><button type="button" class="button check-answer">Provjeri odgovor</button><p class="exercise-feedback" role="status"></p></section>`).join('')
    }</div></details>
    ${data.summary ? `<details class="video-summary"><summary>Završno pitanje</summary><div class="summary-questions">${data.summary.intro}${data.summary.summaries.map((group, index) => `<fieldset data-summary="${index}"><legend>Pitanje ${index + 1}</legend>${group.summary.map((answer, answerIndex) => `<label><input type="radio" name="summary-${id}-${index}" value="${answerIndex}"><span>${answer}</span></label>`).reverse().join('')}<button type="button" class="button check-summary">Provjeri odgovor</button><p role="status"></p></fieldset>`).join('')}</div></details>` : ''}
    </section>`;
}

function content(source) {
  let html = source
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/<p\b[^>]*>\s*<strong>_{10,}<\/strong>\s*<\/p>/g, '<hr class="content-divider">')
    .replace(/<script\b[^>]*>[\s\S]*?<\/script\s*>/gi, '')
    .replace(/\s+on[\w-]+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, '')
    .replace(/(href|src)\s*=\s*(["'])\s*javascript:[\s\S]*?\2/gi, '$1="#"')
    .replace(/\[sp_easyaccordion\s+([^\]]*)\]/g, (_, attrs) => accordion(attributes(attrs).id))
    .replace(/\[gallery\s+([^\]]*)\]/g, (_, attrs) => gallery(attributes(attrs)))
    .replace(/\[h5p\s+([^\]]*)\]/g, (_, attrs) => interactiveVideo(attributes(attrs).id))
    .replace(/<div class="wp-block-embed__wrapper">\s*(https:\/\/(?:www\.)?youtube\.com\/watch\?v=([\w-]+))\s*<\/div>/g,
      (_, url, id) => `<div class="wp-block-embed__wrapper"><iframe src="https://www.youtube.com/embed/${id}" title="Video sa studentskih aktivnosti" loading="lazy" allowfullscreen></iframe><a class="video-source" href="${escaped(url)}" target="_blank" rel="noopener noreferrer">Pogledaj na YouTubeu</a></div>`);
  html = localize(html)
    .replace(/(href\s*=\s*["'])\/prijasnje-godine\/?(?=["'])/gi, '$1/smotre/')
    .replace(/(href\s*=\s*["'])(?:https?:)?\/\/(?:www\.)?smotra\.pbf\.hr\/prijasnje-godine\/?(?=["'])/gi, '$1/smotre/');
  html = html.replace(/<img\b([^>]*?)\/?>/gi, (_, raw) => {
    const attrs = attributes(raw);
    if (!attrs.src) throw new Error('Image without src');
    let tail = raw.replace(/\s*(?:loading|decoding)\s*=\s*"[^"]*"/g, '').replace(/\/\s*$/, '');
    const id = Number(attrs.class?.match(/\bwp-image-(\d+)/)?.[1]);
    const data = meta(id)._wp_attachment_metadata ? unserialize(meta(id)._wp_attachment_metadata) : null;
    if (data) {
      if (!attrs.width && data.width) tail += ` width="${Number(data.width)}"`;
      if (!attrs.height && data.height) tail += ` height="${Number(data.height)}"`;
      if (!attrs.srcset && attrs.src.startsWith('/wp-content/uploads/')) {
        const sizes = Object.values(data.sizes || {}).filter(size => size.width >= 300 && Math.abs(size.width / size.height - data.width / data.height) < 0.06);
        const sources = [...sizes.map(size => `${asset(`${path.posix.dirname(meta(id)._wp_attached_file)}/${size.file}`)} ${size.width}w`), `${attachment(id)} ${data.width}w`];
        tail += ` srcset="${sources.join(', ')}" sizes="(max-width: 700px) 100vw, 1100px"`;
      }
    }
    return `<img${tail} loading="lazy" decoding="async">`;
  });
  html = html.replace(/<iframe\b([^>]*)>/gi, (_, raw) => {
    const attrs = attributes(raw);
    const src = attrs.src || '';
    const localQuiz = src === '/wp-content/uploads/kviz/index.html';
    const url = new URL(src, 'https://static.invalid');
    if (!localQuiz && !['www.youtube.com', 'www.youtube-nocookie.com', 'www.google.com'].includes(url.hostname)) throw new Error(`Unexpected embedded host: ${url.hostname}`);
    const title = attrs.title || (url.hostname === 'www.google.com' ? 'Smještaj Prehrambeno-biotehnološkog fakulteta' : 'Video Prehrambeno-biotehnološkog fakulteta');
    return `<iframe${raw.replace(/\s+(?:loading|title)\s*=\s*"[^"]*"/g, '')} title="${escaped(title)}" loading="lazy">`;
  });
  html = html.replace(/<a\b([^>]*)>/g, (_, raw) => {
    const attrs = attributes(raw);
    const isVideoLink = /^(?:https?:)?\/\/(?:www\.)?(?:youtube\.com\/watch(?:\?|$)|youtu\.be\/)/i.test(attrs.href || '');
    let updated = raw;
    if (isVideoLink) {
      const classes = new Set((attrs.class || '').split(/\s+/).filter(Boolean));
      classes.add('video-thumbnail-link');
      const classAttribute = `class="${escaped([...classes].join(' '))}"`;
      updated = attrs.class
        ? updated.replace(/\sclass\s*=\s*(?:"[^"]*"|'[^']*')/i, ` ${classAttribute}`)
        : `${updated} ${classAttribute}`;
    }
    const labelAttribute = isVideoLink && !attrs['aria-label'] ? ' aria-label="Pogledaj video na YouTubeu"' : '';
    const relAttribute = /\btarget=["']_blank/.test(raw) && !/\brel=/.test(raw) ? ' rel="noopener noreferrer"' : '';
    return `<a${updated}${labelAttribute}${relAttribute}>`;
  });
  html = html.replace(/<li class="blocks-gallery-item"[\s\S]*?<\/li>/g, item =>
    item.replace(/sizes="[^"]*"/g, 'sizes="(max-width: 850px) 50vw, 370px"'));
  const unresolved = html.match(/\[(?:\/?fusion_|h5p|sp_easyaccordion|gallery)[^\]]*\]/g);
  if (unresolved) throw new Error(`Unconverted shortcodes: ${unresolved.join(', ')}`);
  return html;
}

const socialIcons = {
  Instagram: '<rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r=".7" fill="currentColor"/>',
  Facebook: '<path d="M14 21v-8h3l.5-4H14V7c0-1 .4-2 2-2h2V2h-3c-3 0-5 2-5 5v2H7v4h3v8"/>',
  Youtube: '<rect x="2" y="5" width="20" height="14" rx="4"/><path d="m10 9 5 3-5 3z"/>',
  Linkedin: '<rect x="3" y="8" width="4" height="13"/><circle cx="5" cy="4" r="2"/><path d="M11 21V8h4v2c2-3 6-2 6 2v9h-4v-8c0-2-2-2-2 0v8z"/>'
};
const navPosts = database.wp_posts.filter(post => post.post_type === 'nav_menu_item' && post.post_status === 'publish')
  .filter(post => database.wp_term_relationships.some(row => row.object_id === post.ID && row.term_taxonomy_id === 3))
  .sort((a, b) => a.menu_order - b.menu_order);

function navigation(current) {
  return navPosts.map(item => {
    const settings = meta(item.ID);
    const id = Number(settings._menu_item_object_id);
    const isPage = settings._menu_item_type === 'post_type';
    const title = item.post_title || posts.get(id)?.post_title;
    if (!title) throw new Error(`Untitled menu item ${item.ID}`);
    const href = isPage ? routes[id] : settings._menu_item_url;
    if (!href) throw new Error(`Missing menu target ${item.ID}`);
    const icon = socialIcons[title];
    return `<li${icon ? ' class="social-link"' : ''}><a href="${escaped(href)}"${isPage && id === current ? ' aria-current="page"' : ''}${icon ? ` aria-label="${escaped(title)}" title="${escaped(title)}"` : ''}>${icon ? `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true">${icon}</svg>` : escaped(title)}</a></li>`;
  }).join('');
}

function shell(page, body, isHome = false) {
  return `<!doctype html>
<html lang="hr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escaped(page.post_title)} – ${escaped(options.blogname)}</title>
<meta name="description" content="${escaped(isHome ? 'Smotra Sveučilišta u Zagrebu – Prehrambeno-biotehnološki fakultet. Upoznaj studije, fakultet i studentski život.' : `${page.post_title} – Smotra Prehrambeno-biotehnološkog fakulteta Sveučilišta u Zagrebu.`)}">
<link rel="icon" href="/assets/favicon.svg" type="image/svg+xml">
<link rel="stylesheet" href="/assets/site.css">
<script src="/assets/routes.js"></script>
<script src="/assets/site.js" defer></script>
${body.includes('data-interactive-video') ? '<script src="/assets/interactive-video.js" defer></script>' : ''}
</head>
<body class="${isHome ? 'home' : 'inner-page'}" data-page-id="${page.ID}">
<a class="skip-link" href="#content">Preskoči na sadržaj</a>
<header class="site-header"><div class="brand"><a href="/" aria-label="SMOTRA PBF – Naslovnica"><img src="${localize(theme.logo.url)}" width="${theme.logo.width}" height="${theme.logo.height}" alt="Sveučilište u Zagrebu – Smotra – Prehrambeno-biotehnološki fakultet" fetchpriority="high"></a></div></header>
<nav class="site-navigation" aria-label="Glavni izbornik"><div class="navigation-inner"><button class="menu-toggle" type="button" aria-expanded="false" aria-controls="main-menu"><span>Izbornik</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M3 6h18M3 12h18M3 18h18"/></svg></button><ul id="main-menu">${navigation(page.ID)}</ul></div></nav>
<main id="content"${isHome ? ' class="home-content"' : ' class="page-content"'}><h1 class="screen-reader-only">${escaped(page.post_title)}</h1>${body}</main>
<button type="button" class="back-to-top" aria-label="Povratak na vrh" hidden>↑</button>
<dialog class="lightbox" aria-label="Pregled fotografije"><button type="button" class="lightbox-close" aria-label="Zatvori pregled">×</button><button type="button" class="lightbox-prev" aria-label="Prethodna fotografija">‹</button><figure><img alt=""><figcaption></figcaption></figure><button type="button" class="lightbox-next" aria-label="Sljedeća fotografija">›</button><p class="lightbox-counter" aria-live="polite"></p></dialog>
</body></html>`;
}

mkdirSync(output, { recursive: true });
cpSync(path.join(root, 'static'), path.join(output, 'assets'), { recursive: true });
const slides = database.wp_posts.filter(post => post.post_type === 'slide' && post.post_status === 'publish' &&
  database.wp_term_relationships.some(row => row.object_id === post.ID && row.term_taxonomy_id === 2));
if (slides.length !== 1) throw new Error(`Expected the exported single home slide, found ${slides.length}`);
const hero = attachment(meta(slides[0].ID)._thumbnail_id);
for (const page of pages) {
  const isHome = page.ID === home;
  const body = isHome
    ? `<section class="home-hero" aria-label="Studiji Prehrambeno-biotehnološkog fakulteta"><img src="${hero}" width="1904" height="907" alt="Prehrambeno-biotehnološki fakultet: Studij Nutricionizma, Studij Biotehnologije i Studij Prehrambene tehnologije" fetchpriority="high"><div class="hero-study-links"><a href="${routes[113]}">Studij Nutricionizma</a><a href="${routes[78]}">Studij Biotehnologije</a><a href="${routes[74]}">Studij Prehrambene tehnologije</a></div></section>`
    : `${page.ID === 223 ? `${smotra2026()}${smotra2026Gallery()}` : ''}${content(page.post_content)}`;
  const html = shell(page, body, isHome);
  save(isHome ? 'index.html' : `${routes[page.ID].slice(1)}index.html`, html);
  if (isHome) save(`${page.post_name}/index.html`, html);
  if (aliases[page.ID]) save(`${aliases[page.ID]}/index.html`, html);
  if (page.ID === 223) {
    save(`${page.post_name}/index.html`, `<!doctype html>
<html lang="hr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta http-equiv="refresh" content="0;url=/smotre/"><link rel="canonical" href="/smotre/"><title>Smotre – nova adresa</title></head>
<body><p>Stranica je premještena. <a href="/smotre/">Otvori smotre</a>.</p><script>location.replace('/smotre/' + location.search + location.hash);</script></body></html>`);
  }
}

save('assets/routes.js', `(() => {
  const routes = ${JSON.stringify(routes)};
  const query = new URLSearchParams(location.search);
  const id = query.get('page_id') || query.get('p');
  if (id && routes[id] && (location.pathname === '/' || /\\/index\\.(?:html|php)$/.test(location.pathname))) {
    query.delete('page_id'); query.delete('p');
    const rest = query.toString();
    location.replace(routes[id] + (rest ? '?' + rest : '') + location.hash);
  }
})();\n`);

// Keep the supplied standalone quiz, but replace its CDN-only decoration locally.
const quizRoot = 'wp-content/uploads/kviz';
save(`${quizRoot}/index.html`, readFileSync(path.join(root, 'uploads/kviz/index.html'), 'utf8')
  .replace(/<script src="https:\/\/cdn\.jsdelivr\.net\/[^"]*"><\/script>/, '<script src="/assets/confetti.js" defer></script>')
  .replace('</body>', '<script src="/assets/quiz-accessibility.js" defer></script></body>'));
save(`${quizRoot}/style.css`, readFileSync(path.join(root, 'uploads/kviz/style.css'), 'utf8')
  .replace(/@font-face\s*\{[^}]*r2cdn\.perplexity\.ai[^}]*\}/g, '')
  .replaceAll('"FKGroteskNeue"', '"PT Sans"')
  + '\n@font-face { font-family: "PT Sans"; src: url("/assets/fonts/pt-sans.ttf") format("truetype"); font-display: swap; }\n.option-card:focus-visible { outline: 3px solid #134f99; outline-offset: 3px; }\n');
const quizJs = readFileSync(path.join(root, 'uploads/kviz/app.js'), 'utf8');
save(`${quizRoot}/app.js`, quizJs);
media.delete('kviz/index.html');

for (const relative of media) {
  const source = path.join(root, 'uploads', relative);
  if (!/\.(?:avif|gif|jpe?g|png|svg|webp|pdf|mp4|webm|ogv|mp3|wav|woff2?|ttf)$/i.test(relative)) {
    throw new Error(`Refusing to publish unexpected upload type: ${relative}`);
  }
  const target = path.join(output, 'wp-content/uploads', relative);
  mkdirSync(path.dirname(target), { recursive: true });
  copyFileSync(source, target);
}
save('404.html', shell({ ID: 0, post_title: 'Stranica nije pronađena' }, '<section class="not-found"><h2>Stranica nije pronađena</h2><p>Tražena stranica nije dostupna.</p><a class="button" href="/">Povratak na naslovnicu</a></section>'));
save('robots.txt', 'User-agent: *\nAllow: /\n');
save('_redirects', '/index.php / 301\n/prijasnje-godine /smotre/ 301\n/prijasnje-godine/ /smotre/ 301\n');
save('migration-report.json', JSON.stringify({
  pages: pages.map(page => ({ id: page.ID, title: page.post_title, route: routes[page.ID], type: page.post_type })),
  assets: media.size,
  missingAssets: [...missing],
  warnings: [...warnings],
  notes: [
    'Only published pages and posts, referenced accordion content and public media are exported.',
    'The original header and homepage slide are preserved. The home illustration now also links to the three studies.',
    'The original Google Fonts are served locally with their OFL licenses.',
    'YouTube and Google Maps still require internet access; video questions are also available without playback.',
    'H5P calorimetry is reimplemented with vanilla JS: timed text, paused multiple-choice questions and a final summary.',
    'WordPress administration, user records, comments, analytics and PHP code are not published.'
  ]
}, null, 2));
const bytes = [...media].reduce((sum, file) => sum + statSync(path.join(root, 'uploads', file)).size, 0);
console.log(`Built ${pages.length} pages/posts, ${Object.keys(aliases).length} friendly aliases and ${media.size} media files (${Math.round(bytes / 1024 / 1024)} MB) in dist/.`);
if (missing.size) {
  console.error(`Missing exported media:\n${[...missing].join('\n')}`);
  process.exitCode = 1;
}
if (warnings.size) console.warn([...warnings].join('\n'));
