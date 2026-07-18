document.addEventListener('DOMContentLoaded', () => {
    // 1. Interactive Cursor Glow Background
    const glowEl = document.querySelector('.cursor-glow');
    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let currentX = mouseX;
    let currentY = mouseY;

    window.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
    });

    // Smooth interpolation for the mouse glow
    function updateGlowPosition() {
        // Dampen the movements for a premium, heavy feel
        currentX += (mouseX - currentX) * 0.1;
        currentY += (mouseY - currentY) * 0.1;
        
        if (glowEl) {
            glowEl.style.setProperty('--mouse-x', `${currentX}px`);
            glowEl.style.setProperty('--mouse-y', `${currentY}px`);
        }
        requestAnimationFrame(updateGlowPosition);
    }
    updateGlowPosition();

    // 2. Navigation Styling on Scroll
    const nav = document.querySelector('nav');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            nav.classList.add('scrolled');
        } else {
            nav.classList.remove('scrolled');
        }
    });

    // 3. Scroll Reveal & Skill Progress Animations (Intersection Observer)
    const revealOptions = {
        root: null,
        threshold: 0.15,
        rootMargin: '0px 0px -50px 0px'
    };

    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                // Once it is shown, we can unobserve if we only want entrance-once animations
                observer.unobserve(entry.target);
            }
        });
    }, revealOptions);

    // Observe reveal elements
    const revealElements = document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .skill-item');
    revealElements.forEach(el => {
        revealObserver.observe(el);
    });

    // 4. Reviews Slider
    let currentSlide = 0;
    const slider = document.getElementById('reviewsSlider');
    const dots = document.querySelectorAll('.dot');
    const reviewCards = document.querySelectorAll('.review-card');
    const totalSlides = reviewCards.length;
    let autoSlideInterval;

    function goToSlide(n) {
        currentSlide = n;
        if (slider) {
            slider.style.transform = `translateX(-${currentSlide * 100}%)`;
        }
        updateDots();
    }

    function updateDots() {
        dots.forEach((dot, index) => {
            dot.classList.toggle('active', index === currentSlide);
        });
    }

    function nextSlide() {
        currentSlide = (currentSlide + 1) % totalSlides;
        goToSlide(currentSlide);
    }

    // Expose goToSlide globally to let HTML dot onclicks use it
    window.goToSlide = (n) => {
        goToSlide(n);
        resetAutoSlide();
    };

    // Auto-slide every 6 seconds
    function startAutoSlide() {
        autoSlideInterval = setInterval(nextSlide, 6000);
    }

    function resetAutoSlide() {
        clearInterval(autoSlideInterval);
        startAutoSlide();
    }

    if (totalSlides > 0) {
        startAutoSlide();
    }

    // 5. Play Video on Click (Autoplay integration)
    window.playVideo = (element) => {
        element.classList.add('playing');
        
        // Find iframe inside and try to append autoplay query parameter if it exists
        const iframe = element.querySelector('iframe');
        if (iframe) {
            let src = iframe.getAttribute('src');
            if (src && !src.includes('autoplay=1')) {
                src += (src.includes('?') ? '&' : '?') + 'autoplay=1';
                iframe.setAttribute('src', src);
            }
        }
    };

    // 6. Smooth Scroll for Anchor Links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href !== '#') {
                e.preventDefault();
                const target = document.querySelector(href);
                if (target) {
                    const navHeight = nav ? nav.offsetHeight : 0;
                    const targetPosition = target.getBoundingClientRect().top + window.scrollY - navHeight;
                    
                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });
                }
            }
        });
    });
});
