// File: /js/pdp.js
document.addEventListener('DOMContentLoaded', function() {
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id');

    if (!productId) {
        window.location.href = 'index.html'; // Go home if no product ID
        return;
    }

    // --- GET ALL DOM ELEMENTS ---
    const productNameEl = document.getElementById('product-name');
    const productIdEl = document.getElementById('product-id');
    const productDescEl = document.getElementById('product-description');
    const mainImageEl = document.getElementById('main-product-image');
    const thumbnailContainerEl = document.querySelector('.thumbnail-container');
    const priceEl = document.getElementById('product-price');
    const metalSelect = document.getElementById('metal-type');
    const puritySelect = document.getElementById('metal-purity');
    const stoneSelect = document.getElementById('stone-type');
    const addToCartBtn = document.querySelector('.add-to-cart-btn');
    const wishlistBtn = document.querySelector('.add-to-wishlist-btn');

    let basePrice = 0;
    let marketPrices = {};

    // --- HELPER FUNCTION to get current selections ---
    function getCurrentCustomizations() {
        return {
            metal: metalSelect.value,
            purity: puritySelect.value,
            stone: stoneSelect.value,
        };
    }

    // --- DYNAMIC PRICING ENGINE ---
    function calculateAndDisplayPrice() {
        if (!basePrice || !Object.keys(marketPrices).length) return;

        const customizations = getCurrentCustomizations();
        const metalMultiplier = marketPrices.metals[customizations.metal] || 1;
        const purityMultiplier = marketPrices.purity[customizations.purity] || 1;
        const stoneMultiplier = marketPrices.stones[customizations.stone] || 1;
        const finalPrice = basePrice * metalMultiplier * purityMultiplier * stoneMultiplier;
        
        priceEl.textContent = `₹${Math.round(finalPrice).toLocaleString('en-IN')}`;
        
        // When price changes, we also need to update the wishlist button state
        updateWishlistButtonState();
    }
    
    // --- UPDATE WISHLIST BUTTON'S APPEARANCE ---
    function updateWishlistButtonState() {
        const customizations = getCurrentCustomizations();
        const wishlistItemId = `${productId}-${customizations.metal}-${customizations.purity}-${customizations.stone}`;

        if (isItemInWishlist(wishlistItemId)) {
            wishlistBtn.classList.add('active');
            wishlistBtn.innerHTML = '<i class="fa-solid fa-heart"></i> In Wishlist';
        } else {
            wishlistBtn.classList.remove('active');
            wishlistBtn.innerHTML = '<i class="fa-regular fa-heart"></i> Add to Wishlist';
        }
    }

    // --- FETCH DATA AND POPULATE PAGE ---
    async function loadProductDetails() {
        try {
            const [productsResponse, pricesResponse] = await Promise.all([
                fetch('data/products.json'),
                fetch('data/market-prices.json')
            ]);
            const allProducts = await productsResponse.json();
            marketPrices = await pricesResponse.json();
            
            const product = allProducts.find(p => p.id === productId);

            if (!product) {
                document.querySelector('.pdp-main').innerHTML = '<h1>Product not found</h1>';
                return;
            }
            
            basePrice = product.price;

            // --- POPULATE PAGE CONTENT ---
            document.title = `${product.name} - BlueStone Clone`;
            productNameEl.textContent = product.name;
            productIdEl.textContent = `SKU: ${product.id}`;
            productDescEl.textContent = product.description;

            mainImageEl.src = product.images[0];
            thumbnailContainerEl.innerHTML = product.images.map((imgSrc, index) => `
                <img src="${imgSrc}" alt="Thumbnail ${index + 1}" class="${index === 0 ? 'active' : ''}">
            `).join('');

            // Set initial dropdown values from product defaults
            metalSelect.value = product.defaultSpecs.metal;
            puritySelect.value = product.defaultSpecs.purity;
            stoneSelect.value = product.defaultSpecs.stone;
            
            // Initial price calculation and wishlist button state
            calculateAndDisplayPrice();

        } catch (error) {
            console.error('Error loading product details:', error);
        }
    }

    // --- EVENT LISTENERS ---
    
    // Recalculate price and update button state when any option changes
    [metalSelect, puritySelect, stoneSelect].forEach(el => el.addEventListener('change', calculateAndDisplayPrice));

    // Handle thumbnail clicks
    thumbnailContainerEl.addEventListener('click', e => {
        if (e.target.tagName === 'IMG') {
            mainImageEl.src = e.target.src;
            document.querySelectorAll('.thumbnail-container img').forEach(t => t.classList.remove('active'));
            e.target.classList.add('active');
        }
    });

    // Handle Add to Cart click
    addToCartBtn.addEventListener('click', () => {
        const itemForCart = {
            id: productId,
            quantity: 1,
            customizations: getCurrentCustomizations(),
            finalPrice: parseFloat(priceEl.textContent.replace(/[^0-9.]/g, ''))
        };
        addToCart(itemForCart); // from cart.js
        addToCartBtn.textContent = 'Added!';
        setTimeout(() => { addToCartBtn.textContent = 'Add to Cart'; }, 2000);
    });
    
    // Handle Add to Wishlist click
    wishlistBtn.addEventListener('click', () => {
        const itemForWishlist = {
            id: productId,
            customizations: getCurrentCustomizations(),
            // price is not strictly needed in the wishlist object, but can be useful
            finalPrice: parseFloat(priceEl.textContent.replace(/[^0-9.]/g, ''))
        };
        toggleWishlistItem(itemForWishlist); // our new function from cart.js
        updateWishlistButtonState(); // update the button's look immediately
    });

    // --- INITIAL CALL ---
    loadProductDetails();
});