// File: /js/pdp.js
document.addEventListener('DOMContentLoaded', function() {
    // --- 1. SETUP ---
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id');

    if (!productId) {
        window.location.href = 'index.html';
        return;
    }

    // --- 2. DOM ELEMENT SELECTORS ---
    // Product Details
    const productNameEl = document.getElementById('product-name');
    const productIdEl = document.getElementById('product-id');
    const productDescEl = document.getElementById('product-description');
    const mainImageEl = document.getElementById('main-product-image');
    const thumbnailContainerEl = document.querySelector('.thumbnail-container');
    const priceEl = document.getElementById('product-price');
    
    // Action Buttons
    const addToCartBtn = document.querySelector('.add-to-cart-btn');
    const wishlistBtn = document.querySelector('.add-to-wishlist-btn');

    // "Style Your Jewel" Widget Elements
    const customiseBtn = document.getElementById('customise-btn');
    const aiDesignBtn = document.getElementById('ai-design-btn');
    const customisePanel = document.getElementById('customise-panel');
    const aiDesignPanel = document.getElementById('ai-design-panel');
    const metalSelect = document.getElementById('metal-type');
    const puritySelect = document.getElementById('metal-purity');
    const stoneSelect = document.getElementById('stone-type');

    // AI Panel Specific Elements
    const aiPromptInput = document.getElementById('ai-prompt-input');
    const generateAiBtn = document.querySelector('.generate-ai-btn');
    // We will create and inject the result container via JS.

    let basePrice = 0;
    let marketPrices = {};

    // --- 3. CORE LOGIC ---
    
    // Gets current selections from dropdowns
    function getCurrentCustomizations() {
        return {
            metal: metalSelect.value,
            purity: puritySelect.value,
            stone: stoneSelect.value,
        };
    }

    // Calculates and displays price based on selections
    function calculateAndDisplayPrice() {
        if (!basePrice || !Object.keys(marketPrices).length) return;
        const customizations = getCurrentCustomizations();
        const metalMultiplier = marketPrices.metals[customizations.metal] || 1;
        const purityMultiplier = marketPrices.purity[customizations.purity] || 1;
        const stoneMultiplier = marketPrices.stones[customizations.stone] || 1;
        const finalPrice = basePrice * metalMultiplier * purityMultiplier * stoneMultiplier;
        priceEl.textContent = `₹${Math.round(finalPrice).toLocaleString('en-IN')}`;
        updateWishlistButtonState();
    }
    
    // Updates the visual state of the wishlist button
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

    // --- 4. DATA FETCHING & INITIALIZATION ---
    async function loadProductDetails() {
        try {
            const [productsResponse, pricesResponse] = await Promise.all([
                fetch('data/products.json'),
                fetch('data/market-prices.json')
            ]);
            const allProducts = await productsResponse.json();
            marketPrices = await pricesResponse.json();
            
            const product = allProducts.find(p => p.id === productId);
            if (!product) throw new Error('Product not found');
            
            basePrice = product.price;

            // Populate page content
            document.title = `${product.name} - BlueStone Clone`;
            productNameEl.textContent = product.name;
            productIdEl.textContent = `SKU: ${product.id}`;
            productDescEl.textContent = product.description;
            mainImageEl.src = product.images[0];
            thumbnailContainerEl.innerHTML = product.images.map((img, i) => `<img src="${img}" class="${i===0 ? 'active':''}">`).join('');
            metalSelect.value = product.defaultSpecs.metal;
            puritySelect.value = product.defaultSpecs.purity;
            stoneSelect.value = product.defaultSpecs.stone;

            calculateAndDisplayPrice();
        } catch (error) {
            console.error('Error loading product details:', error);
            document.querySelector('.pdp-main').innerHTML = `<h1>Product Not Found</h1><p>${error.message}</p>`;
        }
    }

    // --- 5. EVENT LISTENERS ---

    // Customization dropdowns
    [metalSelect, puritySelect, stoneSelect].forEach(el => el.addEventListener('change', calculateAndDisplayPrice));

    // Thumbnail clicks
    thumbnailContainerEl.addEventListener('click', e => {
        if (e.target.tagName === 'IMG') {
            mainImageEl.src = e.target.src;
            document.querySelectorAll('.thumbnail-container img').forEach(t => t.classList.remove('active'));
            e.target.classList.add('active');
        }
    });

    // Main action buttons
    addToCartBtn.addEventListener('click', () => {
        const itemForCart = { id: productId, quantity: 1, customizations: getCurrentCustomizations(), finalPrice: parseFloat(priceEl.textContent.replace(/[^0-9.]/g, '')) };
        addToCart(itemForCart);
        addToCartBtn.textContent = 'Added!';
        setTimeout(() => { addToCartBtn.textContent = 'Add to Cart'; }, 2000);
    });
    
    wishlistBtn.addEventListener('click', () => {
        const itemForWishlist = { id: productId, customizations: getCurrentCustomizations(), finalPrice: parseFloat(priceEl.textContent.replace(/[^0-9.]/g, '')) };
        toggleWishlistItem(itemForWishlist);
        updateWishlistButtonState();
    });

    // --- "STYLE YOUR JEWEL" TOGGLE LOGIC ---
    customiseBtn.addEventListener('click', () => {
        customiseBtn.classList.add('active');
        aiDesignBtn.classList.remove('active');
        customisePanel.classList.add('active');
        aiDesignPanel.classList.remove('active');
    });

    aiDesignBtn.addEventListener('click', () => {
        aiDesignBtn.classList.add('active');
        customiseBtn.classList.remove('active');
        aiDesignPanel.classList.add('active');
        customisePanel.classList.remove('active');
    });

    // --- SIMULATED AI GENERATION LOGIC ---
    generateAiBtn.addEventListener('click', () => {
        const prompt = aiPromptInput.value.toLowerCase();
        let resultImageUrl = 'images/ai-default.jpg'; // A default fallback image
        
        // Simple keyword matching logic
        if (prompt.includes('platinum') && prompt.includes('ring')) {
            resultImageUrl = 'images/ai-platinum-ring.jpg';
        } else if (prompt.includes('gold') && prompt.includes('necklace')) {
            resultImageUrl = 'images/ai-gold-necklace.jpg';
        } else if (prompt.includes('emerald')) {
            resultImageUrl = 'images/ai-emerald-earrings.jpg';
        }
        
        // Create or get the result container
        let resultContainer = document.getElementById('ai-result-container');
        if (!resultContainer) {
            resultContainer = document.createElement('div');
            resultContainer.id = 'ai-result-container';
            aiDesignPanel.appendChild(resultContainer);
        }

        // Display the result and the "Send for Approval" button
        resultContainer.innerHTML = `
            <h4>Generated Design</h4>
            <img src="${resultImageUrl}" alt="AI Generated Design" class="ai-result-image">
            <button class="btn btn-secondary send-for-approval-btn">Send for Approval</button>
        `;
    });

    // --- "SEND FOR APPROVAL" LOGIC using Event Delegation ---
    aiDesignPanel.addEventListener('click', (event) => {
        if (event.target.classList.contains('send-for-approval-btn')) {
            const promptText = aiPromptInput.value;
            const resultImageSrc = document.querySelector('.ai-result-image').src;
            
            // Create the submission object
            const submission = {
                id: `ai-${Date.now()}`,
                prompt: promptText,
                imageUrl: resultImageSrc,
                status: "Pending" // Initial status
            };
            
            // Save to localStorage
            const submissions = JSON.parse(localStorage.getItem('ai_submissions')) || [];
            submissions.push(submission);
            localStorage.setItem('ai_submissions', JSON.stringify(submissions));
            
            // Give user feedback
            const resultContainer = document.getElementById('ai-result-container');
            resultContainer.innerHTML = `<p class="feedback-success">Your design has been submitted for approval!</p>`;
        }
    });

    // --- 6. INITIAL CALL ---
    loadProductDetails();
});