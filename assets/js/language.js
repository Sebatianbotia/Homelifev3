

let currentLanguage = localStorage.getItem('homelife_language') || 'es';
let translations = {};

async function loadTranslations() {
    try {
        const response = await fetch('assets/data/translations.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        translations = await response.json();
        console.log('✅ Traducciones cargadas:', translations);
        return true;
    } catch (error) {
        console.error('❌ Error cargando traducciones:', error);
        loadDefaultTranslations();
        return false;
    }
}

function loadDefaultTranslations() {
    translations = {
        es: {
            nav: {
                inicio: "Inicio",
                servicios: "Servicios",
                nosotros: "Nosotros",
                contacto: "Contacto"
            },
            hero: {
                title: "Bienvenido",
                subtitle: "Tu salud es nuestra prioridad"
            }
        },
        en: {
            nav: {
                inicio: "Home",
                servicios: "Services",
                nosotros: "About",
                contacto: "Contact"
            },
            hero: {
                title: "Welcome",
                subtitle: "Your health is our priority"
            }
        }
    };
    console.log('⚠️ Usando traducciones por defecto');
}

// ===== OBTENER TRADUCCIÓN =====
function t(key) {
    const keys = key.split('.');
    let value = translations[currentLanguage];
    
    for (const k of keys) {
        if (value && value[k] !== undefined) {
            value = value[k];
        } else {
            console.warn(`⚠️ Traducción no encontrada: ${key}`);
            return key;
        }
    }
    
    return value;
}

// ===== CAMBIAR IDIOMA =====
function changeLanguage(lang) {
    if (lang !== 'es' && lang !== 'en') {
        console.error('❌ Idioma no válido:', lang);
        return;
    }
    
    currentLanguage = lang;
    localStorage.setItem('homelife_language', lang);
    
    // Actualizar UI
    updateLanguageUI();
    translatePage();
    
    // Disparar evento personalizado
    const event = new CustomEvent('languageChanged', { 
        detail: { language: lang } 
    });
    document.dispatchEvent(event);
    
    console.log('✅ Idioma cambiado a:', lang);
}

// ===== ACTUALIZAR UI DEL SELECTOR DE IDIOMA =====
function updateLanguageUI() {
    const langOptions = document.querySelectorAll('.lang-option');
    
    langOptions.forEach(option => {
        if (option.dataset.lang === currentLanguage) {
            option.classList.add('active');
        } else {
            option.classList.remove('active');
        }
    });
    
    // Actualizar atributo lang del HTML
    document.documentElement.lang = currentLanguage;
}

// ===== TRADUCIR PÁGINA COMPLETA =====
function translatePage() {
    // Traducir elementos con atributo data-i18n
    const elements = document.querySelectorAll('[data-i18n]');
    elements.forEach(element => {
        const key = element.dataset.i18n;
        const translation = t(key);
        
        // Si el elemento es un input, traducir el placeholder
        if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
            element.placeholder = translation;
        } else {
            element.textContent = translation;
        }
    });
    
    // Traducir elementos con atributo data-i18n-html (para HTML)
    const htmlElements = document.querySelectorAll('[data-i18n-html]');
    htmlElements.forEach(element => {
        const key = element.dataset.i18nHtml;
        element.innerHTML = t(key);
    });
    
    // Traducir atributos title
    const titleElements = document.querySelectorAll('[data-i18n-title]');
    titleElements.forEach(element => {
        const key = element.dataset.i18nTitle;
        element.title = t(key);
    });
    
    // Traducir atributos alt de imágenes
    const altElements = document.querySelectorAll('[data-i18n-alt]');
    altElements.forEach(element => {
        const key = element.dataset.i18nAlt;
        element.alt = t(key);
    });
    
    console.log(`🔄 Página traducida a: ${currentLanguage}`);
}

// ===== INICIALIZAR SELECTOR DE IDIOMA =====
function initLanguageSelector() {
    const langOptions = document.querySelectorAll('.lang-option');
    
    if (langOptions.length === 0) {
        console.warn('⚠️ No se encontraron elementos .lang-option');
        return;
    }
    
    langOptions.forEach(option => {
        option.addEventListener('click', function(e) {
            e.preventDefault();
            const lang = this.dataset.lang;
            console.log('🖱️ Click en idioma:', lang);
            changeLanguage(lang);
        });
    });
    
    // Establecer idioma activo en UI
    updateLanguageUI();
    console.log('✅ Selector de idioma inicializado');
}

// ===== OBTENER IDIOMA ACTUAL =====
function getCurrentLanguage() {
    return currentLanguage;
}

// ===== FORMATEAR PRECIO SEGÚN IDIOMA =====
function formatPrice(price) {
    const locale = currentLanguage === 'es' ? 'es-CO' : 'en-US';
    return new Intl.NumberFormat(locale, { 
        style: 'currency', 
        currency: 'COP',
        minimumFractionDigits: 0 
    }).format(price);
}

// ===== FORMATEAR FECHA SEGÚN IDIOMA =====
function formatDate(date) {
    const locale = currentLanguage === 'es' ? 'es-CO' : 'en-US';
    return new Date(date).toLocaleDateString(locale, { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });
}

// ===== DETECTAR IDIOMA DEL NAVEGADOR =====
function detectBrowserLanguage() {
    const browserLang = navigator.language || navigator.userLanguage;
    if (browserLang.startsWith('es')) {
        return 'es';
    } else if (browserLang.startsWith('en')) {
        return 'en';
    }
    return 'es'; // Default
}

// ===== INICIALIZAR SISTEMA DE IDIOMA =====
async function initLanguageSystem() {
    console.log('🚀 Inicializando sistema de idiomas...');
    
    // Cargar traducciones
    const loaded = await loadTranslations();
    
    // Si no hay idioma guardado, detectar del navegador
    if (!localStorage.getItem('homelife_language')) {
        currentLanguage = detectBrowserLanguage();
        localStorage.setItem('homelife_language', currentLanguage);
        console.log('🌐 Idioma detectado del navegador:', currentLanguage);
    }
    
    // Inicializar selector de idioma
    initLanguageSelector();
    
    // Traducir página inicial
    translatePage();
    
    console.log('✅ Sistema de idiomas inicializado. Idioma actual:', currentLanguage);
    return true;
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initLanguageSystem);
} else {
    initLanguageSystem();
}

window.LanguageSystem = {
    t,
    changeLanguage,
    getCurrentLanguage,
    translatePage,
    formatPrice,
    formatDate,
    loadTranslations,
    initLanguageSystem
};

/* ===== FIN LANGUAGE.JS ===== */