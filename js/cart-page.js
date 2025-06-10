// File: /js/cart-page.js
// This file controls ONLY the display and interactions on the cart.html page.

document.addEventListener('DOMContentLoaded', async function() {
    // --- 1. GET HTML ELEMENTS ---
    const cartItemsContainer = document.getElementById('cart-items-container');
    const subtotalEl = document.getElementById('cart-subtotal');
    const totalEl = document.getElementById('cart-total');
    const cartLayout = document.querySelector('.cart-layout');
    const emptyCartMessageContainer = document.querySelector('.cart-page-main .container');

    // --- 2. FETCH ALL PRODUCT DATA (once) ---
    let allProducts = [];
    try {
        const response = await fetch('data/products.json');
        if (!response.ok) throw new Error('Network response was not ok');
        allProducts = await response.json();
    } catch (error) {
        console.error("Fatal Error: Could not load product data.", error);
        cartItemsContainer.innerHTML = `<p style="color:red;">Error loading essential product data. Cart cannot be displayed.</p>`;
        return;
    }

    // --- 3. RENDER FUNCTION ---
    function renderCart() {
        const cart = getCart(); // Get current cart from cart.js

        // --- Handle Empty Cart ---
        if (cart.length === 0) {
            cartLayout.style.display = 'none'; // Hide the main layout
            if (!document.getElementById('empty-cart-msg')) {
                const emptyMsg = document.createElement('div');
                emptyMsg.id = 'empty-cart-msg';
                emptyMsg.style.textAlign = 'center';
                emptyMsg.innerHTML = `
                    <h2>Your Shopping Cart is Empty</h2>
                    <p>Looks like you haven't added anything to your cart yet.</p>
                    <a href="product-listing.html" class="btn" style="background-color: #00437a; color: white;">Continue Shopping</a>
                `;
                emptyCartMessageContainer.appendChild(emptyMsg);
            }
            subtotalEl.textContent = '₹0';
            totalEl.textContent = '₹0';
            return;
        }

        // --- Handle Non-Empty Cart ---
        cartLayout.style.display = 'grid'; // Ensure layout is visible
        const existingEmptyMsg = document.getElementById('empty-cart-msg');
        if (existingEmptyMsg) {
            existingEmptyMsg.remove();
        }

        cartItemsContainer.innerHTML = ''; // Clear previous items
        let currentSubtotal = 0;

        cart.forEach(cartItem => {
            const product = allProducts.find(p => p.id === cartItem.id);
            if (!product) {
                console.warn(`Could not find product with ID: ${cartItem.id} in products.json. Skipping item.`);
                return;
            }

            // Use the price stored IN THE CART ITEM, which includes customization costs.
            const itemTotalPrice = cartItem.finalPrice * cartItem.quantity;
            currentSubtotal += itemTotalPrice;

            // Generate HTML for customization details
            const customDetailsHtml = `
                <ul class="cart-custom-details">
                    <li>Metal: <span>${cartItem.customizations.metal}</span></li>
                    <li>Purity: <span>${cartItem.customizations.purity}</span></li>
                    <li>Stone: <span>${cartItem.customizations.stone}</span></li>
                </ul>`;

            const cartItemEl = document.createElement('div');
            cartItemEl.classList.add('cart-item');
            // Use the unique cartItemId in the data attributes for targeting
            cartItemEl.innerHTML = `
                <div class="cart-item-image">
                    <a href="product-detail.html?id=${product.id}" class="cart-item-image-link">
                        <img src="${product.images[0]}" alt="${product.name}">
                    </a>
                </div>
                <div class="cart-item-details">
                    <h3><a href="product-detail.html?id=${product.id}">${product.name}</a></h3>
                    <p class="item-price">₹${cartItem.finalPrice.toLocaleString('en-IN')}</p>
                    ${customDetailsHtml}
                </div>
                <div class="cart-item-actions">
                    <div class="quantity-selector">
                        <label for="qty-${cartItem.cartItemId}">Qty:</label>
                        <input type="number" id="qty-${cartItem.cartItemId}" value="${cartItem.quantity}" min="1" data-cart-item-id="${cartItem.cartItemId}" class="quantity-input">
                    </div>
                    <button class="remove-item-btn" data-cart-item-id="${cartItem.cartItemId}">
                        <i class="fa-regular fa-trash-can"></i> Remove
                    </button>
                </div>
            `;
            cartItemsContainer.appendChild(cartItemEl);
        });

        // Update totals
        subtotalEl.textContent = `₹${currentSubtotal.toLocaleString('en-IN')}`;
        totalEl.textContent = `₹${currentSubtotal.toLocaleString('en-IN')}`;
    }

    // --- 4. EVENT LISTENERS using Event Delegation ---
    cartItemsContainer.addEventListener('click', (event) => {
        const removeButton = event.target.closest('.remove-item-btn');
        if (removeButton) {
            const cartItemId = removeButton.dataset.cartItemId;
            removeFromCart(cartItemId); // Call function from cart.js
            renderCart(); // Re-render the cart view
        }
    });
    
    cartItemsContainer.addEventListener('change', (event) => {
        const quantityInput = event.target;
        if (quantityInput.classList.contains('quantity-input')) {
            const cartItemId = quantityInput.dataset.cartItemId;
            const newQuantity = parseInt(quantityInput.value, 10);
            updateCartQuantity(cartItemId, newQuantity, 10); // Call function from cart.js
            renderCart(); // Re-render the cart view
        }
    });

    // --- 5. INITIAL RENDER ---
    renderCart();
});