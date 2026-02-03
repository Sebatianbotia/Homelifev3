const ProductsState = {
  allProducts: [],
  filteredProducts: [],
  displayedProducts: [],
  categories: [],
  brands: [],
  currentPage: 1,
  productsPerPage: 12,
  currentSort: 'featured',
  filters: {
    categories: [],     
    brands: [],       
    searchQuery: '',
    priceMin: null,
    priceMax: null,
    onlyNew: false,
    onlyDiscount: false,
    onlyStock: false
  }
};

async function initProductsPage() {
  try {
    await loadProducts();
    readFiltersFromUrl();

    renderFiltersUI();
    bindFiltersEvents();

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

  const set = new Set(
    ProductsState.allProducts
      .map(p => normalizeSlug(p.brand || ''))
      .filter(Boolean)
  );
  ProductsState.brands = Array.from(set).sort((a,b) => a.localeCompare(b));
}

function readFiltersFromUrl() {
  const params = new URLSearchParams(window.location.search);

  const cat = params.get('cat') || params.get('categoria');
  const search = params.get('search') || '';

  ProductsState.filters.categories = cat ? [normalizeSlug(cat)] : [];
  ProductsState.filters.searchQuery = String(search || '').trim();
}

function applyFilters() {
  const f = ProductsState.filters;

  let filtered = [...ProductsState.allProducts];
  if (f.categories.length > 0) {
    const set = new Set(f.categories.map(normalizeSlug));
    filtered = filtered.filter(p => set.has(normalizeSlug(p.categorySlug)));
  }

  if (f.brands.length > 0) {
    const set = new Set(f.brands.map(normalizeSlug));
    filtered = filtered.filter(p => set.has(normalizeSlug(p.brand)));
  }

  if (typeof f.priceMin === 'number') {
    filtered = filtered.filter(p => (p.price || 0) >= f.priceMin);
  }
  if (typeof f.priceMax === 'number') {
    filtered = filtered.filter(p => (p.price || 0) <= f.priceMax);
  }

  if (f.onlyNew) filtered = filtered.filter(p => !!p.isNew);
  if (f.onlyDiscount) filtered = filtered.filter(p => (p.discount || 0) > 0);
  if (f.onlyStock) filtered = filtered.filter(p => !!p.inStock);

  if (f.searchQuery) {
    const q = f.searchQuery.toLowerCase();
    filtered = filtered.filter(p => {
      const name = (p.name || '').toLowerCase();
      const catName = (p.category || '').toLowerCase();
      const tags = Array.isArray(p.tags) ? p.tags : [];
      const brand = (p.brand || '').toLowerCase();
      return (
        name.includes(q) ||
        catName.includes(q) ||
        brand.includes(q) ||
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

  grid.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function productCardHTML(product) {
  const img = product.images?.[0] || '';
  const rating = clampInt(product.rating || 0, 0, 5);
  const detailUrl = `producto-detalle.html?id=${encodeURIComponent(product.slug || '')}`;

  return `
    <div class="product-card"
         data-product-id="${escapeHtml(product.id)}"
         role="link"
         tabindex="0"
         onclick="ProductsPage.openDetail('${escapeAttr(product.slug || '')}')"
         onkeydown="if(event.key==='Enter'||event.key===' '){ event.preventDefault(); ProductsPage.openDetail('${escapeAttr(product.slug || '')}'); }">
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
          <button class="add-to-cart-btn"
                  onclick="event.stopPropagation(); ProductsPage.addToCart('${escapeAttr(product.id)}')">
            Agregar al Carrito
          </button>

          <a href="${detailUrl}"
             class="quick-view-btn"
             title="Ver detalles"
             onclick="event.stopPropagation();">
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

  const catAllCount = document.getElementById('catAllCount');
  if (catAllCount) catAllCount.textContent = ProductsState.allProducts.length;
}

function renderFiltersUI() {
  const categoriesList = document.getElementById('categoriesList');
  if (categoriesList) {
    const countsByCat = countBy(ProductsState.allProducts, p => normalizeSlug(p.categorySlug));

    categoriesList.innerHTML = ProductsState.categories.map(c => {
      const slug = normalizeSlug(c.slug);
      const count = countsByCat.get(slug) || 0;
      return `
        <label class="filter-check">
          <input type="checkbox" class="cat-item" value="${escapeAttr(slug)}">
          <span>${escapeHtml(c.name)}</span>
          <span class="filter-badge">${count}</span>
        </label>
      `;
    }).join('');
  }

  const brandsList = document.getElementById('brandsList');
  if (brandsList) {
    const countsByBrand = countBy(ProductsState.allProducts, p => normalizeSlug(p.brand));

    brandsList.innerHTML = ProductsState.brands.map(b => {
      const count = countsByBrand.get(b) || 0;
      const label = b ? (b.charAt(0).toUpperCase() + b.slice(1)) : 'Sin marca';
      return `
        <label class="filter-check">
          <input type="checkbox" class="brand-item" value="${escapeAttr(b)}">
          <span>${escapeHtml(label)}</span>
          <span class="filter-badge">${count}</span>
        </label>
      `;
    }).join('');
  }

  syncFiltersUIFromState();
  updateCounts();
}

function bindFiltersEvents() {
  const catAll = document.getElementById('catAll');
  const catItems = () => Array.from(document.querySelectorAll('.cat-item'));

  if (catAll) {
    catAll.addEventListener('change', () => {
      if (catAll.checked) {
        ProductsState.filters.categories = [];
        catItems().forEach(i => (i.checked = false));
        applyAndRender();
      }
    });
  }

  catItems().forEach(cb => {
    cb.addEventListener('change', () => {
      const selected = catItems().filter(x => x.checked).map(x => normalizeSlug(x.value));
      ProductsState.filters.categories = selected;
      if (catAll) catAll.checked = selected.length === 0;
      applyAndRender();
    });
  });

  const brandItems = Array.from(document.querySelectorAll('.brand-item'));
  brandItems.forEach(cb => {
    cb.addEventListener('change', () => {
      const selected = brandItems.filter(x => x.checked).map(x => normalizeSlug(x.value));
      ProductsState.filters.brands = selected;
      applyAndRender();
    });
  });

  const condNew = document.getElementById('condNew');
  const condDiscount = document.getElementById('condDiscount');
  const condStock = document.getElementById('condStock');

  if (condNew) condNew.addEventListener('change', () => { ProductsState.filters.onlyNew = condNew.checked; applyAndRender(); });
  if (condDiscount) condDiscount.addEventListener('change', () => { ProductsState.filters.onlyDiscount = condDiscount.checked; applyAndRender(); });
  if (condStock) condStock.addEventListener('change', () => { ProductsState.filters.onlyStock = condStock.checked; applyAndRender(); });

  const priceMin = document.getElementById('priceMin');
  const priceMax = document.getElementById('priceMax');
  const applyPriceBtn = document.getElementById('applyPriceBtn');

  const applyPrice = () => {
    const min = toNumberOrNull(priceMin?.value);
    const max = toNumberOrNull(priceMax?.value);

    ProductsState.filters.priceMin = typeof min === 'number' ? min : null;
    ProductsState.filters.priceMax = typeof max === 'number' ? max : null;

    applyAndRender();
  };

  if (applyPriceBtn) applyPriceBtn.addEventListener('click', applyPrice);
  if (priceMin) priceMin.addEventListener('keydown', (e) => { if (e.key === 'Enter') applyPrice(); });
  if (priceMax) priceMax.addEventListener('keydown', (e) => { if (e.key === 'Enter') applyPrice(); });

  const clearBtn = document.getElementById('clearFiltersBtn');
  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      ProductsState.filters.categories = [];
      ProductsState.filters.brands = [];
      ProductsState.filters.priceMin = null;
      ProductsState.filters.priceMax = null;
      ProductsState.filters.onlyNew = false;
      ProductsState.filters.onlyDiscount = false;
      ProductsState.filters.onlyStock = false;

      if (priceMin) priceMin.value = '';
      if (priceMax) priceMax.value = '';
      if (condNew) condNew.checked = false;
      if (condDiscount) condDiscount.checked = false;
      if (condStock) condStock.checked = false;

      document.querySelectorAll('.cat-item, .brand-item').forEach(i => (i.checked = false));
      if (catAll) catAll.checked = true;

      applyAndRender();
    });
  }

  const filtersPanel = document.getElementById('filtersPanel');
  const overlay = document.getElementById('filtersOverlay');
  const openBtn = document.getElementById('openFiltersBtn');
  const closeBtn = document.getElementById('closeFiltersBtn');

  const closeFilters = () => {
    filtersPanel?.classList.remove('is-open');
    overlay?.classList.remove('is-open');
    overlay?.setAttribute('aria-hidden', 'true');
  };

  const openFilters = () => {
    filtersPanel?.classList.add('is-open');
    overlay?.classList.add('is-open');
    overlay?.setAttribute('aria-hidden', 'false');
  };

  if (openBtn) openBtn.addEventListener('click', openFilters);
  if (closeBtn) closeBtn.addEventListener('click', closeFilters);
  if (overlay) overlay.addEventListener('click', closeFilters);

  window.addEventListener('resize', () => {
    if (!window.matchMedia('(max-width: 968px)').matches) closeFilters();
  });
}

function syncFiltersUIFromState() {
  const f = ProductsState.filters;

  const catAll = document.getElementById('catAll');
  const catItems = Array.from(document.querySelectorAll('.cat-item'));

  catItems.forEach(cb => {
    cb.checked = f.categories.includes(normalizeSlug(cb.value));
  });
  if (catAll) catAll.checked = f.categories.length === 0;

  const brandItems = Array.from(document.querySelectorAll('.brand-item'));
  brandItems.forEach(cb => {
    cb.checked = f.brands.includes(normalizeSlug(cb.value));
  });

  const condNew = document.getElementById('condNew');
  const condDiscount = document.getElementById('condDiscount');
  const condStock = document.getElementById('condStock');

  if (condNew) condNew.checked = !!f.onlyNew;
  if (condDiscount) condDiscount.checked = !!f.onlyDiscount;
  if (condStock) condStock.checked = !!f.onlyStock;

  const priceMin = document.getElementById('priceMin');
  const priceMax = document.getElementById('priceMax');
  if (priceMin) priceMin.value = typeof f.priceMin === 'number' ? String(f.priceMin) : '';
  if (priceMax) priceMax.value = typeof f.priceMax === 'number' ? String(f.priceMax) : '';
}

function applyAndRender() {
  applyFilters();
  sortProducts(ProductsState.currentSort, { render: false });
  renderProducts();
  updateCounts();
}

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

function toNumberOrNull(v) {
  const n = Number(String(v || '').trim());
  return Number.isFinite(n) ? n : null;
}

function countBy(arr, keyFn) {
  const map = new Map();
  for (const item of arr) {
    const k = keyFn(item);
    map.set(k, (map.get(k) || 0) + 1);
  }
  return map;
}

document.addEventListener('DOMContentLoaded', () => {
  if (window.location.pathname.includes('productos.html')) initProductsPage();
});

function openDetail(slug) {
  const s = String(slug || '').trim();
  if (!s) return;
  window.location.href = `producto-detalle.html?id=${encodeURIComponent(s)}`;
}

window.ProductsPage = {
  sortProducts,
  goToPage,
  addToCart,
  openDetail,
  getState: () => ({ ...ProductsState })
};
