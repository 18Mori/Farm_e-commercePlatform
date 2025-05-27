// --- Global Cart Variables ---
let cartItems = []; // Array to store items in the cart

// --- Helper Functions for Local Storage ---
function saveCart() {
    localStorage.setItem('agriAssistCart', JSON.stringify(cartItems));
    updateCartDisplay(); // Update UI after saving
}

function loadCart() {
    const savedCart = localStorage.getItem('agriAssistCart');
    if (savedCart) {
        cartItems = JSON.parse(savedCart);
    }
    updateCartDisplay(); // Update UI after loading
}

// --- Cart UI Update Function ---
function updateCartDisplay() {
    const $cartCount = $('#cart-count');
    const $cartDropdownCount = $('#cart-dropdown-count');
    const $cartItemsContainer = $('#cart-items-container');
    const $cartTotal = $('#cart-total');
    const $emptyMessage = $('#empty-cart-message');

    // Update count on icon and dropdown header
    const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
    $cartCount.text(totalItems);
    $cartDropdownCount.text(`(${totalItems} items)`);

    // Clear previous items
    $cartItemsContainer.empty();

    if (cartItems.length === 0) {
        $emptyMessage.show(); // Show "Cart is empty" message
        $cartTotal.text('KSh 0');
    } else {
        $emptyMessage.hide(); // Hide "Cart is empty" message
        let totalCartPrice = 0;

        cartItems.forEach(item => {
            const itemPrice = item.price * item.quantity;
            totalCartPrice += itemPrice;

            const cartItemHtml = `
                <div class="cart-item" data-id="${item.id}">
                    <img src="${item.imageUrl}" alt="${item.name}" class="cart-item-img" onerror="this.onerror=null;this.src='https://via.placeholder.com/60x60?text=No+Image';">
                    <div class="cart-item-details">
                        <h5>${item.name}</h5>
                        <p>${item.quantity} x KSh ${item.price.toLocaleString()}</p>
                    </div>
                    <span class="cart-item-price">KSh ${itemPrice.toLocaleString()}</span>
                    <button class="cart-item-remove" data-id="${item.id}" title="Remove item">
                        <i class="fas fa-times-circle"></i>
                    </button>
                </div>
            `;
            $cartItemsContainer.append(cartItemHtml);
        });

        $cartTotal.text(`KSh ${totalCartPrice.toLocaleString()}`);
    }
}

// --- Add to Cart Logic ---
function addToCart(productId, productName, productPrice, imageUrl) {
    const existingItem = cartItems.find(item => item.id === productId);

    if (existingItem) {
        existingItem.quantity++;
    } else {
        cartItems.push({
            id: productId,
            name: productName,
            price: productPrice,
            imageUrl: imageUrl,
            quantity: 1
        });
    }
    saveCart(); // Save updated cart to localStorage
    console.log(`${productName} added to cart.`);
}

// --- Remove from Cart Logic (NEW FUNCTION) ---
function removeFromCart(productId) {
    const itemIndex = cartItems.findIndex(item => item.id === productId);

    if (itemIndex > -1) { // Item found
        if (cartItems[itemIndex].quantity > 1) {
            cartItems[itemIndex].quantity--; // Decrement quantity
        } else {
            cartItems.splice(itemIndex, 1); // Remove item if quantity is 1
        }
        saveCart(); // Save updated cart
        console.log(`Product ID ${productId} removed from cart or quantity reduced.`);
    }
}


// --- Document Ready for Global Elements (Cart Toggle) ---
$(document).ready(function() {
    // Load cart from localStorage when any page loads
    loadCart();

    // Toggle cart dropdown visibility
    $('#cart-toggle').on('click', function(e) {
        e.preventDefault(); // Prevent default link behavior
        $('#cart-dropdown').toggleClass('show');
    });

    // Close cart dropdown if clicked outside
    $(document).on('click', function(e) {
        if (!$(e.target).closest('.cart-icon-container').length) {
            $('#cart-dropdown').removeClass('show');
        }
    });

    // Handle checkout button click (conceptual)
    $('#checkout-button').on('click', function() {
        if (cartItems.length > 0) {
            alert('Proceeding to checkout! (This is a conceptual action)');
            console.log('Checkout initiated with cart:', cartItems);
            // In a real app, you would navigate to a checkout page
            // window.location.href = 'checkout.html';
        } else {
            alert('Your cart is empty. Please add items before checking out.');
        }
        $('#cart-dropdown').removeClass('show'); // Close dropdown after action
    });

    // --- NEW: Event Listener for Remove Buttons in Cart Dropdown ---
    // Use event delegation because cart items are dynamically added
    $('#cart-items-container').on('click', '.cart-item-remove', function() {
        const productIdToRemove = $(this).data('id');
        removeFromCart(productIdToRemove);
    });

    // IMPORTANT: The event listener for adding to cart
    // remains in your buy-products.html's script block
    // as it relies on the 'allProducts' array.
    // Make sure your buy-products.html has the updated
    // add-to-cart logic that calls the global addToCart(id, name, price, img) function.
});

// --- Custom Popup Functions (NEW) ---
function showCustomPopup(message, type = 'info') {
    const $popupOverlay = $('#custom-popup-overlay');
    const $popupMessage = $('#custom-popup-message');
    const $popupIcon = $('#custom-popup-icon');

    $popupMessage.text(message);

    $popupIcon.removeClass('success error info').addClass(type); // Clear existing types and add new one
    // Add specific icon based on type (Font Awesome)
    if (type === 'success') {
        $popupIcon.html('<i class="fas fa-check-circle"></i>');
        $popupIcon.css('color', 'var(--primary-color)'); // Green
    } else if (type === 'error') {
        $popupIcon.html('<i class="fas fa-times-circle"></i>');
        $popupIcon.css('color', 'var(--error-color)'); // Red
    } else {
        $popupIcon.html('<i class="fas fa-info-circle"></i>');
        $popupIcon.css('color', '#007bff'); // Blue
    }

    $popupOverlay.addClass('show'); // Make popup visible
}

function hideCustomPopup() {
    $('#custom-popup-overlay').removeClass('show'); // Hide popup
}


// --- Document Ready for Global Elements ---
$(document).ready(function() {
    // Initialize theme on page load
    applyTheme();

    // Initialize cart on page load
    loadCart();

    // Update header login/signup/logout links on page load
    updateHeaderLoginLinks();

    // Toggle cart dropdown visibility
    $('#cart-toggle').on('click', function(e) {
        e.preventDefault();
        $('#cart-dropdown').toggleClass('show');
    });

    // Close cart dropdown if clicked outside (excluding the popup)
    $(document).on('click', function(e) {
        if (!$(e.target).closest('.cart-icon-container').length &&
            !$(e.target).closest('.theme-toggle-container').length &&
            !$(e.target).closest('#custom-popup').length) { // Exclude popup
            $('#cart-dropdown').removeClass('show');
        }
    });

    // Handle checkout button click (MODIFIED)
    $('#checkout-button').on('click', function() {
        if (cartItems.length === 0) {
            // If cart is empty, show a regular alert (or custom popup)
            showCustomPopup('Your cart is empty. Please add items before checking out.', 'info');
            $('#cart-dropdown').removeClass('show'); // Close dropdown
            return; // Stop here
        }

        if (isLoggedIn()) {
            // User is logged in, show success popup
            showCustomPopup('Your checkout was successful! Your order has been placed.', 'success');
            // In a real app, you would send order data to backend, clear cart etc.
            cartItems = []; // Clear cart after successful checkout (conceptual)
            saveCart(); // Persist empty cart
            $('#cart-dropdown').removeClass('show'); // Close dropdown
        } else {
            // User is NOT logged in, redirect to sign up page
            alert('Please sign up to complete your checkout!'); // Keep alert for immediate feedback before redirect
            window.location.href = 'signup.html'; // Redirect to sign up
        }
    });

    // Event Listener for Remove Buttons in Cart Dropdown
    $('#cart-items-container').on('click', '.cart-item-remove', function() {
        const productIdToRemove = $(this).data('id');
        removeFromCart(productIdToRemove);
    });

    // Event Listener for Theme Toggle Button
    $('#theme-toggle').on('click', toggleTheme);

    // Event Listeners for Custom Popup Close Button and OK button
    $('#custom-popup-overlay, .custom-popup-close, #custom-popup-ok-button').on('click', function(e) {
        // Only hide if clicking on the overlay itself, close button, or OK button
        if (e.target.id === 'custom-popup-overlay' || $(e.target).hasClass('custom-popup-close') || e.target.id === 'custom-popup-ok-button') {
            hideCustomPopup();
        }
    });
});

