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
     Supports system preference + localStorage override in try/catch.
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

    toggle.addEventListener('click', function () {
      const currentTheme = document.documentElement.getAttribute('data-theme');
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

      let nextTheme;
      if (currentTheme === 'dark' || (!currentTheme && prefersDark)) {
        nextTheme = 'light';
      } else {
        nextTheme = 'dark';
      }

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
     DOM INITIALISATION
     ========================================================== */
  document.addEventListener('DOMContentLoaded', function () {
    initSessionLoader();
    initTheme();
    initMobileMenu();
    initNavProgressBar();
    initLocalUrlFallback();
    initLazyImages();
    initScrollReveal();
  });
})();
