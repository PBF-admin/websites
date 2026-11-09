(() => {
  const routes = {"1":"/dan-svijete/","2":"/primjer-stranice/","7":"/","71":"/zajednicki-predmeti/","74":"/prehrambena-biotehnolgija/","78":"/biotehnologija/","113":"/nutricionizam/","223":"/smotre/","330":"/studentski-zivot/"};
  const query = new URLSearchParams(location.search);
  const id = query.get('page_id') || query.get('p');
  if (id && routes[id] && (location.pathname === '/' || /\/index\.(?:html|php)$/.test(location.pathname))) {
    query.delete('page_id'); query.delete('p');
    const rest = query.toString();
    location.replace(routes[id] + (rest ? '?' + rest : '') + location.hash);
  }
})();
