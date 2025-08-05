// Lightweight Template JavaScript - No external dependencies

// Carousel functionality
let currentSlideIndex = 0;
let currentCarousel = 0; // 0 for first carousel, 1 for second carousel

// Initialize carousels when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Auto-advance removed - only manual navigation now
});

// Change slide function
function changeSlide(direction, carouselIndex = 0) {
    const carouselContainers = document.querySelectorAll('.carousel-container');
    if (carouselIndex >= carouselContainers.length) return;
    
    const container = carouselContainers[carouselIndex];
    const slides = container.querySelectorAll('.carousel-slide');
    const dots = container.querySelectorAll('.dot');
    
    if (carouselIndex === 0) {
        currentSlideIndex = (currentSlideIndex + direction + slides.length) % slides.length;
    } else {
        // For second carousel, use a separate counter
        let secondCarouselIndex = parseInt(container.dataset.currentIndex || 0);
        secondCarouselIndex = (secondCarouselIndex + direction + slides.length) % slides.length;
        container.dataset.currentIndex = secondCarouselIndex;
        currentSlideIndex = secondCarouselIndex;
    }
    
    // Hide all slides
    slides.forEach(slide => slide.classList.remove('active'));
    
    // Show current slide
    slides[currentSlideIndex].classList.add('active');
    
    // Update dots
    dots.forEach(dot => dot.classList.remove('active'));
    if (dots[currentSlideIndex]) {
        dots[currentSlideIndex].classList.add('active');
    }
}

// Go to specific slide
function currentSlide(slideNumber, carouselIndex = 0) {
    const carouselContainers = document.querySelectorAll('.carousel-container');
    if (carouselIndex >= carouselContainers.length) return;
    
    const container = carouselContainers[carouselIndex];
    const slides = container.querySelectorAll('.carousel-slide');
    const dots = container.querySelectorAll('.dot');
    
    if (carouselIndex === 0) {
        currentSlideIndex = slideNumber - 1;
    } else {
        container.dataset.currentIndex = slideNumber - 1;
        currentSlideIndex = slideNumber - 1;
    }
    
    // Hide all slides
    slides.forEach(slide => slide.classList.remove('active'));
    
    // Show current slide
    slides[currentSlideIndex].classList.add('active');
    
    // Update dots
    dots.forEach(dot => dot.classList.remove('active'));
    if (dots[currentSlideIndex]) {
        dots[currentSlideIndex].classList.add('active');
    }
}

// Keyboard navigation
document.addEventListener('keydown', function(event) {
    if (event.key === 'ArrowLeft') {
        changeSlide(-1, 0);
        changeSlide(-1, 1);
    } else if (event.key === 'ArrowRight') {
        changeSlide(1, 0);
        changeSlide(1, 1);
    }
});

// Touch/swipe support for mobile
let touchStartX = 0;
let touchEndX = 0;

document.addEventListener('touchstart', function(event) {
    touchStartX = event.changedTouches[0].screenX;
});

document.addEventListener('touchend', function(event) {
    touchEndX = event.changedTouches[0].screenX;
    handleSwipe();
});

function handleSwipe() {
    const swipeThreshold = 50;
    const diff = touchStartX - touchEndX;
    
    if (Math.abs(diff) > swipeThreshold) {
        if (diff > 0) {
            // Swipe left - next slide
            changeSlide(1, 0);
            changeSlide(1, 1);
        } else {
            // Swipe right - previous slide
            changeSlide(-1, 0);
            changeSlide(-1, 1);
        }
    }
}

// Lazy loading for images
function lazyLoadImages() {
    const images = document.querySelectorAll('img[loading="lazy"]');
    
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src || img.src;
                    img.classList.remove('lazy');
                    imageObserver.unobserve(img);
                }
            });
        });
        
        images.forEach(img => imageObserver.observe(img));
    } else {
        // Fallback for older browsers
        images.forEach(img => {
            img.src = img.dataset.src || img.src;
        });
    }
}

// Initialize lazy loading
document.addEventListener('DOMContentLoaded', lazyLoadImages);

// Smooth scrolling for anchor links
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

// Add loading states for videos
document.querySelectorAll('video').forEach(video => {
    video.addEventListener('loadstart', function() {
        this.style.opacity = '0.7';
    });
    
    video.addEventListener('canplay', function() {
        this.style.opacity = '1';
    });
    
    video.addEventListener('error', function() {
        console.warn('Video failed to load:', this.src);
    });
});

// Performance optimization: Debounce resize events
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Handle window resize for responsive design
window.addEventListener('resize', debounce(function() {
    // Recalculate carousel positions if needed
    const carouselContainers = document.querySelectorAll('.carousel-container');
    carouselContainers.forEach(container => {
        // Force reflow for smooth transitions
        container.style.display = 'none';
        container.offsetHeight; // Trigger reflow
        container.style.display = 'block';
    });
}, 250));

// Add accessibility features
document.addEventListener('DOMContentLoaded', function() {
    // Add ARIA labels to carousel buttons
    document.querySelectorAll('.carousel-btn').forEach((btn, index) => {
        const isPrev = btn.classList.contains('prev');
        btn.setAttribute('aria-label', isPrev ? 'Previous slide' : 'Next slide');
        btn.setAttribute('role', 'button');
        btn.setAttribute('tabindex', '0');
    });
    
    // Add keyboard support for carousel buttons
    document.querySelectorAll('.carousel-btn').forEach(btn => {
        btn.addEventListener('keydown', function(event) {
            if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                this.click();
            }
        });
    });
    
    // Add ARIA labels to dots
    document.querySelectorAll('.dot').forEach((dot, index) => {
        dot.setAttribute('aria-label', `Go to slide ${index + 1}`);
        dot.setAttribute('role', 'button');
        dot.setAttribute('tabindex', '0');
    });
}); 