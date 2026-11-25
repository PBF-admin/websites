const page = document.body.dataset.page || 'index';
const query = window.location.search.startsWith('?') ? decodeURIComponent(window.location.search.slice(1)) : '';
const requestedLanguage = new URLSearchParams(query).get('lang');
const language = requestedLanguage === 'hr' ? 'hr' : requestedLanguage === 'en' ? 'en' : localStorage.getItem('site-language') || 'hr';
const locale = window.siteLocales[language] || window.siteLocales.en;
const articleQuery = new URLSearchParams(query);
const articleSection = articleQuery.get('section');
const articleIndex = Number(articleQuery.get('id'));

localStorage.setItem('site-language', language);
document.documentElement.lang = language;
const articleData = page === 'article' && locale.articles[articleSection]?.[articleIndex];
document.title = page === 'article' && articleData ? `${articleData[0]} | FoRoClimaWINE` : `${locale.pages[page].title} | FoRoClimaWINE`;

const routes = ['index', 'about', 'team', 'news', 'dissemination', 'contact'];
const route = (name) => `${name}.html?lang=${language}`;
const articleRoute = (section, index) => `article.html?section=${section}&id=${index}&lang=${language}`;
const escapeHtml = (text) => text.replace(/[&<>"']/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character]));
const alternateLanguage = language === 'en' ? 'hr' : 'en';
const alternateLabel = language === 'en' ? 'HR' : 'EN';

document.querySelector('nav').innerHTML = `
<div class="brand-group"><a class="institution-logo hrzz-logo" href="${route('index')}" aria-label="HrZZ"><img src="img/hrzz.jpg" alt="HrZZ logo" style="width:116px;height:48px;object-fit:contain"></a><a class="institution-logo pbf-logo" href="${route('index')}" aria-label="${language === 'en' ? 'Faculty of Food Technology and Biotechnology, University of Zagreb' : 'Prehrambeno-biotehnološki fakultet Sveučilišta u Zagrebu'}"><img src="img/${language === 'en' ? 'logo_eng.png' : 'logo_hr.png'}" alt="${language === 'en' ? 'Faculty of Food Technology and Biotechnology, University of Zagreb logo' : 'Prehrambeno-biotehnološki fakultet Sveučilišta u Zagrebu logo'}" style="width:178px;height:52px;object-fit:contain"></a><a class="brand" href="${route('index')}">FoRoClimaWINE</a></div>
<div class="navlinks">${routes.slice(1).map((name) => `<a class="${name === page || (page === 'article' && name === articleSection) ? 'active' : ''}" href="${route(name)}">${locale.nav[name]}</a>`).join('')}<a class="lang" href="${page === 'article' ? `article.html?section=${articleSection}&id=${articleIndex}&lang=${alternateLanguage}` : `${page}.html?lang=${alternateLanguage}`}" >${alternateLabel}</a></div>`;

const pageData = locale.pages[page];
const renderCarousel = (id, label, slides, className = '') => `
<section class="carousel ${className}" aria-label="${escapeHtml(label)}" aria-roledescription="${locale.ui.carousel}">
  <div class="carousel-track" id="${id}" tabindex="0" aria-label="${escapeHtml(label)}">${slides.join('')}</div>
  <div class="carousel-controls">
    <button type="button" data-direction="-1" aria-controls="${id}" aria-label="${locale.ui.previousSlide}">&larr;</button>
    <span class="carousel-status" role="status" aria-live="polite" aria-atomic="true"></span>
    <button type="button" data-direction="1" aria-controls="${id}" aria-label="${locale.ui.nextSlide}">&rarr;</button>
  </div>
</section>`;
const renderArticle = (item) => {
  const images = Array.isArray(item[1]) ? item[1] : item[1] ? [item[1]] : [];
  const photos = images.map((img, index) => `<img class="section-image" src="img/${img}" alt="${escapeHtml(item[2])}"${index ? ' loading="lazy"' : ''}>`);
  const photoHtml = articleSection === 'dissemination' && images.length > 1
    ? renderCarousel('article-photos', locale.ui.articlePhotos, photos.map((photo) => `<div class="carousel-photo">${photo}</div>`), 'photo-carousel')
    : photos.join('');
  const paras = linkifyText(item[3]);
  return `<article class="news-card standalone-article"><h1>${item[0]}</h1>${photoHtml}<p>${paras}</p>${item[4] ? `<a href="${item[4]}" target="_blank" rel="noopener">${locale.ui.moreInformation} →</a>` : ''}</article>`;
};
const content = page === 'article' && articleData ? `
<div class="page"><div class="eyebrow">FoRoClimaWINE</div><a class="article-back" href="${route(articleSection)}">&larr; ${locale.nav[articleSection]}</a>${renderArticle(articleData)}</div>` : page === 'index' ? `
<section class="hero"><div class="hero-inner"><div class="eyebrow">FoRoClimaWINE</div><h1>FoRoClimaWINE</h1><p>${pageData.intro}</p><a class="cta" href="${route('about')}">${locale.ui.learnMore}</a></div></section>` : `
<div class="page"><div class="eyebrow">FoRoClimaWINE</div><h1>${pageData.heading}</h1>${pageData.body}</div>
<div class="pager">${pageData.previous ? `<a href="${route(pageData.previous)}">← ${locale.ui.previous}</a>` : '<span></span>'}${pageData.next ? `<a href="${route(pageData.next)}">${locale.ui.next} →</a>` : ''}</div>`;

document.querySelector('main').innerHTML = content;
document.querySelectorAll('img').forEach((image) => {
	const source = image.getAttribute('src');
	if (source && !source.startsWith('img/')) {
		image.src = `img/${source}`;
	}
});
if (page === 'team') {

	document.querySelectorAll('.team a[href*="mp.unist.hr"]').forEach((link) => {
		const logo = document.createElement('img');
		logo.className = 'team-institution-logo';
		logo.src = 'img/afsp.jpg';
		logo.alt = 'AFSP logo';
		link.prepend(logo);
	});
}
if (page === 'news' || page === 'dissemination') {
	const cards = Array.from(document.querySelectorAll('.news-card'));
	cards.forEach((card, index) => {
		const heading = card.querySelector('h2');
		const link = document.createElement('a');
		link.href = articleRoute(page, index);
		link.target = '_blank';
		link.rel = 'noopener';
		link.textContent = heading.textContent;
		heading.textContent = '';
		heading.append(link);
	});
	if (page === 'dissemination') {
		// Display newest first without changing IDs; MEMTEK follows Bordeaux in time.
		const newestFirst = cards.map((_, index) => index).reverse();
		const memtekPosition = newestFirst.indexOf(1);
		const bordeauxPosition = newestFirst.indexOf(2);
		[newestFirst[memtekPosition], newestFirst[bordeauxPosition]] = [newestFirst[bordeauxPosition], newestFirst[memtekPosition]];
		newestFirst.forEach((index) => cards[index].parentElement.append(cards[index]));
	}
}
document.querySelectorAll('.carousel').forEach((carousel) => {
	const track = carousel.querySelector('.carousel-track');
	const slides = Array.from(track.children);
	const previous = carousel.querySelector('[data-direction="-1"]');
	const next = carousel.querySelector('[data-direction="1"]');
	const status = carousel.querySelector('.carousel-status');
	const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
	const position = (slide) => slide.offsetLeft - slides[0].offsetLeft;
	let current = 0;
	const update = () => {
		current = slides.reduce((nearest, slide, index) => Math.abs(position(slide) - track.scrollLeft) < Math.abs(position(slides[nearest]) - track.scrollLeft) ? index : nearest, 0);
		previous.disabled = track.scrollLeft <= 1;
		next.disabled = track.scrollLeft >= track.scrollWidth - track.clientWidth - 1;
		status.textContent = `${current + 1} / ${slides.length}`;
	};
	const move = (index) => {
		track.scrollTo({ left: position(slides[Math.max(0, Math.min(index, slides.length - 1))]), behavior: reducedMotion.matches ? 'instant' : 'smooth' });
	};
	previous.addEventListener('click', () => move(current - 1));
	next.addEventListener('click', () => move(current + 1));
	track.addEventListener('keydown', (event) => {
		if (event.target !== track) return;
		const destinations = { ArrowLeft: current - 1, ArrowRight: current + 1, Home: 0, End: slides.length - 1 };
		if (event.key in destinations) {
			event.preventDefault();
			move(destinations[event.key]);
		}
	});
	track.addEventListener('scroll', update, { passive: true });
	new ResizeObserver(update).observe(track);
	update();
});
document.querySelector('footer').textContent = 'FoRoClimaWINE · 2024–2027';
