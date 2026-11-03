document.querySelectorAll('.option-card').forEach(card => {
  card.tabIndex = 0;
  card.setAttribute('role', 'button');
  card.setAttribute('aria-pressed', 'false');
  card.addEventListener('keydown', event => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      event.stopPropagation();
      card.click();
    }
  });
});
const observer = new MutationObserver(records => {
  for (const record of records) {
    const element = record.target;
    if (element.matches('.option-card')) {
      element.setAttribute('aria-pressed', String(element.classList.contains('selected')));
    }
    if (element.matches('.screen.active')) {
      const heading = element.querySelector('h1,h2');
      if (heading) {
        heading.tabIndex = -1;
        heading.focus({ preventScroll: true });
        element.scrollIntoView({ block: 'start' });
      }
    }
  }
});
document.querySelectorAll('.option-card,.screen').forEach(element => {
  observer.observe(element, { attributes: true, attributeFilter: ['class'] });
});
