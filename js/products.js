// products.js — Page-specific JavaScript for the Shop / Products page (products.html)
// Handles filtering by category and price, sorting, search, and rendering all product cards

// Wrap in IIFE to keep variables private and avoid conflicts with app.js
(function () {
  // Enable strict mode to catch silent JavaScript errors
  "use strict";

  // state: Tracks the current active filter and sort settings for the product listing
  // These values are updated by user interactions and used to filter/sort the rendered product list
  const state = {
    category: "All",    // The selected category filter; "All" means no category filter applied
    priceRange: "all",  // The selected price range filter; "all" means no price restriction
    sortBy: "featured", // The selected sort order; "featured" = original catalogue order
    search: ""          // The current text entered in the search input box
  };

  // filterAndSortProducts: Applies the current state filters and sort order to the full product list
  // Returns a filtered and sorted sub-array of products to be rendered in the product grid
  const filterAndSortProducts = (products) => {
    const term = state.search.trim().toLowerCase(); // Normalise the search term for case-insensitive comparison

    return products
      .filter((product) => {
        // Category filter — show product only if "All" is selected or product matches the chosen category
        const matchesCategory = state.category === "All" || product.category === state.category;

        // Search term — show product if no search term, or if name/description/category/badge contains the term
        const matchesSearch =
          !term ||
          product.name.toLowerCase().includes(term) ||        // Check product name
          product.description.toLowerCase().includes(term) || // Check product description
          product.category.toLowerCase().includes(term) ||    // Check product category
          product.badge.toLowerCase().includes(term);         // Check product badge label

        // Price range — filter based on the selected price bracket
        let matchesPrice = true; // Default: include product (no price filter)
        if (state.priceRange === "under20") {
          matchesPrice = product.price < 20; // Only include products under £20
        } else if (state.priceRange === "20to30") {
          matchesPrice = product.price >= 20 && product.price <= 30; // Only include products between £20 and £30
        } else if (state.priceRange === "over30") {
          matchesPrice = product.price > 30; // Only include products over £30
        }

        return matchesCategory && matchesSearch && matchesPrice; // Include product only if ALL three filters match
      })
      .sort((a, b) => {
        if (state.sortBy === "price-asc") return a.price - b.price;       // Sort cheapest first
        if (state.sortBy === "price-desc") return b.price - a.price;      // Sort most expensive first
        if (state.sortBy === "rating-desc") return b.rating - a.rating;   // Sort highest-rated first
        if (state.sortBy === "name-asc") return a.name.localeCompare(b.name); // Sort alphabetically A-Z
        return 0; // featured / natural order — keep original catalogue order
      });
  };

  // renderActiveTags: Shows the currently active filter labels as removable "tag" chips below the filter bar
  // Helps users see which filters are active at a glance
  const renderActiveTags = (container, filteredLength, totalLength) => {
    if (!container) return; // Exit if the tags container doesn't exist on the page
    const tags = []; // Build up an array of tag label strings

    if (state.category !== "All") {
      tags.push(`Category: <strong>${ToyHaven.escapeHtml(state.category)}</strong>`); // Add category tag if not "All"
    }
    if (state.priceRange !== "all") {
      const labels = {
        under20: "Under £20",     // Human-readable label for the under20 filter value
        "20to30": "£20 to £30",   // Human-readable label for the 20to30 filter value
        over30: "Over £30"        // Human-readable label for the over30 filter value
      };
      tags.push(`Price: <strong>${labels[state.priceRange] || state.priceRange}</strong>`); // Add price range tag
    }
    if (state.search.trim()) {
      tags.push(`Search: "<strong>${ToyHaven.escapeHtml(state.search.trim())}</strong>"`); // Add search term tag
    }

    if (tags.length) {
      container.innerHTML = tags.map((t) => `<span class="active-tag">${t}</span>`).join(""); // Render all tags as HTML spans
      container.hidden = false; // Show the tags container when there are active filters
    } else {
      container.innerHTML = "";  // Clear any existing tags
      container.hidden = true;   // Hide the container when no filters are active
    }
  };

  // renderProducts: Renders the filtered and sorted product grid on the products page
  // Updates the results count, active filter tags, and the product card grid
  const renderProducts = (products) => {
    const grid = document.querySelector("#product-grid");         // The main product card grid container
    const count = document.querySelector("#results-count");       // The "Showing X toys" results count text
    const tagsContainer = document.querySelector("#active-filter-tags"); // The active filter tags display area
    if (!grid || !count) return; // Exit if essential elements are missing (safety check)

    grid.classList.remove("loading-grid"); // Remove the loading skeleton state once products are ready
    const filtered = filterAndSortProducts(products); // Apply current state filters and sorting

    count.textContent = `Showing ${filtered.length} ${filtered.length === 1 ? "toy" : "toys"} in catalogue`; // Update results count text
    renderActiveTags(tagsContainer, filtered.length, products.length); // Update the active filter tags display

    if (filtered.length === 0) { // If no products match the current filters...
      grid.innerHTML = `
        <div class="empty-state" style="grid-column: 1 / -1">
          <h3>No toys match your criteria</h3>
          <p>Try searching with another name or reset your category and price filters.</p>
          <button id="empty-reset-btn" class="button button-primary" type="button">Reset all filters</button>
        </div>
      `; // Show an "empty state" message spanning the full grid width
      const resetBtn = grid.querySelector("#empty-reset-btn"); // Find the reset button inside the empty state
      if (resetBtn) {
        resetBtn.addEventListener("click", () => resetAllFilters(products)); // Wire up reset button to clear all filters
      }
      return; // Stop here — no product cards to render
    }

    grid.innerHTML = filtered.map((product) => ToyHaven.renderProductCard(product)).join(""); // Render all filtered product cards as HTML

    // Animate reveal cards — add visible class after a paint frame so CSS transitions play correctly
    requestAnimationFrame(() => {
      grid.querySelectorAll(".reveal").forEach((element) => element.classList.add("visible")); // Trigger CSS fade-in animation on each product card
    });
  };

  // updateCategoryCounts: Updates the item count badges on each category filter button
  // Shows how many products are available in each category (e.g., "Figurines (4)")
  const updateCategoryCounts = (products) => {
    const counts = {
      All: products.length,                                                     // Total number of products in the catalogue
      Figurines: products.filter((p) => p.category === "Figurines").length,     // Count of Figurines
      Toys: products.filter((p) => p.category === "Toys").length,               // Count of Toys
      "Board Games": products.filter((p) => p.category === "Board Games").length, // Count of Board Games
      "Diecast Cars": products.filter((p) => p.category === "Diecast Cars").length // Count of Diecast Cars
    };

    const countAll = document.querySelector("#count-all");      // Badge element for "All" category
    const countFig = document.querySelector("#count-figurines"); // Badge element for Figurines
    const countToy = document.querySelector("#count-toys");      // Badge element for Toys
    const countGame = document.querySelector("#count-games");    // Badge element for Board Games
    const countCar = document.querySelector("#count-cars");      // Badge element for Diecast Cars

    if (countAll) countAll.textContent = counts.All;                // Update "All" badge
    if (countFig) countFig.textContent = counts.Figurines;          // Update Figurines badge
    if (countToy) countToy.textContent = counts.Toys;               // Update Toys badge
    if (countGame) countGame.textContent = counts["Board Games"];    // Update Board Games badge
    if (countCar) countCar.textContent = counts["Diecast Cars"];     // Update Diecast Cars badge
  };

  // resetAllFilters: Resets all filter/search/sort state back to default values
  // Also resets the visual state of all filter UI controls to match
  const resetAllFilters = (products) => {
    state.category = "All";     // Reset category filter to show all products
    state.priceRange = "all";   // Reset price filter to show all prices
    state.sortBy = "featured";  // Reset sort to original featured order
    state.search = "";          // Clear the search term

    const searchInput = document.querySelector("#product-search"); // The search text input
    const priceFilter = document.querySelector("#price-filter");   // The price range dropdown
    const sortSelect = document.querySelector("#sort-select");     // The sort order dropdown

    if (searchInput) searchInput.value = "";        // Clear the search input field text
    if (priceFilter) priceFilter.value = "all";     // Reset the price dropdown to "all"
    if (sortSelect) sortSelect.value = "featured";  // Reset the sort dropdown to "featured"

    document.querySelectorAll(".filter-button").forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.category === "All"); // Set "All" button as active, remove active from others
    });

    renderProducts(products); // Re-render the product grid with all filters cleared
  };

  // initProductsPage: Main entry point for the products page
  // Loads products, reads URL params, sets initial state, renders the grid, and wires up all filter events
  const initProductsPage = async () => {
    const grid = document.querySelector("#product-grid"); // The product card grid container
    if (!grid) return; // Exit if the grid element doesn't exist (not on the products page)

    const products = await ToyHaven.loadProducts(); // Fetch the product catalogue (async)
    updateCategoryCounts(products); // Populate the category count badges immediately

    // Read URL category query param (e.g. ?category=Figurines)
    // Allows other pages to link directly to a pre-filtered category view
    const urlParams = new URLSearchParams(window.location.search); // Parse the current URL's query string
    const requestedCategory = urlParams.get("category");           // Extract the "category" query parameter value
    const validCategories = ["Figurines", "Toys", "Board Games", "Diecast Cars"]; // Whitelist of valid category values
    if (validCategories.includes(requestedCategory)) {
      state.category = requestedCategory; // Apply the URL-requested category if it's a valid one
    }

    // Set initial active button — highlight the category button matching the initial state
    document.querySelectorAll(".filter-button").forEach((button) => {
      button.classList.toggle("active", button.dataset.category === state.category); // Mark matching button as active
    });

    renderProducts(products); // Render the initial product grid (with URL category pre-applied if any)

    // Category button events — update state and re-render when a category filter button is clicked
    document.querySelectorAll(".filter-button").forEach((button) => {
      button.addEventListener("click", () => {
        state.category = button.dataset.category; // Update the active category in state
        document.querySelectorAll(".filter-button").forEach((b) => b.classList.remove("active")); // Remove active class from all buttons
        button.classList.add("active"); // Add active class only to the clicked button
        renderProducts(products);       // Re-render the grid with the new category filter
      });
    });

    // Search input — update state and re-render as the user types in the search box
    const searchInput = document.querySelector("#product-search"); // The live search text input
    if (searchInput) {
      searchInput.addEventListener("input", (event) => {
        state.search = event.target.value; // Update the search term in state with the current input value
        renderProducts(products);          // Re-render the grid filtered by the new search term
      });
    }

    // Price dropdown — update state and re-render when the user selects a different price range
    const priceFilter = document.querySelector("#price-filter"); // The price range select dropdown
    if (priceFilter) {
      priceFilter.addEventListener("change", (event) => {
        state.priceRange = event.target.value; // Update the price range in state
        renderProducts(products);              // Re-render the grid with the new price filter
      });
    }

    // Sort dropdown — update state and re-render when the user changes the sort order
    const sortSelect = document.querySelector("#sort-select"); // The sort order select dropdown
    if (sortSelect) {
      sortSelect.addEventListener("change", (event) => {
        state.sortBy = event.target.value; // Update the sort order in state
        renderProducts(products);          // Re-render the grid in the new sort order
      });
    }

    // Reset button — clears all filters and restores the default view
    const resetBtn = document.querySelector("#reset-filters"); // The "Reset Filters" button in the sidebar
    if (resetBtn) {
      resetBtn.addEventListener("click", () => resetAllFilters(products)); // Wire up click to reset handler
    }
  };

  // Wait for the DOM to be fully parsed before running the products page initialisation
  document.addEventListener("DOMContentLoaded", initProductsPage);
})(); // End of IIFE