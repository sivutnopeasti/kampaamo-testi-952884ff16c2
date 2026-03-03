/* ================================================
   KAMPAAMO TESTI – MAIN.JS
   ================================================ */

'use strict';

/* ================================================
   HAMBURGER MENU
   ================================================ */
(function initHamburger() {
  const hamburger = document.getElementById('hamburger');
  const navMenu   = document.getElementById('nav-menu');

  if (!hamburger || !navMenu) return;

  let overlay = null;

  function openMenu() {
    navMenu.classList.add('open');
    hamburger.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';

    overlay = document.createElement('div');
    overlay.setAttribute('aria-hidden', 'true');
    overlay.style.cssText =
      'position:fixed;inset:0;background:rgba(0,0,0,0.5);z-index:1040;';
    overlay.addEventListener('click', closeMenu);
    document.body.appendChild(overlay);
  }

  function closeMenu() {
    navMenu.classList.remove('open');
    hamburger.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';

    if (overlay && overlay.parentNode) {
      overlay.parentNode.removeChild(overlay);
      overlay = null;
    }
  }

  hamburger.addEventListener('click', function () {
    navMenu.classList.contains('open') ? closeMenu() : openMenu();
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && navMenu.classList.contains('open')) {
      closeMenu();
      hamburger.focus();
    }
  });

  navMenu.querySelectorAll('a').forEach(function (link) {
    link.addEventListener('click', function () {
      if (navMenu.classList.contains('open')) closeMenu();
    });
  });
})();


/* ================================================
   SMOOTH SCROLL
   ================================================ */
(function initSmoothScroll() {
  const header = document.querySelector('.site-header');

  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (!targetId || targetId === '#') return;

      const target = document.querySelector(targetId);
      if (!target) return;

      e.preventDefault();

      const headerHeight = header ? header.offsetHeight : 0;
      const targetTop =
        target.getBoundingClientRect().top + window.scrollY - headerHeight - 16;

      window.scrollTo({ top: targetTop, behavior: 'smooth' });

      target.setAttribute('tabindex', '-1');
      target.focus({ preventScroll: true });
    });
  });
})();


/* ================================================
   STICKY HEADER VARJO
   ================================================ */
(function initStickyHeader() {
  const header = document.querySelector('.site-header');
  if (!header) return;

  let ticking = false;

  window.addEventListener('scroll', function () {
    if (ticking) return;
    ticking = true;

    window.requestAnimationFrame(function () {
      header.style.boxShadow = window.scrollY > 40
        ? '0 4px 24px rgba(27,63,114,0.40)'
        : '0 2px 16px rgba(27,63,114,0.25)';
      ticking = false;
    });
  });
})();


/* ================================================
   SCROLL ANIMAATIOT
   ================================================ */
(function initScrollAnimations() {
  const selectors = [
    '.benefit-item',
    '.service-card',
    '.masonry-card',
    '.package-card',
    '.about-content',
    '.about-visual',
    '.hours-content',
    '.hours-cta',
    '.contact-info',
    '.contact-form-wrap',
    '.logo-bar-item',
    '.section-header'
  ].join(', ');

  const targets = document.querySelectorAll(selectors);
  if (!targets.length) return;

  const prefersReduced =
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Lisää data-animate ja porrastettu viive
  targets.forEach(function (el, index) {
    el.setAttribute('data-animate', '');

    // Laske viive saman vanhemman lapsille (max 4 per ryhmä)
    const siblings = el.parentElement
      ? Array.from(el.parentElement.children).filter(function (c) {
          return c.hasAttribute('data-animate') || selectors.split(', ').some(function (s) {
            return c.matches(s);
          });
        })
      : [];
    const siblingIndex = siblings.indexOf(el);
    const delay = Math.min(siblingIndex, 3) * 90;
    el.style.transitionDelay = delay + 'ms';
  });

  // Näytä kaikki heti jos reduced motion
  if (prefersReduced) {
    targets.forEach(function (el) {
      el.classList.add('visible');
    });
    return;
  }

  const observer = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1, rootMargin: '0px 0px -48px 0px' }
  );

  targets.forEach(function (el) {
    observer.observe(el);
  });
})();


/* ================================================
   HERO PARALLAX (kevyt, vain desktop)
   ================================================ */
(function initParallax() {
  const prefersReduced =
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReduced) return;

  // Ei parallaxia mobiililla
  const mq = window.matchMedia('(max-width: 768px)');
  if (mq.matches) return;

  const shapes = document.querySelectorAll('.shape');
  if (!shapes.length) return;

  const speeds = [0.04, 0.07, 0.05];
  let ticking = false;

  window.addEventListener('scroll', function () {
    if (ticking) return;
    ticking = true;

    window.requestAnimationFrame(function () {
      const scrollY = window.scrollY;
      shapes.forEach(function (shape, i) {
        shape.style.transform =
          'translateY(' + (scrollY * (speeds[i] || 0.05)).toFixed(2) + 'px)';
      });
      ticking = false;
    });
  });
})();


/* ================================================
   YHTEYDENOTTOLOMAKE
   ================================================ */
(function initContactForm() {
  const form      = document.getElementById('contact-form');
  if (!form) return;

  const submitBtn  = document.getElementById('submit-btn');
  const btnText    = submitBtn ? submitBtn.querySelector('.btn-text')    : null;
  const btnLoading = submitBtn ? submitBtn.querySelector('.btn-loading') : null;
  const statusEl   = document.getElementById('form-status');

  /* --- Apufunktiot --- */
  function showStatus(message, type) {
    if (!statusEl) return;
    statusEl.textContent = message;
    statusEl.className   = 'form-status ' + type;
    statusEl.hidden      = false;
    statusEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  function clearStatus() {
    if (!statusEl) return;
    statusEl.hidden    = true;
    statusEl.className = 'form-status';
    statusEl.textContent = '';
  }

  function setLoading(isLoading) {
    if (!submitBtn) return;
    submitBtn.disabled = isLoading;
    if (btnText)    btnText.hidden    = isLoading;
    if (btnLoading) btnLoading.hidden = !isLoading;
  }

  function setFieldError(field, hasError) {
    if (hasError) {
      field.setAttribute('aria-invalid', 'true');
    } else {
      field.removeAttribute('aria-invalid');
    }
  }

  /* --- Reaaliaikainen validointi blur-tapahtumassa --- */
  form.querySelectorAll('input[required], textarea[required]').forEach(function (field) {
    field.addEventListener('blur', function () {
      setFieldError(field, field.required && !field.value.trim());
    });

    field.addEventListener('input', function () {
      if (field.value.trim()) setFieldError(field, false);
    });
  });

  /* --- Lomakkeen lähetys --- */
  form.addEventListener('submit', async function (e) {
    e.preventDefault();
    clearStatus();

    // Paikalliset kentät
    const nameField    = form.querySelector('#name');
    const phoneField   = form.querySelector('#phone');
    const messageField = form.querySelector('#message');

    let hasError = false;

    [nameField, phoneField, messageField].forEach(function (field) {
      if (!field) return;
      if (!field.value.trim()) {
        setFieldError(field, true);
        hasError = true;
      }
    });

    if (hasError) {
      showStatus('Täytä vähintään nimi, puhelin ja viesti.', 'error');
      // Fokus ensimmäiseen virhekenttään
      const firstInvalid = form.querySelector('[aria-invalid="true"]');
      if (firstInvalid) firstInvalid.focus();
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData(form);
      const response = await fetch(form.action, {
        method:  'POST',
        body:    formData,
        headers: { Accept: 'application/json' }
      });

      if (response.ok) {
        showStatus(
          'Viesti lähetetty. Otamme yhteyttä pian.',
          'success'
        );
        form.reset();
        // Poista mahdolliset aria-invalid -attribuutit resetin jälkeen
        form.querySelectorAll('[aria-invalid]').forEach(function (f) {
          f.removeAttribute('aria-invalid');
        });
      } else {
        let errorMsg = 'Viestin lähetys epäonnistui. Soita meille: 045 787 36248.';
        try {
          const data = await response.json();
          if (data && Array.isArray(data.errors) && data.errors.length) {
            errorMsg = data.errors.map(function (err) {
              return err.message;
            }).join(' ');
          }
        } catch (_) {
          // JSON-parsinta epäonnistui, käytä oletusvirheviestiä
        }
        showStatus(errorMsg, 'error');
      }
    } catch (networkErr) {
      showStatus(
        'Verkkovirhe – tarkista yhteys tai soita: 045 787 36248.',
        'error'
      );
    } finally {
      setLoading(false);
    }
  });
})();


/* ================================================
   MASONRY-KORTIT – KEYBOARD NAVIGATION
   ================================================ */
(function initGalleryKeyboard() {
  document.querySelectorAll('.masonry-card').forEach(function (card) {
    // Tee kortit fokusoitaviksi näppäimistöllä
    if (!card.getAttribute('tabindex')) {
      card.setAttribute('tabindex', '0');
    }

    card.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        card.classList.toggle('focused');
        const overlay = card.querySelector('.masonry-overlay');
        if (overlay) {
          const isVisible = overlay.style.opacity === '1';
          overlay.style.opacity = isVisible ? '0' : '1';
        }
      }
    });
  });
})();


/* ================================================
   ACTIVE NAV LINK – scroll spy
   ================================================ */
(function initScrollSpy() {
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-links a[href^="#"]');

  if (!sections.length || !navLinks.length) return;

  const header = document.querySelector('.site-header');

  function getHeaderHeight() {
    return header ? header.offsetHeight : 0;
  }

  function onScroll() {
    const scrollY = window.scrollY + getHeaderHeight() + 32;
    let current  = '';

    sections.forEach(function (section) {
      if (section.offsetTop <= scrollY) {
        current = section.getAttribute('id');
      }
    });

    navLinks.forEach(function (link) {
      link.classList.remove('active');
      const href = link.getAttribute('href');
      if (href === '#' + current) {
        link.classList.add('active');
      }
    });
  }

  let ticking = false;
  window.addEventListener('scroll', function () {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(function () {
      onScroll();
      ticking = false;
    });
  });

  // Aja kerran sivulatauksen yhteydessä
  onScroll();
})();