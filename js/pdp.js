// File: /js/pdp.js
document.addEventListener('DOMContentLoaded', function() {
    // --- 1. GET PRODUCT ID & CUSTOMIZATIONS FROM URL ---
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id');

    // FIXED: Get customization params from the URL, if they exist.
    const urlMetal = urlParams.get('metal');
    const urlPurity = urlParams.get('purity');
    const urlStone = urlParams.get('stone');

    if (!productId) {
        window.location.href = 'index.html';
        return;
    }

    // --- 2. GET ALL DOM ELEMENTS ---
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

    // --- 3. DYNAMIC PRICING ENGINE ---
    function calculateAndDisplayPrice() {
        if (!basePrice || !marketPrices.metals) return;

        const metalMultiplier = marketPrices.metals[metalSelect.value] || 1;
        const purityMultiplier = marketPrices.purity[puritySelect.value] || 1;
        const stoneMultiplier = marketPrices.stones[stoneSelect.value] || 1;
        const finalPrice = basePrice * metalMultiplier * purityMultiplier * stoneMultiplier;
        
        priceEl.textContent = `₹${Math.round(finalPrice).toLocaleString('en-IN')}`;
    }

    // --- 4. FETCH DATA AND POPULATE PAGE ---
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

            // --- 5. POPULATE STATIC & DYNAMIC CONTENT ---
            document.title = `${product.name} - BlueStone Clone`;
            productNameEl.textContent = product.name;
            productIdEl.textContent = `SKU: ${product.id}`;
            productDescEl.textContent = product.description;

            // Populate gallery
            mainImageEl.src = product.images[0];
            thumbnailContainerEl.innerHTML = '';
            product.images.forEach((imgSrc, index) => {
                const thumb = document.createElement('img');
                thumb.src = imgSrc;
                thumb.alt = `Thumbnail ${index + 1}`;
                if (index === 0) thumb.classList.add('active');
                thumb.addEventListener('click', () => {
                    mainImageEl.src = imgSrc;
                    document.querySelectorAll('.thumbnail-container img').forEach(t => t.classList.remove('active'));
                    thumb.classList.add('active');
                });
                thumbnailContainerEl.appendChild(thumb);
            });

            // FIXED: Set initial dropdown values. Prioritize URL params, then fall back to defaults.
            metalSelect.value = urlMetal || product.defaultSpecs.metal;
            puritySelect.value = urlPurity || product.defaultSpecs.purity;
            stoneSelect.value = urlStone || product.defaultSpecs.stone;

            // Calculate the initial price based on the selected (or default) options
            calculateAndDisplayPrice();
            
            // Update wishlist button state
            updateWishlistButtonState(productId);

        } catch (error) {
            console.error('Error loading product details:', error);
        }
    }

    // --- 6. EVENT LISTENERS ---
    metalSelect.addEventListener('change', calculateAndDisplayPrice);
    puritySelect.addEventListener('change', calculateAndDisplayPrice);
    stoneSelect.addEventListener('change', calculateAndDisplayPrice);

   // ... (keep all the code at the top of the file) ...

   addToCartBtn.addEventListener('click', () => {
    // Create the full object with all the details
    const itemForCart = {
        id: productId,
        quantity: 1, // Always add one at a time from PDP
        customizations: {
            metal: metalSelect.value,
            purity: puritySelect.value,
            stone: stoneSelect.value
        },
        // Get the FINAL calculated price from the display
        finalPrice: parseFloat(priceEl.textContent.replace(/[^0-9.]/g, ''))
    };

    addToCart(itemForCart); // Call the upgraded global function from cart.js
    
    // Give user feedback
    addToCartBtn.textContent = 'Added!';
    setTimeout(() => { addToCartBtn.textContent = 'Add to Cart'; }, 2000);
});

// ... (keep all the code at the bottom of the file) ...

    function updateWishlistButtonState(productId) {
        if (isProductInWishlist(productId)) {
            wishlistBtn.classList.add('active');
            wishlistBtn.innerHTML = '<i class="fa-solid fa-heart"></i> In Wishlist';
        } else {
            wishlistBtn.classList.remove('active');
            wishlistBtn.innerHTML = '<i class="fa-regular fa-heart"></i> Add to Wishlist';
        }
    }

    wishlistBtn.addEventListener('click', () => {
        toggleWishlist(productId);
        updateWishlistButtonState(productId);
    });

    loadProductDetails();
});