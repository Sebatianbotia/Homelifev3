
let cart = [];
const CART_STORAGE_KEY = 'homelife_cart';
const FREE_SHIPPING_THRESHOLD = 150000;

function initCart() {
    loadCartFromStorage();
    updateCartUI();
    updateCartBadge();
    console.log('Sistema de carrito inicializado');
}

function loadCartFromStorage() {
    const savedCart = localStorage.getItem(CART_STORAGE_KEY);
    if (savedCart) {
        try {
            cart = JSON.parse(savedCart);
        } catch (error) {
            console.error('Error cargando carrito:', error);
            cart = [];
        }
    }
}

function saveCartToStorage() {
    try {
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    } catch (error) {
        console.error('Error guardando carrito:', error);
    }
}

function addToCart(product, quantity = 1) {
    // Validar producto
    if (!product || !product.id) {
        console.error('Producto inválido');
        return false;
    }

    if (quantity < 1) {
        quantity = 1;
    }

    const existingItem = cart.find(item => item.id === product.id);

    if (existingItem) {
        existingItem.quantity += quantity;
        
        if (product.stock && existingItem.quantity > product.stock) {
            existingItem.quantity = product.stock;
            showNotification(`Stock máximo disponible: ${product.stock}`, 'warning');
        }
    } else {
        cart.push({
            id: product.id,
            name: product.name,
            slug: product.slug,
            price: product.price,
            originalPrice: product.originalPrice,
            image: product.images[0],
            quantity: quantity,
            stock: product.stock || 999
        });
    }

    saveCartToStorage();
    updateCartUI();
    updateCartBadge();

    // Mostrar notificación
    const lang = window.LanguageSystem ? window.LanguageSystem.getCurrentLanguage() : 'es';
    const message = lang === 'es' ? 'Producto agregado al carrito' : 'Product added to cart';
    showNotification(message, 'success');

    // Disparar evento
    dispatchCartEvent('itemAdded', { product, quantity });

    return true;
}

// ===== ELIMINAR PRODUCTO DEL CARRITO =====
function removeFromCart(productId) {
    const index = cart.findIndex(item => item.id === productId);
    
    if (index !== -1) {
        const removedItem = cart.splice(index, 1)[0];
        
        // Guardar y actualizar UI
        saveCartToStorage();
        updateCartUI();
        updateCartBadge();

        // Mostrar notificación
        const lang = window.LanguageSystem ? window.LanguageSystem.getCurrentLanguage() : 'es';
        const message = lang === 'es' ? 'Producto eliminado del carrito' : 'Product removed from cart';
        showNotification(message, 'info');

        // Disparar evento
        dispatchCartEvent('itemRemoved', { item: removedItem });

        return true;
    }
    
    return false;
}

// ===== ACTUALIZAR CANTIDAD DE PRODUCTO =====
function updateCartItemQuantity(productId, quantity) {
    const item = cart.find(item => item.id === productId);
    
    if (item) {
        // Validar cantidad
        if (quantity < 1) {
            quantity = 1;
        }
        
        if (quantity > item.stock) {
            quantity = item.stock;
            showNotification(`Stock máximo disponible: ${item.stock}`, 'warning');
        }

        item.quantity = quantity;

        // Guardar y actualizar UI
        saveCartToStorage();
        updateCartUI();
        updateCartBadge();

        // Disparar evento
        dispatchCartEvent('quantityUpdated', { productId, quantity });

        return true;
    }
    
    return false;
}

// ===== VACIAR CARRITO =====
function clearCart() {
    cart = [];
    saveCartToStorage();
    updateCartUI();
    updateCartBadge();

    // Disparar evento
    dispatchCartEvent('cartCleared');
}

// ===== OBTENER TOTAL DE ITEMS =====
function getCartItemCount() {
    return cart.reduce((total, item) => total + item.quantity, 0);
}

// ===== CALCULAR SUBTOTAL =====
function calculateSubtotal() {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
}

// ===== CALCULAR COSTO DE ENVÍO =====
function calculateShipping() {
    const subtotal = calculateSubtotal();
    return subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : 15000;
}

// ===== CALCULAR TOTAL =====
function calculateTotal() {
    return calculateSubtotal() + calculateShipping();
}

// ===== CALCULAR AHORRO TOTAL =====
function calculateTotalSavings() {
    return cart.reduce((total, item) => {
        if (item.originalPrice) {
            return total + ((item.originalPrice - item.price) * item.quantity);
        }
        return total;
    }, 0);
}

// ===== ACTUALIZAR BADGE DEL CARRITO =====
function updateCartBadge() {
    const badges = document.querySelectorAll('.cart-badge, #cartBadge');
    const count = getCartItemCount();
    
    badges.forEach(badge => {
        badge.textContent = count;
        badge.style.display = count > 0 ? 'flex' : 'none';
    });
}

// ===== ACTUALIZAR UI DEL CARRITO =====
function updateCartUI() {
    const cartContainer = document.getElementById('cartItems');
    
    if (!cartContainer) return;

    // Si el carrito está vacío
    if (cart.length === 0) {
        cartContainer.innerHTML = `
            <div class="cart-empty">
                <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="9" cy="21" r="1"></circle>
                    <circle cx="20" cy="21" r="1"></circle>
                    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                </svg>
                <h3 data-i18n="cart.empty">Tu carrito está vacío</h3>
                <p data-i18n="cart.empty_description">Agrega productos para comenzar tu compra</p>
            </div>
        `;

        // Ocultar resumen y botón de checkout
        const summary = document.getElementById('cartSummary');
        const checkoutBtn = document.getElementById('checkoutBtn');
        if (summary) summary.style.display = 'none';
        if (checkoutBtn) checkoutBtn.style.display = 'none';

        return;
    }

    // Renderizar productos
    cartContainer.innerHTML = cart.map(item => `
        <div class="cart-item" data-product-id="${item.id}">
            <img src="${item.image}" alt="${item.name}" class="cart-item-image">
            <div class="cart-item-info">
                <div class="cart-item-name">${item.name}</div>
                <div class="cart-item-price">${formatPrice(item.price)}</div>
                ${item.originalPrice ? `
                    <div class="cart-item-savings">
                        Ahorras ${formatPrice(item.originalPrice - item.price)} por unidad
                    </div>
                ` : ''}
                <div class="cart-item-quantity">
                    <div class="quantity-controls">
                        <button class="quantity-btn" onclick="Cart.changeQuantity('${item.id}', -1)">−</button>
                        <input type="number" class="quantity-input" value="${item.quantity}" min="1" max="${item.stock}" readonly>
                        <button class="quantity-btn" onclick="Cart.changeQuantity('${item.id}', 1)">+</button>
                    </div>
                </div>
            </div>
            <button class="cart-item-remove" onclick="Cart.remove('${item.id}')" title="Eliminar">×</button>
        </div>
    `).join('');

    // Actualizar resumen
    updateCartSummary();
}

// ===== ACTUALIZAR RESUMEN DEL CARRITO =====
function updateCartSummary() {
    const summary = document.getElementById('cartSummary');
    const checkoutBtn = document.getElementById('checkoutBtn');
    
    if (!summary || !checkoutBtn) return;

    const subtotal = calculateSubtotal();
    const shipping = calculateShipping();
    const total = calculateTotal();
    const savings = calculateTotalSavings();

    // Mostrar resumen
    summary.style.display = 'block';
    checkoutBtn.style.display = 'block';

    // Actualizar valores
    const subtotalEl = document.getElementById('cartSubtotal');
    const shippingEl = document.getElementById('cartShipping');
    const totalEl = document.getElementById('cartTotal');

    if (subtotalEl) subtotalEl.textContent = formatPrice(subtotal);
    if (totalEl) totalEl.textContent = formatPrice(total);
    
    if (shippingEl) {
        if (shipping === 0) {
            shippingEl.innerHTML = '<span style="color: #28a745; font-weight: 700;">Gratis ✓</span>';
        } else {
            const remaining = FREE_SHIPPING_THRESHOLD - subtotal;
            shippingEl.innerHTML = `
                ${formatPrice(shipping)}
                <div style="font-size: 12px; color: #6c757d; margin-top: 5px;">
                    Faltan ${formatPrice(remaining)} para envío gratis
                </div>
            `;
        }
    }

    // Mostrar ahorro total si existe
    if (savings > 0) {
        const savingsEl = document.getElementById('cartSavings');
        if (savingsEl) {
            savingsEl.innerHTML = `
                <div class="cart-summary-row" style="color: #28a745;">
                    <span>Ahorro total:</span>
                    <span>${formatPrice(savings)}</span>
                </div>
            `;
        }
    }
}

// ===== CAMBIAR CANTIDAD (INCREMENTAR/DECREMENTAR) =====
function changeQuantity(productId, change) {
    const item = cart.find(item => item.id === productId);
    
    if (item) {
        const newQuantity = item.quantity + change;
        updateCartItemQuantity(productId, newQuantity);
    }
}

// ===== ABRIR MODAL DEL CARRITO =====
function openCartModal() {
    const modal = document.getElementById('cartModal');
    if (modal) {
        updateCartUI();
        modal.classList.add('active');
    }
}

// ===== CERRAR MODAL DEL CARRITO =====
function closeCartModal() {
    const modal = document.getElementById('cartModal');
    if (modal) {
        modal.classList.remove('active');
    }
}

// ===== PROCEDER AL CHECKOUT =====
function proceedToCheckout() {
    if (cart.length === 0) {
        showNotification('Tu carrito está vacío', 'warning');
        return;
    }

    // Guardar carrito antes de ir al checkout
    saveCartToStorage();

    // Redirigir a página de checkout
    window.location.href = 'checkout.html';
}

// ===== OBTENER CARRITO =====
function getCart() {
    return [...cart];
}

// ===== OBTENER ITEM DEL CARRITO =====
function getCartItem(productId) {
    return cart.find(item => item.id === productId);
}

// ===== VERIFICAR SI PRODUCTO ESTÁ EN CARRITO =====
function isInCart(productId) {
    return cart.some(item => item.id === productId);
}

// ===== DISPARAR EVENTO PERSONALIZADO =====
function dispatchCartEvent(eventName, detail = {}) {
    const event = new CustomEvent('cart:' + eventName, {
        detail: {
            cart: getCart(),
            itemCount: getCartItemCount(),
            total: calculateTotal(),
            ...detail
        }
    });
    document.dispatchEvent(event);
}

// ===== FORMATEAR PRECIO =====
function formatPrice(price) {
    if (window.HomeLifeUtils && window.HomeLifeUtils.formatPrice) {
        return window.HomeLifeUtils.formatPrice(price);
    }
    return `$${price.toLocaleString('es-CO')}`;
}

// ===== MOSTRAR NOTIFICACIÓN =====
function showNotification(message, type = 'success') {
    if (window.HomeLifeUtils && window.HomeLifeUtils.showNotification) {
        window.HomeLifeUtils.showNotification(message, type);
    } else {
        alert(message);
    }
}

// ===== INICIALIZAR AL CARGAR DOM =====
document.addEventListener('DOMContentLoaded', function() {
    initCart();

    // Agregar event listeners para cerrar modal
    const cartModal = document.getElementById('cartModal');
    if (cartModal) {
        cartModal.addEventListener('click', function(e) {
            if (e.target === cartModal) {
                closeCartModal();
            }
        });
    }

    console.log('Cart.js inicializado');
});

// ===== EXPORTAR API PÚBLICA =====
window.Cart = {
    // Métodos principales
    add: addToCart,
    remove: removeFromCart,
    update: updateCartItemQuantity,
    clear: clearCart,
    changeQuantity: changeQuantity,

    // Getters
    get: getCart,
    getItem: getCartItem,
    isInCart: isInCart,
    getItemCount: getCartItemCount,

    // Cálculos
    calculateSubtotal: calculateSubtotal,
    calculateShipping: calculateShipping,
    calculateTotal: calculateTotal,
    calculateSavings: calculateTotalSavings,

    // UI
    openModal: openCartModal,
    closeModal: closeCartModal,
    updateUI: updateCartUI,
    updateBadge: updateCartBadge,

    // Checkout
    checkout: proceedToCheckout,

    // Constantes
    FREE_SHIPPING_THRESHOLD: FREE_SHIPPING_THRESHOLD
};

/* ===== FIN CART.JS ===== */