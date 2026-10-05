/* Guía 69 — cada opción lleva directo a su sección (esquina inferior izquierda).
   Para cambiar opciones o destinos, edita el objeto TREE.
   Destinos: ['c', 'handle'] colección · ['p', 'handle'] página · ['h', 'ancla'] sección del inicio.
   Nada se guarda: la conversación vive solo en memoria. */
(function () {
  'use strict';

  var root = document.querySelector('[data-advisor]');
  if (!root) return;

  var COL = root.getAttribute('data-collections') || '/collections';
  var HOME = root.getAttribute('data-root') || '/';
  var WA = root.getAttribute('data-wa') || '';
  var WA_MSG = root.getAttribute('data-wa-msg') || 'Hola, quisiera asesoría.';
  var EXISTING = (root.getAttribute('data-existing') || '').split(',').filter(Boolean);
  var PREVIEW = COL === '#';
  var launch = root.querySelector('[data-adv-open]');
  var panel = root.querySelector('.advisor-panel');
  var log = root.querySelector('[data-adv-log]');
  var opts = root.querySelector('[data-adv-opts]');
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var TREE = {
    root: {
      q: 'Hola, soy la guía 69. Elige una opción y te llevo directo a esa sección.',
      o: [
        { t: 'Es mi primera vez', to: 'Primera vez', go: ['c', 'primera-vez'] },
        { t: 'Busco algo para ella', to: 'Para ella', go: ['c', 'para-ella'] },
        { t: 'Busco algo para él', to: 'Para él', go: ['c', 'para-el'] },
        { t: 'Quiero algo para los dos', to: 'Parejas', go: ['c', 'parejas'] },
        { t: 'Quiero hacer un regalo', to: 'los combos 69', go: ['c', 'combos'] },
        { t: 'Busco lencería', to: 'Lencería', go: ['c', 'lenceria'] },
        { t: 'Necesito un lubricante', to: 'Lubricantes', go: ['c', 'lubricantes'] },
        { t: 'Busco estimulación', to: 'Estimulación', go: ['c', 'estimulacion'] },
        { t: 'Solo estoy mirando', to: 'lo más deseado', go: ['c', 'mas-deseados'] },
        { t: 'Tengo una duda', next: 'help' }
      ]
    },
    help: {
      q: 'Claro. ¿Qué quieres saber?',
      o: [
        { t: 'Envío y privacidad', to: 'Envíos', go: ['p', 'envios'] },
        { t: 'Cambios y devoluciones', to: 'Retracto y devoluciones', go: ['p', 'retracto-y-devoluciones'] },
        { t: 'Preguntas frecuentes', to: 'Preguntas frecuentes', go: ['h', 'preguntas'] },
        { t: 'Hablar con una persona', wa: true }
      ]
    }
  };

  var stack = [];
  var path = [];
  var run = 0;

  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }
  function scroll() { log.scrollTop = log.scrollHeight; }
  function clearOpts() { opts.textContent = ''; }
  function settle() {
    scroll();
    if (window.requestAnimationFrame) window.requestAnimationFrame(scroll);
  }

  function bot(text, quick) {
    return new Promise(function (resolve) {
      var m = el('div', 'adv-msg adv-bot');
      var dots = el('span', 'adv-typing');
      dots.appendChild(el('i'));
      dots.appendChild(el('i'));
      dots.appendChild(el('i'));
      m.appendChild(dots);
      log.appendChild(m);
      scroll();
      var wait = reduce ? 0 : (quick ? 160 : 350 + Math.min(text.length * 7, 450));
      setTimeout(function () {
        m.textContent = text;
        scroll();
        resolve();
      }, wait);
    });
  }

  function me(text) {
    log.appendChild(el('div', 'adv-msg adv-me', text));
    scroll();
  }

  function choice(label, fn, cls) {
    var b = el('button', 'adv-opt' + (cls ? ' ' + cls : ''), label);
    b.type = 'button';
    b.addEventListener('click', fn);
    return b;
  }

  function collectionUrl(handle) {
    if (EXISTING.length && EXISTING.indexOf(handle) === -1) return COL + '/all';
    return COL + '/' + handle;
  }

  function targetUrl(t) {
    if (t[0] === 'c') return collectionUrl(t[1]);
    if (t[0] === 'h') return HOME === '#' ? '#' + t[1] : HOME + '#' + t[1];
    return HOME + 'pages/' + t[1];
  }

  function waUrl() {
    var text = WA_MSG + (path.length ? ' (Mi recorrido en la guía: ' + path.join(' › ') + ')' : '');
    return 'https://wa.me/' + WA + '?text=' + encodeURIComponent(text);
  }

  function renderEnd() {
    clearOpts();
    var row = el('div', 'adv-row');
    row.appendChild(choice('Menú principal', menu, 'adv-ghost--strong'));
    opts.appendChild(row);
    var first = opts.querySelector('button');
    if (first && root.classList.contains('is-open')) first.focus({ preventScroll: true });
    settle();
  }

  function renderChoices(node) {
    clearOpts();
    node.o.forEach(function (o) {
      opts.appendChild(choice(o.t, function () { pick(o); }));
    });
    if (stack.length > 1) {
      var row = el('div', 'adv-row');
      row.appendChild(choice('Atrás', back, 'adv-ghost'));
      row.appendChild(choice('Menú principal', menu, 'adv-ghost'));
      opts.appendChild(row);
    }
    var first = opts.querySelector('button');
    if (first && root.classList.contains('is-open')) first.focus({ preventScroll: true });
    settle();
  }

  function pick(o) {
    me(o.t);
    path.push(o.t);
    if (o.next) { show(o.next); return; }
    if (o.wa) { openWhatsApp(); return; }
    go(o);
  }

  /* Navega directo al destino de la opción */
  function go(o) {
    var my = ++run;
    clearOpts();
    var url = targetUrl(o.go);
    if (PREVIEW) {
      bot('(Vista previa) Aquí te llevaría a «' + o.to + '». En la tienda real se abre esa sección.', true)
        .then(function () { if (my === run) renderEnd(); });
      return;
    }
    bot('Te llevo a ' + o.to + '…', true).then(function () {
      if (my !== run) return;
      if (o.go[0] === 'h') close();
      window.location.href = url;
    });
  }

  function openWhatsApp() {
    var my = ++run;
    clearOpts();
    if (PREVIEW) {
      bot('(Vista previa) Aquí se abriría WhatsApp con tu recorrido ya escrito.', true)
        .then(function () { if (my === run) renderEnd(); });
      return;
    }
    if (WA) {
      window.open(waUrl(), '_blank', 'noopener');
      bot('Te abrí WhatsApp. Una persona del equipo te responde en privado.', true)
        .then(function () { if (my === run) renderEnd(); });
    } else {
      bot('Te llevo a la página de contacto…', true).then(function () {
        if (my === run) window.location.href = HOME + 'pages/contacto';
      });
    }
  }

  function back() {
    if (stack.length < 2) return;
    stack.pop();
    var prev = stack.pop();
    path.pop();
    me('Atrás');
    show(prev);
  }

  function menu() {
    run++;
    log.textContent = '';
    clearOpts();
    stack = [];
    path = [];
    show('root');
  }

  function show(id) {
    var node = TREE[id];
    if (!node) return;
    var my = ++run;
    clearOpts();
    stack.push(id);
    bot(node.q).then(function () {
      if (my === run) renderChoices(node);
    });
  }

  function open() {
    root.classList.add('is-open');
    panel.hidden = false;
    launch.setAttribute('aria-expanded', 'true');
    if (!stack.length) show('root');
  }

  function close() {
    root.classList.remove('is-open');
    panel.hidden = true;
    launch.setAttribute('aria-expanded', 'false');
    launch.focus({ preventScroll: true });
  }

  launch.addEventListener('click', open);
  root.querySelector('[data-adv-close]').addEventListener('click', close);
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && root.classList.contains('is-open')) close();
  });
  /* Cualquier enlace con href="#guia" abre la guía (por ejemplo, «No estoy seguro» del buscador) */
  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a[href="#guia"]');
    if (a) {
      e.preventDefault();
      open();
    }
  });
})();
