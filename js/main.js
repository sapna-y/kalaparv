/**
 * Kalaparv – Main JavaScript
 * Handles: Navbar, Scroll Reveal, Countdown Timer, Preloader
 */

// ===== Preloader =====
window.addEventListener('load', () => {
  const preloader = document.getElementById('preloader');
  if (preloader) {
    setTimeout(() => {
      preloader.classList.add('hidden');
    }, 500);
  }
});

// ===== Navbar =====
const navbar = document.getElementById('navbar');
const navToggle = document.getElementById('navToggle');
const navLinks = document.getElementById('navLinks');

// Sticky Navbar on Scroll
let lastScroll = 0;
window.addEventListener('scroll', () => {
  const currentScroll = window.scrollY;

  if (currentScroll > 50) {
    navbar.classList.add('scrolled');
  } else {
    navbar.classList.remove('scrolled');
  }

  lastScroll = currentScroll;
});

// Mobile Menu Toggle
if (navToggle && navLinks) {
  navToggle.addEventListener('click', () => {
    navToggle.classList.toggle('active');
    navLinks.classList.toggle('active');
    document.body.style.overflow = navLinks.classList.contains('active') ? 'hidden' : '';
  });

  // Close menu when clicking a link
  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      navToggle.classList.remove('active');
      navLinks.classList.remove('active');
      document.body.style.overflow = '';
    });
  });

  // Close menu when clicking outside
  document.addEventListener('click', (e) => {
    if (!navLinks.contains(e.target) && !navToggle.contains(e.target)) {
      navToggle.classList.remove('active');
      navLinks.classList.remove('active');
      document.body.style.overflow = '';
    }
  });
}

// ===== Smooth Scroll for Anchor Links =====
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    const targetId = this.getAttribute('href');
    if (targetId === '#') return;

    const target = document.querySelector(targetId);
    if (target) {
      e.preventDefault();
      const navHeight = navbar ? navbar.offsetHeight : 0;
      const targetPosition = target.getBoundingClientRect().top + window.scrollY - navHeight - 20;

      window.scrollTo({
        top: targetPosition,
        behavior: 'smooth'
      });
    }
  });
});

// ===== Scroll Reveal Animation =====
const revealElements = document.querySelectorAll('.reveal, .reveal-left, .reveal-right');

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('revealed');
      revealObserver.unobserve(entry.target);
    }
  });
}, {
  threshold: 0.1,
  rootMargin: '0px 0px -50px 0px'
});

revealElements.forEach(el => {
  revealObserver.observe(el);
});

// ===== Countdown Timer =====
function initCountdown() {
  // Event date: October 1, 2026
  const eventDate = new Date('2026-10-01T09:00:00').getTime();

  const countDays = document.getElementById('countDays');
  const countHours = document.getElementById('countHours');
  const countMins = document.getElementById('countMins');
  const countSecs = document.getElementById('countSecs');

  if (!countDays) return; // No countdown on this page

  function updateCountdown() {
    const now = new Date().getTime();
    const distance = eventDate - now;

    if (distance < 0) {
      countDays.textContent = '0';
      countHours.textContent = '0';
      countMins.textContent = '0';
      countSecs.textContent = '0';
      return;
    }

    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const mins = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const secs = Math.floor((distance % (1000 * 60)) / 1000);

    countDays.textContent = days;
    countHours.textContent = hours.toString().padStart(2, '0');
    countMins.textContent = mins.toString().padStart(2, '0');
    countSecs.textContent = secs.toString().padStart(2, '0');
  }

  updateCountdown();
  setInterval(updateCountdown, 1000);
}

initCountdown();

// ===== Active Nav Link Highlighting =====
function setActiveNavLink() {
  const currentPath = window.location.pathname;
  const navLinkElements = document.querySelectorAll('.nav-links a:not(.nav-cta)');

  navLinkElements.forEach(link => {
    link.classList.remove('active');
    const href = link.getAttribute('href');

    if (currentPath === href ||
        (currentPath === '/' && href === '/') ||
        (currentPath.endsWith('index.html') && href === '/')) {
      link.classList.add('active');
    }
  });
}

setActiveNavLink();

// ===== Gallery Lightbox (Simple) =====
document.querySelectorAll('.gallery-item').forEach(item => {
  item.addEventListener('click', (e) => {
    // If it's a video item, let the default link behavior open in a new tab
    if (item.getAttribute('data-type') === 'video') {
      return;
    }
    
    const img = item.querySelector('img');
    if (!img) return;

    const overlay = document.createElement('div');
    overlay.style.cssText = `
      position: fixed; inset: 0; z-index: 3000;
      background: rgba(0,0,0,0.9); backdrop-filter: blur(10px);
      display: flex; align-items: center; justify-content: center;
      cursor: pointer; animation: fadeInUp 0.3s ease;
    `;

    const fullImg = document.createElement('img');
    fullImg.src = img.src;
    fullImg.alt = img.alt;
    fullImg.style.cssText = `
      max-width: 90%; max-height: 90vh; border-radius: 12px;
      box-shadow: 0 20px 60px rgba(0,0,0,0.5);
    `;

    overlay.appendChild(fullImg);
    document.body.appendChild(overlay);
    document.body.style.overflow = 'hidden';

    overlay.addEventListener('click', () => {
      document.body.removeChild(overlay);
      document.body.style.overflow = '';
    });
  });
});

// ===== Animated Counter =====
function initCounters() {
  const statValues = document.querySelectorAll('.stat-value[data-count]');
  if (!statValues.length) return;

  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const target = parseInt(el.getAttribute('data-count'), 10);
        const duration = 2000; // 2 seconds
        const start = performance.now();

        function animate(currentTime) {
          const elapsed = currentTime - start;
          const progress = Math.min(elapsed / duration, 1);

          // Ease-out cubic
          const eased = 1 - Math.pow(1 - progress, 3);
          const current = Math.floor(eased * target);
          el.textContent = current.toLocaleString();

          if (progress < 1) {
            requestAnimationFrame(animate);
          } else {
            el.textContent = target.toLocaleString();
          }
        }

        requestAnimationFrame(animate);
        counterObserver.unobserve(el);
      }
    });
  }, { threshold: 0.3 });

  statValues.forEach(el => counterObserver.observe(el));
}

initCounters();

// ===== Testimonial Slider =====
function initTestimonialSlider() {
  const track = document.getElementById('testimonialTrack');
  const dots = document.querySelectorAll('.testimonial-dot');
  if (!track || !dots.length) return;

  let currentIndex = 0;
  const totalSlides = dots.length;
  let autoSlideInterval;

  function goToSlide(index) {
    currentIndex = index;
    track.style.transform = `translateX(-${currentIndex * 100}%)`;
    dots.forEach((dot, i) => {
      dot.classList.toggle('active', i === currentIndex);
    });
  }

  function nextSlide() {
    goToSlide((currentIndex + 1) % totalSlides);
  }

  function startAutoSlide() {
    autoSlideInterval = setInterval(nextSlide, 5000);
  }

  function resetAutoSlide() {
    clearInterval(autoSlideInterval);
    startAutoSlide();
  }

  // Dot click handlers
  dots.forEach(dot => {
    dot.addEventListener('click', () => {
      const index = parseInt(dot.getAttribute('data-index'), 10);
      goToSlide(index);
      resetAutoSlide();
    });
  });

  // Touch/swipe support
  let touchStartX = 0;
  let touchEndX = 0;

  track.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
  }, { passive: true });

  track.addEventListener('touchend', (e) => {
    touchEndX = e.changedTouches[0].screenX;
    const diff = touchStartX - touchEndX;
    if (Math.abs(diff) > 50) {
      if (diff > 0) {
        goToSlide(Math.min(currentIndex + 1, totalSlides - 1));
      } else {
        goToSlide(Math.max(currentIndex - 1, 0));
      }
      resetAutoSlide();
    }
  }, { passive: true });

  startAutoSlide();
}

initTestimonialSlider();

// ===== Staggered Reveal for Grid Items =====
function initStaggeredReveal() {
  const grids = document.querySelectorAll('.grid-4, .grid-3, .grid-2, .stats-grid, .highlights-strip, .partner-grid');
  
  grids.forEach(grid => {
    const children = grid.children;
    Array.from(children).forEach((child, index) => {
      child.style.transitionDelay = `${index * 0.1}s`;
    });
  });
}

initStaggeredReveal();

// ===== Gallery Filtering and Tabs =====
function initGalleryFilters() {
  const tabButtons = document.querySelectorAll('.gallery-tab-btn');
  const filterButtons = document.querySelectorAll('.filter-btn');
  const galleryItems = document.querySelectorAll('.gallery-item');
  const filterGroupKalaparv = document.querySelector('.filter-group.group-kalaparv');
  const filterGroupAcademy = document.querySelector('.filter-group.group-academy');

  if (!galleryItems.length) return;

  let activeGroup = 'kalaparv';
  let activeFilter = 'all';

  // Tab change (Kalaparv Events vs Dream Dance Academy)
  if (tabButtons.length > 0) {
    tabButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        tabButtons.forEach(b => {
          b.classList.remove('active', 'btn-primary');
          b.classList.add('btn-secondary');
        });
        btn.classList.add('active', 'btn-primary');
        btn.classList.remove('btn-secondary');

        activeGroup = btn.getAttribute('data-group');
        activeFilter = 'all'; // reset filter to all when changing tabs

        // Reset filter button active states
        filterButtons.forEach(fb => fb.classList.remove('active'));
        const allBtn = document.querySelector('.filter-btn[data-filter="all"]');
        if (allBtn) allBtn.classList.add('active');

        // Show/hide correct dynamic filter options
        if (activeGroup === 'kalaparv') {
          if (filterGroupKalaparv) filterGroupKalaparv.style.display = 'inline-flex';
          if (filterGroupAcademy) filterGroupAcademy.style.display = 'none';
        } else {
          if (filterGroupKalaparv) filterGroupKalaparv.style.display = 'none';
          if (filterGroupAcademy) filterGroupAcademy.style.display = 'inline-flex';
        }

        applyFilters();
      });
    });
  }

  // Filter change
  filterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      filterButtons.forEach(fb => fb.classList.remove('active'));
      btn.classList.add('active');

      activeFilter = btn.getAttribute('data-filter');
      applyFilters();
    });
  });

  function applyFilters() {
    // Add/remove class to grid container depending on active filter to allow layout adjustment
    const galleryGridEl = document.getElementById('galleryGrid');
    if (galleryGridEl) {
      if (activeFilter === 'video') {
        galleryGridEl.classList.add('videos-active');
      } else {
        galleryGridEl.classList.remove('videos-active');
      }
    }

    galleryItems.forEach(item => {
      const itemGroup = item.getAttribute('data-group');
      const itemType = item.getAttribute('data-type') || 'photo'; // default to photo
      const itemCategory = item.getAttribute('data-category');

      const matchesGroup = tabButtons.length === 0 || itemGroup === activeGroup;
      let matchesFilter = false;

      if (activeFilter === 'all') {
        matchesFilter = true;
      } else if (activeFilter === 'photo' || activeFilter === 'video') {
        matchesFilter = itemType === activeFilter;
      } else {
        matchesFilter = itemCategory === activeFilter;
      }

      if (matchesGroup && matchesFilter) {
        item.style.display = 'block';
      } else {
        item.style.display = 'none';
      }
    });
  }

  // Initial run
  applyFilters();
}

initGalleryFilters();

console.log('🎭 Kalaparv – Powered by Dream Dance Academy');

