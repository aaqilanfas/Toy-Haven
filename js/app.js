/* Toy Haven shared utilities. This file is loaded on every page. */

// Wrap everything in an IIFE (Immediately Invoked Function Expression) to avoid polluting the global scope
(function () {
  // Enable strict mode to catch common JavaScript mistakes and prevent unsafe actions
  "use strict";

  // STORAGE_KEYS: Central object holding all localStorage key names used across the entire website
  // Using one place for keys prevents typos and makes renaming easy in the future
  const STORAGE_KEYS = {
    cart: "toyHavenCart",             // Key for storing the shopping cart array
    wishlist: "toyHavenWishlist",     // Key for storing the user's saved collection/wishlist
    newsletter: "toyHavenNewsletter", // Key for storing newsletter subscription email
    feedback: "toyHavenFeedback",     // Key for storing user feedback and support messages
    orders: "toyHavenOrders",         // Key for storing order history after checkout
    promo: "toyHavenPromo"            // Key for storing the currently applied promo code
  };

  // Complete offline-ready fallback catalogue so the site works immediately
  // even when opened via file:/// without a local web server!
  const FALLBACK_PRODUCTS = [
    {
      id: "fig-001",
      name: "Iron Man Figure",
      category: "Figurines",
      price: 24.99,
      rating: 4.9,
      badge: "New",
      description: " Bring the power of Iron Man to life with this detailed superhero figure, perfect for play or display..",
      features: ["Poseable joints", "Rover accessory", "Collector display base"],
      image: "assets/images/figures/ironmanfigure.jpg"
    },
    {
      id: "fig-002",
      name: "Deadpool Figure",
      category: "Figurines",
      price: 19.5,
      rating: 4.7,
      badge: "Popular",
      description: "Add some action and attitude to your collection with this fun and detailed Deadpool figure.",
      features: ["Hand-painted finish", "Fantasy scale", "Gift-ready box"],
      image: "assets/images/figures/Deadpool.jpg"
    },
    {
      id: "fig-003",
      name: "Spiderman Figure",
      category: "Figurines",
      price: 16.0,
      rating: 4.6,
      badge: "Classic",
      description: "Swing into adventure with this classic Spider-Man figure, perfect for young heroes and collectors.",
      features: ["Swivel head", "Enamel details", "Desk-friendly size"],
      image: "assets/images/figures/Spiderman.webp"
    },
    {
      id: "fig-004",
      name: "Batman Figure",
      category: "Figurines",
      price: 21.99,
      rating: 4.8,
      badge: "Special",
      description: " Step into Gotham with this iconic Batman figure, ready for exciting adventures and heroic missions..",
      features: ["Glow-in-the-dark visor", "Detachable katana blades", "Articulated stance"],
      image: "assets/images/figures/batman action figure.jpg"
    },
    {
      id: "toy-001",
      name: "Build It Blocks",
      category: "Toys",
      price: 31.99,
      rating: 4.8,
      badge: "Bestseller",
      description: " Build, create, and explore endless possibilities with these colorful building blocks.",
      features: ["120 solid wood pieces", "Reusable storage tub", "Non-toxic organic paint"],
      image: "assets/images/Toys/building blocks.jpg"
    },
    {
      id: "toy-002",
      name: "Grow Toys",
      category: "Toys",
      price: 22.75,
      rating: 4.5,
      badge: "Explore",
      description: " Watch the fun grow with this playful toy that brings curiosity and excitement to little explorers.",
      features: ["Three authentic fossil replicas", "Hammer and chisel set", "Full-colour fact booklet"],
      image: "assets/images/Toys/Grow toys.webp"
    },
    {
      id: "toy-003",
      name: "Helicopter",
      category: "Toys",
      price: 18.25,
      rating: 4.4,
      badge: "Creative",
      description: "Take playtime to new heights with this exciting helicopter toy, made for imaginative adventures.",
      features: ["Optical glass prism", "12 colourful craft pigments", "Sunlight reflection guide"],
      image: "assets/images/Toys/Helicopter.jpg"
    },
    {
      id: "toy-004",
      name: "Train",
      category: "Toys",
      price: 28.5,
      rating: 4.9,
      badge: "STEM Pick",
      description: " All aboard! Enjoy exciting journeys and creative adventures with this fun train toy.",
      features: ["Functional mini solar panel", "6-wheel rocker-bogie suspension", "No batteries required"],
      image: "assets/images/Toys/Train.jpg"
    },
    {
      id: "game-001",
      name: "Chess",
      category: "Board Games",
      price: 34.99,
      rating: 4.9,
      badge: "Staff Pick",
      description: "  Challenge your mind and sharpen your strategy with this classic game of chess.",
      features: ["Co-operative strategy", "2–5 players", "45 minute sessions"],
      image: "assets/images/Boardgames/Chess.webp"
    },
    {
      id: "game-002",
      name: "Monopoly",
      category: "Board Games",
      price: 27.5,
      rating: 4.6,
      badge: "Family",
      description: "Buy, trade, and build your way to victory in this classic family board game.",
      features: ["Easy to learn rules", "2–4 players", "Wooden meeple tokens included"],
      image: "assets/images/Boardgames/Monopoly.webp"
    },
    {
      id: "game-003",
      name: "Tic Tac Toe",
      category: "Board Games",
      price: 39.0,
      rating: 4.8,
      badge: "Detective",
      description: " Keep it simple and fun with this classic two-player game of strategy and quick thinking.",
      features: ["Story-driven mystery", "Magnifying glass & clue files", "Replayable case folders"],
      image: "assets/images/Boardgames/Tic Tac Toe.webp"
    },
    {
      id: "game-004",
      name: "Snake and Ladders",
      category: "Board Games",
      price: 36.0,
      rating: 4.7,
      badge: "Adventure",
      description: " Roll the dice, climb the ladders, and watch out for the snakes in this timeless family game.",
      features: ["Modular 3D fortress board", "Ruby dragon miniature", "Ages 10+ / 60 mins"],
      image: "assets/images/Boardgames/snake and ladders.webp"
    },
    {
      id: "car-001",
      name: "Mustang",
      category: "Diecast Cars",
      price: 29.99,
      rating: 4.9,
      badge: "Collector",
      description: " Add classic American muscle to your collection with this stylish Mustang diecast model.",
      features: ["1:24 precision scale", "Opening hood and doors", "Heavyweight diecast metal body"],
      image: "assets/images/diecast cars/mustang.webp"
    },
    {
      id: "car-002",
      name: "Ferarri",
      category: "Diecast Cars",
      price: 21.0,
      rating: 4.5,
      badge: "Speed",
      description: "Experience the elegance and excitement of Ferrari with this detailed diecast model.",
      features: ["1:32 scale", "High-speed pull-back mechanism", "Gloss metallic finish"],
      image: "assets/images/diecast cars/Ferarri.webp"
    },
    {
      id: "car-003",
      name: "Porsche",
      category: "Diecast Cars",
      price: 26.5,
      rating: 4.7,
      badge: "Offroad",
      description: " Bring iconic German performance and style to your collection with this sleek Porsche diecast model.",
      features: ["All-terrain deep rubber tyres", "Functional spring suspension", "Dakar rally decals"],
      image: "assets/images/diecast cars/Porsche.jpg"
    },
    {
      id: "car-004",
      name: "Hellcat",
      category: "Diecast Cars",
      price: 24.5,
      rating: 4.8,
      badge: "Retro",
      description: " Bring iconic German performance and style to your collection with this sleek Porsche diecast model.",
      features: ["1:28 scale", "Real wooden bed rails", "Classic whitewall tyres"],
      image: "assets/images/diecast cars/Hellcat.jpg"
    }
  ];

  // readStorage: Safely reads and parses a JSON value from localStorage
  // Returns the fallback value if the key doesn't exist or JSON parsing fails (e.g., corrupted data)
  const readStorage = (key, fallback) => {
    try {
      const value = localStorage.getItem(key); // Get raw string stored in localStorage
      return value ? JSON.parse(value) : fallback; // Parse back to JS object, or return fallback if null
    } catch (error) {
      return fallback; // Return fallback safely if JSON.parse throws an error
    }
  };

  // writeStorage: Converts a JavaScript value to JSON string and saves it in localStorage
  // Logs a warning instead of crashing if storage is unavailable (e.g., private/incognito mode)
  const writeStorage = (key, value) => {
    try {
      localStorage.setItem(key, JSON.stringify(value)); // Convert object/array to string and store it
    } catch (error) {
      console.warn("Storage write failed", error); // Gracefully handle storage quota errors
    }
  };

  // formatCurrency: Formats a number as British Pounds (GBP) currency string
  // Uses the browser's built-in Intl.NumberFormat for locale-aware formatting
  // Example: formatCurrency(24.99) returns "£24.99"
  const formatCurrency = (amount) =>
    new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP" }).format(amount);

  // escapeHtml: Sanitises a string by replacing special HTML characters with safe HTML entities
  // This prevents Cross-Site Scripting (XSS) attacks when inserting user data into the DOM
  const escapeHtml = (value) =>
    String(value ?? "")           // Convert to string; treat null/undefined as empty string
      .replaceAll("&", "&amp;")   // Escape ampersand first to avoid double-escaping
      .replaceAll("<", "&lt;")    // Escape opening angle bracket (prevents HTML injection)
      .replaceAll(">", "&gt;")    // Escape closing angle bracket
      .replaceAll('"', "&quot;")  // Escape double quotes (for HTML attribute values)
      .replaceAll("'", "&#039;"); // Escape single quotes (for HTML attribute values)

  // productsCache: Module-level variable to cache the loaded products array
  // Prevents repeated fetches/parsing on every page interaction; null means not yet loaded
  let productsCache = null;

  // loadProducts: Async function that fetches the product catalogue from the JSON file
  // Falls back to the hardcoded FALLBACK_PRODUCTS if the fetch fails (e.g., file:// protocol)
  // Uses in-memory cache (productsCache) so products are only loaded once per page session
  const loadProducts = async () => {
    if (productsCache && productsCache.length) return productsCache; // Return cached data if already loaded
    try {
      const response = await fetch("data/products.json"); // Try to fetch the JSON product file
      if (!response.ok) throw new Error("Catalogue unavailable"); // Throw if HTTP response is not 200 OK
      const data = await response.json(); // Parse the JSON response body into a JS array
      if (Array.isArray(data) && data.length) { // Validate that we got a non-empty array
        productsCache = data;    // Store fetched data in the cache variable
        return productsCache;    // Return the fetched product list
      }
    } catch (error) {
      // In case fetch is blocked (file:// protocol) or network issue, fallback is used
    }
    productsCache = FALLBACK_PRODUCTS; // Use the hardcoded fallback product list if fetch failed
    return productsCache;              // Return the fallback list
  };

  // getCart: Retrieves the shopping cart array from localStorage
  // Returns an empty array [] if no cart data exists yet (fresh start)
  const getCart = () => readStorage(STORAGE_KEYS.cart, []);

  // saveCart: Saves the cart to localStorage, filtering out items with zero quantity
  // Also calls updateCartCount() to refresh the cart badge number in the navigation
  const saveCart = (cart) => {
    writeStorage(STORAGE_KEYS.cart, cart.filter((item) => item.quantity > 0)); // Remove zero-quantity items before saving
    updateCartCount(); // Refresh the cart icon badge number shown in the nav bar
  };

  // getWishlist: Retrieves the user's wishlist/collection array from localStorage
  // Returns an empty array [] if the user hasn't saved anything yet
  const getWishlist = () => readStorage(STORAGE_KEYS.wishlist, []);

  // isInWishlist: Checks whether a specific product (by ID) is already in the wishlist
  // Returns true if found, false otherwise — used to toggle heart button state on cards
  const isInWishlist = (productId) =>
    getWishlist().some((item) => item.productId === productId); // .some() returns true on first match

  // addToCart: Adds a product to the cart or increases its quantity if already present
  // Shows a toast notification with the product name after adding
  const addToCart = (productId, quantity = 1) => {
    const qty = parseInt(quantity, 10) || 1; // Ensure quantity is a valid positive integer, default to 1
    const cart = getCart(); // Get the current cart from localStorage
    const existing = cart.find((item) => item.productId === productId); // Check if product is already in cart
    if (existing) {
      existing.quantity += qty; // If already in cart, just increase the quantity
    } else {
      cart.push({ productId, quantity: qty }); // If not in cart, add a new cart entry
    }
    saveCart(cart); // Save updated cart back to localStorage

    // Look up product name for rich toast notification
    const products = productsCache || FALLBACK_PRODUCTS; // Use cached products or fallback
    const product = products.find((p) => p.id === productId); // Find product object by ID
    const title = product ? product.name : "Product"; // Use product name or generic "Product" as fallback
    showToast(`Added ${qty > 1 ? qty + " × " : ""}"${title}" to your cart! 🛍️`); // Show success toast
  };

  // setWishlistStatus: Adds a product to the wishlist or updates its status label
  // Status options: "Interested", "Owned", "Saved for Later"
  // Shows a toast notification confirming the action
  const setWishlistStatus = (productId, status = "Interested") => {
    const wishlist = getWishlist(); // Get the current wishlist from localStorage
    const existing = wishlist.find((item) => item.productId === productId); // Check if already in wishlist
    if (existing) {
      existing.status = status; // Update existing wishlist entry's status label
    } else {
      wishlist.push({ productId, status }); // Add a new wishlist entry with this status
    }
    writeStorage(STORAGE_KEYS.wishlist, wishlist); // Persist updated wishlist to localStorage
    const products = productsCache || FALLBACK_PRODUCTS; // Use cached or fallback product list
    const product = products.find((p) => p.id === productId); // Find the matching product by ID
    const name = product ? `"${product.name}"` : "Item"; // Get product name for the toast message
    showToast(status === "Not Interested" ? `${name} marked in collection.` : `${name} saved to your collection! ❤️`);
  };

  // removeFromWishlist: Removes a product completely from the wishlist by its ID
  // Filters out the matching entry and saves the updated wishlist back to localStorage
  const removeFromWishlist = (productId) => {
    writeStorage(
      STORAGE_KEYS.wishlist,
      getWishlist().filter((item) => item.productId !== productId) // Keep all entries except the removed one
    );
  };

  // getCartDetails: Combines the raw cart entries (IDs + quantities) with full product data
  // Returns enriched cart item objects that include product info, quantity, and calculated subtotal
  const getCartDetails = (products) =>
    getCart()
      .map((item) => {
        const product = products.find((candidate) => candidate.id === item.productId); // Find matching product
        return product
          ? { ...product, quantity: item.quantity, subtotal: item.quantity * product.price } // Spread product data and add quantity + subtotal
          : null; // Return null if product ID no longer exists (stale cart data)
      })
      .filter(Boolean); // Remove any null entries (products not found in catalogue)

  // getCartTotal: Calculates the total price of all items in the cart
  // Reduces the enriched cart details array into a single sum of all subtotals
  const getCartTotal = (products) =>
    getCartDetails(products).reduce((total, item) => total + item.subtotal, 0); // Sum all item subtotals

  // getCartQuantity: Returns the total number of individual items in the cart
  // Counts all quantities combined (e.g., 2 robots + 3 cars = 5 items)
  const getCartQuantity = () =>
    getCart().reduce((total, item) => total + Number(item.quantity || 0), 0); // Sum all quantities

  // updateCartCount: Updates the cart count badge number shown in the navigation bar
  // Triggers a CSS "bump" animation to visually highlight the count change
  const updateCartCount = () => {
    const qty = getCartQuantity(); // Get total cart quantity to display in the badge
    document.querySelectorAll(".cart-count").forEach((counter) => {
      counter.textContent = qty;          // Update the badge text to show current quantity
      counter.classList.remove("bump");   // Remove the animation class so it can be re-triggered
      void counter.offsetWidth;           // trigger reflow for css bounce animation (forces browser to reset animation)
      counter.classList.add("bump");      // Re-add animation class to play the bump effect
    });
  };

  // showToast: Displays a temporary notification message at the bottom of the page
  // Creates the toast element if it doesn't exist yet, then shows it for 3 seconds
  const showToast = (message) => {
    let toast = document.querySelector(".toast"); // Try to find an existing toast element
    if (!toast) {
      toast = document.createElement("div");    // Create a new div for the toast if none exists
      toast.className = "toast";                // Apply toast CSS class for styling
      toast.setAttribute("role", "status");     // Set ARIA role for screen reader accessibility
      document.body.appendChild(toast);         // Add the toast to the end of the page body
    }
    toast.innerHTML = `<span class="toast-icon">✨</span> <span>${escapeHtml(message)}</span>`; // Set escaped message content
    toast.classList.add("show");               // Add 'show' class to trigger CSS visible animation
    window.clearTimeout(showToast.timer);      // Cancel any existing hide timer to prevent early dismissal
    showToast.timer = window.setTimeout(() => toast.classList.remove("show"), 3000); // Auto-hide after 3 seconds
  };

  // renderStars: Converts a numeric rating (e.g., 4.7) into a filled/empty star string
  // Returns a string of 5 star characters: filled (★) for achieved rating, empty (☆) for the rest
  const renderStars = (rating) => {
    const rounded = Math.round(rating); // Round the rating to nearest whole number for star count
    let stars = "";                     // Start with an empty string to build the star display
    for (let i = 1; i <= 5; i++) {
      stars += i <= rounded ? "★" : "☆"; // Add a filled star if within rating, empty star otherwise
    }
    return stars; // Return the completed star string (e.g., "★★★★☆" for rating 4)
  };

  const renderProductCard = (product, options = {}) => {
    const saved = isInWishlist(product.id);
    const actionLabel = options.actionLabel || "Add to cart";
    return `
      <article class="product-card reveal" data-card-id="${product.id}">
        <div class="product-image-wrap">
          <img class="product-image" src="${escapeHtml(product.image)}" alt="${escapeHtml(product.name)}" loading="lazy" onerror="this.src='assets/favicon.svg'">
          <span class="product-badge">${escapeHtml(product.badge)}</span>
          <button class="card-heart-btn ${saved ? "is-saved" : ""}" type="button" aria-label="${saved ? "Remove from" : "Save to"} collection" title="${saved ? "Saved in collection" : "Save to collection"}" data-action="wishlist" data-product-id="${product.id}">
            ${saved ? "♥" : "♡"}
          </button>
        </div>
        <div class="product-card-body">
          <div class="product-card-top">
            <span class="product-category">${escapeHtml(product.category)}</span>
            <div class="product-rating" title="${product.rating} out of 5 stars">
              <span class="stars-gold">${renderStars(product.rating)}</span>
              <span class="rating-num">${product.rating}</span>
            </div>
          </div>
          <h3 class="product-title">${escapeHtml(product.name)}</h3>
          <p class="product-card-description">${escapeHtml(product.description)}</p>
          <div class="product-meta">
            <div class="price-container">
              <span class="price-label">Price:</span>
              <span class="product-price">${formatCurrency(product.price)}</span>
            </div>
          </div>
          <div class="product-actions">
            <button class="button button-primary button-small button-add-cart" type="button" data-action="add-cart" data-product-id="${product.id}">
              <span class="btn-icon">🛒</span> ${actionLabel}
            </button>
            <button class="button button-ghost button-small button-quick-view" type="button" data-action="details" data-product-id="${product.id}" title="Quick details">
              Quick view
            </button>
          </div>
        </div>
      </article>
    `;
  };

  // modalSelectedQty: Tracks the quantity selected in the Quick View modal
  // Starts at 1 every time a new modal is opened; updated by the +/- buttons inside the modal
  let modalSelectedQty = 1;

  // openProductModal: Opens the Quick View product modal with full product details
  // Dynamically builds the modal HTML with image, description, features, quantity controls, and add-to-cart button
  const openProductModal = (product) => {
    const backdrop = document.querySelector("#product-modal"); // Find the modal backdrop element in the DOM
    if (!backdrop) return; // Exit if the modal element doesn't exist on this page
    modalSelectedQty = 1; // Reset selected quantity to 1 each time the modal opens

    // Inject all product details into the modal's content area using a template literal
    backdrop.querySelector(".modal-content").innerHTML = `
      <div class="modal-image-col">
        <img src="${escapeHtml(product.image)}" alt="${escapeHtml(product.name)}" onerror="this.src='assets/favicon.svg'">
        <div class="modal-badge-row">
          <span class="product-badge">${escapeHtml(product.badge)}</span>
          <span class="product-category">${escapeHtml(product.category)}</span>
        </div>
      </div>
      <div class="modal-info-col">
        <h2 id="modal-title">${escapeHtml(product.name)}</h2>
        <div class="modal-rating-row">
          <span class="stars-gold">${renderStars(product.rating)}</span>
          <span class="rating-num">${product.rating} / 5</span>
          <span class="verified-tag">✓ Student Verified Pick</span>
        </div>
        <div class="modal-price-box">
          <span class="price-large">${formatCurrency(product.price)}</span>
          <span class="tax-tag">Includes simulated VAT · Free shipping over £30</span>
        </div>
        <p class="modal-description">${escapeHtml(product.description)}</p>
        <div class="modal-features">
          <strong>Key Highlights:</strong>
          <ul class="feature-list">
            ${product.features.map((feature) => `<li><span class="feature-check">✓</span> ${escapeHtml(feature)}</li>`).join("")}
          </ul>
        </div>
        <div class="modal-quantity-row">
          <span class="qty-label">Quantity:</span>
          <div class="quantity-controls">
            <button class="quantity-button" type="button" id="modal-qty-decrease" aria-label="Decrease quantity">−</button>
            <span id="modal-qty-val" class="quantity-value">1</span>
            <button class="quantity-button" type="button" id="modal-qty-increase" aria-label="Increase quantity">+</button>
          </div>
        </div>
        <div class="modal-actions">
          <button class="button button-primary" type="button" data-modal-add="${product.id}">
            🛒 Add to cart · <span id="modal-subtotal">${formatCurrency(product.price)}</span>
          </button>
          <a class="button button-ghost" href="cart.html">View cart</a>
        </div>
      </div>
    `;
    backdrop.hidden = false;                     // Make the modal backdrop visible
    document.body.classList.add("modal-open");   // Add class to body to prevent background scrolling
    const closeBtn = backdrop.querySelector(".modal-close"); // Find the close button
    if (closeBtn) closeBtn.focus();             // Move keyboard focus to the close button for accessibility

    // Hook up modal quantity buttons
    const qtyVal = backdrop.querySelector("#modal-qty-val");         // Span that displays current quantity number
    const subtotalVal = backdrop.querySelector("#modal-subtotal");   // Span that shows the running price total
    const btnDec = backdrop.querySelector("#modal-qty-decrease");    // Minus button to decrease quantity
    const btnInc = backdrop.querySelector("#modal-qty-increase");    // Plus button to increase quantity

    if (btnDec && btnInc && qtyVal && subtotalVal) { // Only attach events if all elements exist
      btnDec.addEventListener("click", () => {
        if (modalSelectedQty > 1) {             // Prevent going below quantity 1
          modalSelectedQty--;                   // Decrease the tracked quantity
          qtyVal.textContent = modalSelectedQty; // Update the displayed number
          subtotalVal.textContent = formatCurrency(product.price * modalSelectedQty); // Recalculate and show new subtotal
        }
      });
      btnInc.addEventListener("click", () => {
        if (modalSelectedQty < 99) {            // Cap maximum order quantity at 99
          modalSelectedQty++;                   // Increase the tracked quantity
          qtyVal.textContent = modalSelectedQty; // Update the displayed number
          subtotalVal.textContent = formatCurrency(product.price * modalSelectedQty); // Recalculate and show new subtotal
        }
      });
    }
  };

  // closeProductModal: Hides the Quick View modal and restores normal page scrolling
  const closeProductModal = () => {
    const backdrop = document.querySelector("#product-modal"); // Find the modal backdrop element
    if (!backdrop) return;                         // Exit if modal doesn't exist on this page
    backdrop.hidden = true;                        // Hide the modal backdrop from view
    document.body.classList.remove("modal-open"); // Re-enable background page scrolling
  };

  // initNavigation: Sets up the mobile hamburger menu toggle and active nav link highlighting
  // The hamburger button shows/hides the site-nav on small screens
  const initNavigation = () => {
    const toggle = document.querySelector(".nav-toggle"); // The hamburger menu button
    const nav = document.querySelector(".site-nav");      // The navigation links container
    if (toggle && nav) {
      toggle.addEventListener("click", () => {
        const open = nav.classList.toggle("is-open");          // Toggle the open class and track state
        toggle.classList.toggle("is-open", open);              // Sync the toggle button open state
        toggle.setAttribute("aria-expanded", String(open));   // Update ARIA attribute for screen readers
      });
      nav.querySelectorAll("a").forEach((link) =>
        link.addEventListener("click", () => {
          nav.classList.remove("is-open");                      // Close the mobile menu when any link is clicked
          toggle.classList.remove("is-open");                   // Remove active state from the toggle button
          toggle.setAttribute("aria-expanded", "false");       // Reset ARIA expanded state
        })
      );
    }

    const currentPage = document.body.dataset.page; // Read the current page name from the body data attribute
    document.querySelectorAll(".nav-link").forEach((link) => {
      if (link.dataset.page === currentPage) link.classList.add("active"); // Highlight the current page's nav link
    });
  };

  // initNewsletterForms: Handles all newsletter subscription forms on the page
  // Validates the email input, saves it to localStorage, and shows a success/error message
  const initNewsletterForms = () => {
    document.querySelectorAll(".newsletter-form").forEach((form) => {
      form.addEventListener("submit", (event) => {
        event.preventDefault(); // Stop the form from doing a real HTTP submit (this is a client-side demo)
        const input = form.querySelector("input[type='email']"); // Get the email input field
        const email = input ? input.value.trim() : "";           // Extract and trim the email value
        const message = form.parentElement.querySelector(".form-message") || form.querySelector(".form-message"); // Find the status message element
        if (!email || !email.includes("@")) { // Basic email validation: must contain an "@" symbol
          if (message) {
            message.textContent = "Please enter a valid email address."; // Show inline error message
            message.className = "form-message error";  // Apply error styling
          }
          return; // Stop processing if validation fails
        }
        writeStorage(STORAGE_KEYS.newsletter, { email, subscribedAt: new Date().toISOString() }); // Save email + timestamp to localStorage
        form.reset(); // Clear the form input field after successful submission
        if (message) {
          message.textContent = "🎉 You're on the VIP list. Welcome to Toy Haven!"; // Show success message
          message.className = "form-message success"; // Apply success styling
        }
        showToast("Newsletter subscription saved! 💌"); // Also show a toast notification
      });
    });
  };

  // initReveal: Animates page sections into view as the user scrolls down
  // Uses IntersectionObserver API to detect when elements enter the viewport
  const initReveal = () => {
    const elements = document.querySelectorAll(".reveal"); // Select all elements marked for scroll animation
    if (!("IntersectionObserver" in window)) {
      elements.forEach((element) => element.classList.add("visible")); // Instantly show all if browser doesn't support IntersectionObserver
      return; // Exit early — no need to set up the observer
    }
    const observer = new IntersectionObserver(
      (entries, currentObserver) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {                      // Check if the element has scrolled into view
            entry.target.classList.add("visible");         // Add visible class to trigger CSS fade-in animation
            currentObserver.unobserve(entry.target);       // Stop watching this element once it's been revealed (performance)
          }
        });
      },
      { threshold: 0.08 } // Trigger when at least 8% of the element is visible in the viewport
    );
    elements.forEach((element) => observer.observe(element)); // Start observing each reveal element
  };

  // initModal: Attaches global click and keyboard event listeners for the Quick View modal
  // Closes the modal when clicking the backdrop background or the X close button
  // Also handles the "Add to cart" button click inside the modal
  const initModal = () => {
    const backdrop = document.querySelector("#product-modal"); // Find the modal backdrop element
    if (!backdrop) return; // Exit if the modal doesn't exist on this page
    backdrop.addEventListener("click", (event) => {
      if (event.target === backdrop || event.target.closest(".modal-close")) closeProductModal(); // Close if backdrop or X button clicked
      const addButton = event.target.closest("[data-modal-add]"); // Find the add-to-cart button if clicked
      if (addButton) {
        addToCart(addButton.dataset.modalAdd, modalSelectedQty); // Add product to cart using modal's chosen quantity
        closeProductModal(); // Close the modal after adding to cart
      }
    });
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") closeProductModal(); // Close modal when user presses the Escape key (accessibility)
    });
  };

  // initProductActions: Sets up a global click delegate for product card actions
  // Handles "add-cart", "wishlist" (heart button), and "details" (Quick View) actions
  // Uses event delegation — one listener on document handles all product cards
  const initProductActions = async () => {
    const products = await loadProducts(); // Load the product catalogue (cached after first load)
    document.addEventListener("click", (event) => {
      const action = event.target.closest("[data-action]"); // Check if a data-action element was clicked
      if (!action) return; // Exit if the click was not on an action element
      const product = products.find((item) => item.id === action.dataset.productId); // Look up the product by ID
      if (!product) return; // Exit if product ID not found in the catalogue

      if (action.dataset.action === "add-cart") {
        addToCart(product.id, 1); // Add one unit of this product to the cart
      }
      if (action.dataset.action === "wishlist") {
        if (isInWishlist(product.id)) {
          removeFromWishlist(product.id);                                      // Remove from wishlist if already saved
          showToast(`Removed "${product.name}" from your collection.`);        // Notify user of removal
        } else {
          setWishlistStatus(product.id, "Interested");                         // Add to wishlist with default "Interested" status
        }
        const saved = isInWishlist(product.id); // Re-check if product is now in wishlist (after toggle)
        // Update all buttons for this product on the page
        document.querySelectorAll(`[data-action="wishlist"][data-product-id="${product.id}"]`).forEach((btn) => {
          btn.classList.toggle("is-saved", saved);                             // Toggle the saved CSS class on the heart button
          btn.innerHTML = saved ? "♥" : "♡";                                  // Switch between filled and empty heart icon
          btn.setAttribute("title", saved ? "Saved in collection" : "Save to collection"); // Update tooltip text
        });
      }
      if (action.dataset.action === "details") {
        openProductModal(product); // Open the Quick View modal with this product's details
      }
    });
  };

  // initShared: Master initialiser that runs all shared setup functions on every page
  // Called once when the DOM is fully loaded via DOMContentLoaded event
  const initShared = () => {
    initNavigation();      // Set up the hamburger menu and active nav link highlighting
    initNewsletterForms(); // Set up newsletter form validation and submission handling
    initReveal();          // Set up scroll-triggered fade-in animations for .reveal elements
    initModal();           // Set up global modal click/keyboard listeners
    initProductActions();  // Set up delegated product card action handler (add-cart, wishlist, details)
    updateCartCount();     // Update the cart badge count immediately on page load
    if ("serviceWorker" in navigator && window.location.protocol !== "file:") {
      navigator.serviceWorker.register("sw.js").catch(() => {}); // Register the Service Worker for offline/PWA support (skipped on file:// protocol)
    }
  };

  // window.ToyHaven: Expose the public API to the global window object
  // All other page-specific JS files (home.js, cart.js, etc.) use window.ToyHaven to access shared functions
  window.ToyHaven = {
    STORAGE_KEYS,          // Shared localStorage key constants
    FALLBACK_PRODUCTS,     // Hardcoded product catalogue fallback
    readStorage,           // Read from localStorage safely
    writeStorage,          // Write to localStorage safely
    formatCurrency,        // Format numbers as GBP currency strings
    escapeHtml,            // Sanitise strings before inserting into HTML
    loadProducts,          // Fetch or return cached product catalogue
    getCart,               // Get current cart array
    saveCart,              // Save cart array to localStorage
    getWishlist,           // Get current wishlist array
    isInWishlist,          // Check if a product is in the wishlist
    addToCart,             // Add a product to the cart
    setWishlistStatus,     // Add/update wishlist entry status
    removeFromWishlist,    // Remove a product from the wishlist
    getCartDetails,        // Get enriched cart items with product data and subtotals
    getCartTotal,          // Get sum of all cart item subtotals
    getCartQuantity,       // Get total number of items in cart
    updateCartCount,       // Refresh cart badge number in nav
    showToast,             // Display a temporary notification message
    renderStars,           // Convert rating number to star character string
    renderProductCard,     // Generate HTML string for a product card
    openProductModal,      // Open the Quick View product modal
    closeProductModal      // Close the Quick View product modal
  };

  // Listen for the DOM to be fully loaded before running initShared
  // This ensures all HTML elements exist before we try to query them
  document.addEventListener("DOMContentLoaded", initShared);
})(); // End of IIFE — function executes immediately and its variables stay private