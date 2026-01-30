/* =====================================================
   HOMELIFE PREMIUM - MAIN.JS
   Inicialización y coordinación general de la aplicación
   ===================================================== */

// ===== CONFIGURACIÓN GLOBAL =====
const APP_CONFIG = {
    name: 'HomeLife',
    version: '1.0.0',
    debug: false,
    apiBaseUrl: 'assets/data/',
    componentsPath: 'assets/includes/'
};

// ===== ESTADO DE LA APLICACIÓN =====
const AppState = {
    initialized: false,
    componentsLoaded: false,
    dataLoaded: false,
    currentPage: '',
    user: null
};

// ===== INICIALIZAR APLICACIÓN =====
async function initApp() {
    if (AppState.initialized) {
        console.warn('La aplicación ya está inicializada');
        return;
    }

    console.log(`Inicializando ${APP_CONFIG.name} v${APP_CONFIG.version}...`);

    try {
        // 1. Detectar página actual
        AppState.currentPage = getCurrentPage();
        console.log('Página actual:', AppState.currentPage);

        // 2. Cargar componentes globales
        await loadGlobalComponents();

        // 3. Inicializar sistemas
        await initSystems();

        // 4. Configurar listeners globales
        setupGlobalListeners();

        // 5. Marcar como inicializado
        AppState.initialized = true;

        console.log('✅ Aplicación inicializada correctamente');

        // Disparar evento de inicialización
        dispatchAppEvent('appInitialized');

    } catch (error) {
        console.error('❌ Error inicializando aplicación:', error);
    }
}

// ===== OBTENER PÁGINA ACTUAL =====
function getCurrentPage() {
    const path = window.location.pathname;
    const page = path.split('/').pop() || 'index.html';
    return page.replace('.html', '');
}

// ===== CARGAR COMPONENTES GLOBALES =====
async function loadGlobalComponents() {
    console.log('Cargando componentes globales...');

    const components = [
        { id: 'header-container', file: 'header.html' },
        { id: 'footer-container', file: 'footer.html' },
        { id: 'chatbot-container', file: 'chatbot.html' }
    ];

    const promises = components.map(comp => {
        const element = document.getElementById(comp.id);
        if (element) {
            return loadComponent(comp.id, `${APP_CONFIG.componentsPath}${comp.file}`);
        }
        return Promise.resolve();
    });

    await Promise.all(promises);

    AppState.componentsLoaded = true;
    console.log('✅ Componentes globales cargados');
}

// ===== CARGAR COMPONENTE =====
async function loadComponent(elementId, filePath) {
    try {
        const response = await fetch(filePath);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const html = await response.text();
        const element = document.getElementById(elementId);
        if (element) {
            element.innerHTML = html;
        }
    } catch (error) {
        console.error(`Error cargando componente ${filePath}:`, error);
    }
}

// ===== INICIALIZAR SISTEMAS =====
async function initSystems() {
    console.log('Inicializando sistemas...');

    // Sistema de idiomas
    if (window.LanguageSystem) {
        await window.LanguageSystem.initLanguageSystem();
        console.log('✅ Sistema de idiomas inicializado');
    }

    // Sistema de carrito
    if (window.Cart) {
        // El carrito se inicializa automáticamente en cart.js
        console.log('✅ Sistema de carrito listo');
    }

    // Sistema de slider (solo en home)
    if (AppState.currentPage === 'index' && window.SliderSystem) {
        window.SliderSystem.init();
        console.log('✅ Sistema de slider inicializado');
    }

    // Sistema de chatbot (se inicializa en chatbot.js)
    console.log('✅ Sistemas inicializados');
}

// ===== CONFIGURAR LISTENERS GLOBALES =====
function setupGlobalListeners() {
    // Scroll suave para enlaces internos
    setupSmoothScroll();

    // Detectar cambios en el carrito
    document.addEventListener('cart:itemAdded', handleCartUpdate);
    document.addEventListener('cart:itemRemoved', handleCartUpdate);
    document.addEventListener('cart:quantityUpdated', handleCartUpdate);

    // Detectar cambio de idioma
    document.addEventListener('languageChanged', handleLanguageChange);

    // Manejar clics en modales (cerrar al hacer clic fuera)
    setupModalHandlers();

    // Lazy loading de imágenes
    setupLazyLoading();

    // Animaciones al hacer scroll
    setupScrollAnimations();

    console.log('✅ Listeners globales configurados');
}

// ===== SCROLL SUAVE =====
function setupSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            
            if (href === '#') return;

            const targetId = href.substring(1);
            const target = document.getElementById(targetId);

            if (target) {
                e.preventDefault();
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// ===== MANEJAR ACTUALIZACIÓN DEL CARRITO =====
function handleCartUpdate(event) {
    if (APP_CONFIG.debug) {
        console.log('Carrito actualizado:', event.detail);
    }

    // Actualizar badge del carrito
    if (window.Cart) {
        window.Cart.updateBadge();
    }
}

// ===== MANEJAR CAMBIO DE IDIOMA =====
function handleLanguageChange(event) {
    const newLanguage = event.detail.language;
    console.log('Idioma cambiado a:', newLanguage);

    // Recargar contenido dinámico si es necesario
    if (typeof reloadDynamicContent === 'function') {
        reloadDynamicContent();
    }
}

// ===== CONFIGURAR HANDLERS DE MODALES =====
function setupModalHandlers() {
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                modal.classList.remove('active');
            }
        });
    });
}

// ===== LAZY LOADING DE IMÁGENES =====
function setupLazyLoading() {
    const images = document.querySelectorAll('img[data-src]');
    
    if ('IntersectionObserver' in window) {
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
    } else {
        // Fallback para navegadores antiguos
        images.forEach(img => {
            img.src = img.dataset.src;
            img.removeAttribute('data-src');
        });
    }
}

// ===== ANIMACIONES AL HACER SCROLL =====
function setupScrollAnimations() {
    const elements = document.querySelectorAll('.animate-on-scroll');
    
    if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animated');
                }
            });
        }, { threshold: 0.1 });

        elements.forEach(el => observer.observe(el));
    }
}

// ===== DISPARAR EVENTO PERSONALIZADO =====
function dispatchAppEvent(eventName, detail = {}) {
    const event = new CustomEvent(eventName, {
        detail: {
            ...detail,
            timestamp: Date.now(),
            page: AppState.currentPage
        }
    });
    document.dispatchEvent(event);
}

// ===== OBTENER ESTADO DE LA APLICACIÓN =====
function getAppState() {
    return { ...AppState };
}

// ===== LOGGER (para debug) =====
function log(message, type = 'info') {
    if (!APP_CONFIG.debug) return;

    const styles = {
        info: 'color: #17a2b8',
        success: 'color: #28a745',
        warning: 'color: #ffc107',
        error: 'color: #dc3545'
    };

    console.log(`%c[HomeLife] ${message}`, styles[type] || styles.info);
}

// ===== MANEJAR ERRORES GLOBALES =====
window.addEventListener('error', function(event) {
    console.error('Error global capturado:', event.error);
    
    // Aquí podrías enviar el error a un servicio de logging
    if (APP_CONFIG.debug) {
        console.error('Stack trace:', event.error.stack);
    }
});

// ===== MANEJAR PROMESAS RECHAZADAS =====
window.addEventListener('unhandledrejection', function(event) {
    console.error('Promesa rechazada sin manejar:', event.reason);
    
    if (APP_CONFIG.debug) {
        console.error('Promise:', event.promise);
    }
});

// ===== DETECTAR CONEXIÓN A INTERNET =====
function setupNetworkDetection() {
    window.addEventListener('online', () => {
        console.log('✅ Conexión restaurada');
        if (window.HomeLifeUtils && window.HomeLifeUtils.showNotification) {
            window.HomeLifeUtils.showNotification('Conexión restaurada', 'success');
        }
    });

    window.addEventListener('offline', () => {
        console.log('❌ Sin conexión a internet');
        if (window.HomeLifeUtils && window.HomeLifeUtils.showNotification) {
            window.HomeLifeUtils.showNotification('Sin conexión a internet', 'warning');
        }
    });
}

// ===== PRECARGAR RECURSOS CRÍTICOS =====
function preloadCriticalResources() {
    // Precargar productos si estamos en home o productos
    if (['index', 'productos'].includes(AppState.currentPage)) {
        fetch(`${APP_CONFIG.apiBaseUrl}products.json`)
            .then(response => response.json())
            .then(data => {
                console.log('✅ Productos precargados');
                AppState.dataLoaded = true;
            })
            .catch(error => console.error('Error precargando productos:', error));
    }
}

// ===== INICIALIZAR AL CARGAR DOM =====
document.addEventListener('DOMContentLoaded', async function() {
    console.log('DOM cargado, inicializando aplicación...');
    
    // Inicializar app
    await initApp();
    
    // Configurar detección de red
    setupNetworkDetection();
    
    // Precargar recursos
    preloadCriticalResources();
    
    // Log final
    console.log(`%c
    ╔═══════════════════════════════════╗
    ║   HomeLife - Best For Your Life   ║
    ║         v${APP_CONFIG.version}                    ║
    ╚═══════════════════════════════════╝
    `, 'color: #47B1BE; font-weight: bold;');
});

// ===== LIMPIAR AL SALIR =====
window.addEventListener('beforeunload', function() {
    console.log('Limpiando aplicación...');
    
    // Guardar estado si es necesario
    if (window.Cart) {
        // El carrito ya se guarda automáticamente
    }
});

// ===== EXPORTAR API PÚBLICA =====
window.HomeLifeApp = {
    // Configuración
    config: APP_CONFIG,
    
    // Estado
    getState: getAppState,
    
    // Métodos
    init: initApp,
    log: log,
    dispatchEvent: dispatchAppEvent,
    
    // Info
    version: APP_CONFIG.version,
    name: APP_CONFIG.name
};

/* ===== FIN MAIN.JS ===== */