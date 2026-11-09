const navigation = document.querySelector('.site-navigation');
const toggle = document.querySelector('.menu-toggle');
toggle.addEventListener('click', () => {
  const open = toggle.getAttribute('aria-expanded') !== 'true';
  toggle.setAttribute('aria-expanded', String(open));
  navigation.classList.toggle('is-open', open);
});
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && navigation.classList.contains('is-open')) {
    toggle.setAttribute('aria-expanded', 'false');
    navigation.classList.remove('is-open');
    toggle.focus();
  }
});

document.querySelectorAll('table').forEach(table => {
  const wrapper = document.createElement('div');
  wrapper.className = 'table-scroll';
  wrapper.tabIndex = 0;
  wrapper.setAttribute('role', 'region');
  wrapper.setAttribute('aria-label', 'Tablica studijskih programa');
  table.before(wrapper);
  wrapper.append(table);
});

// WordPress stores gallery markup, but its viewer was supplied by Avada.
document.querySelectorAll('.blocks-gallery-item img').forEach(image => {
  const link = image.closest('a');
  if (link && !/\.(?:avif|gif|jpe?g|png|webp)(?:[?#]|$)/i.test(link.href)) return;
  if (link) {
    link.dataset.lightbox = '';
  } else {
    const anchor = document.createElement('a');
    anchor.href = image.dataset.fullUrl || image.src;
    anchor.dataset.lightbox = '';
    image.before(anchor);
    anchor.append(image);
  }
});
const lightbox = document.querySelector('.lightbox');
const lightboxImage = lightbox.querySelector('img');
const caption = lightbox.querySelector('figcaption');
let currentGallery = [];
let currentIndex = 0;
let returnFocus;
function showImage(index) {
  currentIndex = (index + currentGallery.length) % currentGallery.length;
  const link = currentGallery[currentIndex];
  const source = link.querySelector('img');
  lightboxImage.src = link.href;
  lightboxImage.alt = source.alt;
  caption.textContent = link.closest('figure')?.querySelector('figcaption')?.textContent || source.alt;
  lightbox.querySelector('.lightbox-counter').textContent = `${currentIndex + 1} / ${currentGallery.length}`;
  lightbox.querySelector('.lightbox-prev').hidden = currentGallery.length < 2;
  lightbox.querySelector('.lightbox-next').hidden = currentGallery.length < 2;
}
document.addEventListener('click', event => {
  const link = event.target.closest('a[data-lightbox]');
  if (!link) return;
  event.preventDefault();
  returnFocus = link;
  const gallery = link.closest('.wp-block-gallery') || link.parentElement;
  currentGallery = [...gallery.querySelectorAll('a[data-lightbox]')];
  showImage(currentGallery.indexOf(link));
  lightbox.showModal();
  document.body.classList.add('has-lightbox');
});
lightbox.querySelector('.lightbox-close').addEventListener('click', () => lightbox.close());
lightbox.querySelector('.lightbox-prev').addEventListener('click', () => showImage(currentIndex - 1));
lightbox.querySelector('.lightbox-next').addEventListener('click', () => showImage(currentIndex + 1));
lightbox.addEventListener('keydown', event => {
  if (event.key === 'Escape') { event.preventDefault(); lightbox.close(); }
  if (event.key === 'ArrowLeft') { event.preventDefault(); showImage(currentIndex - 1); }
  if (event.key === 'ArrowRight') { event.preventDefault(); showImage(currentIndex + 1); }
});
lightbox.addEventListener('click', event => {
  if (event.target === lightbox) lightbox.close();
});
lightbox.addEventListener('close', () => {
  document.body.classList.remove('has-lightbox');
  lightboxImage.removeAttribute('src');
  returnFocus?.focus();
});
lightboxImage.addEventListener('error', () => {
  caption.textContent = 'Fotografiju nije moguće učitati. Provjeri vezu ili pokušaj ponovno.';
});

const backToTop = document.querySelector('.back-to-top');
const updateScroll = () => { backToTop.hidden = scrollY < 500; };
addEventListener('scroll', updateScroll, { passive: true });
updateScroll();
backToTop.addEventListener('click', () => {
  scrollTo({ top: 0, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
  document.querySelector('.brand a').focus({ preventScroll: true });
});
