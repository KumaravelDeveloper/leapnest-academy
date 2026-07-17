document.addEventListener('DOMContentLoaded', () => {
  initHeaderScroll();
  initMobileMenu();
  initScrollAnimations();
  initStatCounters();
  initAccordions();
  initEnquiryForm();
});

// 1. Header scroll visual transformation
function initHeaderScroll() {
  const header = document.querySelector('.header');
  if (!header) return;

  const checkScroll = () => {
    if (window.scrollY > 50) {
      header.classList.add('header--scrolled');
    } else {
      header.classList.remove('header--scrolled');
    }
  };

  window.addEventListener('scroll', checkScroll);
  checkScroll(); // Trigger initial check
}

// 2. Mobile Nav burger toggle
function initMobileMenu() {
  const toggle = document.querySelector('.nav-toggle');
  const nav = document.querySelector('.nav');
  if (!toggle || !nav) return;

  toggle.addEventListener('click', (e) => {
    e.stopPropagation();
    toggle.classList.toggle('nav-toggle--open');
    nav.classList.toggle('nav--open');
    document.body.classList.toggle('no-scroll');
  });

  // Close menu when clicking navigation links
  const navLinks = document.querySelectorAll('.nav__link');
  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      toggle.classList.remove('nav-toggle--open');
      nav.classList.remove('nav--open');
      document.body.classList.remove('no-scroll');
    });
  });

  // Close menu when clicking outside of nav
  document.addEventListener('click', (e) => {
    if (!nav.contains(e.target) && !toggle.contains(e.target) && nav.classList.contains('nav--open')) {
      toggle.classList.remove('nav-toggle--open');
      nav.classList.remove('nav--open');
      document.body.classList.remove('no-scroll');
    }
  });
}

// 3. Viewport-triggered fade-in animations
function initScrollAnimations() {
  const animElements = document.querySelectorAll('.animate-on-scroll');
  if (animElements.length === 0) return;

  // Insert style tag dynamically to handle animation states smoothly
  const style = document.createElement('style');
  style.innerHTML = `
    .animate-on-scroll {
      opacity: 0;
      transform: translateY(30px);
      transition: opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1), transform 0.8s cubic-bezier(0.16, 1, 0.3, 1);
    }
    .animate-on-scroll--visible {
      opacity: 1;
      transform: translateY(0);
    }
  `;
  document.head.appendChild(style);

  const observerOptions = {
    root: null,
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  };

  const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('animate-on-scroll--visible');
        observer.unobserve(entry.target); // Stop observing after animation triggers
      }
    });
  }, observerOptions);

  animElements.forEach(el => observer.observe(el));
}

// 4. Statistics count-up counter animation
function initStatCounters() {
  const statNumbers = document.querySelectorAll('.stats__number');
  if (statNumbers.length === 0) return;

  const countUp = (el) => {
    const target = parseInt(el.getAttribute('data-target'), 10);
    if (isNaN(target)) return;
    
    const suffix = el.getAttribute('data-suffix') || '';
    const duration = 1500; // 1.5 seconds
    const frameRate = 1000 / 60; // 60fps
    const totalFrames = Math.round(duration / frameRate);
    let frame = 0;

    const timer = setInterval(() => {
      frame++;
      const progress = frame / totalFrames;
      // Easing out quadratic
      const easeVal = progress * (2 - progress);
      const current = Math.round(target * easeVal);
      
      el.textContent = current.toLocaleString() + suffix;

      if (frame >= totalFrames) {
        clearInterval(timer);
        el.textContent = target.toLocaleString() + suffix;
      }
    }, frameRate);
  };

  const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        countUp(entry.target);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.2 });

  statNumbers.forEach(el => observer.observe(el));
}

// 5. Accordions toggling logic (Offerings syllabus details)
function initAccordions() {
  const accordions = document.querySelectorAll('.accordion-header');
  if (accordions.length === 0) return;

  accordions.forEach(header => {
    header.addEventListener('click', () => {
      const item = header.parentElement;
      const content = header.nextElementSibling;
      const isActive = item.classList.contains('accordion-item--active');

      // Close all other accordions first
      const allItems = document.querySelectorAll('.accordion-item');
      allItems.forEach(i => {
        i.classList.remove('accordion-item--active');
        const c = i.querySelector('.accordion-content');
        if (c) c.style.maxHeight = null;
      });

      if (!isActive) {
        item.classList.add('accordion-item--active');
        content.style.maxHeight = content.scrollHeight + 'px';
      }
    });
  });
}

// 6. Enquiry Form Submission validation & custom success pop-up alert
function initEnquiryForm() {
  const form = document.querySelector('.enquiry-form');
  if (!form) return;

  // Create alert popup block and append to body dynamically if not exists
  let alertPopup = document.querySelector('.alert-popup');
  if (!alertPopup) {
    alertPopup = document.createElement('div');
    alertPopup.className = 'alert-popup';
    alertPopup.innerHTML = `
      <div class="alert-popup__icon">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <div>
        <div class="alert-popup__title">Enquiry Submitted</div>
        <div class="alert-popup__text">Thank you! We will get in touch with you shortly.</div>
      </div>
    `;
    document.body.appendChild(alertPopup);
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    // Client-side validations (First Name, Phone, and Email are required)
    const firstName = form.querySelector('[name="first-name"]').value.trim();
    const phone = form.querySelector('[name="phone"]').value.trim();
    const email = form.querySelector('[name="email"]').value.trim();

    if (!firstName || !phone || !email) {
      alert('Please fill out all required fields (*).');
      return;
    }

    // Email regex validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      alert('Please enter a valid email address.');
      return;
    }

    // Form submission simulation
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = 'Submitting...';

    // Simulate server response delay
    setTimeout(() => {
      // Trigger success popup alert
      alertPopup.classList.add('alert-popup--show');
      form.reset();
      submitBtn.disabled = false;
      submitBtn.textContent = originalText;

      // Auto-hide alert popup after 4 seconds
      setTimeout(() => {
        alertPopup.classList.remove('alert-popup--show');
      }, 4000);

    }, 1200);
  });
}

// Testimonials Slider / Carousel Controller
document.addEventListener('DOMContentLoaded', () => {
  const track = document.querySelector('.testimonials-track');
  const prevBtn = document.querySelector('.prev-btn');
  const nextBtn = document.querySelector('.next-btn');
  const toggleBtn = document.querySelector('.testimonials-toggle-btn');
  const controls = document.querySelector('.slider-controls');

  if (track && prevBtn && nextBtn && toggleBtn) {
    let currentIndex = 0;
    const cards = Array.from(track.children);
    const cardCount = cards.length;

    function getSlideWidth() {
      if (window.innerWidth <= 600) {
        return 100;
      } else if (window.innerWidth <= 992) {
        return 50;
      } else {
        return 33.333;
      }
    }

    function getVisibleCount() {
      if (window.innerWidth <= 600) return 1;
      if (window.innerWidth <= 992) return 2;
      return 3;
    }

    function updateSliderPosition() {
      if (track.classList.contains('testimonials-grid-active')) {
        return;
      }
      const visibleCount = getVisibleCount();
      const maxIndex = cardCount - visibleCount;
      if (currentIndex > maxIndex) {
        currentIndex = maxIndex;
      }
      if (currentIndex < 0) {
        currentIndex = 0;
      }
      const offset = currentIndex * (100 / visibleCount);
      track.style.transform = `translateX(-${offset}%)`;
      
      prevBtn.disabled = currentIndex === 0;
      nextBtn.disabled = currentIndex >= maxIndex;
      prevBtn.style.opacity = currentIndex === 0 ? '0.4' : '1';
      nextBtn.style.opacity = currentIndex >= maxIndex ? '0.4' : '1';
    }

    prevBtn.addEventListener('click', () => {
      if (currentIndex > 0) {
        currentIndex--;
        updateSliderPosition();
      }
    });

    nextBtn.addEventListener('click', () => {
      const visibleCount = getVisibleCount();
      const maxIndex = cardCount - visibleCount;
      if (currentIndex < maxIndex) {
        currentIndex++;
        updateSliderPosition();
      }
    });

    toggleBtn.addEventListener('click', () => {
      const isGrid = track.classList.toggle('testimonials-grid-active');
      if (isGrid) {
        track.style.transform = 'none';
        controls.style.display = 'none';
        toggleBtn.textContent = 'Show Slider';
      } else {
        controls.style.display = 'flex';
        toggleBtn.textContent = 'View All Testimonials';
        currentIndex = 0;
        updateSliderPosition();
      }
    });

    window.addEventListener('resize', updateSliderPosition);
    updateSliderPosition();
  }
});

