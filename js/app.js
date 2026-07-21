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

// Helper function to display custom success notification alert
function showCustomAlert(title, text) {
  let alertPopup = document.querySelector('.alert-popup');
  if (!alertPopup) {
    alertPopup = document.createElement('div');
    alertPopup.className = 'alert-popup';
    document.body.appendChild(alertPopup);
  }
  alertPopup.innerHTML = `
    <div class="alert-popup__icon">
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
        <path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    </div>
    <div>
      <div class="alert-popup__title">${title}</div>
      <div class="alert-popup__text">${text}</div>
    </div>
  `;
  alertPopup.classList.add('alert-popup--show');
  setTimeout(() => {
    alertPopup.classList.remove('alert-popup--show');
  }, 4000);
}

// 6. Enquiry Form Submission validation & custom success pop-up alert
function initEnquiryForm() {
  const form = document.querySelector('.enquiry-form');
  if (!form) return;

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
      showCustomAlert('Enquiry Submitted', 'Thank you! We will get in touch with you shortly.');
      form.reset();
      submitBtn.disabled = false;
      submitBtn.textContent = originalText;
    }, 1200);
  });
}

// Testimonials Slider / Carousel Controller
document.addEventListener('DOMContentLoaded', () => {
  const track = document.querySelector('.testimonials-track');
  const prevBtn = document.querySelector('.prev-btn');
  const nextBtn = document.querySelector('.next-btn');
  const toggleBtn = document.querySelector('.testimonials-toggle-btn');
  const openFeedbackBtn = document.querySelector('.open-feedback-modal-btn');
  const feedbackModal = document.querySelector('#feedback-modal');
  const closeFeedbackBtn = document.querySelector('#close-feedback-modal');
  const feedbackForm = document.querySelector('#feedback-form');
  const lightboxModal = document.querySelector('#lightbox-modal');
  const closeLightboxBtn = document.querySelector('#close-lightbox');
  const lightboxImg = document.querySelector('#lightbox-img');
  const lightboxCaption = document.querySelector('#lightbox-caption');
  const controls = document.querySelector('.slider-controls');

  if (track && prevBtn && nextBtn && toggleBtn) {
    let currentIndex = 0;
    let cards = Array.from(track.children);
    let cardCount = cards.length;
    let autoplayInterval = null;
    const sliderContainer = document.querySelector('.testimonials-slider-container');

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
      
      // Infinite loop adjustments: if out of bounds, wrap around
      if (currentIndex > maxIndex) {
        currentIndex = 0;
      }
      if (currentIndex < 0) {
        currentIndex = maxIndex >= 0 ? maxIndex : 0;
      }

      // Calculate pixel translation offset exactly to prevent cutoff/cropping
      if (sliderContainer) {
        const containerWidth = sliderContainer.getBoundingClientRect().width;
        const gap = 30; // Matches css layout gap
        const offset = currentIndex * (containerWidth + gap) / visibleCount;
        track.style.transform = `translateX(-${offset}px)`;
      } else {
        const offset = currentIndex * (100 / visibleCount);
        track.style.transform = `translateX(-${offset}%)`;
      }
      
      // In infinite loop, the navigation buttons are always enabled and full opacity
      prevBtn.disabled = false;
      nextBtn.disabled = false;
      prevBtn.style.opacity = '1';
      nextBtn.style.opacity = '1';
    }

    // Prev / Next button listeners
    prevBtn.addEventListener('click', () => {
      currentIndex--;
      updateSliderPosition();
      resetAutoplay();
    });

    nextBtn.addEventListener('click', () => {
      currentIndex++;
      updateSliderPosition();
      resetAutoplay();
    });

    // Autoplay functions
    function startAutoplay() {
      if (autoplayInterval) clearInterval(autoplayInterval);
      autoplayInterval = setInterval(() => {
        if (!track.classList.contains('testimonials-grid-active')) {
          currentIndex++;
          updateSliderPosition();
        }
      }, 4500);
    }

    function stopAutoplay() {
      if (autoplayInterval) clearInterval(autoplayInterval);
    }

    function resetAutoplay() {
      stopAutoplay();
      startAutoplay();
    }

    // Start autoplay initially
    startAutoplay();

    // Pause autoplay on hover
    const container = document.querySelector('.testimonials-slider-container');
    if (container) {
      container.addEventListener('mouseenter', stopAutoplay);
      container.addEventListener('mouseleave', startAutoplay);
    }

    // View All / Show Slider Toggle
    toggleBtn.addEventListener('click', () => {
      const isGrid = track.classList.toggle('testimonials-grid-active');
      if (isGrid) {
        track.style.transform = 'none';
        controls.style.display = 'none';
        toggleBtn.textContent = 'Show Slider';
        stopAutoplay();
      } else {
        controls.style.display = 'flex';
        toggleBtn.textContent = 'View All Testimonials';
        currentIndex = 0;
        updateSliderPosition();
        startAutoplay();
      }
    });

    window.addEventListener('resize', () => {
      updateSliderPosition();
    });
    updateSliderPosition();

    // --- Lightbox Image Zoom Functionality ---
    // Use event delegation on document click to handle dynamically added cards too!
    document.addEventListener('click', (e) => {
      if (e.target && e.target.classList.contains('testimonial-card__avatar')) {
        const avatarImg = e.target;
        const profileContainer = avatarImg.closest('.testimonial-card__profile');
        let name = '';
        let role = '';
        if (profileContainer) {
          const nameEl = profileContainer.querySelector('.testimonial-card__name');
          const roleEl = profileContainer.querySelector('.testimonial-card__role');
          if (nameEl) name = nameEl.textContent;
          if (roleEl) role = roleEl.textContent;
        }
        
        lightboxImg.src = avatarImg.src;
        lightboxCaption.innerHTML = `${name} <span style="font-weight: 300; font-size: 0.95rem; display: block; margin-top: 4px; color: #cbd5e1;">${role}</span>`;
        lightboxModal.classList.add('lightbox-overlay--show');
      }
    });

    if (closeLightboxBtn && lightboxModal) {
      closeLightboxBtn.addEventListener('click', () => {
        lightboxModal.classList.remove('lightbox-overlay--show');
      });
      lightboxModal.addEventListener('click', (e) => {
        if (e.target === lightboxModal) {
          lightboxModal.classList.remove('lightbox-overlay--show');
        }
      });
    }

    // --- Give Feedback Modal Logic ---
    if (openFeedbackBtn && feedbackModal && closeFeedbackBtn) {
      openFeedbackBtn.addEventListener('click', () => {
        feedbackModal.classList.add('modal-overlay--show');
        stopAutoplay();
      });

      closeFeedbackBtn.addEventListener('click', () => {
        feedbackModal.classList.remove('modal-overlay--show');
        if (!track.classList.contains('testimonials-grid-active')) {
          startAutoplay();
        }
      });

      feedbackModal.addEventListener('click', (e) => {
        if (e.target === feedbackModal) {
          feedbackModal.classList.remove('modal-overlay--show');
          if (!track.classList.contains('testimonials-grid-active')) {
            startAutoplay();
          }
        }
      });

      // Star rating interaction selector
      const stars = document.querySelectorAll('.star-item');
      const ratingInput = document.querySelector('#fb-rating');
      stars.forEach(star => {
        star.addEventListener('click', () => {
          const ratingVal = parseInt(star.getAttribute('data-rating'));
          ratingInput.value = ratingVal;
          stars.forEach(s => {
            const sVal = parseInt(s.getAttribute('data-rating'));
            if (sVal <= ratingVal) {
              s.classList.add('star-item--active');
            } else {
              s.classList.remove('star-item--active');
            }
          });
        });
      });

      // Form submission handler to inject card dynamically
      if (feedbackForm) {
        feedbackForm.addEventListener('submit', (e) => {
          e.preventDefault();
          const nameVal = document.querySelector('#fb-name').value.trim();
          const roleVal = document.querySelector('#fb-role').value.trim();
          const ratingVal = parseInt(ratingInput.value);
          const quoteVal = document.querySelector('#fb-quote').value.trim();
          
          // Get selected avatar image url
          const selectedAvatar = document.querySelector('input[name="fb-avatar"]:checked').value;

          if (quoteVal.length < 20) {
            alert('Feedback must be at least 20 characters.');
            return;
          }

          // Build stars string
          let starsStr = '';
          for (let i = 0; i < ratingVal; i++) {
            starsStr += '★';
          }

          // Create new testimonial card DOM structure
          const newCard = document.createElement('div');
          newCard.className = 'testimonial-card';
          newCard.style.opacity = '0';
          newCard.style.transition = 'opacity 0.5s ease';
          newCard.innerHTML = `
            <span class="testimonial-card__quote-icon">“</span>
            <div class="testimonial-card__stars" style="color: #ffb900;">${starsStr}</div>
            <p class="testimonial-card__quote">${quoteVal}</p>
            <div class="testimonial-card__profile">
              <img src="${selectedAvatar}" alt="${nameVal}, Leapnest Alumni" class="testimonial-card__avatar">
              <div style="text-align: left;">
                <div class="testimonial-card__name">${nameVal}</div>
                <div class="testimonial-card__role">${roleVal}</div>
              </div>
            </div>
          `;

          // Append card to track list
          track.appendChild(newCard);

          // Update tracking variables
          cards = Array.from(track.children);
          cardCount = cards.length;

          // Close modal and reset form
          feedbackModal.classList.remove('modal-overlay--show');
          feedbackForm.reset();
          
          // Reset stars display to 5 stars default
          stars.forEach(s => s.classList.add('star-item--active'));
          ratingInput.value = '5';

          // Trigger success popup notification
          showCustomAlert('Feedback Submitted', 'Thank you! Your feedback has been added to our success stories list.');

          // Refresh slider layout positions
          setTimeout(() => {
            newCard.style.opacity = '1';
          }, 50);

          // Scroll slider view directly to show the newly added feedback card
          const visibleCount = getVisibleCount();
          const maxIndex = cardCount - visibleCount;
          currentIndex = maxIndex >= 0 ? maxIndex : 0;
          updateSliderPosition();

          // Resume autoplay loop
          startAutoplay();
        });
      }
    }
  }
});



