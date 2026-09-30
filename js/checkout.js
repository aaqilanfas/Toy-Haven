// checkout.js — Page-specific JavaScript for the Checkout page (checkout.html)
// Handles order summary rendering, delivery speed toggle, form validation, and simulated order placement

// Wrap in IIFE to keep variables private and avoid conflicts with app.js
(function () {
  // Enable strict mode to catch common JavaScript mistakes
  "use strict";

  const FREE_SHIPPING_THRESHOLD = 30.0; // Orders £30 or above qualify for free standard delivery
  const STANDARD_FEE = 3.99;           // Standard delivery fee when below the free shipping threshold
  const EXPRESS_FEE = 5.99;            // Express next-day delivery fee (always charged regardless of order total)

  let selectedDeliverySpeed = "standard"; // Tracks the user's chosen delivery option; starts at "standard"

  // calculateCosts: Computes all pricing values (subtotal, discount, delivery, total) for the current cart
  // Returns an object with all cost breakdowns so they can be displayed in the order summary
  const calculateCosts = (products) => {
    const subtotal = ToyHaven.getCartTotal(products); // Get the raw product total before any deductions
    const savedPromo = ToyHaven.readStorage(ToyHaven.STORAGE_KEYS.promo, null); // Read any saved promo from localStorage
    const discountPercent = savedPromo && savedPromo.code === "STUDENT10" ? 0.1 : 0; // Apply 10% if STUDENT10 promo is active
    const discountAmount = subtotal * discountPercent; // Calculate the monetary discount value

    let deliveryFee = 0; // Start delivery fee at 0
    if (selectedDeliverySpeed === "express") {
      deliveryFee = EXPRESS_FEE; // Express delivery is always charged (£5.99), no free threshold
    } else {
      deliveryFee = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : STANDARD_FEE; // Standard: free if over £30, otherwise £3.99
    }

    const total = Math.max(0, subtotal - discountAmount + deliveryFee); // Final total: never goes below £0

    // Return all cost components as a single object so the UI can display each value separately
    return {
      subtotal,        // Product total before discount and delivery
      discountPercent, // The applied discount rate (0 or 0.1)
      discountAmount,  // The monetary value of the discount
      deliveryFee,     // The delivery cost (0 for free shipping, or the fee amount)
      total            // The final amount the customer would pay
    };
  };

  // renderOrderSummary: Fetches cart items and displays them in the checkout order summary panel
  // Also updates all pricing rows (subtotal, delivery, discount, total)
  const renderOrderSummary = async () => {
    const products = await ToyHaven.loadProducts(); // Load the product catalogue
    const items = ToyHaven.getCartDetails(products); // Get enriched cart items (with product data and subtotals)
    const list = document.querySelector("#order-list");          // The container for order item rows
    const totalEl = document.querySelector("#checkout-total");   // The grand total display element
    const empty = document.querySelector("#checkout-empty");     // The "cart is empty" message panel
    const formCard = document.querySelector("#checkout-form-card"); // The checkout form card (hidden when cart is empty)
    const orderCard = document.querySelector("#order-card");     // The order summary card (hidden when cart is empty)
    if (!list || !totalEl || !empty || !formCard) return; // Exit if essential elements are missing

    if (!items.length) { // If the cart is empty...
      formCard.hidden = true;           // Hide the checkout form
      if (orderCard) orderCard.hidden = true; // Hide the order summary card
      empty.hidden = false;             // Show the empty cart message
      return; // Stop — nothing to render
    }

    empty.hidden = true;               // Hide the empty message (we have items)
    formCard.hidden = false;           // Show the checkout form
    if (orderCard) orderCard.hidden = false; // Show the order summary card

    // Render order items list — each item shows thumbnail, name, quantity, unit price, and subtotal
    list.innerHTML = items
      .map(
        (item) => `
          <div class="order-list-item">
            <div class="order-item-thumb">
              <img src="${ToyHaven.escapeHtml(item.image)}" alt="${ToyHaven.escapeHtml(item.name)}" onerror="this.src='assets/favicon.svg'">
            </div>
            <div class="order-item-desc">
              <strong>${ToyHaven.escapeHtml(item.name)}</strong>
              <span class="order-item-subtext">Qty: ${item.quantity} · ${ToyHaven.formatCurrency(item.price)}</span>
            </div>
            <strong class="order-item-price">${ToyHaven.formatCurrency(item.subtotal)}</strong>
          </div>
        `
      )
      .join(""); // Join all item HTML strings together

    const costs = calculateCosts(products); // Calculate all costs using current delivery speed and promo

    // Update standard radio label — show "FREE" if order qualifies, otherwise show the fee
    const standardRadioText = document.querySelector("#radio-standard-price");
    if (standardRadioText) {
      standardRadioText.textContent = costs.subtotal >= FREE_SHIPPING_THRESHOLD ? "FREE" : "£3.99"; // Dynamically update the standard delivery label
    }

    document.querySelector("#order-subtotal").textContent = ToyHaven.formatCurrency(costs.subtotal); // Show product subtotal
    document.querySelector("#order-delivery").textContent =
      costs.deliveryFee === 0 ? "Free" : ToyHaven.formatCurrency(costs.deliveryFee); // Show delivery cost or "Free"

    const discountRow = document.querySelector("#order-discount-row"); // The entire discount row (hidden when no discount)
    const discountEl = document.querySelector("#order-discount");      // The discount amount text element
    if (discountRow && discountEl) {
      if (costs.discountAmount > 0) {
        discountRow.hidden = false;                                              // Show the discount row
        discountEl.textContent = `-${ToyHaven.formatCurrency(costs.discountAmount)}`; // Display discount as negative value
      } else {
        discountRow.hidden = true; // Hide the discount row if no promo is active
      }
    }

    totalEl.textContent = ToyHaven.formatCurrency(costs.total); // Update the grand total display
  };

  // setMessage: Displays a validation or status message below the checkout form
  // Used to show both error messages (red) and success confirmation (green)
  const setMessage = (message, type) => {
    const target = document.querySelector("#checkout-message"); // The message display element below the form
    if (target) {
      target.textContent = message;            // Set the message text
      target.className = `form-message ${type}`; // Apply "error" or "success" CSS class for styling
    }
  };

  // initCheckout: Main entry point for the checkout page
  // Sets up the order summary, payment/delivery toggles, and form submission handling
  const initCheckout = async () => {
    const form = document.querySelector("#checkout-form"); // The main checkout form element
    if (!form) return; // Exit if the form doesn't exist on this page

    renderOrderSummary(); // Render the initial order summary on page load

    // Toggle card fields based on payment method — show/hide card fields based on radio selection
    form.querySelectorAll("input[name='payment']").forEach((radio) => {
      radio.addEventListener("change", (e) => {
        const cardBox = document.querySelector("#card-fields"); // The card number/expiry fields container
        if (cardBox) {
          cardBox.hidden = e.target.value !== "Card"; // Show card fields only if "Card" payment method is selected
        }
      });
    });

    // Toggle delivery speed — update selected speed and re-render the summary with recalculated costs
    form.querySelectorAll("input[name='deliverySpeed']").forEach((radio) => {
      radio.addEventListener("change", (e) => {
        selectedDeliverySpeed = e.target.value; // Update the delivery speed tracker variable
        renderOrderSummary(); // Recalculate and re-render costs with the new delivery speed
      });
    });

    // Form submit handler — validates all fields and simulates placing the order
    form.addEventListener("submit", async (event) => {
      event.preventDefault(); // Prevent the browser from actually submitting the form (this is a simulation)
      const name = form.elements.fullName.value.trim();           // Get trimmed full name from input
      const email = form.elements.email.value.trim();             // Get trimmed email address from input
      const postcode = form.elements.postcode ? form.elements.postcode.value.trim() : ""; // Get postcode (with fallback if field missing)
      const address = form.elements.address.value.trim();         // Get trimmed delivery address
      const payment = form.elements.payment.value;               // Get selected payment method value

      // Form validation — check each required field and show an inline error if invalid
      if (name.length < 2) return setMessage("Please enter your full name.", "error");           // Name must be at least 2 characters
      if (!email || !email.includes("@")) return setMessage("Please enter a valid email address.", "error"); // Basic email format check
      if (postcode.length < 3) return setMessage("Please enter a valid postal code.", "error");  // Postcode must be at least 3 characters
      if (address.length < 5) return setMessage("Please enter a complete delivery address.", "error"); // Address must be at least 5 characters

      const products = await ToyHaven.loadProducts(); // Load products to calculate the final order cost
      const items = ToyHaven.getCartDetails(products); // Get the current cart items
      if (!items.length) return setMessage("Your cart is empty.", "error"); // Cannot checkout with an empty cart

      const costs = calculateCosts(products); // Calculate all costs (subtotal, discount, delivery, total)

      // Estimate delivery date — express = 1 day, standard = 3 days from today
      const daysToAdd = selectedDeliverySpeed === "express" ? 1 : 3; // 1 day for express, 3 days for standard
      const deliveryDate = new Date();                                // Start from today's date
      deliveryDate.setDate(deliveryDate.getDate() + daysToAdd);      // Add the delivery days
      const deliveryDateStr = deliveryDate.toLocaleDateString("en-GB", { // Format the date as a UK locale string
        weekday: "short",  // Short weekday name (e.g., "Mon")
        day: "numeric",    // Day of month as number
        month: "short"     // Short month name (e.g., "Oct")
      });

      const orderNumber = `TH-${Math.floor(100000 + Math.random() * 900000)}`; // Generate a 6-digit random order number with "TH-" prefix

      // Build the order object with all relevant data for saving and display
      const order = {
        orderNumber,           // Unique order reference number
        name,                  // Customer's full name
        email,                 // Customer's email address
        postcode,              // Delivery postcode
        address,               // Full delivery address
        payment,               // Payment method chosen (e.g., "Card", "PayPal")
        deliverySpeed: selectedDeliverySpeed, // Chosen delivery speed ("standard" or "express")
        deliveryDateStr,       // Estimated delivery date as a formatted string
        costs,                 // All cost breakdown values
        items,                 // Array of cart items ordered
        placedAt: new Date().toISOString() // ISO timestamp of when the order was placed
      };

      // Save order to history — append this order to the orders array in localStorage
      const orders = ToyHaven.readStorage(ToyHaven.STORAGE_KEYS.orders, []); // Load existing order history
      orders.push(order);                                                     // Add the new order
      ToyHaven.writeStorage(ToyHaven.STORAGE_KEYS.orders, orders);           // Save updated order history

      // Clear cart & promo — empty the cart and remove any applied promo code after placing the order
      ToyHaven.saveCart([]);                                                 // Clear the shopping cart
      ToyHaven.writeStorage(ToyHaven.STORAGE_KEYS.promo, null);             // Remove the saved promo code

      // Render success screen — hide the form and show the order confirmation panel
      form.hidden = true; // Hide the checkout form
      const orderCard = document.querySelector("#order-card");
      if (orderCard) orderCard.hidden = true; // Hide the order summary card

      const successPanel = document.querySelector("#checkout-success"); // The success confirmation panel
      if (successPanel) {
        successPanel.hidden = false; // Make the success panel visible
        document.querySelector("#success-order-number").textContent = orderNumber; // Show the order number
        document.querySelector("#success-delivery-date").textContent = `${deliveryDateStr} (${selectedDeliverySpeed === "express" ? "Express" : "Standard"})`; // Show estimated delivery date and speed
        document.querySelector("#success-customer-name").textContent = name;   // Show customer name in confirmation
        document.querySelector("#success-customer-address").textContent = `${address}, ${postcode}`; // Show full delivery address
        document.querySelector("#success-payment-method").textContent = payment; // Show chosen payment method
        document.querySelector("#success-total").textContent = ToyHaven.formatCurrency(costs.total); // Show the total paid
      }

      ToyHaven.showToast("Order placed successfully! 🎉"); // Show a toast notification confirming the order
    });
  };

  // Wait for the DOM to be fully parsed before initialising the checkout page
  document.addEventListener("DOMContentLoaded", initCheckout);
})(); // End of IIFE