// File: /js/wishlist-page.js

document.addEventListener('DOMContentLoaded', () => {
    console.log("wishlist-page.js script started."); // 1. Check if the script runs

    const wishlistGrid = document.getElementById('wishlist-grid');
    const emptyMessage = document.getElementById('empty-wishlist-message');

    // 2. Check if the essential HTML elements exist
    if (!wishlistGrid || !emptyMessage) {
        console.error("CRITICAL ERROR: Could not find 'wishlist-grid' or 'empty-wishlist-message' elements in the HTML.");
        return; // Stop the script if the page is broken
    }
    
    const formatCurrency = (amount) => `₹${amount.toLocaleString('en-IN')}`;

    async function renderWishlist() {
        try {
            const wishlist = getWishlist(); // From cart.js
            console.log("Wishlist IDs from localStorage:", wishlist); // 3. Check what's in the wishlist

            if (wishlist.length === 0) {
                console.log("Wishlist is empty. Showing empty message.");
                wishlistGrid.style.display = 'none';
                emptyMessage.style.display = 'block';
                return;
            }

            wishlistGrid.style.display = 'grid';
            emptyMessage.style.display = 'none';
            
            console.log("Fetching product data from data/products.json");
            const productsResponse = await fetch('data/products.json');
            if (!productsResponse.ok) {
                throw new Error(`Failed to fetch products.json. Status: ${productsResponse.status}`);
            }
            const allProducts = await productsResponse.json();
            console.log("Successfully fetched all products:", allProducts); // 4. Check if products were fetched

            wishlistGrid.innerHTML = '';

            const wishlistedProducts = allProducts.filter(product => wishlist.includes(product.id));
            console.log("Filtered products to display:", wishlistedProducts); // 5. Check the final list

            if (wishlistedProducts.length === 0) {
                 console.warn("Wishlist has IDs, but no matching products were found in products.json.");
                 wishlistGrid.style.display = 'none';
                 emptyMessage.style.display = 'block';
                 return;
            }

            wishlistedProducts.forEach(product => {
                const productCardHTML = `
                    <a href="product-detail.html?id=${product.id}" class="product-card">
                        <div class="wishlist-icon active" data-product-id="${product.id}">
                            <i class="fa-solid fa-heart"></i>
                        </div>
                        <div class="product-image-container">
                            <img src="${product.images[0]}" alt="${product.name}">
                        </div>
                        <div class="product-card-details">
                            <h3>${product.name}</h3>
                            <p class="price">${formatCurrency(product.price)}</p>
                        </div>
                    </a>
                `;
                wishlistGrid.innerHTML += productCardHTML;
            });

        } catch (error) {
            console.error("An error occurred in renderWishlist:", error);
            wishlistGrid.innerHTML = `<p style="text-align: center; color: red;">Error: Could not load wishlist items. Check console for details.</p>`;
        }
    }

    wishlistGrid.addEventListener('click', (event) => {
        const wishlistBtn = event.target.closest('.wishlist-icon');
        if (wishlistBtn) {
            event.preventDefault();
            event.stopPropagation();
            const productId = wishlistBtn.dataset.productId;
            toggleWishlist(productId);
            renderWishlist(); // Re-render the page to show the item has been removed
        }
    });

    renderWishlist();
});