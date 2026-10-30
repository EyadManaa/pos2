/**
 * ==========================================================================
 * Tactile Retail POS System - Artisan Roast & Bakery
 * Controller & Interactive Logic (script.js)
 * ==========================================================================
 */

// ==========================================================================
// 1. Constants and State Variables
// ==========================================================================

// Product Catalog Array (Array of Objects)
const products = [
  {
    id: 1,
    sku: '#ESP-01',
    name: 'Artisanal Espresso',
    price: 3.80,
    cartPrice: 3.80,
    category: 'Coffee',
    description: 'Single origin Colombian roast with rich honey crema notes.',
    tag: 'Hot / Standard',
    image: 'images/espresso.jpg',
    spec: '',
    modifiers: []
  },
  {
    id: 2,
    sku: '#LAT-02',
    name: 'Oat Milk Latte',
    price: 5.20,
    cartPrice: 6.70,
    category: 'Coffee',
    description: 'Double espresso pulled over velvety steamed organic oat milk.',
    tag: 'Coffee / 12oz',
    image: 'images/latte.jpg',
    spec: '(12oz)',
    modifiers: [
      { text: '• Oat Milk substitute', price: '+$0.75' },
      { text: '• Extra shot', price: '+$0.75' },
      { text: '• Hot / Steamed 140°F', price: '' }
    ]
  },
  {
    id: 3,
    sku: '#BAK-11',
    name: 'Butter Croissant',
    price: 4.50,
    cartPrice: 4.50,
    category: 'Bakery',
    description: 'Hand-laminated European pastry with caramelized crust layers.',
    tag: 'Bakery / Fresh',
    image: 'images/croissant.jpg',
    spec: '',
    modifiers: [
      { text: '• Warmed lightly', price: '' }
    ]
  },
  {
    id: 4,
    sku: '#BAK-14',
    name: 'Blueberry Scone',
    price: 4.00,
    cartPrice: 4.00,
    category: 'Bakery',
    description: 'Traditional buttermilk pastry loaded with wild Maine blueberries.',
    tag: 'Bakery',
    image: 'images/scone.jpg',
    spec: '',
    modifiers: []
  },
  {
    id: 5,
    sku: '#BRU-03',
    name: 'Avocado Toast',
    price: 9.50,
    cartPrice: 11.00,
    category: 'Food',
    description: 'Smashed Hass avocado, cold pressed olive oil, sea salt on levain.',
    tag: 'Kitchen / Warm',
    image: 'images/avocado-toast.jpg',
    spec: '',
    modifiers: [
      { text: '• Add poached egg', price: '+$1.50' },
      { text: '• No chili flakes (Kitchen note)', price: '' }
    ]
  },
  {
    id: 6,
    sku: '#DRK-08',
    name: 'Matcha Green Cooler',
    price: 6.00,
    cartPrice: 6.00,
    category: 'Drinks',
    description: 'Ceremonial grade Uji matcha, sparkling water, mint & lime spritz.',
    tag: 'Cold Drinks',
    image: 'images/matcha.jpg',
    spec: '',
    modifiers: []
  }
];

// Current Active Order Cart (Array of Objects) - Starts empty
let cart = [];

// Order Number Counter - Starts from 1 and increments sequentially with each order
let currentOrderNumber = 1;

// Current Active Category Filter (Feature 2)
let currentCategoryFilter = 'all';

// Current Search Query (Feature 1)
let currentSearchQuery = '';

// Cash Tendered / Amount Paid (Feature 4)
let currentAmountPaid = 0;

// Sales History Array (Feature 8) - Stores completed transactions during the session
let salesHistory = [];


// ==========================================================================
// 2. Calculation and Helper Functions (Parameters & Return Values)
// ==========================================================================

/**
 * Format a number into currency string with 2 decimal places.
 * @param {number} amount
 * @returns {string}
 */
function formatCurrency(amount) {
  return '$' + amount.toFixed(2);
}

/**
 * Format the current date and time for the receipt (Feature 7).
 * Uses conditions, Date object methods, and string concatenation.
 * @returns {string}
 */
function formatCurrentDateTime() {
  const now = new Date();
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const month = months[now.getMonth()];
  const day = now.getDate();
  const year = now.getFullYear();

  let hours = now.getHours();
  const minutes = now.getMinutes();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  if (hours === 0) {
    hours = 12;
  }
  const formattedMinutes = minutes < 10 ? '0' + minutes : minutes;

  return month + ' ' + day + ', ' + year + ' ' + hours + ':' + formattedMinutes + ' ' + ampm;
}

/**
 * Calculate the total subtotal for all items in the cart.
 * Uses a loop and basic arithmetic multiplication and addition.
 * @param {Array} items
 * @returns {number}
 */
function calculateSubtotal(items) {
  let subtotal = 0;
  for (let i = 0; i < items.length; i++) {
    const itemTotal = items[i].price * items[i].quantity;
    subtotal = subtotal + itemTotal;
  }
  return subtotal;
}

/**
 * Calculate 10% discount when subtotal exceeds $100 (Feature 3).
 * @param {number} subtotal
 * @returns {number}
 */
function calculateDiscount(subtotal) {
  if (subtotal > 100) {
    return subtotal * 0.10;
  }
  return 0;
}

/**
 * Calculate grand total by subtracting discount from subtotal.
 * @param {number} subtotal
 * @param {number} discount
 * @returns {number}
 */
function calculateTotal(subtotal, discount) {
  return subtotal - discount;
}

/**
 * Calculate change due based on amount paid and order total (Feature 4).
 * @param {number} amountPaid
 * @param {number} total
 * @returns {number}
 */
function calculateChange(amountPaid, total) {
  if (amountPaid > total) {
    return amountPaid - total;
  }
  return 0;
}

/**
 * Count total quantity of items currently in the cart.
 * @param {Array} items
 * @returns {number}
 */
function countTotalItems(items) {
  let totalCount = 0;
  for (let i = 0; i < items.length; i++) {
    totalCount = totalCount + items[i].quantity;
  }
  return totalCount;
}

/**
 * Find a product by its ID in the catalog array.
 * @param {number} productId
 * @returns {Object|null}
 */
function findProductById(productId) {
  for (let i = 0; i < products.length; i++) {
    if (products[i].id === productId) {
      return products[i];
    }
  }
  return null;
}

/**
 * Find the index of an item in the cart array.
 * @param {number} productId
 * @returns {number}
 */
function findCartIndex(productId) {
  for (let i = 0; i < cart.length; i++) {
    if (cart[i].id === productId) {
      return i;
    }
  }
  return -1;
}


// ==========================================================================
// 3. DOM Manipulation & Rendering Functions
// ==========================================================================

/**
 * Render the product catalog grid based on an array of products.
 * Uses DOM selection, loops, conditions, and innerHTML.
 * @param {Array} productList
 */
function renderProducts(productList) {
  const productGrid = document.getElementById('product-grid');
  const catalogCount = document.getElementById('catalog-count');

  if (!productGrid) {
    return;
  }

  // Update item count text
  if (catalogCount) {
    catalogCount.textContent = 'Showing ' + productList.length + ' Fast-Service Items';
  }

  // Handle empty catalog or filter results
  if (productList.length === 0) {
    productGrid.innerHTML = '<div class="empty-catalog-message">No products found matching your filter criteria.</div>';
    return;
  }

  let html = '';
  for (let i = 0; i < productList.length; i++) {
    const p = productList[i];
    html = html +
      '<article class="product-card">' +
        '<div class="card-media">' +
          '<img class="card-image" src="' + p.image + '" alt="' + p.name + '">' +
          '<span class="card-badge">' + p.sku + '</span>' +
        '</div>' +
        '<div class="card-details">' +
          '<div class="card-header-row">' +
            '<h3 class="card-product-name">' + p.name + '</h3>' +
            '<span class="card-price numeric-value">' + formatCurrency(p.price) + '</span>' +
          '</div>' +
          '<p class="card-description">' + p.description + '</p>' +
        '</div>' +
        '<div class="card-footer">' +
          '<span class="card-category-tag">' + p.tag + '</span>' +
          '<button class="card-add-button" type="button" data-product-id="' + p.id + '" aria-label="Add ' + p.name + '">' +
            '<span class="material-symbols-outlined" data-icon="add">add</span>' +
          '</button>' +
        '</div>' +
      '</article>';
  }

  productGrid.innerHTML = html;

  // Attach click event listeners to all Add buttons
  const addButtons = productGrid.querySelectorAll('.card-add-button');
  for (let i = 0; i < addButtons.length; i++) {
    const btn = addButtons[i];
    btn.addEventListener('click', function () {
      const idAttr = btn.getAttribute('data-product-id');
      const productId = parseInt(idAttr, 10);
      addToCart(productId);
    });
  }
}

/**
 * Render the itemized receipt list in the cart sidebar.
 * Displays name, unit price, quantity, and total price for each item.
 */
function renderCart() {
  const cartList = document.getElementById('cart-items-list');
  if (!cartList) {
    return;
  }

  // If cart is empty, show empty state
  if (cart.length === 0) {
    cartList.innerHTML =
      '<div class="empty-cart-message">' +
        '<span class="material-symbols-outlined">shopping_cart</span>' +
        '<p>No items in current order</p>' +
      '</div>';
    return;
  }

  let html = '';
  for (let i = 0; i < cart.length; i++) {
    const item = cart[i];
    const itemTotal = item.price * item.quantity;

    // Spec label (e.g. 12oz)
    let specHtml = '';
    if (item.spec && item.spec !== '') {
      specHtml = '<span class="cart-item-spec">' + item.spec + '</span>';
    }

    // Modifiers list
    let modifiersHtml = '';
    if (item.modifiers && item.modifiers.length > 0) {
      modifiersHtml = '<ul class="cart-item-modifiers">';
      for (let j = 0; j < item.modifiers.length; j++) {
        const mod = item.modifiers[j];
        let priceTag = '';
        if (mod.price && mod.price !== '') {
          priceTag = ' <span class="modifier-price numeric-value">' + mod.price + '</span>';
        }
        modifiersHtml = modifiersHtml + '<li>' + mod.text + priceTag + '</li>';
      }
      modifiersHtml = modifiersHtml + '</ul>';
    }

    html = html +
      '<div class="cart-item">' +
        '<div class="cart-item-top">' +
          '<div class="cart-item-info">' +
            '<div class="cart-item-title-row">' +
              '<h4 class="cart-item-name">' + item.name + '</h4>' +
              specHtml +
            '</div>' +
            '<div class="cart-item-meta">' +
              '<span class="cart-item-unit-price">Unit Price: ' + formatCurrency(item.price) + '</span>' +
              '<span class="cart-item-meta-divider">•</span>' +
              '<span class="cart-item-quantity-text">Quantity: ' + item.quantity + '</span>' +
            '</div>' +
            modifiersHtml +
          '</div>' +
          '<div class="cart-item-price-col">' +
            '<span class="cart-item-total-label">Total</span>' +
            '<span class="cart-item-price numeric-value">' + formatCurrency(itemTotal) + '</span>' +
          '</div>' +
        '</div>' +
        '<div class="cart-item-actions">' +
          '<div class="quantity-stepper">' +
            '<button class="stepper-btn btn-decrease" type="button" data-product-id="' + item.id + '" aria-label="Decrease quantity">' +
              '<span class="material-symbols-outlined" data-icon="remove">remove</span>' +
            '</button>' +
            '<span class="stepper-value numeric-value">' + item.quantity + '</span>' +
            '<button class="stepper-btn btn-increase" type="button" data-product-id="' + item.id + '" aria-label="Increase quantity">' +
              '<span class="material-symbols-outlined" data-icon="add">add</span>' +
            '</button>' +
          '</div>' +
          '<button class="btn-remove-item" type="button" data-product-id="' + item.id + '">Remove</button>' +
        '</div>' +
      '</div>';
  }

  cartList.innerHTML = html;

  // Attach event listeners for Decrease buttons
  const decreaseBtns = cartList.querySelectorAll('.btn-decrease');
  for (let i = 0; i < decreaseBtns.length; i++) {
    const btn = decreaseBtns[i];
    btn.addEventListener('click', function () {
      const productId = parseInt(btn.getAttribute('data-product-id'), 10);
      changeQuantity(productId, -1);
    });
  }

  // Attach event listeners for Increase buttons
  const increaseBtns = cartList.querySelectorAll('.btn-increase');
  for (let i = 0; i < increaseBtns.length; i++) {
    const btn = increaseBtns[i];
    btn.addEventListener('click', function () {
      const productId = parseInt(btn.getAttribute('data-product-id'), 10);
      changeQuantity(productId, 1);
    });
  }

  // Attach event listeners for Remove buttons
  const removeBtns = cartList.querySelectorAll('.btn-remove-item');
  for (let i = 0; i < removeBtns.length; i++) {
    const btn = removeBtns[i];
    btn.addEventListener('click', function () {
      const productId = parseInt(btn.getAttribute('data-product-id'), 10);
      removeFromCart(productId);
    });
  }
}

/**
 * Update change calculation and visual cues (Feature 4).
 */
function updateChangeCalculation() {
  const subtotal = calculateSubtotal(cart);
  const discount = calculateDiscount(subtotal);
  const total = calculateTotal(subtotal, discount);

  const amountPaidInput = document.getElementById('amount-paid-input');
  const changeDisplay = document.getElementById('change-display');

  if (!amountPaidInput || !changeDisplay) {
    return;
  }

  const rawValue = amountPaidInput.value.trim();

  if (rawValue === '') {
    changeDisplay.textContent = '$0.00';
    changeDisplay.classList.remove('due-short');
    currentAmountPaid = 0;
    return;
  }

  let paid = parseFloat(rawValue);
  if (isNaN(paid) || paid < 0) {
    paid = 0;
  }

  currentAmountPaid = paid;

  if (paid >= total) {
    const change = calculateChange(paid, total);
    changeDisplay.textContent = formatCurrency(change);
    changeDisplay.classList.remove('due-short');
  } else {
    const shortAmount = total - paid;
    changeDisplay.textContent = 'Due: ' + formatCurrency(shortAmount);
    changeDisplay.classList.add('due-short');
  }
}

/**
 * Update the financial summary display (subtotal, discount, total, badges).
 * Uses DOM selection via querySelector and getElementById, and textContent.
 */
function updateSummary() {
  const subtotal = calculateSubtotal(cart);
  const discount = calculateDiscount(subtotal); // Feature 3: 10% discount when subtotal > $100
  const total = calculateTotal(subtotal, discount);
  const totalItems = countTotalItems(cart);

  const subtotalLabel = document.getElementById('subtotal-label');
  const subtotalValue = document.getElementById('subtotal-value');
  const discountRow = document.getElementById('discount-row');
  const discountValue = document.getElementById('discount-value');
  const totalAmount = document.getElementById('total-amount');
  const chargeAmount = document.getElementById('charge-amount');
  const orderBadge = document.querySelector('#order-badge');

  if (subtotalLabel) {
    subtotalLabel.textContent = 'Subtotal (' + totalItems + ' items)';
  }
  if (subtotalValue) {
    subtotalValue.textContent = formatCurrency(subtotal);
  }

  // Feature 3: Display 10% discount if subtotal > $100
  if (discountRow && discountValue) {
    if (discount > 0) {
      discountRow.classList.remove('hidden');
      discountValue.textContent = '-' + formatCurrency(discount);
    } else {
      discountRow.classList.add('hidden');
    }
  }

  if (totalAmount) {
    totalAmount.textContent = formatCurrency(total);
  }
  if (chargeAmount) {
    chargeAmount.textContent = formatCurrency(total) + ' →';
  }
  if (orderBadge) {
    if (totalItems > 0) {
      orderBadge.textContent = 'Order #' + currentOrderNumber + ' (' + totalItems + ')';
    } else {
      orderBadge.textContent = 'Order #' + currentOrderNumber;
    }
  }

  // Update change calculation
  updateChangeCalculation();
}


// ==========================================================================
// 4. Cart Operation & Business Logic Functions
// ==========================================================================

/**
 * Add an item from the catalog to the cart, or increase quantity if it exists.
 * @param {number} productId
 */
function addToCart(productId) {
  const existingIndex = findCartIndex(productId);

  if (existingIndex !== -1) {
    // Item already in cart: increment quantity
    cart[existingIndex].quantity = cart[existingIndex].quantity + 1;
  } else {
    // New item: find product details and add to cart
    const product = findProductById(productId);
    if (product !== null) {
      const newItem = {
        id: product.id,
        name: product.name,
        spec: product.spec,
        price: product.cartPrice || product.price,
        quantity: 1,
        modifiers: product.modifiers
      };
      cart.push(newItem);
    }
  }

  renderCart();
  updateSummary();
}

/**
 * Change the quantity of an item in the cart by a given delta (+1 or -1).
 * If quantity drops to 0 or below, remove item.
 * @param {number} productId
 * @param {number} delta
 */
function changeQuantity(productId, delta) {
  const itemIndex = findCartIndex(productId);

  if (itemIndex !== -1) {
    cart[itemIndex].quantity = cart[itemIndex].quantity + delta;
    if (cart[itemIndex].quantity <= 0) {
      cart.splice(itemIndex, 1);
    }
  }

  renderCart();
  updateSummary();
}

/**
 * Remove an item completely from the cart.
 * @param {number} productId
 */
function removeFromCart(productId) {
  const itemIndex = findCartIndex(productId);

  if (itemIndex !== -1) {
    cart.splice(itemIndex, 1);
  }

  renderCart();
  updateSummary();
}

/**
 * Clear/cancel all items from current order with a confirmation prompt (Feature 5).
 */
function clearCart() {
  if (cart.length === 0) {
    alert('The current order is already empty.');
    return;
  }

  // Feature 5: Display a confirmation message before canceling an order
  const confirmed = confirm('Are you sure you want to cancel / void this order? All items will be removed.');
  if (confirmed) {
    cart = [];
    currentAmountPaid = 0;
    const amountPaidInput = document.getElementById('amount-paid-input');
    if (amountPaidInput) {
      amountPaidInput.value = '';
    }
    renderCart();
    updateSummary();
  }
}

/**
 * Display the completed order receipt in the modal dialog.
 * Shows order number, date/time, items, subtotal, discount, total, amount paid, and change (Features 3, 4, 7).
 * @param {number} orderNumber
 * @param {Array} itemsList
 * @param {number} subtotal
 * @param {number} discount
 * @param {number} total
 * @param {number} amountPaid
 * @param {number} change
 */
function showReceipt(orderNumber, itemsList, subtotal, discount, total, amountPaid, change) {
  const modal = document.getElementById('receipt-modal');
  const orderNumElem = document.getElementById('receipt-order-num');
  const datetimeElem = document.getElementById('receipt-datetime');
  const itemsContainer = document.getElementById('receipt-items-list');
  const itemsCountElem = document.getElementById('receipt-items-count');
  const subtotalElem = document.getElementById('receipt-subtotal');
  const discountRow = document.getElementById('receipt-discount-row');
  const discountElem = document.getElementById('receipt-discount');
  const totalElem = document.getElementById('receipt-total');
  const paidElem = document.getElementById('receipt-amount-paid');
  const changeElem = document.getElementById('receipt-change');

  if (!modal) {
    return;
  }

  // Feature 7: Display current date and time on receipt
  if (orderNumElem) {
    orderNumElem.textContent = 'Order #' + orderNumber;
  }
  if (datetimeElem) {
    datetimeElem.textContent = formatCurrentDateTime();
  }

  // Build itemized rows using a loop
  let itemsHtml = '';
  for (let i = 0; i < itemsList.length; i++) {
    const item = itemsList[i];
    const itemTotal = item.price * item.quantity;

    let modsHtml = '';
    if (item.modifiers && item.modifiers.length > 0) {
      modsHtml = '<ul class="receipt-item-modifier-list">';
      for (let j = 0; j < item.modifiers.length; j++) {
        modsHtml = modsHtml + '<li>' + item.modifiers[j].text + '</li>';
      }
      modsHtml = modsHtml + '</ul>';
    }

    let specText = '';
    if (item.spec && item.spec !== '') {
      specText = ' ' + item.spec;
    }

    itemsHtml = itemsHtml +
      '<div class="receipt-item-entry">' +
        '<div class="receipt-item-main">' +
          '<div class="receipt-item-title-group">' +
            '<span class="receipt-item-quantity">' + item.quantity + 'x</span>' +
            '<span class="receipt-item-name">' + item.name + specText + '</span>' +
          '</div>' +
          '<div class="receipt-item-pricing">' +
            '<span class="receipt-item-unit-price">(' + formatCurrency(item.price) + ' ea)</span>' +
            '<span class="receipt-item-total numeric-value">' + formatCurrency(itemTotal) + '</span>' +
          '</div>' +
        '</div>' +
        modsHtml +
      '</div>';
  }

  if (itemsContainer) {
    itemsContainer.innerHTML = itemsHtml;
  }

  // Update summary totals
  const totalItems = countTotalItems(itemsList);
  if (itemsCountElem) {
    itemsCountElem.textContent = 'Total Items (' + totalItems + ')';
  }
  if (subtotalElem) {
    subtotalElem.textContent = formatCurrency(subtotal);
  }

  // Feature 3: Display discount on receipt if applicable
  if (discountRow && discountElem) {
    if (discount > 0) {
      discountRow.classList.remove('hidden');
      discountElem.textContent = '-' + formatCurrency(discount);
    } else {
      discountRow.classList.add('hidden');
    }
  }

  if (totalElem) {
    totalElem.textContent = formatCurrency(total);
  }

  // Feature 4: Display amount paid and change on receipt
  if (paidElem) {
    paidElem.textContent = formatCurrency(amountPaid);
  }
  if (changeElem) {
    changeElem.textContent = formatCurrency(change);
  }

  // Display the receipt modal
  modal.classList.remove('hidden');
}

/**
 * Close receipt modal, increment order number sequentially for the next customer, and clear cart.
 */
function closeReceiptModal() {
  const modal = document.getElementById('receipt-modal');
  if (modal) {
    modal.classList.add('hidden');
  }

  // Increment order number sequentially (1 -> 2 -> 3 etc.)
  currentOrderNumber = currentOrderNumber + 1;

  // Clear current cart and reset terminal
  cart = [];
  currentAmountPaid = 0;
  const amountPaidInput = document.getElementById('amount-paid-input');
  if (amountPaidInput) {
    amountPaidInput.value = '';
  }
  const changeDisplay = document.getElementById('change-display');
  if (changeDisplay) {
    changeDisplay.textContent = '$0.00';
    changeDisplay.classList.remove('due-short');
  }

  renderCart();
  updateSummary();
}

/**
 * Complete and charge current order, validating cash payment and recording to sales history (Features 3, 4, 7, 8).
 */
function processCheckout() {
  if (cart.length === 0) {
    alert('Cannot charge order: the cart is currently empty.');
    return;
  }

  const subtotal = calculateSubtotal(cart);
  const discount = calculateDiscount(subtotal);
  const total = calculateTotal(subtotal, discount);

  const amountPaidInput = document.getElementById('amount-paid-input');
  let amountPaid = total; // default to exact payment if cashier left input empty

  if (amountPaidInput && amountPaidInput.value.trim() !== '') {
    const parsed = parseFloat(amountPaidInput.value);
    if (!isNaN(parsed) && parsed > 0) {
      amountPaid = parsed;
    }
  }

  // Feature 4: Validate customer amount paid covers total
  if (amountPaid < total) {
    alert('Insufficient payment: The customer provided ' + formatCurrency(amountPaid) + ' but the total due is ' + formatCurrency(total) + '.');
    return;
  }

  const change = calculateChange(amountPaid, total);

  // Copy current cart items for the receipt using a loop
  const purchasedItems = [];
  for (let i = 0; i < cart.length; i++) {
    purchasedItems.push({
      id: cart[i].id,
      name: cart[i].name,
      price: cart[i].price,
      quantity: cart[i].quantity,
      spec: cart[i].spec,
      modifiers: cart[i].modifiers
    });
  }

  // Feature 8: Record transaction in session sales history
  recordSale(currentOrderNumber, purchasedItems, subtotal, discount, total, amountPaid, change);

  // Display receipt modal for current order number (Features 3, 4, 7)
  showReceipt(currentOrderNumber, purchasedItems, subtotal, discount, total, amountPaid, change);
}


// ==========================================================================
// 5. Search, Filter & Custom Product Functions (Features 1, 2, 6)
// ==========================================================================

/**
 * Filter product catalog by name and category (Features 1 & 2).
 * Uses standard loops, conditions, and string matching.
 */
function filterCatalog() {
  const filtered = [];
  const query = currentSearchQuery.toLowerCase().trim();

  for (let i = 0; i < products.length; i++) {
    const item = products[i];

    // Feature 2: Filter products by category
    let matchesCategory = false;
    if (currentCategoryFilter === 'all') {
      matchesCategory = true;
    } else if (item.category && item.category.toLowerCase() === currentCategoryFilter.toLowerCase()) {
      matchesCategory = true;
    }

    // Feature 1: Search for products by name
    let matchesSearch = false;
    if (query === '') {
      matchesSearch = true;
    } else if (item.name.toLowerCase().indexOf(query) !== -1) {
      matchesSearch = true;
    }

    if (matchesCategory && matchesSearch) {
      filtered.push(item);
    }
  }

  renderProducts(filtered);
}

/**
 * Set active category filter and update pill styling (Feature 2).
 * @param {string} category
 */
function setCategoryFilter(category) {
  currentCategoryFilter = category;

  const pills = document.querySelectorAll('.category-pill');
  for (let i = 0; i < pills.length; i++) {
    const pill = pills[i];
    const cat = pill.getAttribute('data-category');
    if (cat.toLowerCase() === category.toLowerCase()) {
      pill.classList.add('active');
    } else {
      pill.classList.remove('active');
    }
  }

  filterCatalog();
}

/**
 * Handle search query typing (Feature 1).
 * @param {string} query
 */
function handleSearch(query) {
  currentSearchQuery = query;
  filterCatalog();
}

/**
 * Open custom product modal (Feature 6).
 */
function openCustomProductModal() {
  const modal = document.getElementById('custom-product-modal');
  if (modal) {
    modal.classList.remove('hidden');
    const nameInput = document.getElementById('custom-name-input');
    if (nameInput) {
      nameInput.focus();
    }
  }
}

/**
 * Close custom product modal and reset form inputs (Feature 6).
 */
function closeCustomProductModal() {
  const modal = document.getElementById('custom-product-modal');
  if (modal) {
    modal.classList.add('hidden');
  }

  const nameInput = document.getElementById('custom-name-input');
  const priceInput = document.getElementById('custom-price-input');
  if (nameInput) {
    nameInput.value = '';
  }
  if (priceInput) {
    priceInput.value = '';
  }
}

/**
 * Add a custom product with name and price (Feature 6).
 * Validates inputs, creates new item object, adds to catalog and cart, and refreshes views.
 */
function handleAddCustomProduct() {
  const nameInput = document.getElementById('custom-name-input');
  const priceInput = document.getElementById('custom-price-input');
  const categorySelect = document.getElementById('custom-category-select');

  if (!nameInput || !priceInput) {
    return;
  }

  const name = nameInput.value.trim();
  const priceStr = priceInput.value.trim();
  const category = categorySelect ? categorySelect.value : 'Custom';

  if (name === '') {
    alert('Please enter a valid product name.');
    return;
  }

  const price = parseFloat(priceStr);
  if (isNaN(price) || price <= 0) {
    alert('Please enter a valid positive price.');
    return;
  }

  const newId = products.length + 1;
  const skuNum = newId < 10 ? '0' + newId : '' + newId;

  const newProduct = {
    id: newId,
    sku: '#CUST-' + skuNum,
    name: name,
    price: price,
    cartPrice: price,
    category: category,
    description: 'Custom product added by register cashier.',
    tag: category + ' / Custom',
    image: 'images/croissant.jpg',
    spec: '',
    modifiers: []
  };

  products.push(newProduct);

  // Automatically add the custom item to the active cart
  addToCart(newProduct.id);

  // Refresh catalog grid
  filterCatalog();

  // Close modal and reset fields
  closeCustomProductModal();
}


// ==========================================================================
// 6. Sales History Functions (Feature 8)
// ==========================================================================

/**
 * Record a completed transaction into session sales history (Feature 8).
 * @param {number} orderNumber
 * @param {Array} itemsList
 * @param {number} subtotal
 * @param {number} discount
 * @param {number} total
 * @param {number} amountPaid
 * @param {number} change
 */
function recordSale(orderNumber, itemsList, subtotal, discount, total, amountPaid, change) {
  const transaction = {
    orderNumber: orderNumber,
    timestamp: formatCurrentDateTime(),
    items: itemsList,
    subtotal: subtotal,
    discount: discount,
    total: total,
    amountPaid: amountPaid,
    change: change
  };

  salesHistory.push(transaction);
  updateSalesHistoryBadge();
}

/**
 * Update the sales history counter badge in the header.
 */
function updateSalesHistoryBadge() {
  const badge = document.getElementById('history-badge');
  if (badge) {
    badge.textContent = salesHistory.length;
  }
}

/**
 * Render sales history cards and KPI statistics (Feature 8).
 */
function renderSalesHistory() {
  const listContainer = document.getElementById('sales-history-list');
  const metricOrderCount = document.getElementById('metric-order-count');
  const metricTotalRevenue = document.getElementById('metric-total-revenue');
  const metricAvgOrder = document.getElementById('metric-avg-order');

  if (!listContainer) {
    return;
  }

  let totalRevenue = 0;
  for (let i = 0; i < salesHistory.length; i++) {
    totalRevenue = totalRevenue + salesHistory[i].total;
  }

  const avgOrder = salesHistory.length > 0 ? (totalRevenue / salesHistory.length) : 0;

  if (metricOrderCount) {
    metricOrderCount.textContent = salesHistory.length;
  }
  if (metricTotalRevenue) {
    metricTotalRevenue.textContent = formatCurrency(totalRevenue);
  }
  if (metricAvgOrder) {
    metricAvgOrder.textContent = formatCurrency(avgOrder);
  }

  if (salesHistory.length === 0) {
    listContainer.innerHTML =
      '<div class="empty-history-message">' +
        '<span class="material-symbols-outlined">receipt_long</span>' +
        '<p>No transactions recorded yet in this session.</p>' +
      '</div>';
    return;
  }

  let html = '';
  // Show in reverse order (newest completed order first)
  for (let i = salesHistory.length - 1; i >= 0; i--) {
    const sale = salesHistory[i];

    let itemsSummary = '';
    for (let j = 0; j < sale.items.length; j++) {
      if (j > 0) {
        itemsSummary = itemsSummary + ', ';
      }
      itemsSummary = itemsSummary + sale.items[j].quantity + 'x ' + sale.items[j].name;
    }

    let discountHtml = '';
    if (sale.discount > 0) {
      discountHtml = '<span class="history-discount">Discount: -' + formatCurrency(sale.discount) + '</span>';
    }

    html = html +
      '<div class="history-item-card">' +
        '<div class="history-item-header">' +
          '<div class="history-order-id">' +
            '<span class="order-badge">Order #' + sale.orderNumber + '</span>' +
            '<span class="history-timestamp">' + sale.timestamp + '</span>' +
          '</div>' +
          '<span class="history-item-total numeric-value">' + formatCurrency(sale.total) + '</span>' +
        '</div>' +
        '<div class="history-items-breakdown">' + itemsSummary + '</div>' +
        '<div class="history-financial-row">' +
          '<span>Subtotal: ' + formatCurrency(sale.subtotal) + '</span>' +
          discountHtml +
          '<span>Paid: ' + formatCurrency(sale.amountPaid) + '</span>' +
          '<span>Change: ' + formatCurrency(sale.change) + '</span>' +
        '</div>' +
      '</div>';
  }

  listContainer.innerHTML = html;
}

/**
 * Open sales history modal (Feature 8).
 */
function openSalesHistoryModal() {
  const modal = document.getElementById('sales-history-modal');
  if (modal) {
    renderSalesHistory();
    modal.classList.remove('hidden');
  }
}

/**
 * Close sales history modal (Feature 8).
 */
function closeSalesHistoryModal() {
  const modal = document.getElementById('sales-history-modal');
  if (modal) {
    modal.classList.add('hidden');
  }
}


// ==========================================================================
// 7. Event Listeners & System Initialization
// ==========================================================================

/**
 * Attach global event listeners to interactive elements.
 */
function setupEventListeners() {
  // Feature 1: Search Input live typing
  const searchInput = document.getElementById('search-input');
  if (searchInput) {
    searchInput.addEventListener('input', function (e) {
      handleSearch(e.target.value);
    });
  }

  // Keyboard shortcut: Press "/" to focus search input
  window.addEventListener('keydown', function (e) {
    if (e.key === '/' && document.activeElement !== searchInput) {
      e.preventDefault();
      if (searchInput) {
        searchInput.focus();
      }
    }
  });

  // Feature 2: Category Filter Pills
  const categoryPills = document.querySelectorAll('.category-pill');
  for (let i = 0; i < categoryPills.length; i++) {
    const pill = categoryPills[i];
    pill.addEventListener('click', function () {
      const category = pill.getAttribute('data-category');
      setCategoryFilter(category);
    });
  }

  // Feature 4: Amount Paid live input
  const amountPaidInput = document.getElementById('amount-paid-input');
  if (amountPaidInput) {
    amountPaidInput.addEventListener('input', updateChangeCalculation);
  }

  // Feature 4: Quick Cash buttons
  const quickCashBtns = document.querySelectorAll('.quick-cash-btn');
  for (let i = 0; i < quickCashBtns.length; i++) {
    const btn = quickCashBtns[i];
    btn.addEventListener('click', function () {
      const action = btn.getAttribute('data-action');
      const valStr = btn.getAttribute('data-value');

      if (action === 'exact') {
        const subtotal = calculateSubtotal(cart);
        const discount = calculateDiscount(subtotal);
        const total = calculateTotal(subtotal, discount);
        if (amountPaidInput) {
          amountPaidInput.value = total.toFixed(2);
        }
      } else if (valStr) {
        const val = parseFloat(valStr);
        if (amountPaidInput) {
          amountPaidInput.value = val.toFixed(2);
        }
      }
      updateChangeCalculation();
    });
  }

  // Feature 5: Clear / Void Cart Button
  const btnClearCart = document.getElementById('btn-clear-cart');
  if (btnClearCart) {
    btnClearCart.addEventListener('click', clearCart);
  }

  // Primary Checkout Button
  const btnChargeOrder = document.getElementById('btn-charge-order');
  if (btnChargeOrder) {
    btnChargeOrder.addEventListener('click', processCheckout);
  }

  // Next Order / Close Receipt Button
  const btnCloseReceipt = document.getElementById('btn-close-receipt');
  if (btnCloseReceipt) {
    btnCloseReceipt.addEventListener('click', closeReceiptModal);
  }

  // Feature 6: Custom Product Modal Open / Close / Form Submit
  const btnOpenCustom = document.getElementById('btn-open-custom-product');
  if (btnOpenCustom) {
    btnOpenCustom.addEventListener('click', openCustomProductModal);
  }

  const btnCloseCustom = document.getElementById('btn-close-custom-modal');
  if (btnCloseCustom) {
    btnCloseCustom.addEventListener('click', closeCustomProductModal);
  }

  const btnCancelCustom = document.getElementById('btn-cancel-custom');
  if (btnCancelCustom) {
    btnCancelCustom.addEventListener('click', closeCustomProductModal);
  }

  const customForm = document.getElementById('custom-product-form');
  if (customForm) {
    customForm.addEventListener('submit', function (e) {
      e.preventDefault();
      handleAddCustomProduct();
    });
  }

  // Feature 8: Sales History Modal Open / Close
  const btnOpenHistory = document.getElementById('btn-open-history');
  if (btnOpenHistory) {
    btnOpenHistory.addEventListener('click', openSalesHistoryModal);
  }

  const btnCloseHistory = document.getElementById('btn-close-history-modal');
  if (btnCloseHistory) {
    btnCloseHistory.addEventListener('click', closeSalesHistoryModal);
  }

  const btnHistoryDismiss = document.getElementById('btn-history-dismiss');
  if (btnHistoryDismiss) {
    btnHistoryDismiss.addEventListener('click', closeSalesHistoryModal);
  }
}

/**
 * Application Entry Point: initialize product catalog, cart, totals, and listeners.
 */
function init() {
  filterCatalog();
  renderCart();
  updateSummary();
  updateSalesHistoryBadge();
  setupEventListeners();
  console.log('POS Register 01 system initialized successfully.');
}

// Run init when DOM is fully loaded
document.addEventListener('DOMContentLoaded', init);
