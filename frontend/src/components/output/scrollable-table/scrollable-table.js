/**
 * Renders Inventory's product table rows.
 *
 * This file lives alongside scrollable-table.css, which provides the shared
 * scroll/sticky-header mechanics used by every table in the app (Inventory,
 * Sales, Dashboard widgets). This specific render function is Inventory-only
 * — it knows about products, stock badges, and edit/delete actions.
 *
 * Usage:
 *   import { renderProductTable } from "../../components/scrollable-table/scrollable-table.js";
 *
 *   renderProductTable("product-tbody", products, {
 *       onEdit:   (id) => { ... },
 *       onDelete: (id) => { ... },
 *   });
 */

function stockBadge(qty) {
    if (qty === 0) return `<span class="badge badge-danger">NO STOCK</span>`;
    if (qty <= 5) return `<span class="badge badge-warning">LOW STOCK</span>`;
    return `<span class="badge badge-success">AVAILABLE</span>`;
}

function renderRow(product) {
    return `
        <tr>
            <td class="td-id">#${product.id}</td>
            <td class="td-name">${product.name}</td>
            <td>${product.category ?? "General"}</td>
            <td class="td-desc">${product.description ?? "—"}</td>
            <td class="td-price">₱${Number(product.price).toFixed(2)}</td>
            <td class="td-stock">${product.stock_quantity}</td>
            <td>${stockBadge(product.stock_quantity)}</td>
            <td>
                <div class="row-actions">
                    <button class="btn-icon btn-ghost edit-btn" data-id="${product.id}" aria-label="Edit ${product.name}">
                        <i class="ti ti-pencil" aria-hidden="true"></i>
                    </button>
                    <button class="btn-icon btn-ghost delete-btn" data-id="${product.id}" aria-label="Archive ${product.name}">
                        <i class="ti ti-trash" aria-hidden="true"></i>
                    </button>
                </div>
            </td>
        </tr>
    `;
}

function renderEmptyState() {
    return `
        <tr>
            <td colspan="8">
                <div class="empty-state">
                    <i class="ti ti-package-off" aria-hidden="true"></i>
                    No products found
                </div>
            </td>
        </tr>
    `;
}

/**
 * Renders the product table body into the given tbody element and wires
 * up edit/delete click handlers for each row.
 *
 * @param {string} tbodyId - id of the <tbody> element to render into
 * @param {Array} products - array of product objects to display
 * @param {Object} handlers - { onEdit(id), onDelete(id) }
 */
export function renderProductTable(tbodyId, products, handlers = {}) {
    const tbody = document.getElementById(tbodyId);
    if (!tbody) return;

    tbody.innerHTML = products.length === 0
        ? renderEmptyState()
        : products.map(renderRow).join("");

    tbody.querySelectorAll(".edit-btn").forEach(btn =>
        btn.addEventListener("click", () => handlers.onEdit?.(Number(btn.dataset.id)))
    );
    tbody.querySelectorAll(".delete-btn").forEach(btn =>
        btn.addEventListener("click", () => handlers.onDelete?.(Number(btn.dataset.id)))
    );
}