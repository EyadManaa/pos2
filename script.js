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
    description: 'Ceremonial grade Uji matcha, sparkling water, mint & lime spritz.',
    tag: 'Cold Drinks',
    image: 'images/matcha.jpg',
    spec: '',
    modifiers: []
  }
];

// Current Active Order Cart (Array of Objects) - Starts empty
let cart = [];

// Order Number Counter - Starts from 1 and increments gradually with each order
let currentOrderNumber = 1;


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
 * Format the current date and time for the receipt.
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
 * Calculate grand total.
 * @param {number} subtotal
 * @returns {number}
 */
function calculateTotal(subtotal) {
  return subtotal;
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

  // Handle empty search results
  if (productList.length === 0) {
    productGrid.innerHTML = '<div class="empty-catalog-message">No items found matching your search.</div>';
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
 * Uses loops, conditions, and DOM manipulation.
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
            modifiersHtml +
          '</div>' +
          '<span class="cart-item-price numeric-value">' + formatCurrency(itemTotal) + '</span>' +
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
 * Update the financial summary display (subtotal, total, badges).
 * Uses DOM selection via querySelector and getElementById, and textContent.
 */
function updateSummary() {
  const subtotal = calculateSubtotal(cart);
  const total = calculateTotal(subtotal);
  const totalItems = countTotalItems(cart);

  // DOM Selection using both getElementById and querySelector
  const subtotalLabel = document.getElementById('subtotal-label');
  const subtotalValue = document.getElementById('subtotal-value');
  const totalAmount = document.getElementById('total-amount');
  const chargeAmount = document.getElementById('charge-amount');
  const orderBadge = document.querySelector('#order-badge');

  // DOM manipulation using textContent
  if (subtotalLabel) {
    subtotalLabel.textContent = 'Subtotal (' + totalItems + ' items)';
  }
  if (subtotalValue) {
    subtotalValue.textContent = formatCurrency(subtotal);
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
 * Clear/void all items from the current order after confirmation.
 */
function clearCart() {
  if (cart.length === 0) {
    alert('The current order is already empty.');
    return;
  }

  const confirmed = confirm('Are you sure you want to void / clear this order?');
  if (confirmed) {
    cart = [];
    renderCart();
    updateSummary();
  }
}

/**
 * Display the completed order receipt in the modal dialog.
 * Uses DOM selection, innerHTML, textContent, conditions, and loops.
 * @param {number} orderNumber
 * @param {Array} itemsList
 * @param {number} totalAmount
 */
function showReceipt(orderNumber, itemsList, totalAmount) {
  const modal = document.getElementById('receipt-modal');
  const orderNumElem = document.getElementById('receipt-order-num');
  const datetimeElem = document.getElementById('receipt-datetime');
  const itemsContainer = document.getElementById('receipt-items-list');
  const itemsCountElem = document.getElementById('receipt-items-count');
  const subtotalElem = document.getElementById('receipt-subtotal');
  const totalElem = document.getElementById('receipt-total');

  if (!modal) {
    return;
  }

  // Update receipt order number and current date/time
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
          '<span class="receipt-item-total numeric-value">' + formatCurrency(itemTotal) + '</span>' +
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
    subtotalElem.textContent = formatCurrency(totalAmount);
  }
  if (totalElem) {
    totalElem.textContent = formatCurrency(totalAmount);
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

  // Increment order number sequentially (1, 2, 3...)
  currentOrderNumber = currentOrderNumber + 1;

  // Clear current cart and reset terminal
  cart = [];
  renderCart();
  updateSummary();
}

/**
 * Complete and charge the current order, opening the receipt modal.
 */
function processCheckout() {
  if (cart.length === 0) {
    alert('Cannot charge order: the cart is currently empty.');
    return;
  }

  const total = calculateTotal(calculateSubtotal(cart));

  // Copy current cart items for the receipt using a loop
  const purchasedItems = [];
  for (let i = 0; i < cart.length; i++) {
    purchasedItems.push(cart[i]);
  }

  // Display receipt modal for current order number
  showReceipt(currentOrderNumber, purchasedItems, total);
}

/**
 * Filter the catalog items according to search input text.
 * Uses loops and conditional checks.
 * @param {string} query
 */
function handleSearch(query) {
  const trimmed = query.toLowerCase().trim();

  if (trimmed === '') {
    renderProducts(products);
    return;
  }

  const filtered = [];
  for (let i = 0; i < products.length; i++) {
    const item = products[i];
    const nameMatch = item.name.toLowerCase().indexOf(trimmed) !== -1;
    const skuMatch = item.sku.toLowerCase().indexOf(trimmed) !== -1;
    const descMatch = item.description.toLowerCase().indexOf(trimmed) !== -1;

    if (nameMatch || skuMatch || descMatch) {
      filtered.push(item);
    }
  }

  renderProducts(filtered);
}


// ==========================================================================
// 5. Event Listeners & System Initialization
// ==========================================================================

/**
 * Attach global event listeners to interactive elements.
 */
function setupEventListeners() {
  // Search Input live typing
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

  // Clear / Void Cart Button
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
}

/**
 * Application Entry Point: initialize product catalog, cart, totals, and listeners.
 */
function init() {
  renderProducts(products);
  renderCart();
  updateSummary();
  setupEventListeners();
  console.log('POS Register 01 system initialized successfully.');
}

// Run init when DOM is fully loaded
document.addEventListener('DOMContentLoaded', init);
