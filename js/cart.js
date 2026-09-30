// cart.js — Page-specific JavaScript for the Shopping Cart page (cart.html)
// Handles rendering cart items, quantity controls, promo codes, delivery cost, and clear cart

// Wrap in IIFE to keep all variables local and prevent polluting the global scope
(function () {
  // Enable strict mode to catch common programming mistakes
  "use strict";

  const FREE_SHIPPING_THRESHOLD = 30.0;   // Orders at or above £30 qualify for free standard delivery
  const STANDARD_DELIVERY_FEE = 3.99;     // Delivery fee charged when order total is below the free shipping threshold

  let activeDiscountPercent = 0; // Stores the currently applied discount rate (e.g., 0.1 = 10%); 0 means no discount

  // renderCart: Loads and displays all cart items, calculates costs, and updates the order summary
  // Called on page load and every time the cart is modified (quantity change, remove, promo code)
  const renderCart = async () => {
    const products = await ToyHaven.loadProducts(); // Fetch the product catalogue (used to match IDs to product data)
    const items = ToyHaven.getCartDetails(products); // Get the full cart with product data and calculated subtotals
    const list = document.querySelector("#cart-items");           // The ordered list container for cart item cards
    const empty = document.querySelector("#cart-empty");          // The empty cart message shown when cart has no items
    const layout = document.querySelector("#cart-layout-container"); // The main two-column layout (items + summary)
    const banner = document.querySelector("#delivery-banner");    // The free delivery progress bar at the top
    if (!list || !empty) return; // Exit if essential elements don't exist (page safety check)

    if (!items.length) {          // If the cart is empty...
      empty.hidden = false;       // Show the empty cart message
      if (layout) layout.hidden = true;   // Hide the cart layout (items + summary)
      if (banner) banner.hidden = true;   // Hide the delivery progress banner
      return; // Stop here — nothing else to render
    }

    empty.hidden = true;                    // Hide the empty message since we have items
    if (layout) layout.hidden = false;      // Show the main cart layout
    if (banner) banner.hidden = false;      // Show the delivery progress banner

    // Render items list — loop through each cart item and generate its HTML card
    list.innerHTML = items
      .map(
        (item) => `
          <article class="cart-item">
            <div class="cart-item-image-wrap">
              <img src="${ToyHaven.escapeHtml(item.image)}" alt="${ToyHaven.escapeHtml(item.name)}" onerror="this.src='assets/favicon.svg'">
            </div>
            <div class="cart-item-body">
              <div class="cart-item-details">
                <div>
                  <span class="cart-item-category">${ToyHaven.escapeHtml(item.category)}</span>
                  <h3 class="cart-item-name">${ToyHaven.escapeHtml(item.name)}</h3>
                  <span class="cart-unit-price">${ToyHaven.formatCurrency(item.price)} each</span>
                </div>
                <div class="cart-item-price-col">
                  <span class="cart-item-price">${ToyHaven.formatCurrency(item.subtotal)}</span>
                </div>
              </div>
              <div class="cart-item-footer">
                <div class="quantity-controls" aria-label="Quantity controls for ${ToyHaven.escapeHtml(item.name)}">
                  <button class="quantity-button" type="button" data-cart-action="decrease" data-product-id="${item.id}" aria-label="Decrease quantity">−</button>
                  <span class="quantity-value">${item.quantity}</span>
                  <button class="quantity-button" type="button" data-cart-action="increase" data-product-id="${item.id}" aria-label="Increase quantity">+</button>
                </div>
                <button class="remove-button" type="button" data-cart-action="remove" data-product-id="${item.id}">
                  🗑️ Remove
                </button>
              </div>
            </div>
          </article>
        `
      )
      .join(""); // Concatenate all cart item HTML strings into a single string and inject into the list container

    const subtotal = ToyHaven.getCartTotal(products); // Calculate the total price of all items (before discount and delivery)
    const totalCount = ToyHaven.getCartQuantity();    // Get the total number of individual items in the cart

    // Check saved promo — if a promo code was previously applied, restore its discount
    const savedPromo = ToyHaven.readStorage(ToyHaven.STORAGE_KEYS.promo, null); // Read saved promo from localStorage
    if (savedPromo && savedPromo.code === "STUDENT10") {
      activeDiscountPercent = 0.1; // Restore the 10% student discount if STUDENT10 was previously applied
    }

    const discountAmount = activeDiscountPercent > 0 ? subtotal * activeDiscountPercent : 0; // Calculate discount value (0 if no promo code applied)
    const isFreeShipping = subtotal >= FREE_SHIPPING_THRESHOLD; // Check if order qualifies for free delivery
    const deliveryFee = isFreeShipping ? 0 : STANDARD_DELIVERY_FEE; // Set delivery fee to 0 if free shipping, otherwise charge standard fee
    const grandTotal = Math.max(0, subtotal - discountAmount + deliveryFee); // Calculate final order total (discount subtracted, delivery added; never goes below 0)

    // Update summary values — push calculated values into the summary panel elements
    document.querySelector("#cart-items-count").textContent = totalCount; // Show total item count in summary
    document.querySelector("#cart-subtotal").textContent = ToyHaven.formatCurrency(subtotal); // Show subtotal in summary

    const deliveryEl = document.querySelector("#cart-delivery"); // The delivery fee display element in the summary
    if (deliveryEl) {
      deliveryEl.innerHTML = isFreeShipping
        ? '<strong style="color: #10b981;">Free</strong>' // Show "Free" in green if free shipping applies
        : ToyHaven.formatCurrency(deliveryFee);           // Otherwise show the delivery fee amount
    }

    const discountRow = document.querySelector("#discount-row");  // The entire discount row in the summary (hidden when no discount)
    const discountVal = document.querySelector("#cart-discount"); // The discount amount text element
    if (discountRow && discountVal) {
      if (discountAmount > 0) {
        discountRow.hidden = false;                                        // Show the discount row when a discount is active
        discountVal.textContent = `-${ToyHaven.formatCurrency(discountAmount)}`; // Display discount as a negative value (e.g., -£2.50)
      } else {
        discountRow.hidden = true; // Hide the discount row when no promo is applied
      }
    }

    document.querySelector("#cart-total").textContent = ToyHaven.formatCurrency(grandTotal); // Show the final grand total

    // Free delivery progress bar — shows how close the order is to earning free delivery
    if (banner) {
      const bannerText = document.querySelector("#delivery-banner-text"); // The text message inside the delivery banner
      const progressFill = document.querySelector("#delivery-progress-fill"); // The coloured progress bar fill element
      if (bannerText && progressFill) {
        if (isFreeShipping) {
          bannerText.innerHTML = "🎉 <strong>Congratulations!</strong> You have unlocked Free Standard Delivery!"; // Success message when free shipping is earned
          progressFill.style.width = "100%";          // Fill the progress bar completely
          progressFill.style.background = "#10b981";  // Change bar colour to green to indicate success
        } else {
          const remaining = (FREE_SHIPPING_THRESHOLD - subtotal).toFixed(2); // Calculate how much more is needed to reach free shipping
          const percent = Math.min(100, Math.max(0, (subtotal / FREE_SHIPPING_THRESHOLD) * 100)); // Calculate progress percentage (clamped 0–100)
          bannerText.innerHTML = `🚚 Add <strong>£${remaining}</strong> more toys to unlock <strong>FREE Standard Delivery</strong>!`; // Show the remaining amount needed
          progressFill.style.width = `${percent}%`;        // Set the bar width to show how close they are
          progressFill.style.background = "var(--coral)";  // Keep the bar coral/orange until free shipping is earned
        }
      }
    }
  };

  // handlePromo: Initialises the promo code input field and "Apply" button
  // Validates the entered code and applies the matching discount if valid
  const handlePromo = () => {
    const input = document.querySelector("#promo-input"); // The promo code text input field
    const btn = document.querySelector("#apply-promo-btn"); // The "Apply" button next to the promo input
    const msg = document.querySelector("#promo-message"); // The success/error message element below the promo form
    if (!input || !btn) return; // Exit if promo elements don't exist on this page

    // Check if promo already applied — restore the display if the user already entered a valid code
    const savedPromo = ToyHaven.readStorage(ToyHaven.STORAGE_KEYS.promo, null); // Read any saved promo from localStorage
    if (savedPromo && savedPromo.code) {
      input.value = savedPromo.code; // Pre-fill the input with the saved code
      if (msg) {
        msg.textContent = "✓ Promo code STUDENT10 applied (10% discount)"; // Show that the code is already applied
        msg.className = "form-message success"; // Apply success styling to the message
      }
    }

    btn.addEventListener("click", () => {
      const code = input.value.trim().toUpperCase(); // Read and normalise the entered promo code (trim spaces, uppercase)
      if (!code) return; // Exit if the input is empty
      if (code === "STUDENT10") { // Check if the entered code matches the valid promo
        activeDiscountPercent = 0.1; // Apply 10% discount to the session variable
        ToyHaven.writeStorage(ToyHaven.STORAGE_KEYS.promo, { code: "STUDENT10", discount: 0.1 }); // Save the applied promo to localStorage so it persists across page refreshes
        msg.textContent = "🎉 STUDENT10 applied! 10% student discount added."; // Show success message
        msg.className = "form-message success"; // Apply success CSS class
        ToyHaven.showToast("Student discount applied! 🎓"); // Also show a brief toast notification
        renderCart(); // Re-render the cart to reflect the updated discount in the summary
      } else {
        msg.textContent = "Invalid code. Try using STUDENT10 for a demo discount."; // Show error for unrecognised codes
        msg.className = "form-message error"; // Apply error CSS class
      }
    });
  };

  // initCartPage: Main entry point for the cart page — sets up rendering and all event listeners
  const initCartPage = () => {
    if (!document.querySelector("#cart-items")) return; // Only run on pages that have a cart list (i.e., cart.html)
    renderCart();   // Render the current cart contents immediately
    handlePromo();  // Set up the promo code form

    // Global click delegate for cart action buttons (increase, decrease, remove)
    document.addEventListener("click", (event) => {
      const button = event.target.closest("[data-cart-action]"); // Find the closest element with a cart-action data attribute
      if (!button) return; // Exit if the click wasn't on a cart action button
      const cart = ToyHaven.getCart(); // Get the current cart from localStorage
      const item = cart.find((entry) => entry.productId === button.dataset.productId); // Find the matching cart entry by product ID
      if (!item) return; // Exit if no matching cart item found

      if (button.dataset.cartAction === "increase") item.quantity += 1; // Increase item quantity by 1
      if (button.dataset.cartAction === "decrease") {
        item.quantity -= 1; // Decrease item quantity by 1 (saveCart will filter out zero-quantity items)
      }
      if (button.dataset.cartAction === "remove") {
        item.quantity = 0; // Set quantity to 0 so saveCart will filter it out completely
        ToyHaven.showToast("Item removed from your cart."); // Notify the user the item was removed
      }

      ToyHaven.saveCart(cart); // Persist the updated cart to localStorage and refresh the badge count
      renderCart();            // Re-render the cart UI to reflect the change
    });

    const clearBtn = document.querySelector("#clear-cart"); // The "Clear Cart" button
    if (clearBtn) {
      clearBtn.addEventListener("click", () => {
        if (!ToyHaven.getCart().length) return; // Don't do anything if the cart is already empty
        ToyHaven.saveCart([]);                  // Save an empty array to clear the entire cart
        ToyHaven.writeStorage(ToyHaven.STORAGE_KEYS.promo, null); // Also clear any applied promo code
        activeDiscountPercent = 0;              // Reset the in-memory discount percentage
        renderCart();                           // Re-render the (now empty) cart
        ToyHaven.showToast("Cart cleared.");   // Notify the user the cart was cleared
      });
    }
  };

  // Wait for the DOM to be fully parsed before initialising the cart page
  document.addEventListener("DOMContentLoaded", initCartPage);
})(); // End of IIFE