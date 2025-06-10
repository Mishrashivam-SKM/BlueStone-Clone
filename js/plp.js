document.addEventListener('DOMContentLoaded', function () {
    // DOM Elements
    const productGrid = document.querySelector('.product-grid');
    const pageTitle = document.querySelector('.plp-header h2');
    const filterCheckboxes = document.querySelectorAll('.plp-filters input[type="checkbox"]');
    const sortBySelect = document.querySelector('#sort-by');

    // State Variable
    let allProducts = []; // This will store the master list of products

    // --- 1. FETCHING LOGIC ---

    async function fetchProducts() {
        try {
            const response = await fetch('data/products.json');
            if (!response.ok) throw new Error('Network response was not ok');
            const products = await response.json();

            allProducts = products; // Store the original list
            applyFiltersAndSort(); // Initial display
        } catch (error) {
            console.error('Fetch error:', error);
            productGrid.innerHTML = '<p>Could not load products.</p>';
        }
    }

    // --- 2. DISPLAY LOGIC ---

    function displayProducts(products) {
        productGrid.innerHTML = ''; // Clear the grid before displaying new results

        if (pageTitle) {
            pageTitle.textContent = `Rings (${products.length} Designs)`;
        }

        if (products.length === 0) {
            productGrid.innerHTML = '<p>No products match your criteria.</p>';
            return;
        }

        products.forEach(product => {
            const productLink = document.createElement('a');
            productLink.href = `product-detail.html?id=${product.id}`;
            productLink.classList.add('product-card');

            // **FIX 1: CORRECTED TYPO** (was 'pproductLink')
            productLink.innerHTML = `
                <div class="wishlist-icon" data-product-id="${product.id}">
                    <i class="fa-regular fa-heart"></i>
                </div>
                <div class="product-image-container">
                    <img src="${product.images[0]}" alt="${product.name}">
                </div>
                <div class="product-card-details">
                    <h3>${product.name}</h3>
                    <p class="price">₹${product.price.toLocaleString('en-IN')}</p>
                </div>
            `;

            // Add the active class if the product is in the wishlist
            const wishlistIcon = productLink.querySelector('.wishlist-icon');
            if (wishlistIcon && typeof isProductInWishlist === 'function' && isProductInWishlist(product.id)) {
                wishlistIcon.classList.add('active');
                wishlistIcon.querySelector('i').classList.replace('fa-regular', 'fa-solid');
            }
            
            // **FIX 2: CRITICAL MISSING LINE**
            // This adds the card you just created to the actual webpage.
            productGrid.appendChild(productLink);
        });
    }

    // --- 3. FILTERING AND SORTING LOGIC ---

    function applyFiltersAndSort() {
        let filteredProducts = [...allProducts]; // Start with a fresh copy of all products

        // Filtering Step
        const activeFilters = {
            price: [],
            metal: []
        };
        filterCheckboxes.forEach(checkbox => {
            if (checkbox.checked) {
                activeFilters[checkbox.name].push(checkbox.value);
            }
        });

        if (activeFilters.price.length > 0) {
            filteredProducts = filteredProducts.filter(product => {
                return activeFilters.price.some(range => {
                    const [min, max] = range.split('-').map(Number);
                    return product.price >= min && product.price <= max;
                });
            });
        }

        if (activeFilters.metal.length > 0) {
            filteredProducts = filteredProducts.filter(product =>
                activeFilters.metal.includes(product.defaultSpecs.metal)
            );
        }

        // Sorting Step
        const sortBy = sortBySelect.value;
        if (sortBy === 'price-asc') {
            filteredProducts.sort((a, b) => a.price - b.price);
        } else if (sortBy === 'price-desc') {
            filteredProducts.sort((a, b) => b.price - a.price);
        }

        // Final Step: Re-render the display
        displayProducts(filteredProducts);
    }

    // --- 4. EVENT LISTENERS ---

    filterCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', applyFiltersAndSort);
    });

    sortBySelect.addEventListener('change', applyFiltersAndSort);

    // Using Event Delegation for wishlist icons for better performance
    productGrid.addEventListener('click', (event) => {
        const wishlistBtn = event.target.closest('.wishlist-icon');
        if (wishlistBtn) {
            event.preventDefault(); // Stop link navigation
            event.stopPropagation(); // Stop event from bubbling up

            const productId = wishlistBtn.dataset.productId;
            if (typeof toggleWishlist === 'function') {
                toggleWishlist(productId);
            }

            // Toggle visual state
            wishlistBtn.classList.toggle('active');
            const icon = wishlistBtn.querySelector('i');
            if (wishlistBtn.classList.contains('active')) {
                icon.classList.replace('fa-regular', 'fa-solid');
            } else {
                icon.classList.replace('fa-solid', 'fa-regular');
            }
        }
    });

    // --- 5. INITIAL CALL ---
    fetchProducts();
});