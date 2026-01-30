/* =====================================================
   HOMELIFE PREMIUM - UTILS.JS
   Funciones auxiliares y utilidades globales
   ===================================================== */

// ===== CONFIGURACIÓN GLOBAL =====
const CONFIG = {
    apiUrl: 'assets/data/',
    imageUrl: 'assets/images/',
    language: localStorage.getItem('language') || 'es',
    currency: 'COP',
    currencySymbol: '$'
};

// ===== FORMATEAR PRECIOS =====
function formatPrice(price) {
    return `${CONFIG.currencySymbol}${price.toLocaleString('es-CO')}`;
}

// ===== CALCULAR DESCUENTO =====
function calculateDiscount(originalPrice, discountedPrice) {
    const discount = ((originalPrice - discountedPrice) / originalPrice) * 100;
    return Math.round(discount);
}

// ===== CALCULAR AHORRO =====
function calculateSavings(originalPrice, discountedPrice) {
    return originalPrice - discountedPrice;
}

// ===== MOSTRAR NOTIFICACIÓN =====
function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <span class="notification-icon">${getNotificationIcon(type)}</span>
            <span class="notification-message">${message}</span>
        </div>
    `;
    
    // Estilos en línea para la notificación
    notification.style.cssText = `
        position: fixed;
        bottom: 30px;
        right: 30px;
        background: ${getNotificationColor(type)};
        color: white;
        padding: 15px 25px;
        border-radius: 10px;
        box-shadow: 0 5px 20px rgba(0,0,0,0.2);
        z-index: 9999;
        font-weight: 600;
        animation: slideInRight 0.3s ease;
        display: flex;
        align-items: center;
        gap: 10px;
    `;
    
    document.body.appendChild(notification);
    
    // Remover después de 3 segundos
    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transform = 'translateX(100px)';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// ===== OBTENER ICONO DE NOTIFICACIÓN =====
function getNotificationIcon(type) {
    const icons = {
        success: '✓',
        error: '✕',
        warning: '⚠',
        info: 'ℹ'
    };
    return icons[type] || icons.info;
}

// ===== OBTENER COLOR DE NOTIFICACIÓN =====
function getNotificationColor(type) {
    const colors = {
        success: '#28a745',
        error: '#dc3545',
        warning: '#ffc107',
        info: '#17a2b8'
    };
    return colors[type] || colors.info;
}

// ===== CARGAR ARCHIVO JSON =====
async function loadJSON(filename) {
    try {
        const response = await fetch(`${CONFIG.apiUrl}${filename}`);
        if (!response.ok) throw new Error(`Error loading ${filename}`);
        return await response.json();
    } catch (error) {
        console.error('Error loading JSON:', error);
        return null;
    }
}

// ===== CARGAR COMPONENTE HTML =====
async function loadComponent(elementId, filePath) {
    try {
        const response = await fetch(filePath);
        if (!response.ok) throw new Error(`Error loading ${filePath}`);
        const html = await response.text();
        const element = document.getElementById(elementId);
        if (element) {
            element.innerHTML = html;
        }
    } catch (error) {
        console.error('Error loading component:', error);
    }
}

// ===== OBTENER PARÁMETRO DE URL =====
function getUrlParameter(name) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(name);
}

// ===== GUARDAR EN LOCALSTORAGE =====
function saveToLocalStorage(key, data) {
    try {
        localStorage.setItem(key, JSON.stringify(data));
        return true;
    } catch (error) {
        console.error('Error saving to localStorage:', error);
        return false;
    }
}

// ===== OBTENER DE LOCALSTORAGE =====
function getFromLocalStorage(key) {
    try {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : null;
    } catch (error) {
        console.error('Error getting from localStorage:', error);
        return null;
    }
}

// ===== ELIMINAR DE LOCALSTORAGE =====
function removeFromLocalStorage(key) {
    try {
        localStorage.removeItem(key);
        return true;
    } catch (error) {
        console.error('Error removing from localStorage:', error);
        return false;
    }
}

// ===== VALIDAR EMAIL =====
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

// ===== VALIDAR TELÉFONO COLOMBIANO =====
function validatePhone(phone) {
    const re = /^(\+57)?[3][0-9]{9}$/;
    return re.test(phone.replace(/\s/g, ''));
}

// ===== DEBOUNCE (Para búsquedas) =====
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

// ===== SCROLL SUAVE A ELEMENTO =====
function smoothScrollTo(elementId) {
    const element = document.getElementById(elementId);
    if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

// ===== GENERAR ID ÚNICO =====
function generateUniqueId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// ===== FORMATEAR FECHA =====
function formatDate(date, locale = 'es-CO') {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(date).toLocaleDateString(locale, options);
}

// ===== TRUNCAR TEXTO =====
function truncateText(text, maxLength) {
    if (text.length <= maxLength) return text;
    return text.substr(0, maxLength) + '...';
}

// ===== CAPITALIZAR PRIMERA LETRA =====
function capitalize(text) {
    return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
}

// ===== GENERAR ESTRELLAS DE RATING =====
function generateStars(rating) {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    let starsHTML = '';
    
    for (let i = 0; i < fullStars; i++) {
        starsHTML += '<span class="star star-full">★</span>';
    }
    
    if (hasHalfStar) {
        starsHTML += '<span class="star star-half">★</span>';
    }
    
    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
        starsHTML += '<span class="star star-empty">☆</span>';
    }
    
    return starsHTML;
}

// ===== LOADER (Pantalla de carga) =====
function showLoader() {
    let loader = document.getElementById('global-loader');
    if (!loader) {
        loader = document.createElement('div');
        loader.id = 'global-loader';
        loader.innerHTML = `
            <div class="loader-spinner">
                <div class="spinner"></div>
                <p>Cargando...</p>
            </div>
        `;
        loader.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(32, 57, 99, 0.9);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 99999;
        `;
        document.body.appendChild(loader);
    }
    loader.style.display = 'flex';
}

function hideLoader() {
    const loader = document.getElementById('global-loader');
    if (loader) {
        loader.style.display = 'none';
    }
}

// ===== DETECTAR DISPOSITIVO MÓVIL =====
function isMobile() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

// ===== COPIAR AL PORTAPAPELES =====
async function copyToClipboard(text) {
    try {
        await navigator.clipboard.writeText(text);
        showNotification('Copiado al portapapeles', 'success');
        return true;
    } catch (error) {
        console.error('Error copying to clipboard:', error);
        showNotification('Error al copiar', 'error');
        return false;
    }
}

// ===== LAZY LOADING DE IMÁGENES =====
function lazyLoadImages() {
    const images = document.querySelectorAll('img[data-src]');
    
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.removeAttribute('data-src');
                observer.unobserve(img);
            }
        });
    });
    
    images.forEach(img => imageObserver.observe(img));
}

// ===== ANIMACIÓN AL HACER SCROLL =====
function animateOnScroll() {
    const elements = document.querySelectorAll('.animate-on-scroll');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animated');
            }
        });
    }, { threshold: 0.1 });
    
    elements.forEach(el => observer.observe(el));
}

// ===== CONVERTIR A SLUG (Para URLs amigables) =====
function slugify(text) {
    return text
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
}

// ===== COMPARTIR EN REDES SOCIALES =====
function shareOnSocial(platform, url, title) {
    const shareUrls = {
        facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
        twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`,
        whatsapp: `https://wa.me/?text=${encodeURIComponent(title + ' ' + url)}`,
        linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`
    };
    
    if (shareUrls[platform]) {
        window.open(shareUrls[platform], '_blank', 'width=600,height=400');
    }
}

// ===== INICIALIZAR UTILIDADES AL CARGAR =====
document.addEventListener('DOMContentLoaded', function() {
    // Inicializar lazy loading de imágenes
    lazyLoadImages();
    
    // Inicializar animaciones al hacer scroll
    animateOnScroll();
    
    // Log de inicialización
    console.log('HomeLife Utils loaded successfully');
});

// ===== EXPORTAR FUNCIONES (Para uso global) =====
window.HomeLifeUtils = {
    formatPrice,
    calculateDiscount,
    calculateSavings,
    showNotification,
    loadJSON,
    loadComponent,
    getUrlParameter,
    saveToLocalStorage,
    getFromLocalStorage,
    removeFromLocalStorage,
    validateEmail,
    validatePhone,
    debounce,
    smoothScrollTo,
    generateUniqueId,
    formatDate,
    truncateText,
    capitalize,
    generateStars,
    showLoader,
    hideLoader,
    isMobile,
    copyToClipboard,
    slugify,
    shareOnSocial,
    CONFIG
};

/* ===== FIN UTILS.JS ===== */