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
  item.addEventListener('click', () => {
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

console.log('🎭 Kalaparv – Powered by Dream Dance Academy');
$galleryJS
