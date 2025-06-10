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
    // Notifies the header counter to update
    window.dispatchEvent(new CustomEvent('cartUpdated'));
}

/**
 * Adds an item with customizations to the shopping cart.
 * @param {object} itemToAdd - The full item object to be added.
 */
function addToCart(itemToAdd) {
    const cart = getCart();
    
    // Create a unique ID for this cart item based on its exact customizations.
    // Example: "BS001R-Gold-18K-Diamond(SI IJ)"
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


// --- NEW & IMPROVED WISHLIST FUNCTIONS ---

/**
 * Retrieves the wishlist array of objects from localStorage.
 * @returns {Array} The wishlist items. Returns an empty array if nothing is found.
 */
function getWishlist() {
    try {
        const wishlistString = localStorage.getItem('wishlist_v2'); // Using a new key to avoid conflicts with old format
        return JSON.parse(wishlistString) || [];
    } catch (error) {
        console.error("Error parsing wishlist from localStorage:", error);
        return [];
    }
}

/**
 * Saves the wishlist array to localStorage and dispatches a custom event.
 * @param {Array} wishlist - The wishlist array to save.
 */
function saveWishlist(wishlist) {
    localStorage.setItem('wishlist_v2', JSON.stringify(wishlist));
    // Notifies the header counter to update
    window.dispatchEvent(new CustomEvent('wishlistUpdated'));
}

/**
 * Toggles a custom item in the wishlist. Adds it if it doesn't exist, removes it if it does.
 * @param {object} itemToToggle - The full item object with customizations.
 */
function toggleWishlistItem(itemToToggle) {
    let wishlist = getWishlist();
    // Create a unique ID for the item, just like we do for the cart.
    const wishlistItemId = `${itemToToggle.id}-${itemToToggle.customizations.metal}-${itemToToggle.customizations.purity}-${itemToToggle.customizations.stone}`;
    
    const itemIndex = wishlist.findIndex(item => item.wishlistItemId === wishlistItemId);

    if (itemIndex > -1) {
        // Item exists, so remove it.
        wishlist.splice(itemIndex, 1);
    } else {
        // Item does not exist, so add it.
        itemToToggle.wishlistItemId = wishlistItemId;
        wishlist.push(itemToToggle);
    }
    
    saveWishlist(wishlist);
}

/**
 * Checks if a specific customized item exists in the wishlist.
 * @param {string} wishlistItemId - The unique ID of the item to check for.
 * @returns {boolean} - True if the item is in the wishlist, false otherwise.
 */
function isItemInWishlist(wishlistItemId) {
    const wishlist = getWishlist();
    return wishlist.some(item => item.wishlistItemId === wishlistItemId);
}