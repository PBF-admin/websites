// The supplied quiz calls this API; decoration should not require a CDN.
globalThis.confetti = function confetti({ particleCount = 40, colors = ['#34539b', '#a0ce4e', '#fcb900'], origin = { x: .5, y: .6 } } = {}) {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const canvas = document.createElement('canvas');
  canvas.width = innerWidth;
  canvas.height = innerHeight;
  canvas.style.cssText = 'position:fixed;inset:0;pointer-events:none;z-index:9999;width:100%;height:100%';
  canvas.setAttribute('aria-hidden', 'true');
  document.body.append(canvas);
  const context = canvas.getContext('2d');
  if (!context) { canvas.remove(); return; }
  const particles = Array.from({ length: Math.min(particleCount, 100) }, (_, index) => ({
    x: (origin.x ?? .5) * canvas.width,
    y: (origin.y ?? .6) * canvas.height,
    vx: (Math.random() - .5) * 13,
    vy: -5 - Math.random() * 12,
    color: colors[index % colors.length],
    angle: Math.random() * 6
  }));
  let start;
  let previous;
  function draw(time) {
    start ??= time;
    previous ??= time;
    const delta = Math.min((time - previous) / 16.67, 3);
    previous = time;
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.globalAlpha = Math.max(0, 1 - (time - start) / 2200);
    for (const particle of particles) {
      particle.x += particle.vx * delta;
      particle.y += particle.vy * delta;
      particle.vy += .23 * delta;
      particle.angle += .07 * delta;
      context.save();
      context.translate(particle.x, particle.y);
      context.rotate(particle.angle);
      context.fillStyle = particle.color;
      context.fillRect(-3, -3, 6, 9);
      context.restore();
    }
    if (time - start < 2200) requestAnimationFrame(draw);
    else canvas.remove();
  }
  requestAnimationFrame(draw);
};
