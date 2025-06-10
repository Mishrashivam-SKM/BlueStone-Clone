// File: /js/cart.js
// This file manages all shopping cart and wishlist logic.

// --- CART FUNCTIONS ---

/**
 * Retrieves the cart from localStorage.
 * @returns {Array} The cart items.
 */
function getCart() {
    const cartString = localStorage.getItem('cart');
    return JSON.parse(cartString) || [];
}

/**
 * Saves the cart to localStorage and notifies the app of the update.
 * @param {Array} cart - The cart array to save.
 */
function saveCart(cart) {
    localStorage.setItem('cart', JSON.stringify(cart));
    window.dispatchEvent(new Event('cartUpdated'));
}

/**
 * UPGRADED: Adds a potentially customized item to the shopping cart.
 * @param {object} item - The full item object, including id, quantity, customizations, and finalPrice.
 */
function addToCart(item) {
    const cart = getCart();
    
    // Create a unique ID for this specific cart item based on its exact customizations.
    // e.g., "BS001R-Gold-18K-Diamond (SI IJ)"
    const cartItemId = `${item.id}-${item.customizations.metal}-${item.customizations.purity}-${item.customizations.stone}`;
    item.cartItemId = cartItemId; // Add this unique ID to the item object itself.

    const existingItem = cart.find(cartItem => cartItem.cartItemId === cartItemId);

    if (existingItem) {
        existingItem.quantity += item.quantity;
    } else {
        cart.push(item);
    }
    saveCart(cart);
}

/**
 * FIXED: Removes an item from the cart using its unique cartItemId.
 * @param {string} cartItemId - The unique ID of the cart item to remove.
 */
function removeFromCart(cartItemId) {
    let cart = getCart();
    // Keep only the items that DO NOT match the unique cartItemId.
    cart = cart.filter(item => item.cartItemId !== cartItemId);
    saveCart(cart);
}

/**
 * FIXED: Updates the quantity of a specific item in the cart using its unique cartItemId.
 * @param {string} cartItemId - The unique ID of the product to update.
 * @param {number} newQuantity - The new quantity.
 */
function updateCartQuantity(cartItemId, newQuantity) {
    let cart = getCart();
    const itemToUpdate = cart.find(item => item.cartItemId === cartItemId);

    if (itemToUpdate) {
        if (newQuantity > 0) {
            itemToUpdate.quantity = newQuantity;
        } else {
            // If new quantity is 0 or less, remove the item entirely.
            cart = cart.filter(item => item.cartItemId !== cartItemId);
        }
    }
    saveCart(cart);
}


// --- WISHLIST FUNCTIONS (no changes needed here) ---

function getWishlist() {
    return JSON.parse(localStorage.getItem('wishlist')) || [];
}

function isProductInWishlist(productId) {
    const wishlist = getWishlist();
    return wishlist.includes(productId);
}

function saveWishlist(wishlist) {
    localStorage.setItem('wishlist', JSON.stringify(wishlist));
    window.dispatchEvent(new Event('wishlistUpdated'));
}

function toggleWishlist(productId) {
    let wishlist = getWishlist();
    if (isProductInWishlist(productId)) {
        wishlist = wishlist.filter(id => id !== productId);
    } else {
        wishlist.push(productId);
    }
    saveWishlist(wishlist);
}