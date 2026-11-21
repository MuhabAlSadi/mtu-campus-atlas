(() => {
  const root = document.documentElement;
  const finePointer = matchMedia('(hover: hover) and (pointer: fine)');
  // An original angular pointer and lightweight symbols for map gestures.
  const shapes = {
    arrow: ['4 3', '<path d="M4 3 27 17 16 19 10 28Z"/>'],
    action: ['4 3', '<path d="M4 3 24 15 14 17 9 25Z"/><path fill="none" d="m24 23 4 4m-3-9h5m-11 8v4"/>'],
    zoom: ['12 12', '<circle cx="12" cy="12" r="8"/><path fill="none" d="m18 18 8 8M8.5 12h7m-3.5-3.5v7"/>'],
    grab: ['16 16', '<circle cx="16" cy="16" r="4"/><path fill="none" d="M16 4v5m0 14v5M4 16h5m14 0h5"/>'],
    drag: ['16 16', '<path d="m16 9 7 7-7 7-7-7Z"/><path fill="none" d="m13 6 3-3 3 3m-6 20 3 3 3-3M6 13l-3 3 3 3m20-6 3 3-3 3"/>']
  };

  function apply() {
    root.toggleAttribute('data-atlas-cursors', finePointer.matches);
    if (!finePointer.matches) return;
    const accent = getComputedStyle(root).getPropertyValue('--atlas-accent').trim();
    const fill = /^#[0-9a-f]{6}$/i.test(accent) ? accent : '#4aa790';
    for (const [name, [hotspot, shape]] of Object.entries(shapes)) {
      const svg = '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32"><g stroke-linejoin="round" stroke-linecap="round"><g fill="none" stroke="#fff" stroke-width="3.1">'+shape+'</g><g fill="'+fill+'" stroke="#102927" stroke-width="1.35">'+shape+'</g></g></svg>';
      root.style.setProperty('--cursor-'+name, 'url("data:image/svg+xml,'+encodeURIComponent(svg)+'") '+hotspot);
    }
  }

  function endDrag() {
    root.removeAttribute('data-map-dragging');
  }

  document.addEventListener('pointerdown', e => {
    if (e.pointerType === 'mouse' && e.button === 0 && e.target.matches('.campus-canvas > canvas')) {
      root.setAttribute('data-map-dragging', '');
    }
  }, {passive:true});
  window.addEventListener('pointerup', endDrag);
  window.addEventListener('pointercancel', endDrag);
  window.addEventListener('blur', endDrag);
  finePointer.addEventListener('change', apply);
  new MutationObserver(apply).observe(root,{attributes:true,attributeFilter:['data-atlas-theme']});
  apply();
})();
