// --- Wait for the entire HTML document to be loaded before running the script ---
document.addEventListener('DOMContentLoaded', function() {

    // --- Mega Menu Functionality ---
    const navItemsWithDropdown = document.querySelectorAll('.has-dropdown');

    navItemsWithDropdown.forEach(item => {
        // We use mouseenter and mouseleave to avoid event bubbling issues
        item.addEventListener('mouseenter', () => {
            // The 'active' class is a more robust way to control state with JS
            item.classList.add('active'); 
        });

        item.addEventListener('mouseleave', () => {
            item.classList.remove('active');
        });
    });

    // You can add more JavaScript functionality here in the future

});

document.addEventListener('DOMContentLoaded', function() {

    // --- Mega Menu Functionality (from before) ---
    // ... your existing code for desktop hover ...


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

    // --- Mobile Sub-menu Functionality ---
    // On mobile, we want to toggle dropdowns on click, not hover.
    const navLinks = document.querySelectorAll('.main-nav .has-dropdown > a');
    navLinks.forEach(link => {
        link.addEventListener('click', function(event) {
            // Check if we are in mobile view
            if (window.innerWidth <= 1024) {
                event.preventDefault(); // Prevent link from navigating
                const parentItem = this.parentElement;
                parentItem.classList.toggle('active');
            }
        });
    });

     // --- Global Cart Counter Update Functionality ---
     const cartCounterEl = document.getElementById('cart-counter');

     function updateCartCounter() {
         // We need to access getCart() from cart.js. For simplicity, we'll redefine it here.
         // A better approach in larger apps would be modules, but this is clear and effective.
         const cart = JSON.parse(localStorage.getItem('cart')) || [];
         
         let totalItems = 0;
         cart.forEach(item => {
             totalItems += item.quantity;
         });
         
         if (cartCounterEl) {
             cartCounterEl.textContent = totalItems;
         }
     }
 
     // Update the counter when the page loads
     updateCartCounter();
 
     // Add an event listener to update the counter whenever the cart changes
     window.addEventListener('cartUpdated', updateCartCounter);

     // --- Global Wishlist Counter Update Functionality ---
    const wishlistCounterEl = document.getElementById('wishlist-counter');

    function updateWishlistCounter() {
        const wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];
        if (wishlistCounterEl) {
            wishlistCounterEl.textContent = wishlist.length;
        }
    }

    // Update the counter when the page first loads
    updateWishlistCounter();

    // Listen for the custom event from cart.js
    window.addEventListener('wishlistUpdated', updateWishlistCounter);
});
