function performSearch() {
    const searchInput = document.getElementById('headerSearchInput');
    const query = searchInput.value.trim();
    
    if (query) {
        window.location.href = `productos.html?search=${encodeURIComponent(query)}`;
    }
}

document.getElementById('headerSearchInput')?.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        performSearch();
    }
});

document.addEventListener('DOMContentLoaded', function() {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    const navLinks = document.querySelectorAll('.nav-link');
    
    navLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (href === currentPage) {
            link.style.background = 'rgba(255,255,255,0.15)';
        }
    });
});