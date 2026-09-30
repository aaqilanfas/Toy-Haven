// home.js — Page-specific JavaScript for the Home (index.html) page
// Handles the hero banner slideshow, featured product grid, and daily spotlight panel

// Wrap in IIFE to keep all variables private and prevent conflicts with app.js
(function () {
  // Enforce strict mode to catch silent JavaScript errors
  "use strict";

  // initHero: Sets up the auto-playing hero banner slideshow with dot navigation
  // Cycles through multiple promotional slides every 5.5 seconds
  const initHero = () => {
    const slides = [...document.querySelectorAll(".hero-slide")]; // Convert NodeList to Array of all hero slide elements
    const dots = [...document.querySelectorAll(".hero-dot")];     // Convert NodeList to Array of all dot navigation buttons
    if (!slides.length) return; // Exit if no slides exist on the page (safety check)
    let current = 0; // Tracks the index of the currently displayed slide
    let timer;       // Stores the interval timer reference so it can be cleared/restarted

    // showSlide: Switches the active slide and updates the corresponding dot indicator
    const showSlide = (index) => {
      current = (index + slides.length) % slides.length; // Wrap around using modulo (e.g., after last slide, go back to 0)
      slides.forEach((slide, slideIndex) => slide.classList.toggle("is-active", slideIndex === current)); // Mark only the current slide as active
      dots.forEach((dot, dotIndex) => {
        dot.classList.toggle("is-active", dotIndex === current);           // Highlight the corresponding dot
        dot.setAttribute("aria-selected", String(dotIndex === current));  // Update ARIA selected state for accessibility
      });
    };

    // startTimer: Starts (or restarts) the automatic slide rotation interval
    // The interval is reset when a user manually clicks a dot, so it doesn't immediately auto-advance
    const startTimer = () => {
      window.clearInterval(timer); // Clear any existing timer before starting a new one (prevents multiple timers)
      timer = window.setInterval(() => showSlide(current + 1), 5500); // Auto-advance to next slide every 5.5 seconds
    };

    // Attach click listeners to each dot button so users can manually navigate slides
    dots.forEach((dot, index) => {
      dot.addEventListener("click", () => {
        showSlide(index); // Jump directly to the slide matching this dot's index
        startTimer();     // Restart the timer so auto-advance resets from this point
      });
    });
    showSlide(0);   // Show the first slide immediately on page load
    startTimer();   // Begin the auto-play timer
  };

  // initHomeProductsGrid: Loads and renders the 4-item featured product grid on the homepage
  // Picks one top product from each category (Figurines, Toys, Board Games, Diecast Cars)
  const initHomeProductsGrid = async () => {
    const grid = document.querySelector("#home-featured-grid"); // Find the grid container element in the DOM
    if (!grid) return; // Exit if the grid element doesn't exist on this page
    const products = await ToyHaven.loadProducts(); // Fetch the product catalogue (async, uses cache after first call)
    // Select one top toy from each category plus high-rated items (4 items for crisp grid)
    const featuredIds = ["fig-001", "toy-001", "game-001", "car-001"]; // Hardcoded IDs of the 4 featured products
    const featuredList = featuredIds
      .map((id) => products.find((p) => p.id === id)) // Look up each featured product object by ID
      .filter(Boolean); // Remove any undefined entries if a product ID doesn't exist

    // Generate and inject HTML for all 4 featured product cards using app.js's renderProductCard function
    grid.innerHTML = featuredList.map((product) => ToyHaven.renderProductCard(product)).join("");
    // Ensure all cards are visible immediately or via observer
    requestAnimationFrame(() => {
      // Use requestAnimationFrame to wait until the DOM has painted before adding visible class
      grid.querySelectorAll(".reveal").forEach((el) => el.classList.add("visible")); // Trigger reveal animation on all product cards
    });
  };

  // initFeaturedProduct: Renders the "Product of the Day" spotlight section below the product grid
  // Uses the current day's date to deterministically pick a different product each day
  const initFeaturedProduct = async () => {
    const container = document.querySelector("#featured-product"); // Find the featured product container element
    if (!container) return; // Exit if the container doesn't exist on this page
    const products = await ToyHaven.loadProducts(); // Load the full product catalogue
    const dayIndex = Math.floor(Date.now() / 86400000) % products.length; // Calculate today's product index: milliseconds ÷ ms-per-day = day number, wrapped to catalogue length
    const product = products[dayIndex]; // Select the product for today based on the day index
    // Build and inject the full featured product panel HTML
    container.innerHTML = `
      <img class="featured-panel-image" src="${ToyHaven.escapeHtml(product.image)}" alt="${ToyHaven.escapeHtml(product.name)}" onerror="this.src='assets/favicon.svg'">
      <div class="featured-panel-content">
        <div class="eyebrow">Featured toy of the day</div>
        <h2>${ToyHaven.escapeHtml(product.name)}</h2>
        <p>${ToyHaven.escapeHtml(product.description)}</p>
        <div class="featured-meta">
          <div class="price-container">
            <span class="price-label">Today's Price:</span>
            <span class="price-large">${ToyHaven.formatCurrency(product.price)}</span>
          </div>
          <span class="product-rating" title="${product.rating} out of 5 stars">
            <span class="stars-gold">${ToyHaven.renderStars(product.rating)}</span>
            <strong>${product.rating}</strong>
          </span>
        </div>
        <div class="product-actions" style="margin-top: 1.2rem;">
          <button class="button button-primary" type="button" data-action="add-cart" data-product-id="${product.id}">
            🛒 Add today's pick to cart
          </button>
          <button class="button button-ghost" type="button" data-action="details" data-product-id="${product.id}">
            Quick view
          </button>
        </div>
      </div>
    `;
    if (window.IntersectionObserver) { // Only use IntersectionObserver if the browser supports it
      container.classList.add("reveal"); // Add reveal class to enable the scroll-triggered animation
      new IntersectionObserver((entries, observer) => {
        if (entries[0].isIntersecting) {    // Check if the featured panel has scrolled into view
          container.classList.add("visible"); // Trigger the CSS fade-in animation
          observer.disconnect();            // Stop observing once visible (no need to keep watching)
        }
      }).observe(container); // Start observing the container element for intersection
    }
  };

  // Wait for the HTML document to be fully parsed before running any initialisation code
  document.addEventListener("DOMContentLoaded", () => {
    initHero();              // Start the hero slideshow
    initHomeProductsGrid();  // Render the 4 featured product cards
    initFeaturedProduct();   // Render today's product spotlight panel
  });
})(); // End of IIFE