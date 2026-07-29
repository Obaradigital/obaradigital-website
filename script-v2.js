/* ============================================
   OBARA DIGITAL v2 — PREMIUM AGENCY SCRIPTS
   Production-ready vanilla JavaScript
   ============================================ */

(function() {
  'use strict';

  /* ── 1. CONFIG & UTILITIES ── */
  const CONFIG = {
    scrollOffset: 80,
    revealThreshold: 0.12,
    counterDuration: 2000,
    counterThreshold: 0.3,
    parallaxSpeed: 0.3,
    headerScrollThreshold: 50,
    scrollTopThreshold: 500,
    reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches
  };

  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));
  const on = (el, evt, fn, opts) => el.addEventListener(evt, fn, opts);
  const off = (el, evt, fn) => el.removeEventListener(evt, fn);
  const debounce = (fn, ms = 100) => {
    let t;
    return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), ms); };
  };
  const throttle = (fn, ms = 16) => {
    let last = 0;
    return (...args) => {
      const now = Date.now();
      if (now - last >= ms) { last = now; fn(...args); }
    };
  };

  /* ── 2. PRELOADER ── */
  const preloader = $('#preloader');
  if (preloader) {
    const hidePreloader = () => {
      preloader.classList.add('hidden');
      // Remove from DOM after transition to free memory
      setTimeout(() => {
        if (preloader.parentNode) preloader.parentNode.removeChild(preloader);
      }, 700);
    };
    if (document.readyState === 'complete') {
      setTimeout(hidePreloader, 600);
    } else {
      on(window, 'load', () => setTimeout(hidePreloader, 400));
    }
  }

  /* ── 3. STICKY HEADER ── */
  const header = $('#header');
  let lastScrollY = 0;

  function updateHeader() {
    const y = window.scrollY || window.pageYOffset;
    if (y > CONFIG.headerScrollThreshold) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
    lastScrollY = y;
  }

  on(window, 'scroll', throttle(updateHeader, 16), { passive: true });

  /* ── 4. MOBILE NAVIGATION ── */
  const hamburger = $('#hamburger');
  const navMenu = $('#navMenu');
  const navLinks = $$('.nav-link');

  function openMenu() {
    hamburger.classList.add('active');
    navMenu.classList.add('active');
    hamburger.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  }

  function closeMenu() {
    hamburger.classList.remove('active');
    navMenu.classList.remove('active');
    hamburger.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }

  if (hamburger && navMenu) {
    on(hamburger, 'click', () => {
      if (navMenu.classList.contains('active')) closeMenu(); else openMenu();
    });

    navLinks.forEach(link => on(link, 'click', closeMenu));

    // Escape key closes menu
    on(document, 'keydown', (e) => {
      if (e.key === 'Escape' && navMenu.classList.contains('active')) {
        closeMenu();
        hamburger.focus();
      }
    });

    // Click outside closes menu
    on(document, 'click', (e) => {
      if (navMenu.classList.contains('active') &&
          !navMenu.contains(e.target) &&
          !hamburger.contains(e.target)) {
        closeMenu();
      }
    });
  }

  /* ── 5. SMOOTH SCROLL ── */
  on(document, 'click', (e) => {
    const anchor = e.target.closest('a[href^="#"]');
    if (!anchor) return;
    const id = anchor.getAttribute('href');
    if (id === '#') return;
    const target = $(id);
    if (!target) return;
    e.preventDefault();
    const y = target.getBoundingClientRect().top + window.pageYOffset - CONFIG.scrollOffset;
    window.scrollTo({ top: y, behavior: CONFIG.reducedMotion ? 'auto' : 'smooth' });
    // Update focus for accessibility
    target.setAttribute('tabindex', '-1');
    target.focus({ preventScroll: true });
  });

  /* ── 6. ACTIVE NAV LINK ON SCROLL ── */
  const sections = $$('section[id]');

  function updateActiveNav() {
    const y = window.pageYOffset + CONFIG.scrollOffset + 20;
    let current = '';
    sections.forEach(section => {
      if (section.offsetTop <= y) {
        current = section.getAttribute('id');
      }
    });
    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === '#' + current) {
        link.classList.add('active');
      }
    });
  }

  on(window, 'scroll', throttle(updateActiveNav, 80), { passive: true });

  /* ── 7. SCROLL TO TOP ── */
  const scrollTopBtn = $('#scrollTop');

  function toggleScrollTop() {
    if (!scrollTopBtn) return;
    if (window.pageYOffset > CONFIG.scrollTopThreshold) {
      scrollTopBtn.classList.add('visible');
    } else {
      scrollTopBtn.classList.remove('visible');
    }
  }

  if (scrollTopBtn) {
    on(window, 'scroll', throttle(toggleScrollTop, 100), { passive: true });
    on(scrollTopBtn, 'click', () => {
      window.scrollTo({ top: 0, behavior: CONFIG.reducedMotion ? 'auto' : 'smooth' });
    });
  }

  /* ── 8. INTERSECTION OBSERVER — REVEAL ANIMATIONS ── */
  const revealElements = $$('.reveal, .reveal-scale');

  if ('IntersectionObserver' in window && revealElements.length) {
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          revealObserver.unobserve(entry.target);
        }
      });
    }, {
      threshold: CONFIG.revealThreshold,
      rootMargin: '0px 0px -40px 0px'
    });

    revealElements.forEach(el => revealObserver.observe(el));
  } else {
    // Fallback for older browsers
    revealElements.forEach(el => el.classList.add('visible'));
  }

  /* ── 9. COUNTER ANIMATIONS ── */
  const counters = $$('[data-counter]');

  function animateCounter(el) {
    const target = parseInt(el.getAttribute('data-counter'), 10);
    const suffix = el.getAttribute('data-suffix') || '';
    const prefix = el.getAttribute('data-prefix') || '';
    const duration = CONFIG.counterDuration;
    const startTime = performance.now();

    function update(now) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.floor(eased * target);
      el.textContent = prefix + current.toLocaleString() + suffix;

      if (progress < 1) {
        requestAnimationFrame(update);
      } else {
        el.textContent = prefix + target.toLocaleString() + suffix;
        el.classList.add('counter-done');
      }
    }

    requestAnimationFrame(update);
  }

  if ('IntersectionObserver' in window && counters.length) {
    const counterObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          counterObserver.unobserve(entry.target);
        }
      });
    }, { threshold: CONFIG.counterThreshold });

    counters.forEach(c => counterObserver.observe(c));
  }

  /* ── 10. FAQ ACCORDION ── */
  const faqItems = $$('.faq-item');

  faqItems.forEach(item => {
    const question = item.querySelector('.faq-question');
    if (!question) return;

    on(question, 'click', () => {
      const isActive = item.classList.contains('active');

      // Close all others
      faqItems.forEach(i => {
        i.classList.remove('active');
        const q = i.querySelector('.faq-question');
        if (q) q.setAttribute('aria-expanded', 'false');
      });

      // Toggle current
      if (!isActive) {
        item.classList.add('active');
        question.setAttribute('aria-expanded', 'true');
      }
    });

    // Keyboard support
    on(question, 'keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        question.click();
      }
    });
  });

  /* ── 11. HERO PARALLAX ── */
  const heroBg = $('.hero-bg');

  if (heroBg && !CONFIG.reducedMotion) {
    let ticking = false;
    on(window, 'scroll', () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const scrolled = window.pageYOffset;
          heroBg.style.transform = `translateY(${scrolled * CONFIG.parallaxSpeed}px)`;
          ticking = false;
        });
        ticking = true;
      }
    }, { passive: true });
  }

  /* ── 12. FLOATING CARDS STAGGER ── */
  const floatingCards = $$('.floating-card');

  if (!CONFIG.reducedMotion && floatingCards.length) {
    floatingCards.forEach((card, i) => {
      card.style.animationDelay = `${i * 2}s`;
      card.style.animationDuration = `${5 + i * 1.2}s`;
    });
  }

  /* ── 13. DASHBOARD ANIMATIONS ── */
  const chartBars = $$('.chart-bar');

  if (!CONFIG.reducedMotion && chartBars.length) {
    chartBars.forEach((bar, i) => {
      bar.style.animationDelay = `${0.3 + i * 0.15}s`;
    });
  }

  /* ── 14. FORM VALIDATION ── */
  function validateField(field) {
    const value = field.value.trim();
    let valid = true;
    let message = '';

    if (field.hasAttribute('required') && !value) {
      valid = false;
      message = 'This field is required.';
    } else if (field.type === 'email' && value) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        valid = false;
        message = 'Please enter a valid email address.';
      }
    } else if (field.type === 'tel' && value) {
      const phoneRegex = /^[\d\s\+\-\(\)]{7,20}$/;
      if (!phoneRegex.test(value)) {
        valid = false;
        message = 'Please enter a valid phone number.';
      }
    } else if (field.minLength && value.length < field.minLength) {
      valid = false;
      message = `Minimum ${field.minLength} characters required.`;
    }

    const group = field.closest('.form-group');
    const errorEl = group ? group.querySelector('.form-error-msg') : null;

    if (valid) {
      field.classList.remove('error');
      field.classList.add('success');
      if (errorEl) errorEl.classList.remove('visible');
    } else {
      field.classList.add('error');
      field.classList.remove('success');
      if (errorEl) {
        errorEl.textContent = message;
        errorEl.classList.add('visible');
      }
    }

    return valid;
  }

  function initFormValidation(formId) {
    const form = $(formId);
    if (!form) return;

    const inputs = $$('input, textarea, select', form);

    inputs.forEach(input => {
      on(input, 'blur', () => validateField(input));
      on(input, 'input', () => {
        if (input.classList.contains('error')) validateField(input);
      });
    });

    on(form, 'submit', (e) => {
      let allValid = true;
      inputs.forEach(input => {
        if (!validateField(input)) allValid = false;
      });

      if (!allValid) {
        e.preventDefault();
        const firstError = form.querySelector('.error');
        if (firstError) {
          firstError.focus();
          firstError.scrollIntoView({ behavior: CONFIG.reducedMotion ? 'auto' : 'smooth', block: 'center' });
        }
        return;
      }

      // Show loading state
      const btn = form.querySelector('button[type="submit"]');
      if (btn) {
        const originalHTML = btn.innerHTML;
        btn.innerHTML = '<span>Sending...</span><i class="fas fa-spinner fa-spin" aria-hidden="true"></i>';
        btn.disabled = true;
        btn.dataset.originalHtml = originalHTML;

        // For demo / Formspree — simulate success after delay
        // Remove this setTimeout when using real form endpoint
        setTimeout(() => {
          btn.innerHTML = '<span>Message Sent!</span><i class="fas fa-check" aria-hidden="true"></i>';
          form.reset();
          inputs.forEach(i => i.classList.remove('success', 'error'));
          setTimeout(() => {
            btn.innerHTML = btn.dataset.originalHtml;
            btn.disabled = false;
          }, 3000);
        }, 1500);
      }
    });
  }

  initFormValidation('#contactForm');
  initFormValidation('#leadForm');

  /* ── 15. COOKIE CONSENT ── */
  const cookieBanner = $('#cookieConsent');
  const acceptBtn = $('#acceptCookies');
  const declineBtn = $('#declineCookies');

  function hideCookieBanner() {
    if (cookieBanner) {
      cookieBanner.style.transform = 'translateY(100%)';
      setTimeout(() => { cookieBanner.style.display = 'none'; }, 500);
    }
  }

  if (cookieBanner) {
    const consent = localStorage.getItem('cookieConsent');
    if (!consent) {
      cookieBanner.style.display = 'block';
      // Small delay for entrance animation
      requestAnimationFrame(() => {
        cookieBanner.style.transform = 'translateY(0)';
      });
    } else {
      cookieBanner.style.display = 'none';
    }

    if (acceptBtn) {
      on(acceptBtn, 'click', () => {
        localStorage.setItem('cookieConsent', 'accepted');
        hideCookieBanner();
        // Update Google Consent Mode if gtag exists
        if (typeof gtag === 'function') {
          gtag('consent', 'update', {
            'ad_storage': 'granted',
            'analytics_storage': 'granted',
            'functionality_storage': 'granted',
            'personalization_storage': 'granted'
          });
        }
      });
    }

    if (declineBtn) {
      on(declineBtn, 'click', () => {
        localStorage.setItem('cookieConsent', 'declined');
        hideCookieBanner();
      });
    }
  }

  /* ── 16. ANNOUNCEMENT BAR ── */
  const announcementBar = $('.announcement-bar');
  const announcementClose = $('#announcementClose');

  if (announcementClose && announcementBar) {
    const isHidden = sessionStorage.getItem('announcementHidden');
    if (isHidden) {
      announcementBar.style.display = 'none';
    } else {
      on(announcementClose, 'click', () => {
        announcementBar.style.display = 'none';
        sessionStorage.setItem('announcementHidden', 'true');
      });
    }
  }

  /* ── 17. THEME TOGGLE ── */
  const themeToggle = $('#themeToggle');
  const savedTheme = localStorage.getItem('theme');

  if (savedTheme === 'dark') {
    document.documentElement.setAttribute('data-theme', 'dark');
  }

  if (themeToggle) {
    const icon = themeToggle.querySelector('i');
    if (icon) {
      if (savedTheme === 'dark') {
        icon.classList.remove('fa-moon');
        icon.classList.add('fa-sun');
      }
    }

    on(themeToggle, 'click', () => {
      const current = document.documentElement.getAttribute('data-theme');
      const icon = themeToggle.querySelector('i');
      if (current === 'dark') {
        document.documentElement.removeAttribute('data-theme');
        localStorage.setItem('theme', 'light');
        if (icon) {
          icon.classList.remove('fa-sun');
          icon.classList.add('fa-moon');
        }
      } else {
        document.documentElement.setAttribute('data-theme', 'dark');
        localStorage.setItem('theme', 'dark');
        if (icon) {
          icon.classList.remove('fa-moon');
          icon.classList.add('fa-sun');
        }
      }
    });
  }

  /* ── 18. CURRENT YEAR ── */
  const yearEl = $('#year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ── 19. PORTFOLIO FILTER (if present) ── */
  const filterBtns = $$('.filter-btn');
  const portfolioCards = $$('.portfolio-card');

  if (filterBtns.length && portfolioCards.length) {
    filterBtns.forEach(btn => {
      on(btn, 'click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        const filter = btn.getAttribute('data-filter');

        portfolioCards.forEach(card => {
          const category = card.getAttribute('data-category');
          if (filter === 'all' || category === filter) {
            card.classList.remove('hidden');
            if (!CONFIG.reducedMotion) {
              card.style.animation = 'fadeInUp 0.5s ease forwards';
            }
          } else {
            card.classList.add('hidden');
          }
        });
      });
    });
  }

  /* ── 20. PERFORMANCE: LAZY LOAD IMAGES (native + fallback) ── */
  if ('loading' in HTMLImageElement.prototype) {
    // Browser supports native lazy loading
  } else {
    // Fallback for older browsers
    const lazyImages = $$('img[loading="lazy"]');
    if ('IntersectionObserver' in window && lazyImages.length) {
      const imgObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target;
            img.src = img.dataset.src || img.src;
            imgObserver.unobserve(img);
          }
        });
      }, { rootMargin: '200px' });
      lazyImages.forEach(img => imgObserver.observe(img));
    }
  }

  /* ── 21. RESIZE HANDLER (cleanup / recalc) ── */
  let resizeTimer;
  on(window, 'resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      // Recalculate section positions for active nav
      updateActiveNav();
      // Close mobile menu on resize to desktop
      if (window.innerWidth > 768 && navMenu && navMenu.classList.contains('active')) {
        closeMenu();
      }
    }, 200);
  });

  /* ── 22. VISIBILITY API — pause expensive animations when tab hidden ── */
  on(document, 'visibilitychange', () => {
    if (document.hidden) {
      document.documentElement.classList.add('tab-hidden');
    } else {
      document.documentElement.classList.remove('tab-hidden');
    }
  });

})();