/* =============================================================
   Quick actions: command palette, gallery lightbox, print-to-PDF
   and privacy-friendly visit counting. Loaded at the end of the
   document; every block bails out quietly if its markup is absent.
   ============================================================= */
(function initQuickActions() {
  'use strict';

  /* ------------------------------------------------------------
     CONFIG — the only two things you may ever need to edit.
     ------------------------------------------------------------
     goatcounter : your GoatCounter subdomain, e.g. 'mohimohiuddin'
                   (leave '' to send no analytics at all)
     views       : the public "N views" badge. Uses Abacus, a free
                   counter with no account, so the badge works the
                   moment the site is online.
     ------------------------------------------------------------ */
  var CONFIG = {
    goatcounter: '',
    views: {
      enabled: true,
      namespace: 'mddmohiuddin.github.io',
      key: 'portfolio',
    },
  };

  var isLocal = /^(localhost|127\.0\.0\.1|0\.0\.0\.0|\[::1\])$/.test(location.hostname);
  var $ = function (sel, root) { return (root || document).querySelector(sel); };

  /* ============================================================
     1. Visit counter + badge
     ============================================================ */
  (function views() {
    var badge = $('#views-badge');
    var countEl = $('#views-count');
    var wordEl = $('#views-word');
    if (!badge || !countEl || !CONFIG.views.enabled) return;

    // Localhost burns a throwaway key so testing never inflates the real number.
    var key = isLocal ? CONFIG.views.key + '-preview' : CONFIG.views.key;
    var url = 'https://abacus.jasoncameron.dev';

    var day = new Date().toISOString().slice(0, 10);
    var dayKey = 'mohi-views-' + key + '-' + day;
    var alreadyHit = false;
    try { alreadyHit = localStorage.getItem(dayKey) === '1'; } catch (e) {}

    // One hit per browser per day; every other load only reads the value.
    var endpoint = alreadyHit ? '/get/' : '/hit/';

    fetch(url + endpoint + CONFIG.views.namespace + '/' + key, { mode: 'cors' })
      .then(function (res) { return res.ok ? res.json() : Promise.reject(new Error('HTTP ' + res.status)); })
      .then(function (data) {
        var value = Number(data && data.value);
        if (!isFinite(value) || value < 0) throw new Error('bad payload');
        countEl.textContent = value.toLocaleString('en-US');
        if (wordEl) wordEl.textContent = value === 1 ? 'view' : 'views';
        badge.hidden = false;
        if (endpoint === '/hit/') {
          try { localStorage.setItem(dayKey, '1'); } catch (e) {}
        }
      })
      .catch(function () {
        // Counter unreachable → stay silent rather than show a fake number.
        badge.hidden = true;
      });
  })();

  /* ============================================================
     2. GoatCounter analytics (optional, privacy-friendly, cookieless)
     ============================================================ */
  (function analytics() {
    if (!CONFIG.goatcounter) return;
    var s = document.createElement('script');
    s.async = true;
    s.dataset.goatcounter = 'https://' + CONFIG.goatcounter + '.goatcounter.com/count';
    s.src = 'https://gc.zgo.at/count.js';
    document.body.appendChild(s);
  })();

  /* ============================================================
     3. Command palette (Ctrl / Cmd + K)
     ============================================================ */
  (function palette() {
    var dlg = $('#palette');
    var input = $('#palette-input');
    var list = $('#palette-list');
    if (!dlg || !input || !list) return;

    var icon = function (name) {
      return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" ' +
        'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#i-' + name + '"/></svg>';
    };

    function go(hash) {
      var el = document.querySelector(hash);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      if (history.replaceState) history.replaceState(null, '', hash);
    }

    function copyEmail() {
      var email = 'mddmohiuddin2000@gmail.com';
      var done = function () { toast('Email copied — ' + email); };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(email).then(done).catch(function () { location.href = 'mailto:' + email; });
      } else {
        location.href = 'mailto:' + email;
      }
    }

    var ACTIONS = [
      /* Sections */
      { g: 'Sections', t: 'About', i: 'user-check', k: 'intro hero home', run: function () { go('#about'); } },
      { g: 'Sections', t: 'Research Experiences', i: 'microscope', k: 'thesis teng lab', run: function () { go('#research'); } },
      { g: 'Sections', t: 'Education', i: 'graduation-cap', k: 'bsc hsc ssc degree', run: function () { go('#education'); } },
      { g: 'Sections', t: 'Skills', i: 'sliders', k: 'software tools programming', run: function () { go('#skills'); } },
      { g: 'Sections', t: 'Academic Projects', i: 'folder-code', k: 'hardware robotics', run: function () { go('#projects'); } },
      { g: 'Sections', t: 'Industrial Experience', i: 'factory', k: 'internship training', run: function () { go('#experience'); } },
      { g: 'Sections', t: 'Awards & Certifications', i: 'trophy', k: 'scholarship medal', run: function () { go('#awards'); } },
      { g: 'Sections', t: 'References', i: 'users', k: 'professors', run: function () { go('#references'); } },
      { g: 'Sections', t: 'Photo Gallery', i: 'images', k: 'photos album slideshow', run: function () { go('#gallery'); } },
      { g: 'Sections', t: 'Contact', i: 'mail', k: 'email reach message', run: function () { go('#contact'); } },

      /* Actions */
      { g: 'Actions', t: 'Copy email address', i: 'copy', k: 'clipboard mail', hint: 'mddmohiuddin2000@gmail.com', run: copyEmail },
      { g: 'Actions', t: 'Open academic CV (PDF)', i: 'graduation-cap', k: 'resume cv research thesis download', hint: 'PDF', run: function () { window.open('assets/Academic-CV-Mohi.pdf', '_blank', 'noopener'); } },
      { g: 'Actions', t: 'Open professional CV (PDF)', i: 'briefcase', k: 'resume cv ats job download', hint: 'PDF', run: function () { window.open('assets/Professional-CV-Mohi.pdf', '_blank', 'noopener'); } },
      { g: 'Actions', t: 'Print / save this page as PDF', i: 'printer', k: 'cv resume print', hint: 'Ctrl P', run: function () { window.print(); } },
      { g: 'Actions', t: 'Toggle light / dark theme', i: 'sun', k: 'appearance mode night', run: function () { var b = $('#theme-toggle'); if (b) b.click(); } },
      { g: 'Actions', t: 'Message on WhatsApp', i: 'message-circle', k: 'chat phone contact', hint: '+880 1516-505371', run: function () { window.open('https://wa.me/8801516505371', '_blank', 'noopener'); } },
      { g: 'Actions', t: 'Open LinkedIn profile', i: 'linkedin', k: 'network job', run: function () { window.open('https://linkedin.com/in/md-mohi-uddin-chowdhury-0a0107234', '_blank', 'noopener'); } },
      { g: 'Actions', t: 'Open the CESI Lab website', i: 'external-link', k: 'research lab', run: function () { window.open('https://www.cesilab.org/', '_blank', 'noopener'); } },
      { g: 'Actions', t: 'Open the Google Photos album', i: 'images', k: 'gallery photos', run: function () { window.open('https://photos.app.goo.gl/yH8CZFdgC3h5Sxw69', '_blank', 'noopener'); } },
    ];

    var filtered = [];
    var active = 0;

    function toast(message) {
      var el = document.createElement('div');
      el.textContent = message;
      el.setAttribute('role', 'status');
      el.style.cssText = 'position:fixed;left:50%;bottom:1.5rem;transform:translateX(-50%);z-index:120;' +
        'padding:.55rem .9rem;border-radius:.6rem;font-size:.75rem;font-weight:600;' +
        'background:rgb(var(--sky-600));color:#fff;box-shadow:0 10px 30px -12px rgba(2,6,23,.8)';
      document.body.appendChild(el);
      setTimeout(function () { el.remove(); }, 2200);
    }

    function render() {
      var q = input.value.trim().toLowerCase();
      filtered = ACTIONS.filter(function (a) {
        if (!q) return true;
        return (a.t + ' ' + (a.k || '') + ' ' + a.g).toLowerCase().indexOf(q) !== -1;
      });
      if (active >= filtered.length) active = Math.max(0, filtered.length - 1);

      if (!filtered.length) {
        list.innerHTML = '<div class="palette-empty">No action matches “' + input.value.replace(/[<>&]/g, '') + '”.</div>';
        input.removeAttribute('aria-activedescendant');
        return;
      }

      var html = '';
      var group = '';
      filtered.forEach(function (a, index) {
        if (a.g !== group) {
          group = a.g;
          html += '<div class="palette-group" role="presentation">' + group + '</div>';
        }
        html += '<button type="button" role="option" id="pal-' + index + '" data-index="' + index + '" ' +
          'aria-selected="' + (index === active) + '" class="palette-item">' +
          icon(a.i) + '<span>' + a.t + '</span>' +
          (a.hint ? '<span class="palette-hint">' + a.hint + '</span>' : '') +
          '</button>';
      });
      list.innerHTML = html;
      input.setAttribute('aria-activedescendant', 'pal-' + active);

      var sel = list.querySelector('[aria-selected="true"]');
      if (sel) sel.scrollIntoView({ block: 'nearest' });
    }

    function run(index) {
      var action = filtered[index];
      if (!action) return;
      dlg.close();
      // Let the dialog close before doing anything that moves focus.
      setTimeout(function () { action.run(); }, 0);
    }

    function open() {
      if (dlg.open) return;
      input.value = '';
      active = 0;
      render();
      dlg.showModal();
      input.focus();
    }

    input.addEventListener('input', function () { active = 0; render(); });

    input.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (filtered.length) { active = (active + 1) % filtered.length; render(); }
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (filtered.length) { active = (active - 1 + filtered.length) % filtered.length; render(); }
      } else if (e.key === 'Enter') {
        e.preventDefault();
        run(active);
      } else if (e.key === 'Home') {
        active = 0; render();
      } else if (e.key === 'End') {
        active = filtered.length - 1; render();
      }
    });

    list.addEventListener('click', function (e) {
      var btn = e.target.closest('.palette-item');
      if (btn) run(Number(btn.dataset.index));
    });

    list.addEventListener('mousemove', function (e) {
      var btn = e.target.closest('.palette-item');
      if (!btn) return;
      var index = Number(btn.dataset.index);
      if (index === active) return;
      active = index;
      list.querySelectorAll('.palette-item').forEach(function (el) {
        el.setAttribute('aria-selected', String(Number(el.dataset.index) === active));
      });
      input.setAttribute('aria-activedescendant', 'pal-' + active);
    });

    // Clicking the dimmed backdrop closes the dialog.
    dlg.addEventListener('click', function (e) { if (e.target === dlg) dlg.close(); });

    document.addEventListener('keydown', function (e) {
      var isK = (e.key === 'k' || e.key === 'K');
      // ignore the shortcut while the visitor is typing in a form field
      var el = e.target;
      var typing = el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.isContentEditable);
      if (typing && !(e.metaKey || e.ctrlKey)) return;
      if (isK && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        if (dlg.open) dlg.close(); else open();
      }
    });
  })();

  /* ============================================================
     4. Gallery lightbox
     ============================================================ */
  (function lightbox() {
    var dlg = $('#lightbox');
    var img = $('#lightbox-img');
    var counter = $('#lightbox-counter');
    var prev = $('#lightbox-prev');
    var next = $('#lightbox-next');
    var close = $('#lightbox-close');
    if (!dlg || !img) return;

    var photos = [];
    var at = 0;

    function collect() {
      var seen = {};
      photos = [];
      document.querySelectorAll('#gallery-track a[data-lightbox]').forEach(function (a) {
        var index = a.dataset.lightbox;
        if (seen[index]) return;
        seen[index] = true;
        photos[Number(index)] = a.getAttribute('href');
      });
      photos = photos.filter(Boolean);
    }

    function show(index) {
      if (!photos.length) return;
      at = (index + photos.length) % photos.length;
      img.src = photos[at];
      img.alt = 'Portfolio photo ' + (at + 1) + ' of ' + photos.length;
      if (counter) counter.textContent = (at + 1) + ' / ' + photos.length;
    }

    function open(index) {
      collect();
      if (!photos.length) return;
      show(index);
      if (!dlg.open) dlg.showModal();
    }

    document.addEventListener('click', function (e) {
      var anchor = e.target.closest('#gallery-track a[data-lightbox]');
      if (!anchor || e.metaKey || e.ctrlKey || e.shiftKey || e.button === 1) return;
      e.preventDefault();
      open(Number(anchor.dataset.lightbox) || 0);
    });

    document.addEventListener('keydown', function (e) {
      if (!dlg.open) return;
      if (e.key === 'ArrowRight') { e.preventDefault(); show(at + 1); }
      else if (e.key === 'ArrowLeft') { e.preventDefault(); show(at - 1); }
    });

    if (prev) prev.addEventListener('click', function () { show(at - 1); });
    if (next) next.addEventListener('click', function () { show(at + 1); });
    if (close) close.addEventListener('click', function () { dlg.close(); });
    dlg.addEventListener('click', function (e) { if (e.target === dlg) dlg.close(); });
    dlg.addEventListener('close', function () { img.src = ''; });
  })();

  /* ============================================================
     5. CV chooser (hero tile -> academic or professional CV)
     ============================================================ */
  (function cvChooser() {
    var dlg = $('#cv-menu');
    var tile = $('#cv-tile');
    if (!dlg || !tile) return;

    function open() {
      if (dlg.open) return;
      dlg.showModal();
      var first = dlg.querySelector('.cv-option');
      if (first) first.focus();
    }

    tile.addEventListener('click', open);

    var closeBtn = $('#cv-menu-close');
    if (closeBtn) closeBtn.addEventListener('click', function () { dlg.close(); });

    // A backdrop click closes the menu.
    dlg.addEventListener('click', function (e) {
      if (e.target === dlg) { dlg.close(); return; }
      // Choosing a version closes the menu; the anchor handles the new tab.
      if (e.target.closest('.cv-option')) setTimeout(function () { dlg.close(); }, 0);
    });

    // Enter/Space already trigger the button; make Esc explicit for older browsers.
    dlg.addEventListener('cancel', function () { dlg.close(); });
  })();

  /* ============================================================
     5. Print / save as PDF
     ============================================================ */
  (function printButton() {
    var btn = $('#print-cv');
    if (btn) btn.addEventListener('click', function () { window.print(); });
  })();
})();
