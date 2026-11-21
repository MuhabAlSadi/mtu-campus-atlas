/* Reveal content on first entry. The map keeps its own pointer and camera animations. */
(() => {
  const root = document.getElementById('root');
  if (!root || !window.IntersectionObserver || !Element.prototype.animate) return;

  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const selector = [
    '.hero-copy > *', '.page-heading', '.place-card', '.section-heading',
    '.section-strip', '.service-feature', '.service-grid > *',
    '.about-image', '.about-grid > article', '.tech-panel', '.empty-state'
  ].join(',');
  const revealed = new WeakSet();
  const running = new Map();
  const observer = new IntersectionObserver(entries => {
    let batch = 0;
    for (const entry of entries) {
      const el = entry.target;
      if (!entry.isIntersecting || !el.isConnected || revealed.has(el)) continue;
      observer.unobserve(el);
      el.removeAttribute('data-reveal-pending');
      revealed.add(el);
      if (motion.matches || el.contains(document.activeElement)) continue;
      const animation = el.animate([
        { opacity: 0, translate: '0 12px' },
        { opacity: 1, translate: '0 0' }
      ], { duration: 420, delay: Math.min(batch++, 3) * 45,
           easing: 'cubic-bezier(.2,.7,.25,1)', fill: 'backwards' });
      running.set(el, animation);
      animation.onfinish = animation.oncancel = () => running.delete(el);
    }
  }, { threshold: 0, rootMargin: '0px' });

  function visit(node, callback) {
    if (node.nodeType !== 1) return;
    if (node.matches(selector)) callback(node);
    node.querySelectorAll(selector).forEach(callback);
  }
  function prepare(el) {
    if (motion.matches || revealed.has(el) || el.hasAttribute('data-reveal-pending')) return;
    el.setAttribute('data-reveal-pending', '');
    observer.observe(el);
  }
  function release(el) {
    observer.unobserve(el);
    el.removeAttribute('data-reveal-pending');
    running.get(el)?.cancel();
  }
  new MutationObserver(records => {
    for (const r of records) {
      r.removedNodes.forEach(n => visit(n, release));
      r.addedNodes.forEach(n => visit(n, prepare));
    }
  }).observe(root, { childList: true, subtree: true });

  root.addEventListener('focusin', event => {
    const el = event.target.closest(selector);
    if (el) { release(el); revealed.add(el); }
  });
  motion.addEventListener('change', () => visit(root, motion.matches ? release : prepare));
  visit(root, prepare);
})();
