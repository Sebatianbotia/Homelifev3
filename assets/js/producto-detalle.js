/* =====================================================
   HOMELIFE PREMIUM - PRODUCTO-DETALLE.JS
   Sistema completo para página de detalle de producto
   ===================================================== */

// ===== ESTADO DEL PRODUCTO =====
const ProductDetailState = {
    currentProduct: null,
    allProducts: [],
    currentImageIndex: 0,
    quantity: 1,
    relatedProducts: []
};


async function initProductDetail() {
    console.log('Inicializando detalle de producto...');

    try {
        // Obtener ID del producto desde URL
        const urlParams = new URLSearchParams(window.location.search);
        const productSlug = urlParams.get('id');

        if (!productSlug) {
            showError('No se especificó un producto');
            return;
        }

        // Cargar productos
        await loadAllProducts();

        // Buscar producto actual
        ProductDetailState.currentProduct = ProductDetailState.allProducts.find(
            p => p.slug === productSlug
        );

        if (!ProductDetailState.currentProduct) {
            showError('Producto no encontrado');
            return;
        }

        // Renderizar producto
        renderProductDetail();

        // Cargar productos relacionados
        loadRelatedProducts();

        console.log('✅ Detalle de producto cargado');

    } catch (error) {
        console.error('Error inicializando detalle:', error);
        showError('Error cargando el producto');
    }
}

// ===== CARGAR TODOS LOS PRODUCTOS =====
async function loadAllProducts() {
    const data = await HomeLifeUtils.loadJSON('products.json');
    
    if (!data || !data.products) {
        throw new Error('No se pudieron cargar los productos');
    }

    ProductDetailState.allProducts = data.products;
}

// ===== RENDERIZAR DETALLE DEL PRODUCTO =====
function renderProductDetail() {
    const product = ProductDetailState.currentProduct;

    // Breadcrumb
    document.getElementById('breadcrumbProduct').textContent = product.name;

    // Título y categoría
    document.getElementById('productCategory').textContent = product.category;
    document.getElementById('productTitle').textContent = product.name;
    document.title = `${product.name} | HomeLife`;

    // Rating
    const stars = '★'.repeat(product.rating) + '☆'.repeat(5 - product.rating);
    document.getElementById('productStars').textContent = stars;
    document.getElementById('productRatingValue').textContent = product.rating.toFixed(1);
    document.getElementById('productReviews').textContent = `(${product.reviewCount} reseñas)`;

    // Precios
    document.getElementById('productPrice').textContent = HomeLifeUtils.formatPrice(product.price);

    if (product.originalPrice) {
        document.getElementById('productOriginalPrice').textContent = HomeLifeUtils.formatPrice(product.originalPrice);
        document.getElementById('productOriginalPrice').style.display = 'inline';
        
        document.getElementById('productDiscount').textContent = `-${product.discount}%`;
        document.getElementById('productDiscount').style.display = 'inline-block';
        
        const savings = product.originalPrice - product.price;
        document.getElementById('productSavings').textContent = `Ahorras ${HomeLifeUtils.formatPrice(savings)}`;
        document.getElementById('productSavings').style.display = 'block';
    }

    // Stock
    const stockElement = document.getElementById('stockStatus');
    if (product.inStock) {
        stockElement.classList.add('in-stock');
        stockElement.classList.remove('out-of-stock');
        stockElement.innerHTML = '<span class="stock-dot"></span><span>Disponible en stock</span>';
    } else {
        stockElement.classList.add('out-of-stock');
        stockElement.classList.remove('in-stock');
        stockElement.innerHTML = '<span class="stock-dot"></span><span>Agotado</span>';
    }

    // Descripción
    document.getElementById('productDescription').textContent = product.fullDescription;

    // Características
    const featuresContainer = document.getElementById('productFeatures');
    featuresContainer.innerHTML = product.features.map(feature => 
        `<li>${feature}</li>`
    ).join('');

    // Especificaciones
    const specsContainer = document.getElementById('specificationsTable');
    specsContainer.innerHTML = Object.entries(product.specifications).map(([key, value]) => `
        <tr>
            <td>${key}</td>
            <td>${value}</td>
        </tr>
    `).join('');
    ////////////////////////////////////////////////////////////////

    const techBlock = document.getElementById('techSheetBlock');
    const techLink = document.getElementById('techSheetLink');

    if (techBlock && techLink && product.techSheetPdf) {
    techLink.href = product.techSheetPdf;
        //verifica que exista el pdf, si no existe, el boton de descarga no aparecera
    techLink.setAttribute('download', `${product.slug}-ficha-tecnica.pdf`);

    techBlock.style.display = 'block';
    } else if (techBlock) {
    techBlock.style.display = 'none';
    }


    // Galería de imágenes
    renderGallery();
}

// ===== RENDERIZAR GALERÍA DE IMÁGENES =====
function renderGallery() {
    const product = ProductDetailState.currentProduct;
    
    // Imagen principal
    document.getElementById('mainImage').src = product.images[0];
    document.getElementById('mainImage').alt = product.name;

    // Thumbnails
    const thumbnailsContainer = document.getElementById('thumbnails');
    thumbnailsContainer.innerHTML = product.images.map((image, index) => `
        <div class="thumbnail ${index === 0 ? 'active' : ''}" onclick="changeMainImage(${index})">
            <img src="${image}" alt="${product.name}">
        </div>
    `).join('');
}

// ===== CAMBIAR IMAGEN PRINCIPAL =====
function changeMainImage(index) {
    const product = ProductDetailState.currentProduct;
    ProductDetailState.currentImageIndex = index;

    // Actualizar imagen principal
    document.getElementById('mainImage').src = product.images[index];

    // Actualizar thumbnails activos
    document.querySelectorAll('.thumbnail').forEach((thumb, i) => {
        if (i === index) {
            thumb.classList.add('active');
        } else {
            thumb.classList.remove('active');
        }
    });
}

// ===== AUMENTAR CANTIDAD =====
function increaseQuantity() {
    const product = ProductDetailState.currentProduct;
    
    if (ProductDetailState.quantity < product.stock) {
        ProductDetailState.quantity++;
        updateQuantityDisplay();
    } else {
        HomeLifeUtils.showNotification(`Stock máximo: ${product.stock}`, 'warning');
    }
}

// ===== DISMINUIR CANTIDAD =====
function decreaseQuantity() {
    if (ProductDetailState.quantity > 1) {
        ProductDetailState.quantity--;
        updateQuantityDisplay();
    }
}

// ===== ACTUALIZAR DISPLAY DE CANTIDAD =====
function updateQuantityDisplay() {
    document.getElementById('quantityValue').textContent = ProductDetailState.quantity;
}

// ===== AGREGAR AL CARRITO =====
function addCurrentProductToCart() {
    const product = ProductDetailState.currentProduct;
    const quantity = ProductDetailState.quantity;

    if (!product.inStock) {
        HomeLifeUtils.showNotification('Producto agotado', 'error');
        return;
    }

    if (window.Cart) {
        window.Cart.add(product, quantity);
        
        // Reset cantidad
        ProductDetailState.quantity = 1;
        updateQuantityDisplay();
    }
}

// ===== CAMBIAR TAB =====
function switchTab(event, tabName) {
    // Remover active de todos los tabs
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });

    // Activar tab seleccionado
    event.currentTarget.classList.add('active');
    document.getElementById(`tab-${tabName}`).classList.add('active');
}

// ===== CARGAR PRODUCTOS RELACIONADOS =====
function loadRelatedProducts() {
    const product = ProductDetailState.currentProduct;
    
    // Filtrar productos de la misma categoría (excluyendo el actual)
    ProductDetailState.relatedProducts = ProductDetailState.allProducts
        .filter(p => p.categorySlug === product.categorySlug && p.id !== product.id)
        .slice(0, 4);

    renderRelatedProducts();
}

// ===== RENDERIZAR PRODUCTOS RELACIONADOS =====
function renderRelatedProducts() {
    const container = document.getElementById('relatedProducts');
    
    if (ProductDetailState.relatedProducts.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: #6c757d;">No hay productos relacionados disponibles</p>';
        return;
    }

    container.innerHTML = ProductDetailState.relatedProducts.map(product => `
        <div class="product-card" data-product-id="${product.id}">
            ${product.discount > 0 ? `<div class="discount-badge">-${product.discount}%</div>` : ''}
            ${product.isNew ? `<div class="new-badge">NUEVO</div>` : ''}
            
            <div class="product-image-container">
                <img src="${product.images[0]}" alt="${product.name}" class="product-image">
            </div>
            
            <div class="product-info">
                <div class="product-category">${product.category}</div>
                <h3 class="product-name">${product.name}</h3>
                
                <div class="product-rating">
                    <div class="stars">${'★'.repeat(product.rating)}${'☆'.repeat(5-product.rating)}</div>
                    <span class="rating-count">(${product.reviewCount})</span>
                </div>
                
                <div class="product-pricing">
                    ${product.originalPrice ? `<span class="original-price">${HomeLifeUtils.formatPrice(product.originalPrice)}</span>` : ''}
                    <div class="current-price">${HomeLifeUtils.formatPrice(product.price)}</div>
                </div>
                
                <div class="product-actions">
                    <button class="add-to-cart-btn" onclick="addRelatedToCart('${product.id}')">
                        Agregar
                    </button>
                    <a href="producto-detalle.html?id=${product.slug}" class="quick-view-btn" title="Ver detalles">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                            <circle cx="12" cy="12" r="3"></circle>
                        </svg>
                    </a>
                </div>
            </div>
        </div>
    `).join('');
}

// ===== AGREGAR PRODUCTO RELACIONADO AL CARRITO =====
function addRelatedToCart(productId) {
    const product = ProductDetailState.allProducts.find(p => p.id === productId);
    
    if (product && window.Cart) {
        window.Cart.add(product, 1);
    }
}

// ===== MOSTRAR ERROR =====
function showError(message) {
    document.querySelector('.product-detail-section').innerHTML = `
        <div style="text-align: center; padding: 100px 20px;">
            <svg width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="#dc3545" stroke-width="2">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="15" y1="9" x2="9" y2="15"></line>
                <line x1="9" y1="9" x2="15" y2="15"></line>
            </svg>
            <h2 style="color: #dc3545; margin: 20px 0;">${message}</h2>
            <a href="productos.html" class="btn-primary">Ver Productos</a>
        </div>
    `;
}

// ===== INICIALIZAR AL CARGAR DOM =====
document.addEventListener('DOMContentLoaded', function() {
    // Solo inicializar si estamos en la página de detalle
    if (window.location.pathname.includes('producto-detalle.html')) {
        initProductDetail();
        console.log('producto-detalle.js inicializado');
    }
});

// ===== EXPORTAR FUNCIONES GLOBALES =====
window.ProductDetail = {
    changeImage: changeMainImage,
    increaseQty: increaseQuantity,
    decreaseQty: decreaseQuantity,
    addToCart: addCurrentProductToCart,
    switchTab: switchTab
};



/* ===== FIN PRODUCTO-DETALLE.JS ===== */