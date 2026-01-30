/* =====================================================
   HOMELIFE PREMIUM - SLIDER.JS
   Sistema de Hero Slider con auto-play y controles
   ===================================================== */

// ===== CONFIGURACIÓN DEL SLIDER =====
const SLIDER_CONFIG = {
    autoPlayInterval: 3000, // 3 segundos
    transitionDuration: 1000, // 1 segundo
    pauseOnHover: true
};

// ===== ESTADO DEL SLIDER =====
let currentSlide = 0;
let totalSlides = 0;
let autoPlayTimer = null;
let isPaused = false;
let slides = [];
let dots = [];

// ===== INICIALIZAR SLIDER =====
function initSlider() {
    // Obtener elementos
    slides = document.querySelectorAll('.hero-slide');
    dots = document.querySelectorAll('.slider-dot');
    const sliderContainer = document.getElementById('heroSlider');
    
    if (!slides.length) {
        console.warn('No se encontraron slides');
        return;
    }
    
    totalSlides = slides.length;
    
    // Configurar primer slide como activo
    setActiveSlide(0);
    
    // Iniciar auto-play
    startAutoPlay();
    
    // Pausar en hover si está configurado
    if (SLIDER_CONFIG.pauseOnHover && sliderContainer) {
        sliderContainer.addEventListener('mouseenter', pauseAutoPlay);
        sliderContainer.addEventListener('mouseleave', resumeAutoPlay);
    }
    
    // Soporte para gestos táctiles (swipe)
    if (sliderContainer) {
        setupTouchEvents(sliderContainer);
    }
    
    console.log(`Slider inicializado con ${totalSlides} slides`);
}

// ===== ESTABLECER SLIDE ACTIVO =====
function setActiveSlide(index) {
    // Validar índice
    if (index < 0) {
        index = totalSlides - 1;
    } else if (index >= totalSlides) {
        index = 0;
    }
    
    currentSlide = index;
    
    // Actualizar slides
    slides.forEach((slide, i) => {
        if (i === currentSlide) {
            slide.classList.add('active');
        } else {
            slide.classList.remove('active');
        }
    });
    
    // Actualizar dots
    dots.forEach((dot, i) => {
        if (i === currentSlide) {
            dot.classList.add('active');
        } else {
            dot.classList.remove('active');
        }
    });
}

// ===== IR AL SIGUIENTE SLIDE =====
function nextSlide() {
    setActiveSlide(currentSlide + 1);
}

// ===== IR AL SLIDE ANTERIOR =====
function prevSlide() {
    setActiveSlide(currentSlide - 1);
}

// ===== IR A SLIDE ESPECÍFICO =====
function goToSlide(index) {
    setActiveSlide(index);
    
    // Reiniciar auto-play
    if (autoPlayTimer) {
        stopAutoPlay();
        startAutoPlay();
    }
}

// ===== INICIAR AUTO-PLAY =====
function startAutoPlay() {
    if (autoPlayTimer) {
        clearInterval(autoPlayTimer);
    }
    
    autoPlayTimer = setInterval(() => {
        if (!isPaused) {
            nextSlide();
        }
    }, SLIDER_CONFIG.autoPlayInterval);
}

// ===== DETENER AUTO-PLAY =====
function stopAutoPlay() {
    if (autoPlayTimer) {
        clearInterval(autoPlayTimer);
        autoPlayTimer = null;
    }
}

// ===== PAUSAR AUTO-PLAY =====
function pauseAutoPlay() {
    isPaused = true;
}

// ===== REANUDAR AUTO-PLAY =====
function resumeAutoPlay() {
    isPaused = false;
}

// ===== CONFIGURAR EVENTOS TÁCTILES (SWIPE) =====
function setupTouchEvents(element) {
    let touchStartX = 0;
    let touchEndX = 0;
    
    element.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });
    
    element.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
    }, { passive: true });
    
    function handleSwipe() {
        const swipeThreshold = 50; // Mínimo de píxeles para considerar swipe
        
        if (touchEndX < touchStartX - swipeThreshold) {
            // Swipe hacia la izquierda (siguiente)
            nextSlide();
            stopAutoPlay();
            startAutoPlay();
        }
        
        if (touchEndX > touchStartX + swipeThreshold) {
            // Swipe hacia la derecha (anterior)
            prevSlide();
            stopAutoPlay();
            startAutoPlay();
        }
    }
}

// ===== SOPORTE PARA TECLADO =====
function setupKeyboardNavigation() {
    document.addEventListener('keydown', (e) => {
        // Solo si el slider está visible
        const sliderContainer = document.getElementById('heroSlider');
        if (!sliderContainer) return;
        
        const rect = sliderContainer.getBoundingClientRect();
        const isVisible = rect.top < window.innerHeight && rect.bottom > 0;
        
        if (!isVisible) return;
        
        switch(e.key) {
            case 'ArrowLeft':
                prevSlide();
                stopAutoPlay();
                startAutoPlay();
                break;
            case 'ArrowRight':
                nextSlide();
                stopAutoPlay();
                startAutoPlay();
                break;
            case ' ': // Espacio
                if (isPaused) {
                    resumeAutoPlay();
                } else {
                    pauseAutoPlay();
                }
                e.preventDefault();
                break;
        }
    });
}

// ===== DETENER SLIDER AL SALIR DE LA PÁGINA =====
function cleanupSlider() {
    stopAutoPlay();
}

// ===== REINICIAR SLIDER =====
function resetSlider() {
    stopAutoPlay();
    setActiveSlide(0);
    startAutoPlay();
}

// ===== OBTENER INFORMACIÓN DEL SLIDER =====
function getSliderInfo() {
    return {
        currentSlide: currentSlide,
        totalSlides: totalSlides,
        isPaused: isPaused,
        autoPlayActive: autoPlayTimer !== null
    };
}

// ===== AUTO-INICIALIZAR AL CARGAR DOM =====
document.addEventListener('DOMContentLoaded', function() {
    initSlider();
    setupKeyboardNavigation();
    
    console.log('Slider.js inicializado');
});

// ===== LIMPIAR AL SALIR =====
window.addEventListener('beforeunload', cleanupSlider);

// ===== PAUSAR SI LA PESTAÑA NO ESTÁ VISIBLE =====
document.addEventListener('visibilitychange', function() {
    if (document.hidden) {
        pauseAutoPlay();
    } else {
        resumeAutoPlay();
    }
});

// ===== EXPORTAR API PÚBLICA =====
window.SliderSystem = {
    // Métodos principales
    init: initSlider,
    next: nextSlide,
    prev: prevSlide,
    goToSlide: goToSlide,
    
    // Control de auto-play
    start: startAutoPlay,
    stop: stopAutoPlay,
    pause: pauseAutoPlay,
    resume: resumeAutoPlay,
    reset: resetSlider,
    
    // Información
    getInfo: getSliderInfo,
    
    // Estado
    get currentSlide() { return currentSlide; },
    get totalSlides() { return totalSlides; },
    get isPaused() { return isPaused; }
};

/* ===== FIN SLIDER.JS ===== */