/* 69 SEXSHOP — comportamiento del tema (sin dependencias, sin compilación) */
(function () {
  'use strict';

  var T = window.theme || {};
  var R = T.routes || {};
  var FAV_KEY = '69_favs';
  var AGE_KEY = '69_age_ok';
  var toastTimer;

  function $(s, c) { return (c || document).querySelector(s); }
  function $$(s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); }
  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }
  function sized(url, w) { return url + (url.indexOf('?') > -1 ? '&' : '?') + 'width=' + w; }

  function money(cents) {
    var whole = cents % 100 === 0;
    try {
      return new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: T.currency || 'COP',
        minimumFractionDigits: whole ? 0 : 2,
        maximumFractionDigits: whole ? 0 : 2
      }).format(cents / 100);
    } catch (e) {
      return (cents / 100).toFixed(whole ? 0 : 2);
    }
  }

  function toast(msg) {
    var t = $('#Toast');
    if (!t) return;
    t.textContent = msg;
    t.classList.add('is-visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { t.classList.remove('is-visible'); }, 2600);
  }

  function fetchJSON(url, opts) {
    return fetch(url, opts).then(function (r) {
      return r.json().then(function (d) {
        if (!r.ok) throw d;
        return d;
      });
    });
  }

  /* ---------- Carrito lateral ---------- */
  function getCart() {
    return fetchJSON(R.cartJs, { headers: { Accept: 'application/json' } });
  }

  function updateCount(n) {
    $$('[data-cart-count]').forEach(function (c) {
      c.textContent = n;
      c.hidden = !n;
    });
  }

  function renderCart(cart) {
    updateCount(cart.item_count);
    var box = $('[data-drawer-items]');
    var foot = $('[data-drawer-foot]');
    var total = $('[data-drawer-total]');
    if (!box) return;
    box.textContent = '';

    if (!cart.items.length) {
      var empty = el('div', 'drawer-empty');
      empty.appendChild(el('p', null, 'Tu carrito está vacío.'));
      var go = el('a', 'btn', 'Explorar tienda');
      go.href = R.all || '/';
      empty.appendChild(go);
      box.appendChild(empty);
      if (foot) foot.hidden = true;
      return;
    }

    cart.items.forEach(function (item, i) {
      var row = el('div', 'drawer-item');
      if (item.image) {
        var img = el('img');
        img.src = sized(item.image, 200);
        img.alt = item.product_title;
        img.width = 72;
        img.height = 90;
        img.loading = 'lazy';
        row.appendChild(img);
      } else {
        row.appendChild(el('span', 'cart-noimg'));
      }

      var info = el('div');
      var title = el('a', 'drawer-item-title', item.product_title);
      title.href = item.url;
      info.appendChild(title);
      if (item.variant_title && item.variant_title !== 'Default Title') {
        info.appendChild(el('div', 'drawer-item-variant', item.variant_title));
      }

      var line = el('div', 'drawer-item-row');
      var ctl = el('div', 'qty-ctl');
      var minus = el('button', null, '−');
      minus.type = 'button';
      minus.setAttribute('aria-label', 'Quitar una unidad');
      minus.dataset.line = i + 1;
      minus.dataset.qty = item.quantity - 1;
      var plus = el('button', null, '+');
      plus.type = 'button';
      plus.setAttribute('aria-label', 'Agregar una unidad');
      plus.dataset.line = i + 1;
      plus.dataset.qty = item.quantity + 1;
      ctl.appendChild(minus);
      ctl.appendChild(el('span', null, String(item.quantity)));
      ctl.appendChild(plus);
      line.appendChild(ctl);
      line.appendChild(el('strong', null, money(item.final_line_price)));
      info.appendChild(line);

      var rm = el('button', 'drawer-remove', 'Quitar');
      rm.type = 'button';
      rm.dataset.line = i + 1;
      rm.dataset.qty = 0;
      info.appendChild(rm);

      row.appendChild(info);
      box.appendChild(row);
    });

    if (total) total.textContent = money(cart.total_price);
    if (foot) foot.hidden = false;
  }

  function changeLine(line, qty) {
    fetchJSON(R.cartChange, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ line: Number(line), quantity: Number(qty) })
    }).then(renderCart).catch(function (err) {
      toast((err && err.description) || 'No se pudo actualizar el carrito.');
    });
  }

  function openDrawer() {
    var d = $('[data-drawer]');
    var o = $('.drawer-overlay');
    if (!d) return;
    getCart().then(renderCart).catch(function () {});
    if (o) o.hidden = false;
    d.classList.add('is-open');
    d.setAttribute('aria-hidden', 'false');
    document.body.classList.add('drawer-open');
    var close = $('[data-drawer-close]', d);
    if (close) close.focus();
  }

  function closeDrawer() {
    var d = $('[data-drawer]');
    var o = $('.drawer-overlay');
    if (!d) return;
    d.classList.remove('is-open');
    d.setAttribute('aria-hidden', 'true');
    if (o) o.hidden = true;
    document.body.classList.remove('drawer-open');
  }

  function addToCart(form) {
    var btn = $('[type=submit]', form);
    if (btn) btn.disabled = true;
    fetchJSON(R.cartAdd, {
      method: 'POST',
      headers: { Accept: 'application/json' },
      body: new FormData(form)
    }).then(getCart).then(function (cart) {
      renderCart(cart);
      openDrawer();
    }).catch(function (err) {
      toast((err && err.description) || 'No se pudo agregar el producto.');
    }).then(function () {
      if (btn) btn.disabled = false;
    });
  }

  /* ---------- Favoritos (solo en este dispositivo) ---------- */
  function getFavs() {
    try {
      var a = JSON.parse(localStorage.getItem(FAV_KEY) || '[]');
      return Array.isArray(a) ? a : [];
    } catch (e) { return []; }
  }
  function setFavs(a) {
    try { localStorage.setItem(FAV_KEY, JSON.stringify(a)); } catch (e) {}
  }
  function syncFavs() {
    var a = getFavs();
    $$('[data-fav]').forEach(function (b) {
      var on = a.indexOf(b.dataset.handle) > -1;
      b.classList.toggle('is-on', on);
      b.setAttribute('aria-pressed', on ? 'true' : 'false');
    });
    $$('[data-fav-count]').forEach(function (c) {
      c.textContent = a.length;
      c.hidden = !a.length;
    });
  }
  function toggleFav(handle) {
    var a = getFavs();
    var i = a.indexOf(handle);
    if (i > -1) a.splice(i, 1); else a.push(handle);
    setFavs(a);
    syncFavs();
    return i === -1;
  }

  function favCard(p) {
    var card = el('article', 'product-card');
    var heart = el('button', 'fav-btn is-on');
    heart.type = 'button';
    heart.dataset.fav = '';
    heart.dataset.handle = p.handle;
    heart.setAttribute('aria-pressed', 'true');
    heart.setAttribute('aria-label', 'Quitar de favoritos');
    heart.innerHTML = '<svg class="icon" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 20s-7.5-4.6-7.5-10.1A4.2 4.2 0 0 1 12 7.4a4.2 4.2 0 0 1 7.5 2.5C19.5 15.4 12 20 12 20Z"/></svg>';
    card.appendChild(heart);

    var link = el('a', 'product-link');
    link.href = p.url;
    var imgBox = el('div', 'product-image');
    if (p.featured_image) {
      var img = el('img');
      img.src = sized(p.featured_image, 800);
      img.alt = p.title;
      img.loading = 'lazy';
      imgBox.appendChild(img);
    }
    link.appendChild(imgBox);
    var meta = el('div', 'product-meta');
    meta.appendChild(el('h3', 'product-title', p.title));
    meta.appendChild(el('div', 'product-price', money(p.price)));
    link.appendChild(meta);
    card.appendChild(link);
    return card;
  }

  function renderFavPage() {
    var grid = $('[data-fav-grid]');
    if (!grid) return;
    var empty = $('[data-fav-empty]');
    var handles = getFavs();
    grid.textContent = '';
    if (empty) empty.hidden = handles.length > 0;
    Promise.all(handles.map(function (h) {
      return fetchJSON(R.products + encodeURIComponent(h) + '.js', { headers: { Accept: 'application/json' } })
        .catch(function () { return null; });
    })).then(function (list) {
      var alive = list.filter(Boolean);
      alive.forEach(function (p) { grid.appendChild(favCard(p)); });
      setFavs(alive.map(function (p) { return p.handle; }));
      if (empty) empty.hidden = alive.length > 0;
      syncFavs();
    });
  }

  /* ---------- Eventos ---------- */
  document.addEventListener('click', function (e) {
    var t = e.target;
    if (!t.closest) return;

    var menu = t.closest('[data-menu]');
    if (menu) {
      var open = document.body.classList.toggle('nav-open');
      menu.setAttribute('aria-expanded', open ? 'true' : 'false');
      return;
    }

    var opener = t.closest('[data-drawer-open]');
    if (opener && !document.body.classList.contains('template-cart')) {
      e.preventDefault();
      openDrawer();
      return;
    }
    if (t.closest('[data-drawer-close]')) {
      closeDrawer();
      return;
    }

    var line = t.closest('[data-line]');
    if (line) {
      changeLine(line.dataset.line, line.dataset.qty);
      return;
    }

    var fav = t.closest('[data-fav]');
    if (fav) {
      e.preventDefault();
      var on = toggleFav(fav.dataset.handle);
      if (!on && fav.closest('[data-fav-grid]')) {
        var card = fav.closest('.product-card');
        if (card) card.remove();
        var empty = $('[data-fav-empty]');
        if (empty) empty.hidden = getFavs().length > 0;
      }
      return;
    }

    var ft = t.closest('[data-filter-toggle]');
    if (ft) {
      var lay = ft.closest('[data-collection-layout]');
      var isOpen = lay.classList.toggle('filters-open');
      ft.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      return;
    }

    if (t.closest('[data-age-yes]')) {
      try { localStorage.setItem(AGE_KEY, '1'); } catch (err) {}
      document.documentElement.classList.remove('age-lock');
    }
  });

  document.addEventListener('submit', function (e) {
    var f = e.target;
    if (f && f.matches && f.matches('form[data-product-form]')) {
      e.preventDefault();
      addToCart(f);
    }
  });

  document.addEventListener('change', function (e) {
    var f = e.target && e.target.form;
    if (f && f.hasAttribute && f.hasAttribute('data-filter-form')) {
      if (f.requestSubmit) f.requestSubmit(); else f.submit();
    }
  });

  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    closeDrawer();
    document.body.classList.remove('nav-open');
  });

  /* Modo discreto */
  function initDiscreet() {
    var btns = $$('[data-discreet]');
    if (!btns.length) return;
    var root = document.documentElement;
    function paint() {
      var on = root.classList.contains('discreet');
      btns.forEach(function (b) {
        b.setAttribute('aria-pressed', on ? 'true' : 'false');
        b.setAttribute('aria-label', on ? 'Desactivar modo discreto' : 'Activar modo discreto');
      });
    }
    btns.forEach(function (b) {
      b.addEventListener('click', function () {
        var on = root.classList.toggle('discreet');
        try { localStorage.setItem('69_discreet', on ? '1' : '0'); } catch (e) {}
        var orig = window.__orig || { title: document.title, icon: '' };
        document.title = on ? 'Notas' : orig.title;
        if (window.__setIcon) window.__setIcon(on ? window.__neutralIcon : orig.icon);
        paint();
        toast(on ? 'Modo discreto activado' : 'Modo discreto desactivado');
      });
    });
    paint();
  }

  /* Encargar producto (opción extra para productos agotados) */
  function openRequest() {
    var box = $('[data-request-box]');
    if (!box) return;
    box.setAttribute('data-open', '');
    box.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
  function initRequest() {
    var t = $('[data-request-toggle]');
    var box = $('[data-request-box]');
    if (!t || !box) return;
    t.addEventListener('click', function () {
      if (box.hasAttribute('data-open')) box.removeAttribute('data-open');
      else openRequest();
    });
    if (box.hasAttribute('data-open')) box.scrollIntoView({ block: 'center' });
  }

  /* Barra de compra fija en celular */
  function initSticky() {
    var bar = $('[data-sticky-buy]');
    var form = $('form[data-product-form]');
    if (!bar || !form || !window.IntersectionObserver) return;
    var btn = $('[data-sticky-btn]', bar);
    function sync() {
      var buy = $('[data-buy]');
      var sold = buy && buy.classList.contains('is-soldout');
      var add = $('[data-add-btn]');
      btn.textContent = sold ? 'Encargar producto' : 'Agregar al carrito';
      var cur = $('[data-price-current]');
      var price = $('[data-sticky-price]', bar);
      if (cur && price) price.textContent = cur.textContent;
    }
    var io = new IntersectionObserver(function (entries) {
      var e = entries[0];
      var show = !e.isIntersecting && e.boundingClientRect.top < 0;
      bar.classList.toggle('is-visible', show);
      document.body.classList.toggle('sticky-on', show);
      sync();
    }, { threshold: 0 });
    io.observe(form);
    btn.addEventListener('click', function () {
      var buy = $('[data-buy]');
      if (buy && buy.classList.contains('is-soldout')) {
        openRequest();
      } else if (form.requestSubmit) {
        form.requestSubmit();
      } else {
        form.submit();
      }
    });
    document.addEventListener('change', sync);
  }

  /* Jugos y recetas */
  function parseAmount(s) {
    s = (s || '').trim().replace(',', '.');
    if (!s) return null;
    var m = s.match(/^(\d+)\s+(\d+)\/(\d+)$/);
    if (m) return +m[1] + (+m[2]) / (+m[3]);
    m = s.match(/^(\d+)\/(\d+)$/);
    if (m) return (+m[1]) / (+m[2]);
    var n = parseFloat(s);
    return isNaN(n) ? null : n;
  }
  function formatAmount(n) {
    if (n >= 10) return String(Math.round(n));
    var steps = [[0, ''], [0.25, '¼'], [1 / 3, '⅓'], [0.5, '½'], [2 / 3, '⅔'], [0.75, '¾'], [1, '']];
    var whole = Math.floor(n + 1e-9), frac = n - whole, best = steps[0];
    steps.forEach(function (s) { if (Math.abs(s[0] - frac) < Math.abs(best[0] - frac)) best = s; });
    if (best[0] === 1) { whole += 1; best = steps[0]; }
    return (whole > 0 ? String(whole) : '') + (best[1] || '') || '0';
  }
  function pluralize(unit, n) {
    if (!unit || n <= 1) return unit;
    if (/(^|\s)(ml|g|kg|l|cc)$/i.test(unit) || unit.length <= 2) return unit;
    if (/[aeiouáéíóú]$/i.test(unit)) return unit + 's';
    return unit + 'es';
  }
  function initJuices() {
    $$('[data-juices]').forEach(function (root) {
      var tabs = $$('[data-juice-tab]', root);
      var panels = $$('[data-juice]', root);
      var BASE = 2;
      function showTab(i) {
        tabs.forEach(function (t, k) { t.setAttribute('aria-selected', k === i ? 'true' : 'false'); t.tabIndex = k === i ? 0 : -1; });
        panels.forEach(function (p, k) { p.hidden = k !== i; });
      }
      tabs.forEach(function (t, i) {
        t.addEventListener('click', function () { showTab(i); });
        t.addEventListener('keydown', function (e) {
          if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
            var n = (i + (e.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length;
            showTab(n); tabs[n].focus();
          }
        });
      });

      panels.forEach(function (panel) {
        var servings = BASE;
        var count = $('[data-serv-count]', panel);
        function render() {
          count.textContent = servings;
          $$('[data-ing]', panel).forEach(function (li) {
            var base = parseAmount(li.dataset.amt);
            var unit = li.dataset.unit || '';
            var name = li.dataset.name || '';
            var text;
            if (base == null) {
              text = [li.dataset.amt, unit, name].filter(Boolean).join(' ');
            } else {
              var n = base * servings / BASE;
              text = [formatAmount(n), pluralize(unit, n), name].filter(Boolean).join(' ');
            }
            $('[data-ing-text]', li).textContent = text.replace(/^\s+/, '');
          });
        }
        $('[data-serv-minus]', panel).addEventListener('click', function () { if (servings > 1) { servings--; render(); } });
        $('[data-serv-plus]', panel).addEventListener('click', function () { if (servings < 8) { servings++; render(); } });
        $('[data-juice-share]', panel).addEventListener('click', function () {
          var lines = $$('[data-ing-text]', panel).map(function (s) { return '• ' + s.textContent; });
          var steps = $$('.juice-steps li', panel).map(function (s, i) { return (i + 1) + '. ' + s.textContent; });
          var text = panel.dataset.title + ' (' + servings + ' porciones)\n\n' + lines.join('\n') + '\n\n' + steps.join('\n') + '\n\n' + window.location.origin;
          if (navigator.share) {
            navigator.share({ title: panel.dataset.title, text: text }).catch(function () {});
          } else {
            window.open('https://wa.me/?text=' + encodeURIComponent(text), '_blank', 'noopener');
          }
        });
        render();
      });
      showTab(0);
    });
  }

  /* Deslizador de inicio */
  function initSliders() {
    $$('[data-slider]').forEach(function (root) {
      var track = $('[data-slider-track]', root);
      var slides = $$('.slide', track);
      var dots = $$('[data-slide-dot]', root);
      if (slides.length < 2) { root.classList.remove('is-playing'); return; }
      var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      var wanted = root.dataset.autoplay === 'true' && !reduceMotion;
      var delay = (parseInt(root.dataset.interval, 10) || 6) * 1000;
      var idx = 0, timer = null, userPaused = false, hoverPaused = false, settleTimer = null;
      root.style.setProperty('--slide-ms', delay + 'ms');

      function mark() {
        slides.forEach(function (s, k) {
          s.classList.toggle('is-active', k === idx);
          s.setAttribute('aria-hidden', k === idx ? 'false' : 'true');
        });
        dots.forEach(function (d, k) {
          d.classList.toggle('is-active', k === idx);
          if (k === idx) d.setAttribute('aria-current', 'true'); else d.removeAttribute('aria-current');
        });
      }
      function go(i, instant) {
        idx = (i + slides.length) % slides.length;
        track.scrollTo({ left: idx * track.clientWidth, behavior: instant || reduceMotion ? 'auto' : 'smooth' });
        mark();
        schedule();
      }
      function playing() { return wanted && !userPaused && !hoverPaused && !document.hidden; }
      function schedule() {
        clearTimeout(timer);
        root.classList.toggle('is-playing', playing());
        if (playing()) timer = setTimeout(function () { go(idx + 1); }, delay);
      }

      track.addEventListener('scroll', function () {
        clearTimeout(settleTimer);
        settleTimer = setTimeout(function () {
          var i = Math.round(track.scrollLeft / (track.clientWidth || 1));
          if (i !== idx && i >= 0 && i < slides.length) { idx = i; mark(); schedule(); }
        }, 90);
      }, { passive: true });

      root.addEventListener('click', function (e) {
        var t = e.target.closest ? e.target : null;
        if (!t) return;
        var dot = t.closest('[data-slide-dot]');
        if (dot) { go(dots.indexOf(dot)); return; }
        if (t.closest('[data-slide-next]')) { go(idx + 1); return; }
        if (t.closest('[data-slide-prev]')) { go(idx - 1); return; }
        var tg = t.closest('[data-slide-toggle]');
        if (tg) {
          userPaused = !userPaused;
          wanted = wanted || !userPaused;
          tg.setAttribute('aria-label', userPaused ? 'Reanudar presentación' : 'Pausar presentación');
          schedule();
        }
      });
      root.addEventListener('mouseenter', function () { hoverPaused = true; schedule(); });
      root.addEventListener('mouseleave', function () { hoverPaused = false; schedule(); });
      root.addEventListener('focusin', function () { hoverPaused = true; schedule(); });
      root.addEventListener('focusout', function () { hoverPaused = false; schedule(); });
      root.addEventListener('touchstart', function () { hoverPaused = true; clearTimeout(timer); }, { passive: true });
      root.addEventListener('touchend', function () { setTimeout(function () { hoverPaused = false; schedule(); }, 2500); }, { passive: true });
      document.addEventListener('visibilitychange', schedule);
      window.addEventListener('resize', function () { go(idx, true); });
      mark();
      schedule();
    });
  }

  /* Opciones del producto (tallas, tamaños, colores) */
  function initOptions() {
    var wrap = $('[data-options]');
    var dataEl = $('[data-variants]');
    if (!wrap || !dataEl) return;
    var variants;
    try { variants = JSON.parse(dataEl.textContent); } catch (err) { return; }
    var groups = $$('[data-option]', wrap);

    function selection() {
      return groups.map(function (g) {
        var c = $('input:checked', g);
        return c ? c.value : null;
      });
    }
    function matches(v, sel) {
      var vals = [v.option1, v.option2, v.option3];
      return sel.every(function (x, i) { return x === vals[i]; });
    }
    function refresh() {
      var sel = selection();
      groups.forEach(function (g, gi) {
        $$('.size-chip', g).forEach(function (chip) {
          var test = sel.slice();
          test[gi] = $('input', chip).value;
          var ok = variants.some(function (x) { return matches(x, test) && x.available; });
          chip.classList.toggle('is-soldout', !ok);
        });
      });
      var v = variants.filter(function (x) { return matches(x, sel); })[0];
      if (!v) return;
      var idInput = $('[data-variant-id]');
      if (idInput) idInput.value = v.id;
      var cur = $('[data-price-current]');
      if (cur) cur.textContent = money(v.price);
      var cmp = $('[data-price-compare]');
      var hasCompare = v.compare_at_price && v.compare_at_price > v.price;
      if (cmp) {
        cmp.textContent = hasCompare ? money(v.compare_at_price) : '';
        cmp.hidden = !hasCompare;
      }
      var buy = $('[data-buy]');
      if (buy) buy.classList.toggle('is-soldout', !v.available);
      var addBtn = $('[data-add-btn]');
      if (addBtn) {
        addBtn.disabled = !v.available;
        addBtn.textContent = v.available ? 'Agregar al carrito' : 'Agotado';
      }
      var vf = $('[data-request-variant]');
      if (vf) vf.value = v.title || '';
      var wa = $('[data-request-wa]');
      if (wa && wa.dataset.base) {
        wa.href = wa.dataset.base + '?text=' + encodeURIComponent((wa.dataset.text || '').replace('__VARIANTE__', v.title || ''));
      }
      if (window.history && window.history.replaceState) {
        try { window.history.replaceState(null, '', '?variant=' + v.id); } catch (err) {}
      }
    }
    wrap.addEventListener('change', refresh);
    refresh();
  }

  /* Header: el logo grande se compacta al bajar */
  var hdr = $('.site-header');
  var ticking = false;
  function compact() {
    if (hdr) hdr.classList.toggle('is-compact', window.scrollY > 40);
    ticking = false;
  }
  window.addEventListener('scroll', function () {
    if (!ticking) {
      ticking = true;
      window.requestAnimationFrame(compact);
    }
  }, { passive: true });
  compact();

  initDiscreet();
  initSticky();
  initRequest();
  initSliders();
  initJuices();
  initOptions();
  syncFavs();
  renderFavPage();
})();
