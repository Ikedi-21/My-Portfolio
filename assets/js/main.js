/**
 * OGBONNE IKEDINACHI | PORTFOLIO JAVASCRIPT
 * Single shared script for all pages.
 */

(function () {
  'use strict';

  /* ==========================================================
     1. FIRST-VISIT SESSION LOADER
     Only shows on the first page view of a browser session.
     Minimum 600ms, maximum 1500ms, respects prefers-reduced-motion.
     ========================================================== */
  function initSessionLoader() {
    const loader = document.getElementById('site-loader');
    if (!loader) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let hasVisited = false;

    try {
      hasVisited = sessionStorage.getItem('visited_session') === 'true';
    } catch (e) {
      // Storage unavailable
    }

    if (hasVisited || prefersReducedMotion) {
      loader.classList.add('site-loader--hidden');
      return;
    }

    const startTime = Date.now();
    const minDelay = 600;
    const maxDelay = 1500;
    let dismissed = false;

    function dismissLoader() {
      if (dismissed) return;
      dismissed = true;
      loader.classList.add('site-loader--hidden');
      try {
        sessionStorage.setItem('visited_session', 'true');
      } catch (e) {}
    }

    // Dismiss when window completes loading, respecting minimum delay
    window.addEventListener('load', function () {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, minDelay - elapsed);
      setTimeout(dismissLoader, remaining);
    });

    // Hard ceiling timeout so it never hangs
    setTimeout(dismissLoader, maxDelay);
  }

  /* ==========================================================
     2. THEME TOGGLE
     Dark is the default; remembers the visitor's theme choice.
     ========================================================== */
  function initTheme() {
    const toggle = document.getElementById('theme-toggle');

    // Restore saved theme
    try {
      const savedTheme = localStorage.getItem('theme');
      if (savedTheme === 'dark' || savedTheme === 'light') {
        document.documentElement.setAttribute('data-theme', savedTheme);
      }
    } catch (e) {}

    if (!toggle) return;

    const initialTheme = document.documentElement.getAttribute('data-theme') || 'dark';

    toggle.setAttribute(
      'aria-label',
      initialTheme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'
    );

    toggle.addEventListener('click', function () {
      const currentTheme = document.documentElement.getAttribute('data-theme');
      const nextTheme = currentTheme === 'light' ? 'dark' : 'light';

      document.documentElement.setAttribute('data-theme', nextTheme);
      toggle.setAttribute(
        'aria-label',
        nextTheme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'
      );

      try {
        localStorage.setItem('theme', nextTheme);
      } catch (e) {}
    });
  }

  /* ==========================================================
     3. ACCESSIBLE MOBILE MENU
     ========================================================== */
  function initMobileMenu() {
    const openBtn = document.getElementById('mobile-menu-open');
    const closeBtn = document.getElementById('mobile-menu-close');
    const nav = document.getElementById('mobile-nav');

    if (!openBtn || !closeBtn || !nav) return;

    function openMenu() {
      nav.setAttribute('aria-hidden', 'false');
      openBtn.setAttribute('aria-expanded', 'true');
      document.body.style.overflow = 'hidden';
      closeBtn.focus();
    }

    function closeMenu() {
      nav.setAttribute('aria-hidden', 'true');
      openBtn.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
      openBtn.focus();
    }

    openBtn.addEventListener('click', openMenu);
    closeBtn.addEventListener('click', closeMenu);

    // Close on Escape key
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && nav.getAttribute('aria-hidden') === 'false') {
        closeMenu();
      }
    });

    // Close if clicking outside container
    nav.addEventListener('click', function (e) {
      if (e.target === nav) {
        closeMenu();
      }
    });
  }

  /* ==========================================================
     4. NAVIGATION PROGRESS BAR
     Animates thin accent bar when navigating internal links.
     ========================================================== */
  function initNavProgressBar() {
    const bar = document.getElementById('nav-progress');
    if (!bar) return;

    document.addEventListener('click', function (e) {
      const link = e.target.closest('a');
      if (!link) return;

      const href = link.getAttribute('href');
      if (!href) return;

      // Ignore hash links, external links, mailto, tel, downloads
      if (
        href.startsWith('#') ||
        href.startsWith('mailto:') ||
        href.startsWith('tel:') ||
        link.target === '_blank' ||
        link.hasAttribute('download') ||
        href.endsWith('.pdf')
      ) {
        return;
      }

      // Check if same origin
      if (link.origin && link.origin !== window.location.origin) return;

      bar.classList.remove('nav-progress--done');
      bar.classList.add('nav-progress--active');

      // Reset after a brief timeout if page doesn't unload immediately
      setTimeout(function () {
        bar.classList.add('nav-progress--done');
        setTimeout(function () {
          bar.classList.remove('nav-progress--active', 'nav-progress--done');
        }, 200);
      }, 1000);
    });
  }

  /* ==========================================================
     5. LOCAL SERVER CLEAN-URL FALLBACK
     When running on Python http.server without URL rewrites,
     ensures clicks to clean routes like /work or /stack
     navigate smoothly to /work/index.html or /stack.html.
     ========================================================== */
  function initLocalUrlFallback() {
    const isLocal =
      window.location.hostname === 'localhost' ||
      window.location.hostname === '127.0.0.1' ||
      window.location.protocol === 'file:';

    if (!isLocal) return;

    // Rewrite links on localhost if needed
    document.querySelectorAll('a[href^="/"]').forEach(function (link) {
      const href = link.getAttribute('href');
      if (
        href.startsWith('/#') ||
        href.endsWith('.pdf') ||
        href.endsWith('.svg') ||
        href.endsWith('.png') ||
        href.endsWith('.webp') ||
        href.endsWith('.jpg') ||
        href.endsWith('.html') ||
        href === '/'
      ) {
        return;
      }

      if (href === '/work') {
        link.setAttribute('href', '/work/index.html');
      } else if (href.startsWith('/work/')) {
        link.setAttribute('href', href + '.html');
      } else {
        link.setAttribute('href', href + '.html');
      }
    });
  }

  /* ==========================================================
     6. LAZY IMAGE FADE-IN
     ========================================================== */
  function initLazyImages() {
    const images = document.querySelectorAll('img.img-lazy');
    images.forEach(function (img) {
      if (img.complete) {
        img.classList.add('loaded');
      } else {
        img.addEventListener('load', function () {
          img.classList.add('loaded');
        });
        img.addEventListener('error', function () {
          img.classList.add('loaded');
        });
      }
    });
  }

  /* ==========================================================
     7. SCROLL REVEAL OBSERVER
     ========================================================== */
  function initScrollReveal() {
    document.querySelectorAll('.projects-grid > .project-card, .experience-list > .experience-card, .stack-tier, .case-section').forEach(function (el) {
      el.classList.add('reveal');
    });

    const reveals = document.querySelectorAll('.reveal');
    if (!reveals.length) return;

    if (!('IntersectionObserver' in window)) {
      reveals.forEach(function (el) {
        el.classList.add('is-visible');
      });
      return;
    }

    const observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.08,
        rootMargin: '0px 0px -30px 0px',
      }
    );

    reveals.forEach(function (el) {
      observer.observe(el);
    });
  }

  /* ==========================================================
     STACK TECHNOLOGY MARKS
     Small, text-based marks keep the toolkit visual without
     adding a third-party icon request or extra image payloads.
     ========================================================== */
  function initStackIcons() {
    const marks = {
      Python: 'Py', JavaScript: 'JS', TypeScript: 'TS', 'HTML/CSS': '</>', SQL: 'SQL',
      Django: 'Dj', FastAPI: 'FA', React: 'Re', 'Tailwind CSS': 'Tw', Vite: 'Vi',
      PostgreSQL: 'Pg', MySQL: 'My', SQLite: 'Sq', Supabase: 'Sb', 'REST APIs': 'API',
      Git: 'Git', GitHub: 'GH', Vercel: 'Ve', Railway: 'Rw', Java: 'Ja', 'C#': 'C#',
      JavaFX: 'JFX', Redis: 'Rd', WebSockets: 'WS', 'django-tenants': 'Dt', Docker: 'Dk',
      Notion: 'No', Scrum: 'Sc', 'Dart and Flutter': 'Df', 'Spring Boot': 'Sp',
    };

    document.querySelectorAll('.stack-group__tags .tag').forEach(function (tag) {
      const name = tag.textContent.trim();
      const mark = marks[name];
      if (!mark || tag.querySelector('.stack-tech-tag__mark')) return;

      tag.classList.add('stack-tech-tag');
      const icon = document.createElement('span');
      icon.className = 'stack-tech-tag__mark';
      icon.setAttribute('aria-hidden', 'true');
      icon.textContent = mark;
      tag.prepend(icon);
    });
  }

  /* ==========================================================
     8. FORMSPREE CONTACT FORM HANDLER
     Handles client-side validation, Formspree submission, loading,
     success, and error states gracefully.
     ========================================================== */
  function initContactForm() {
    const form = document.getElementById('contact-form');
    if (!form) return;

    const configuredAction = form.getAttribute('action') || '';
    const formNotice = document.getElementById('contact-form-notice');
    const isConfigured = configuredAction && !configuredAction.includes('YOUR_FORM_ID');
    if (formNotice && isConfigured) formNotice.hidden = true;

    const statusSuccess = document.getElementById('form-status-success');
    const statusError = document.getElementById('form-status-error');
    const statusErrorMessage = document.getElementById('form-status-error-message');
    const submitBtn = form.querySelector('button[type="submit"]');
    const submitBtnText = submitBtn ? submitBtn.querySelector('.btn-text') : null;
    const defaultBtnText = submitBtnText ? submitBtnText.textContent : 'Send message';

    function clearStatus() {
      if (statusSuccess) statusSuccess.classList.remove('is-visible');
      if (statusError) statusError.classList.remove('is-visible');
    }

    function validateEmail(email) {
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    // Clear inline error on input
    ['contact-name', 'contact-email', 'contact-subject', 'contact-message'].forEach(function (id) {
      const el = document.getElementById(id);
      if (!el) return;
      el.addEventListener('input', function () {
        el.classList.remove('is-invalid');
        const err = document.getElementById('error-' + id.replace('contact-', ''));
        if (err) err.classList.remove('is-visible');
      });
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      clearStatus();

      const nameInput = document.getElementById('contact-name');
      const emailInput = document.getElementById('contact-email');
      const subjectInput = document.getElementById('contact-subject');
      const messageInput = document.getElementById('contact-message');

      let isValid = true;

      // Validate name
      if (!nameInput || !nameInput.value.trim()) {
        if (nameInput) nameInput.classList.add('is-invalid');
        const err = document.getElementById('error-name');
        if (err) err.classList.add('is-visible');
        isValid = false;
      } else {
        nameInput.classList.remove('is-invalid');
        const err = document.getElementById('error-name');
        if (err) err.classList.remove('is-visible');
      }

      // Validate email
      if (!emailInput || !validateEmail(emailInput.value.trim())) {
        if (emailInput) emailInput.classList.add('is-invalid');
        const err = document.getElementById('error-email');
        if (err) err.classList.add('is-visible');
        isValid = false;
      } else {
        emailInput.classList.remove('is-invalid');
        const err = document.getElementById('error-email');
        if (err) err.classList.remove('is-visible');
      }

      // Validate subject
      if (!subjectInput || !subjectInput.value.trim()) {
        if (subjectInput) subjectInput.classList.add('is-invalid');
        const err = document.getElementById('error-subject');
        if (err) err.classList.add('is-visible');
        isValid = false;
      } else {
        subjectInput.classList.remove('is-invalid');
        const err = document.getElementById('error-subject');
        if (err) err.classList.remove('is-visible');
      }

      // Validate message
      if (!messageInput || !messageInput.value.trim()) {
        if (messageInput) messageInput.classList.add('is-invalid');
        const err = document.getElementById('error-message');
        if (err) err.classList.add('is-visible');
        isValid = false;
      } else {
        messageInput.classList.remove('is-invalid');
        const err = document.getElementById('error-message');
        if (err) err.classList.remove('is-visible');
      }

      if (!isValid) {
        return;
      }

      // Check if endpoint is placeholder
      const formAction = form.getAttribute('action') || '';
      if (!formAction || formAction.includes('YOUR_FORM_ID')) {
        if (statusError) {
          if (statusErrorMessage) {
            statusErrorMessage.textContent = 'This message form is not connected yet. Please email ikedinachiogbonne@gmail.com directly.';
          }
          statusError.classList.add('is-visible');
          statusError.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
        return;
      }

      // Enter loading state & prevent duplicate submission
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.setAttribute('aria-busy', 'true');
        if (submitBtnText) submitBtnText.textContent = 'Sending message...';
      }

      const formData = new FormData(form);

      fetch(formAction, {
        method: 'POST',
        body: formData,
        headers: {
          Accept: 'application/json',
        },
      })
        .then(function (response) {
          if (response.ok) {
            form.reset();
            if (statusSuccess) {
              statusSuccess.classList.add('is-visible');
              statusSuccess.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }
          } else {
            return response.json().then(function (data) {
              const errMsg =
                data && data.errors
                  ? data.errors.map(function (item) { return item.message; }).join(', ')
                  : (data && data.error ? data.error : 'There was an issue submitting the form. Please try again or reach out directly.');
              throw new Error(errMsg);
            });
          }
        })
        .catch(function (error) {
          if (statusError) {
            if (statusErrorMessage) {
              statusErrorMessage.textContent = error.message || 'There was an error sending your message. Please email ikedinachiogbonne@gmail.com directly.';
            }
            statusError.classList.add('is-visible');
            statusError.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
          }
        })
        .finally(function () {
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.removeAttribute('aria-busy');
            if (submitBtnText) submitBtnText.textContent = defaultBtnText;
          }
        });
    });
  }

  /* ==========================================================
     DOM INITIALISATION
     ========================================================== */
  document.addEventListener('DOMContentLoaded', function () {
    document.documentElement.classList.add('has-js');
    initSessionLoader();
    initTheme();
    initMobileMenu();
    initNavProgressBar();
    initLocalUrlFallback();
    initLazyImages();
    initStackIcons();
    initScrollReveal();
    initContactForm();
  });
})();
