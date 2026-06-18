/**
 * product-card component
 *
 * Renders a grid of purchasable product cards into a container.
 *
 * Usage:
 *   import { renderProductGrid } from "../../components/product-card/product-card.js";
 *
 *   renderProductGrid("mount-id", products, {
 *       onAddToCart: (product) => { ... }
 *   });
 */

export function renderProductGrid(mountId, products, { onAddToCart } = {}) {
    const container = document.getElementById(mountId);
    if (!container) return;

    if (!products.length) {
        container.innerHTML = `
            <div class="product-grid-empty">
                <i class="ti ti-package-off" aria-hidden="true"></i>
                <p>No products found</p>
            </div>
        `;
        return;
    }

    container.innerHTML = `
        <div class="product-grid">
            ${products.map(p => productCardTemplate(p)).join("")}
        </div>
    `;

    container.querySelectorAll(".product-card").forEach(card => {
        card.addEventListener("click", () => {
            const id = parseInt(card.dataset.id);
            const product = products.find(p => p.id === id);
            if (product && product.stock_quantity > 0) {
                onAddToCart?.(product);
                animateCard(card);
            }
        });
    });
}

function productCardTemplate(product) {
    const outOfStock = product.stock_quantity === 0;
    const lowStock   = product.stock_quantity > 0 && product.stock_quantity <= 5;

    return `
        <button
            class="product-card ${outOfStock ? "out-of-stock" : ""}"
            data-id="${product.id}"
            ${outOfStock ? "disabled" : ""}
            aria-label="Add ${product.name} to cart"
        >
            <div class="product-card-body">
                <span class="product-card-category">${product.category ?? "General"}</span>
                <p class="product-card-name">${product.name}</p>
                ${product.description
                    ? `<p class="product-card-desc">${product.description}</p>`
                    : ""}
            </div>

            <div class="product-card-footer">
                <span class="product-card-price font-mono">₱${parseFloat(product.price).toFixed(2)}</span>
                <span class="product-card-stock ${outOfStock ? "badge badge-danger" : lowStock ? "badge badge-warning" : "badge badge-success"}">
                    ${outOfStock ? "Out of stock" : lowStock ? `${product.stock_quantity} left` : `${product.stock_quantity} in stock`}
                </span>
            </div>

            ${outOfStock ? `<div class="product-card-overlay"><span>Unavailable</span></div>` : ""}
        </button>
    `;
}

function animateCard(card) {
    card.classList.add("card-pulse");
    card.addEventListener("animationend", () => card.classList.remove("card-pulse"), { once: true });
}