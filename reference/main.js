document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM loaded, starting cursor test...');
  
  // Test if we can see the red test cursor
  const testCursor = document.getElementById('test-cursor');
  if (testCursor) {
    console.log('Test cursor found:', testCursor);
    // Move test cursor with mouse to verify it works
    document.addEventListener('mousemove', (e) => {
      testCursor.style.left = e.clientX + 'px';
      testCursor.style.top = e.clientY + 'px';
    });
  }

  // Performance-optimized Custom Cursor System
  function initCustomCursor() {
    // Force hide default cursor
    document.body.style.cursor = 'none';
    document.documentElement.style.cursor = 'none';
    
    // Add styles to ensure cursor is hidden
    const style = document.createElement('style');
    style.textContent = `
      *, *::before, *::after { cursor: none !important; }
      html, body { cursor: none !important; }
    `;
    document.head.appendChild(style);

    // Create cursor
    const cursor = document.createElement('div');
    cursor.className = 'custom-cursor';
    document.body.appendChild(cursor);

    let mouseX = 0;
    let mouseY = 0;
    let isSnapped = false;
    let currentElement = null;

    // Track mouse with requestAnimationFrame for better performance
    document.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    });

    // High-performance cursor following - direct positioning
    function updateCursor() {
      if (!isSnapped) {
        // Direct positioning for maximum performance
        cursor.style.left = mouseX + 'px';
        cursor.style.top = mouseY + 'px';
      }
      
      requestAnimationFrame(updateCursor);
    }
    updateCursor();

    // Optimized cursor states with smoother animations
    function setCursor(state, element = null) {
      if (state === 'button-magnetic' && element) {
        const rect = element.getBoundingClientRect();
        isSnapped = true;
        currentElement = element;
        
        cursor.className = 'custom-cursor button-magnetic';
        if (element.classList.contains('btn-secondary')) {
          cursor.classList.add('secondary');
        }
        
        cursor.style.setProperty('--btn-width', rect.width + 'px');
        cursor.style.setProperty('--btn-height', rect.height + 'px');
        
        let buttonText = element.textContent.trim();
        buttonText = buttonText.replace(/[📦📖⚡🎨🔧🚀]/g, '').trim();
        cursor.style.setProperty('--btn-text', `"${buttonText}"`);
        
        cursor.style.left = (rect.left + rect.width / 2) + 'px';
        cursor.style.top = (rect.top + rect.height / 2) + 'px';
        
        element.style.opacity = '0';
        element.style.transition = 'opacity 0.2s ease';
        
      } else if (state === 'nav-magnetic' && element) {
        const rect = element.getBoundingClientRect();
        isSnapped = true;
        currentElement = element;
        
        cursor.className = 'custom-cursor nav-magnetic';
        cursor.style.setProperty('--nav-width', (rect.width + 20) + 'px');
        
        const navText = element.textContent.trim();
        cursor.style.setProperty('--nav-text', `"${navText}"`);
        
        cursor.style.left = (rect.left + rect.width / 2) + 'px';
        cursor.style.top = (rect.top + rect.height / 2) + 'px';
        
      } else if (state === 'play-magnetic' && element) {
        const rect = element.getBoundingClientRect();
        isSnapped = true;
        currentElement = element;
        
        cursor.className = 'custom-cursor play-magnetic';
        
        cursor.style.left = (rect.left + rect.width / 2) + 'px';
        cursor.style.top = (rect.top + rect.height / 2) + 'px';
        
        element.style.opacity = '0';
        element.style.transition = 'opacity 0.2s ease';
        
      } else {
        // Smoother exit transition
        if (cursor.classList.contains('nav-magnetic') || 
            cursor.classList.contains('button-magnetic') || 
            cursor.classList.contains('play-magnetic')) {
          // Add a brief transition for smoother exit
          cursor.style.transition = 'all 0.15s cubic-bezier(0.23, 1, 0.32, 1)';
          
          // Reset after transition
          setTimeout(() => {
            cursor.style.transition = 'width 0.25s cubic-bezier(0.25, 0.46, 0.45, 0.94), height 0.25s cubic-bezier(0.25, 0.46, 0.45, 0.94), background 0.25s ease';
          }, 150);
        }
        
        cursor.className = `custom-cursor ${state}`;
        isSnapped = false;
        currentElement = null;
        
        cursor.style.removeProperty('--btn-text');
        cursor.style.removeProperty('--nav-text');
        
        document.querySelectorAll('[style*="opacity: 0"]').forEach(el => {
          el.style.opacity = '1';
        });
      }
    }

    // Button events
    document.querySelectorAll('.btn').forEach(btn => {
      btn.addEventListener('mouseenter', () => setCursor('button-magnetic', btn));
      btn.addEventListener('mouseleave', () => setCursor(''));
    });

    // Logo events
    const logo = document.querySelector('.logo');
    if (logo) {
      logo.addEventListener('mouseenter', () => setCursor('logo'));
      logo.addEventListener('mouseleave', () => setCursor(''));
    }

    // Nav events
    document.querySelectorAll('.nav-menu a').forEach(link => {
      link.addEventListener('mouseenter', () => setCursor('nav-magnetic', link));
      link.addEventListener('mouseleave', () => setCursor(''));
    });

    // Play button
    const playBtn = document.querySelector('.play-btn');
    if (playBtn) {
      playBtn.addEventListener('mouseenter', () => setCursor('play-magnetic', playBtn));
      playBtn.addEventListener('mouseleave', () => setCursor(''));
    }

    // Text cursor events
    document.querySelectorAll('p, h1, h2, h3, h4, span:not(.btn-icon)').forEach(text => {
      text.addEventListener('mouseenter', () => setCursor('text'));
      text.addEventListener('mouseleave', () => setCursor(''));
    });

    // Hover events for cards and interactive elements
    document.querySelectorAll('.feature-card, .step, .tech-item, code, .code-preview').forEach(el => {
      el.addEventListener('mouseenter', () => setCursor('hover'));
      el.addEventListener('mouseleave', () => setCursor(''));
    });

    // Update snapped cursor position when element moves (e.g., on scroll)
    function updateSnappedPosition() {
      if (isSnapped && currentElement) {
        const rect = currentElement.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        cursor.style.left = centerX + 'px';
        cursor.style.top = centerY + 'px';
      }
    }

    // Update position on scroll
    window.addEventListener('scroll', updateSnappedPosition);
    window.addEventListener('resize', updateSnappedPosition);
  }

  // Initialize cursor on desktop only
  if (window.innerWidth > 768 && !('ontouchstart' in window)) {
    initCustomCursor();
  }

  // Smooth scrolling for anchor links
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', e => {
      e.preventDefault();
      const targetId = link.getAttribute('href');
      const target = document.querySelector(targetId);
      
      if (target) {
        const navHeight = document.querySelector('.navbar').offsetHeight;
        const targetPosition = target.offsetTop - navHeight - 20;
        
        window.scrollTo({
          top: targetPosition,
          behavior: 'smooth'
        });
      }
    });
  });

  // Initialize AOS animations
  AOS.init({
    duration: 800,
    easing: 'ease-out-cubic',
    once: true,
    offset: 100
  });

  // Loading screen
  window.addEventListener('load', () => {
    const loadingScreen = document.querySelector('.loading-screen');
    setTimeout(() => {
      loadingScreen.classList.add('fade-out');
      setTimeout(() => {
        loadingScreen.style.display = 'none';
      }, 500);
    }, 1500);
  });

  // Smooth scrolling for navigation links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        target.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    });
  });

  // Navbar scroll effect
  window.addEventListener('scroll', () => {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 100) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  });

  // Mobile menu toggle
  const navToggle = document.querySelector('.nav-toggle');
  const navMenu = document.querySelector('.nav-menu');

  navToggle.addEventListener('click', () => {
    navMenu.classList.toggle('active');
    navToggle.classList.toggle('active');
  });

  // Demo video simulation
  const playBtn = document.querySelector('.play-btn');
  const demoContainer = document.querySelector('.demo-container');

  playBtn.addEventListener('click', () => {
    demoContainer.classList.add('playing');
    playBtn.style.opacity = '0';
    
    // Simulate video playing
    setTimeout(() => {
      demoContainer.classList.remove('playing');
      playBtn.style.opacity = '1';
    }, 3000);
  });

  // Demo tabs
  const demoTabs = document.querySelectorAll('.demo-tab');
  const demoImage = document.querySelector('.demo-image');

  demoTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      demoTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      
      // Simulate different demo content
      const demoType = tab.dataset.demo;
      demoImage.style.transform = 'scale(0.95)';
      setTimeout(() => {
        demoImage.src = `assets/quickshell-${demoType}.png`;
        demoImage.style.transform = 'scale(1)';
      }, 200);
    });
  });

  // Copy to clipboard functionality
  document.querySelectorAll('.copy-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const textToCopy = btn.dataset.copy;
      navigator.clipboard.writeText(textToCopy).then(() => {
        btn.textContent = '✅';
        btn.style.background = 'var(--success)';
        setTimeout(() => {
          btn.textContent = '📋';
          btn.style.background = '';
        }, 2000);
      });
    });
  });

  // Parallax effect for floating elements
  window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    const rate = scrolled * -0.5;
    
    document.querySelectorAll('.floating-box').forEach((box, index) => {
      box.style.transform = `translateY(${rate * (index + 1) * 0.3}px)`;
    });
  });

  // Feature cards hover effect
  document.querySelectorAll('.feature-card').forEach(card => {
    card.addEventListener('mouseenter', () => {
      card.style.transform = 'translateY(-10px) scale(1.02)';
    });
    
    card.addEventListener('mouseleave', () => {
      card.style.transform = 'translateY(0) scale(1)';
    });
  });

  // Testimonials auto-rotation
  let currentTestimonial = 0;
  const testimonials = document.querySelectorAll('.testimonial-card');

  function rotateTestimonials() {
    testimonials.forEach((card, index) => {
      card.classList.toggle('highlighted', index === currentTestimonial);
    });
    currentTestimonial = (currentTestimonial + 1) % testimonials.length;
  }

  // Start testimonial rotation
  setInterval(rotateTestimonials, 4000);

  // Add sparkle effect on button hover
  document.querySelectorAll('.btn-glow').forEach(btn => {
    btn.addEventListener('mouseenter', createSparkles);
  });

  function createSparkles(e) {
    for (let i = 0; i < 6; i++) {
      const sparkle = document.createElement('div');
      sparkle.className = 'sparkle';
      sparkle.style.left = Math.random() * 100 + '%';
      sparkle.style.top = Math.random() * 100 + '%';
      sparkle.style.animationDelay = Math.random() * 0.5 + 's';
      e.target.appendChild(sparkle);
      
      setTimeout(() => sparkle.remove(), 1000);
    }
  }

  // Intersection Observer for count-up animations
  const observerOptions = {
    threshold: 0.5,
    rootMargin: '0px 0px -100px 0px'
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateNumbers(entry.target);
      }
    });
  }, observerOptions);

  document.querySelectorAll('.stat-number').forEach(stat => {
    observer.observe(stat);
  });

  function animateNumbers(element) {
    const target = element.textContent;
    const isNumber = target.match(/\d+/);
    
    if (isNumber) {
      const number = parseInt(isNumber[0]);
      const increment = number / 50;
      let current = 0;
      
      const timer = setInterval(() => {
        current += increment;
        if (current >= number) {
          current = number;
          clearInterval(timer);
        }
        element.textContent = target.replace(/\d+/, Math.floor(current));
      }, 30);
    }
  }
});
