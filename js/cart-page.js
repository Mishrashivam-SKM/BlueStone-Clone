// File: /js/cart-page.js
// Replace the entire file content with this.

document.addEventListener('DOMContentLoaded', () => {
    // Select the main containers from the *new* HTML structure
    const layoutContainer = document.querySelector('.cart-page-layout');
    const itemsContainer = document.getElementById('cart-items-container');
    const summaryContainer = document.getElementById('order-summary-container');
    const emptyCartMessage = document.getElementById('empty-cart-message');

    // Helper function to format currency consistently
    const formatCurrency = (amount) => `₹${amount.toLocaleString('en-IN')}`;

    async function renderCart() {
        // Get cart data from the global function in cart.js
        const cart = getCart();

        // --- Handle Empty Cart ---
        if (cart.length === 0) {
            if(layoutContainer) layoutContainer.style.display = 'none';
            if(emptyCartMessage) emptyCartMessage.style.display = 'block';
            return;
        }

        // --- Handle Non-Empty Cart ---
        if(layoutContainer) layoutContainer.style.display = 'grid';
        if(emptyCartMessage) emptyCartMessage.style.display = 'none';

        // Fetch all product data to get names and images
        const productsResponse = await fetch('data/products.json');
        const allProducts = await productsResponse.json();

        let subtotal = 0;
        itemsContainer.innerHTML = ''; // Clear previous items before re-rendering

        // Loop through each item in the cart array
        for (const cartItem of cart) {
            // Find the base product details using the item's ID
            const product = allProducts.find(p => p.id === cartItem.id);
            if (!product) continue; // Skip if the product doesn't exist in our data file

            // UPGRADED: Use the stored finalPrice for the subtotal calculation
            subtotal += cartItem.finalPrice * cartItem.quantity;

            // NEW: Generate a description list from the item's customization object
            let customDesc = '';
            if (cartItem.customizations) {
                customDesc = `
                    <ul class="cart-custom-details">
                        <li>Metal: <span>${cartItem.customizations.metal}</span></li>
                        <li>Purity: <span>${cartItem.customizations.purity}</span></li>
                        <li>Stone: <span>${cartItem.customizations.stone}</span></li>
                    </ul>
                `;
            }

            // NEW: Create a dynamic URL to link back to the PDP with the exact customizations
            const pdpUrl = `product-detail.html?id=${cartItem.id}&metal=${cartItem.customizations.metal}&purity=${cartItem.customizations.purity}&stone=${cartItem.customizations.stone}`;

            // UPGRADED: The new, more detailed HTML for each cart item
            itemsContainer.innerHTML += `
                <div class="cart-item-card" data-cart-item-id="${cartItem.cartItemId}">
                    <a href="${pdpUrl}" class="cart-item-image-link">
                        <img src="${product.images[0]}" alt="${product.name}">
                    </a>
                    <div class="cart-item-details">
                        <h3><a href="${pdpUrl}">${product.name}</a></h3>
                        ${customDesc}
                        <p class="price">${formatCurrency(cartItem.finalPrice)}</p>
                    </div>
                    <div class="cart-item-actions">
                        <label>Qty:</label>
                        <input type="number" class="quantity-input" value="${cartItem.quantity}" min="1">
                        <button class="remove-btn">
                            <i class="fa-regular fa-trash-can"></i> Remove
                        </button>
                    </div>
                </div>
            `;
        }
        
        // UPGRADED: Render the entire order summary block dynamically
        summaryContainer.innerHTML = `
            <h2>Order Summary</h2>
            <div class="summary-row">
                <span>Subtotal</span>
                <span>${formatCurrency(subtotal)}</span>
            </div>
            <div class="summary-row">
                <span>Shipping</span>
                <span>FREE</span>
            </div>
            <div class="summary-row total">
                <span>Total</span>
                <span>${formatCurrency(subtotal)}</span>
            </div>
            <button class="btn btn-primary checkout-btn" ${subtotal === 0 ? 'disabled' : ''}>
                Proceed to Checkout
            </button>
        `;
    }

    // --- UPGRADED Event Listeners using the unique cartItemId ---
    itemsContainer.addEventListener('click', (event) => {
        const removeButton = event.target.closest('.remove-btn');
        if (removeButton) {
            const cartItemId = removeButton.closest('.cart-item-card').dataset.cartItemId;
            // This function needs to be updated in cart.js
            removeFromCart(cartItemId);
            renderCart(); // Re-render the entire cart view
        }
    });

    itemsContainer.addEventListener('change', (event) => {
        const quantityInput = event.target;
        if (quantityInput.classList.contains('quantity-input')) {
            const cartItemId = quantityInput.closest('.cart-item-card').dataset.cartItemId;
            const newQuantity = parseInt(quantityInput.value, 10);
            // This function also needs to be updated in cart.js
            updateCartQuantity(cartItemId, newQuantity);
            renderCart(); // Re-render the entire cart view
        }
    });

    // Initial render when the page loads
    renderCart();
});