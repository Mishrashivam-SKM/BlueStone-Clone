// File: /js/main.js
document.addEventListener('DOMContentLoaded', function() {

    // --- Mega Menu & Dropdown Functionality ---
    const navItemsWithDropdown = document.querySelectorAll('.main-nav .has-dropdown');

    navItemsWithDropdown.forEach(item => {
        // Desktop Hover Logic
        item.addEventListener('mouseenter', () => {
            if (window.innerWidth > 1024) { // Only run on desktop
                item.classList.add('active');
            }
        });
        item.addEventListener('mouseleave', () => {
            if (window.innerWidth > 1024) { // Only run on desktop
                item.classList.remove('active');
            }
        });

        // Mobile Click Logic
        const link = item.querySelector('a');
        link.addEventListener('click', function(event) {
            if (window.innerWidth <= 1024) { // Only run on mobile
                event.preventDefault(); // Prevent link navigation
                // Close other open submenus
                navItemsWithDropdown.forEach(otherItem => {
                    if (otherItem !== item) {
                        otherItem.classList.remove('active');
                    }
                });
                // Toggle the current one
                item.classList.toggle('active');
            }
        });
    });

    // --- Mobile Menu Toggle Functionality ---
    const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
    const mobileMenuClose = document.querySelector('.mobile-menu-close');
    const mainNav = document.querySelector('.main-nav');

    if (mobileMenuToggle && mainNav) {
        mobileMenuToggle.addEventListener('click', () => {
            mainNav.classList.add('is-open');
        });
    }

    if (mobileMenuClose && mainNav) {
        mobileMenuClose.addEventListener('click', () => {
            mainNav.classList.remove('is-open');
        });
    }

    // --- Global Cart Counter Update ---
    function updateCartCounter() {
        const cartCounterEl = document.getElementById('cart-counter');
        if (!cartCounterEl) return;

        const cart = JSON.parse(localStorage.getItem('cart')) || [];
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        cartCounterEl.textContent = totalItems;
    }

    // --- Global Wishlist Counter Update ---
    function updateWishlistCounter() {
        const wishlistCounterEl = document.getElementById('wishlist-counter');
        if (!wishlistCounterEl) return;

        // **THE FIX IS HERE:** We now read from 'wishlist_v2' to match cart.js
        const wishlist = JSON.parse(localStorage.getItem('wishlist_v2')) || [];
        wishlistCounterEl.textContent = wishlist.length;
    }

    // --- Initial Counter Updates on Page Load ---
    updateCartCounter();
    updateWishlistCounter();

    // --- Event Listeners to Update Counters ---
    window.addEventListener('cartUpdated', updateCartCounter);
    window.addEventListener('wishlistUpdated', updateWishlistCounter);

});