// File: /js/cart.js
// This file manages all shopping cart and wishlist data logic.

// --- CART FUNCTIONS ---

/**
 * Retrieves the cart array from localStorage.
 * @returns {Array} The cart items. Returns an empty array if nothing is found.
 */
function getCart() {
    try {
        const cartString = localStorage.getItem('cart');
        return JSON.parse(cartString) || [];
    } catch (error) {
        console.error("Error parsing cart from localStorage:", error);
        return [];
    }
}

/**
 * Saves the cart array to localStorage and dispatches a custom event.
 * @param {Array} cart - The cart array to save.
 */
function saveCart(cart) {
    localStorage.setItem('cart', JSON.stringify(cart));
    window.dispatchEvent(new Event('cartUpdated')); // Notifies the header counter to update
}

/**
 * Adds an item with potential customizations to the shopping cart.
 * This is the function called from the Product Detail Page.
 * @param {object} itemToAdd - The full item object to be added.
 */
function addToCart(itemToAdd) {
    const cart = getCart();
    
    // Create a unique ID for this cart item based on its exact customizations.
    // Example: "BS001R-Gold-18K-Diamond (SI IJ)"
    const cartItemId = `${itemToAdd.id}-${itemToAdd.customizations.metal}-${itemToAdd.customizations.purity}-${itemToAdd.customizations.stone}`;
    
    const existingItem = cart.find(cartItem => cartItem.cartItemId === cartItemId);

    if (existingItem) {
        // If the *exact same* custom item exists, just increase its quantity.
        existingItem.quantity += itemToAdd.quantity;
    } else {
        // Otherwise, add the unique ID to the item object and push it as a new entry.
        itemToAdd.cartItemId = cartItemId;
        cart.push(itemToAdd);
    }
    
    saveCart(cart);
}

/**
 * Removes an item from the cart using its unique cartItemId.
 * @param {string} cartItemId - The unique ID of the cart item to remove.
 */
function removeFromCart(cartItemId) {
    let cart = getCart();
    // This keeps all items EXCEPT the one with the matching cartItemId.
    cart = cart.filter(item => item.cartItemId !== cartItemId);
    saveCart(cart);
}

/**
 * Updates the quantity of a specific item in the cart.
 * @param {string} cartItemId - The unique ID of the item to update.
 * @param {number} newQuantity - The new quantity for the item.
 */
function updateCartQuantity(cartItemId, newQuantity) {
    let cart = getCart();
    const itemToUpdate = cart.find(item => item.cartItemId === cartItemId);

    if (itemToUpdate) {
        if (newQuantity > 0) {
            itemToUpdate.quantity = newQuantity;
        } else {
            // If the user sets quantity to 0 or less, remove the item.
            cart = cart.filter(item => item.cartItemId !== cartItemId);
        }
    }
    saveCart(cart);
}


// --- WISHLIST FUNCTIONS ---

function getWishlist() {
    return JSON.parse(localStorage.getItem('wishlist')) || [];
}

function saveWishlist(wishlist) {
    localStorage.setItem('wishlist', JSON.stringify(wishlist));
    window.dispatchEvent(new Event('wishlistUpdated'));
}

function toggleWishlist(productId) {
    let wishlist = getWishlist();
    if (wishlist.includes(productId)) {
        wishlist = wishlist.filter(id => id !== productId);
    } else {
        wishlist.push(productId);
    }
    saveWishlist(wishlist);
}