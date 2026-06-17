function stockBadge(qty) {
    if (qty === 0) return `<span class="badge badge-danger">Out of stock</span>`;
    if (qty <= 5) return `<span class="badge badge-warning">Low stock</span>`;
    return `<span class="badge badge-success">In stock</span>`;
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
                    <button class="btn-icon btn-ghost restock-btn" data-id="${product.id}" aria-label="Restock ${product.name}">
                        <i class="ti ti-package-import" aria-hidden="true"></i>
                    </button>
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

    tbody.querySelectorAll(".restock-btn").forEach(btn =>
        btn.addEventListener("click", () => handlers.onRestock?.(Number(btn.dataset.id)))
    );
    tbody.querySelectorAll(".edit-btn").forEach(btn =>
        btn.addEventListener("click", () => handlers.onEdit?.(Number(btn.dataset.id)))
    );
    tbody.querySelectorAll(".delete-btn").forEach(btn =>
        btn.addEventListener("click", () => handlers.onDelete?.(Number(btn.dataset.id)))
    );
}