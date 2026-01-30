/* =====================================================
   HOMELIFE PREMIUM - PRODUCTOS.JS (LIMPIO ~200 líneas)
   - Carga products.json
   - Filtro por URL: productos.html?cat=slug
   - Búsqueda opcional: ?search=texto
   - Ordenamiento + paginación
   - Render grid
   ===================================================== */

const ProductsState = {
  allProducts: [],
  filteredProducts: [],
  displayedProducts: [],
  categories: [],
  currentPage: 1,
  productsPerPage: 12,
  currentSort: 'featured',
  filters: {
    category: null,     // string slug (o null)
    searchQuery: ''     // string
  }
};

async function initProductsPage() {
  try {
    await loadProducts();
    readFiltersFromUrl();
    applyFilters();
    sortProducts(ProductsState.currentSort, { render: false });
    renderProducts();
    updateCounts();
  } catch (err) {
    console.error('Error inicializando productos:', err);
  }
}

async function loadProducts() {
  const data = await HomeLifeUtils.loadJSON('products.json');
  if (!data || !Array.isArray(data.products)) throw new Error('products.json inválido');

  ProductsState.allProducts = data.products;
  ProductsState.categories = Array.isArray(data.categories) ? data.categories : [];
}

function readFiltersFromUrl() {
  const params = new URLSearchParams(window.location.search);

  // Solo se usa cat (se mantiene compat con categoria)
  const cat = params.get('cat') || params.get('categoria');
  const search = params.get('search') || '';

  ProductsState.filters.category = cat ? normalizeSlug(cat) : null;
  ProductsState.filters.searchQuery = String(search || '').trim();
}

function applyFilters() {
  const { category, searchQuery } = ProductsState.filters;

  let filtered = [...ProductsState.allProducts];

  if (category) {
    filtered = filtered.filter(p => normalizeSlug(p.categorySlug) === category);
  }

  if (searchQuery) {
    const q = searchQuery.toLowerCase();
    filtered = filtered.filter(p => {
      const name = (p.name || '').toLowerCase();
      const catName = (p.category || '').toLowerCase();
      const tags = Array.isArray(p.tags) ? p.tags : [];
      return (
        name.includes(q) ||
        catName.includes(q) ||
        tags.some(t => String(t).toLowerCase().includes(q))
      );
    });
  }

  ProductsState.filteredProducts = filtered;
  ProductsState.currentPage = 1;
}

function sortProducts(sortType, opts = { render: true }) {
  ProductsState.currentSort = sortType;

  const sorted = [...ProductsState.filteredProducts];
  switch (sortType) {
    case 'name-asc':
      sorted.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
      break;
    case 'name-desc':
      sorted.sort((a, b) => (b.name || '').localeCompare(a.name || ''));
      break;
    case 'price-asc':
      sorted.sort((a, b) => (a.price || 0) - (b.price || 0));
      break;
    case 'price-desc':
      sorted.sort((a, b) => (b.price || 0) - (a.price || 0));
      break;
    case 'newest':
      sorted.sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0));
      break;
    case 'rating':
      sorted.sort((a, b) => (b.rating || 0) - (a.rating || 0));
      break;
    case 'featured':
    default:
      sorted.sort((a, b) => (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0));
      break;
  }

  ProductsState.filteredProducts = sorted;

  if (opts.render) {
    renderProducts();
    updateCounts();
  }
}

function renderProducts() {
  const grid = document.getElementById('productsGrid');
  const noProducts = document.getElementById('noProducts');
  if (!grid) return;

  const start = (ProductsState.currentPage - 1) * ProductsState.productsPerPage;
  const end = start + ProductsState.productsPerPage;

  ProductsState.displayedProducts = ProductsState.filteredProducts.slice(start, end);

  if (ProductsState.displayedProducts.length === 0) {
    grid.innerHTML = '';
    if (noProducts) noProducts.style.display = 'block';
    renderPagination();
    return;
  }

  if (noProducts) noProducts.style.display = 'none';

  grid.innerHTML = ProductsState.displayedProducts.map(p => productCardHTML(p)).join('');
  renderPagination();

  // opcional: scroll al grid al cambiar página/orden
  grid.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function productCardHTML(product) {
  const img = product.images?.[0] || '';
  const rating = clampInt(product.rating || 0, 0, 5);

  return `
    <div class="product-card" data-product-id="${escapeHtml(product.id)}">
      ${product.discount > 0 ? `<div class="discount-badge">-${product.discount}%</div>` : ''}
      ${product.isNew ? `<div class="new-badge">NUEVO</div>` : ''}

      <div class="product-image-container">
        <img src="${img}" alt="${escapeHtml(product.name)}" class="product-image">
      </div>

      <div class="product-info">
        <div class="product-category">${escapeHtml(product.category || '')}</div>
        <h3 class="product-name">${escapeHtml(product.name || '')}</h3>

        <div class="product-rating">
          <div class="stars">${'★'.repeat(rating)}${'☆'.repeat(5 - rating)}</div>
          <span class="rating-count">(${product.reviewCount || 0})</span>
        </div>

        <div class="product-pricing">
          ${product.originalPrice ? `<span class="original-price">${HomeLifeUtils.formatPrice(product.originalPrice)}</span>` : ''}
          <div class="current-price">${HomeLifeUtils.formatPrice(product.price || 0)}</div>
          ${product.originalPrice ? `<div class="savings">Ahorras ${HomeLifeUtils.formatPrice(product.originalPrice - (product.price || 0))}</div>` : ''}
        </div>

        <div class="product-actions">
          <button class="add-to-cart-btn" onclick="ProductsPage.addToCart('${escapeAttr(product.id)}')">
            Agregar al Carrito
          </button>

          <a href="producto-detalle.html?id=${encodeURIComponent(product.slug || '')}"
             class="quick-view-btn" title="Ver detalles">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
              <circle cx="12" cy="12" r="3"></circle>
            </svg>
          </a>
        </div>
      </div>
    </div>
  `;
}

function renderPagination() {
  const container = document.getElementById('pagination');
  if (!container) return;

  const totalPages = Math.ceil(ProductsState.filteredProducts.length / ProductsState.productsPerPage);
  if (totalPages <= 1) {
    container.innerHTML = '';
    return;
  }

  let html = `
    <button class="pagination-btn"
            onclick="ProductsPage.goToPage(${ProductsState.currentPage - 1})"
            ${ProductsState.currentPage === 1 ? 'disabled' : ''}>
      ‹
    </button>
  `;

  for (let i = 1; i <= totalPages; i++) {
    const near = i === 1 || i === totalPages || Math.abs(i - ProductsState.currentPage) <= 1;
    const dots = i === ProductsState.currentPage - 2 || i === ProductsState.currentPage + 2;

    if (near) {
      html += `
        <button class="pagination-btn ${i === ProductsState.currentPage ? 'active' : ''}"
                onclick="ProductsPage.goToPage(${i})">${i}</button>
      `;
    } else if (dots) {
      html += `<span style="padding:0 6px;">...</span>`;
    }
  }

  html += `
    <button class="pagination-btn"
            onclick="ProductsPage.goToPage(${ProductsState.currentPage + 1})"
            ${ProductsState.currentPage === totalPages ? 'disabled' : ''}>
      ›
    </button>
  `;

  container.innerHTML = html;
}

function goToPage(page) {
  const totalPages = Math.ceil(ProductsState.filteredProducts.length / ProductsState.productsPerPage);
  if (page < 1 || page > totalPages) return;
  ProductsState.currentPage = page;
  renderProducts();
  updateCounts();
}

async function addToCart(productId) {
  const product = ProductsState.allProducts.find(p => p.id === productId);
  if (product && window.Cart) window.Cart.add(product, 1);
}

function updateCounts() {
  const countEl = document.getElementById('productCount');
  if (countEl) countEl.textContent = ProductsState.filteredProducts.length;
}

/* ===== Helpers ===== */
function normalizeSlug(v) {
  return String(v || '').trim().toLowerCase();
}

function clampInt(n, min, max) {
  n = parseInt(n, 10);
  if (Number.isNaN(n)) n = 0;
  return Math.min(max, Math.max(min, n));
}

function escapeHtml(str) {
  return String(str ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function escapeAttr(str) {
  return escapeHtml(str).replaceAll('`', '&#96;');
}

/* ===== Boot ===== */
document.addEventListener('DOMContentLoaded', () => {
  if (window.location.pathname.includes('productos.html')) initProductsPage();
});

/* ===== Public API ===== */
window.ProductsPage = {
  sortProducts,
  goToPage,
  addToCart,
  getState: () => ({ ...ProductsState })
};
