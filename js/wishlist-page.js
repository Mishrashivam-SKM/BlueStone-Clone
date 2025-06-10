// File: /js/wishlist-page.js

document.addEventListener('DOMContentLoaded', async () => {
    const wishlistGrid = document.getElementById('wishlist-grid');
    const emptyMessage = document.getElementById('empty-wishlist-message');

    if (!wishlistGrid || !emptyMessage) {
        console.error("Critical Error: Could not find 'wishlist-grid' or 'empty-wishlist-message' elements.");
        return;
    }
    
    const formatCurrency = (amount) => `₹${amount.toLocaleString('en-IN')}`;

    async function renderWishlist() {
        try {
            // 1. Get the new wishlist (array of objects)
            const wishlistItems = getWishlist(); // from cart.js

            if (wishlistItems.length === 0) {
                wishlistGrid.style.display = 'none';
                emptyMessage.style.display = 'block';
                return;
            }

            wishlistGrid.style.display = 'grid';
            emptyMessage.style.display = 'none';
            
            // 2. Fetch all base product data
            const productsResponse = await fetch('data/products.json');
            if (!productsResponse.ok) throw new Error('Failed to fetch products.json.');
            const allProducts = await productsResponse.json();

            wishlistGrid.innerHTML = '';

            // 3. Loop through each item IN THE WISHLIST
            wishlistItems.forEach(item => {
                // Find the matching base product
                const product = allProducts.find(p => p.id === item.id);
                if (!product) return; // Skip if product not found

                // 4. Generate the HTML for customization details
                const customDetailsHtml = `
                    <ul class="cart-custom-details">
                        <li>Metal: <span>${item.customizations.metal}</span></li>
                        <li>Purity: <span>${item.customizations.purity}</span></li>
                        <li>Stone: <span>${item.customizations.stone}</span></li>
                    </ul>`;

                // 5. Build the full product card, now including the custom details
                const productCard = document.createElement('div');
                productCard.classList.add('product-card'); // Use a div wrapper for better event handling
                
                // Construct the link that preserves the customization in the URL
                const detailUrl = `product-detail.html?id=${product.id}&metal=${item.customizations.metal}&purity=${item.customizations.purity}&stone=${encodeURIComponent(item.customizations.stone)}`;

                productCard.innerHTML = `
                    <div class="wishlist-icon active" data-wishlist-item-id="${item.wishlistItemId}">
                        <i class="fa-solid fa-heart"></i>
                    </div>
                    <a href="${detailUrl}" class="product-link-wrapper">
                        <div class="product-image-container">
                            <img src="${product.images[0]}" alt="${product.name}">
                        </div>
                        <div class="product-card-details">
                            <h3>${product.name}</h3>
                            <p class="price">${formatCurrency(item.finalPrice)}</p>
                            <!-- Inject the custom details here! -->
                            ${customDetailsHtml}
                        </div>
                    </a>
                `;
                wishlistGrid.appendChild(productCard);
            });

        } catch (error) {
            console.error("An error occurred in renderWishlist:", error);
            wishlistGrid.innerHTML = `<p style="text-align: center; color: red;">Error: Could not load wishlist items.</p>`;
        }
    }

    // New event listener that uses the unique wishlistItemId
    wishlistGrid.addEventListener('click', (event) => {
        const wishlistBtn = event.target.closest('.wishlist-icon');
        if (wishlistBtn) {
            event.preventDefault();
            event.stopPropagation();
            const wishlistItemIdToRemove = wishlistBtn.dataset.wishlistItemId;
            
            // We need to find the full item object to remove it
            const wishlist = getWishlist();
            const itemToRemove = wishlist.find(i => i.wishlistItemId === wishlistItemIdToRemove);

            if (itemToRemove) {
                toggleWishlistItem(itemToRemove); // Use the existing toggle function
                renderWishlist(); // Re-render the page
            }
        }
    });

    renderWishlist();
});