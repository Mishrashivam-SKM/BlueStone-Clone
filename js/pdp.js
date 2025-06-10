// File: /js/pdp.js
document.addEventListener('DOMContentLoaded', async function() {
    // --- 1. SETUP ---
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id');
    if (!productId) { window.location.href = 'index.html'; return; }

    // --- 2. DOM ELEMENT SELECTORS ---
    const productNameEl = document.getElementById('product-name');
    const productIdEl = document.getElementById('product-id');
    const productDescEl = document.getElementById('product-description');
    const mainImageEl = document.getElementById('main-product-image');
    const thumbnailContainerEl = document.querySelector('.thumbnail-container');
    const priceEl = document.getElementById('product-price');
    const addToCartBtn = document.querySelector('.add-to-cart-btn');
    const wishlistBtn = document.querySelector('.add-to-wishlist-btn');
    const customiseBtn = document.getElementById('customise-btn');
    const aiDesignBtn = document.getElementById('ai-design-btn');
    const customisePanel = document.getElementById('customise-panel');
    const aiDesignPanel = document.getElementById('ai-design-panel');
    const metalSelect = document.getElementById('metal-type');
    const puritySelect = document.getElementById('metal-purity');
    const stoneSelect = document.getElementById('stone-type');
    const aiPromptInput = document.getElementById('ai-prompt-input');
    const generateAiBtn = document.querySelector('.generate-ai-btn');

    // --- 3. STATE VARIABLES ---
    let basePrice = 0;
    let marketPrices = {};
    let aiImageData = []; // To store our AI image "database"

    // --- 4. CORE LOGIC (Customise Mode) ---
    function getCurrentCustomizations() { /* ... (same as before) ... */ }
    function calculateAndDisplayPrice() { /* ... (same as before) ... */ }
    function updateWishlistButtonState() { /* ... (same as before) ... */ }
    
    // --- 5. "AI DESIGN" LOGIC (NEW & IMPROVED) ---
    async function generateAiDesign() {
        const prompt = aiPromptInput.value.toLowerCase();
        if (!prompt) return;

        // Create a simple array of keywords from the user's prompt
        const promptKeywords = prompt.split(/\s+/);

        let bestMatch = { score: -1, image: null };

        // Loop through our database of AI images
        aiImageData.forEach(image => {
            let currentScore = 0;
            // For each image, check how many of its tags appear in the prompt
            image.tags.forEach(tag => {
                if (prompt.includes(tag)) {
                    currentScore++;
                }
            });

            // If this image has a better score, it becomes the new best match
            if (currentScore > bestMatch.score) {
                bestMatch = { score: currentScore, image: image };
            }
        });

        // Determine the final image URL
        let resultImageUrl;
        if (bestMatch.score > 0) {
            resultImageUrl = bestMatch.image.src;
        } else {
            // If no keywords matched, find the default fallback image
            const defaultImage = aiImageData.find(img => img.tags.includes('default'));
            resultImageUrl = defaultImage ? defaultImage.src : 'images/ai-default.jpg';
        }
        
        // Display the result
        let resultContainer = document.getElementById('ai-result-container');
        if (!resultContainer) {
            resultContainer = document.createElement('div');
            resultContainer.id = 'ai-result-container';
            aiDesignPanel.appendChild(resultContainer);
        }
        resultContainer.innerHTML = `
            <h4>Generated Design</h4>
            <img src="${resultImageUrl}" alt="AI Generated Design" class="ai-result-image">
            <button class="btn btn-secondary send-for-approval-btn">Send for Approval</button>
        `;
    }

    // --- 6. DATA FETCHING & INITIALIZATION ---
    async function loadPageData() {
        try {
            // Fetch all necessary data concurrently
            const [prodRes, pricesRes, aiImgRes] = await Promise.all([
                fetch('data/products.json'),
                fetch('data/market-prices.json'),
                fetch('data/ai-images.json') // Fetch the new AI image data
            ]);
            const allProducts = await prodRes.json();
            marketPrices = await pricesRes.json();
            aiImageData = await aiImgRes.json(); // Store AI image data

            const product = allProducts.find(p => p.id === productId);
            if (!product) throw new Error('Product not found');
            
            basePrice = product.price;

            // Populate page content (same as before)
            // ...

            calculateAndDisplayPrice();
        } catch (error) {
            console.error('Error loading page data:', error);
            // ...
        }
    }
    
    // --- 7. EVENT LISTENERS (same as before, with one change) ---
    // ... (keep all your existing listeners) ...
    
    // Change generateAiBtn listener to call the new function
    generateAiBtn.addEventListener('click', generateAiDesign);

    // ... (keep the rest of your listeners for approval, cart, etc.)

    // --- 8. INITIAL CALL ---
    loadPageData();
});