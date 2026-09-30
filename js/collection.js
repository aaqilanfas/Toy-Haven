(function () {
  "use strict";

  let activeFilter = "all";

  const renderCollection = async () => {
    const products = await ToyHaven.loadProducts();
    const saved = ToyHaven.getWishlist();
    const grid = document.querySelector("#collection-grid");
    const empty = document.querySelector("#collection-empty");
    const count = document.querySelector("#collection-count");
    if (!grid || !empty || !count) return;

    count.textContent = `${saved.length} ${saved.length === 1 ? "toy" : "toys"} saved`;

    if (!saved.length) {
      empty.hidden = false;
      grid.hidden = true;
      return;
    }

    const filtered =
      activeFilter === "all"
        ? saved
        : saved.filter((entry) => entry.status === activeFilter);

    if (!filtered.length) {
      empty.hidden = false;
      empty.querySelector("h2").textContent = `No toys marked as "${activeFilter}"`;
      grid.hidden = true;
      return;
    }

    empty.hidden = true;
    grid.hidden = false;

    grid.innerHTML = filtered
      .map((entry) => {
        const product = products.find((item) => item.id === entry.productId);
        if (!product) return "";
        return `
          <article class="collection-card reveal visible">
            <div class="collection-card-image-wrap">
              <img src="${ToyHaven.escapeHtml(product.image)}" alt="${ToyHaven.escapeHtml(product.name)}" onerror="this.src='assets/favicon.svg'">
              <span class="product-badge">${ToyHaven.escapeHtml(product.badge)}</span>
            </div>
            <div class="collection-card-content">
              <span class="product-category">${ToyHaven.escapeHtml(product.category)}</span>
              <h3>${ToyHaven.escapeHtml(product.name)}</h3>
              
              <div class="price-container" style="margin: 0.35rem 0 0.75rem;">
                <span class="price-label">Price:</span>
                <span class="product-price">${ToyHaven.formatCurrency(product.price)}</span>
              </div>

              <div class="collection-controls">
                <label class="sr-only" for="status-${product.id}">Shelf status</label>
                <select id="status-${product.id}" class="collection-status" data-status-id="${product.id}">
                  ${["Interested", "Owned", "Saved for Later"]
                    .map((status) => `<option value="${status}" ${entry.status === status ? "selected" : ""}>${status}</option>`)
                    .join("")}
                </select>
                <button class="button button-primary button-small" type="button" data-action="add-cart" data-product-id="${product.id}" title="Add to shopping cart">
                  🛒 Add
                </button>
                <button class="collection-remove-btn" type="button" data-remove-id="${product.id}" title="Remove from collection">
                  ✕
                </button>
              </div>
            </div>
          </article>
        `;
      })
      .join("");
  };

  const initCollection = () => {
    if (!document.querySelector("#collection-grid")) return;
    renderCollection();

    // Filter tab buttons
    document.querySelectorAll(".col-filter-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        document.querySelectorAll(".col-filter-btn").forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
        activeFilter = btn.dataset.filter;
        renderCollection();
      });
    });

    // Status change
    document.addEventListener("change", (event) => {
      const select = event.target.closest("[data-status-id]");
      if (!select) return;
      ToyHaven.setWishlistStatus(select.dataset.statusId, select.value);
      renderCollection();
    });

    // Remove button
    document.addEventListener("click", (event) => {
      const button = event.target.closest("[data-remove-id]");
      if (!button) return;
      ToyHaven.removeFromWishlist(button.dataset.removeId);
      renderCollection();
      ToyHaven.showToast("Removed from your shelf.");
    });
  };

  document.addEventListener("DOMContentLoaded", initCollection);
})();