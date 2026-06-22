import { getProducts, addProduct, updateProduct, deleteProduct }    from "../../api/productAPI.js";
import { renderSidebar, initSidebar }                               from "../../components/navigation/sidebar/sidebar.js";
import { showToast }                                                from "../../components/output/toast/toast.js";
import { mountSearch }                                              from "../../components/input/search/search.js";
import { renderHeader }                                             from "../../components/headers/header/header.js";
import { renderSubheader }                                          from "../../components/headers/subheader/subheader.js";
import { mountCatFilter }                                           from "../../components/output/cat-filter/cat-filter.js";
import { mountProductModals }                                       from "../../components/modals/product-modals/product-modals.js";

let products = [];
let activeCategory = "All";

document.getElementById("sidebar-mount").outerHTML = renderSidebar("inventory");
initSidebar();

document.getElementById("header-mount").outerHTML = renderHeader({
    title:       "Inventory",
    subtitle:    "Manage your product catalog",
    rightSlotId: "search-mount",
});

mountSearch("search-mount", {
    placeholder: "Search products…",
    onInput: () => renderTable(),
});

document.getElementById("subheader-mount").outerHTML = renderSubheader({
    left: `
        <h3>Total Products</h3>
        <span class="badge badge-neutral" id="row-count">0</span>
        <button class="btn btn-primary btn-sm" id="add-product-btn" aria-label="Add product">
            <i class="ti ti-plus" aria-hidden="true"></i>
        </button>
    `,
    right: `<div class="cat-filter flex gap-1" id="cat-filter-mount"></div>`,
});

syncPageOffset();

// ─── Modals ───────────────────────────────────────────────────────────────────

const productModals = mountProductModals("modals-mount", {
    getExistingCategories,
    onSubmit:  handleFormSubmit,
    onDelete:  handleConfirmDelete,
});

function syncPageOffset() {
    const header    = document.querySelector(".header");
    const subheader = document.querySelector(".subheader");

    const totalHeight = (header?.offsetHeight ?? 0) + (subheader?.offsetHeight ?? 0);
    document.documentElement.style.setProperty("--page-offset", `${totalHeight}px`);
}

// ─── Data ────────────────────────────────────────────────────────────────────

async function loadProducts() {
    try {
        products = await getProducts();
    } catch (err) {
        console.error(err);
        showToast("Failed to load products.", "danger");
        products = [];
    }
    renderAll();
}

function getFilteredProducts() {
    const query = document.getElementById("search-input").value.toLowerCase().trim();
    return products.filter(p => {
        const matchesCategory = activeCategory === "All" || p.category === activeCategory;
        const matchesQuery =
            !query ||
            p.name.toLowerCase().includes(query) ||
            (p.category ?? "").toLowerCase().includes(query) ||
            (p.description ?? "").toLowerCase().includes(query);
        return matchesCategory && matchesQuery;
    });
}

function getExistingCategories() {
    return [...new Set(products.map(p => p.category).filter(Boolean))];
}

// ─── Render: filters ──────────────────────────────────────────────────────────

function renderAll() {
    renderCategoryFilter();
    renderTable();
}

function renderCategoryFilter() {
    const categories = ["All", ...new Set(products.map(p => p.category).filter(Boolean))];
    mountCatFilter("cat-filter-mount", {
        categories,
        active: activeCategory,
        onChange: (cat) => {
            activeCategory = cat;
            renderAll();
        },
    });
}

// ─── Render: product table ─────────────────────────────────────────────────────

function stockBadge(qty) {
    if (qty === 0) return `<span class="badge badge-danger">NO STOCK</span>`;
    if (qty <= 5) return `<span class="badge badge-warning">LOW STOCK</span>`;
    return `<span class="badge badge-success">AVAILABLE</span>`;
}

function renderProductRow(product) {
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

function renderTable() {
    const filtered = getFilteredProducts();
    document.getElementById("row-count").textContent = filtered.length;

    const tbody = document.getElementById("product-tbody");
    if (!tbody) return;

    tbody.innerHTML = filtered.length === 0
        ? renderEmptyState()
        : filtered.map(renderProductRow).join("");

    tbody.querySelectorAll(".edit-btn").forEach(btn =>
        btn.addEventListener("click", () => {
            const product = products.find(p => p.id === Number(btn.dataset.id));
            productModals.openEdit(product);
        })
    );
    tbody.querySelectorAll(".delete-btn").forEach(btn =>
        btn.addEventListener("click", () => productModals.openDelete(Number(btn.dataset.id)))
    );
}

// ─── Submit / delete (called by product-modals.js) ─────────────────────────────

async function handleFormSubmit({ payload, editingId, error }) {
    if (error) {
        showToast(error, "warning");
        return;
    }

    try {
        if (editingId) {
            await updateProduct(editingId, payload);
            showToast("Product updated.", "success");
        } else {
            await addProduct(payload);
            showToast("Product added.", "success");
        }
        productModals.closeForm();
        await loadProducts();
    } catch (err) {
        console.error(err);
        showToast("Something went wrong. Please try again.", "danger");
    }
}

async function handleConfirmDelete(id) {
    try {
        await deleteProduct(id);
        showToast("Product archived.", "success");
        productModals.closeDelete();
        await loadProducts();
    } catch (err) {
        console.error(err);
        showToast("Failed to archive product.", "danger");
    }
}

// ─── Event listeners ──────────────────────────────────────────────────────────
window.addEventListener("resize", syncPageOffset);
document.getElementById("add-product-btn").addEventListener("click", () => productModals.openAdd());

loadProducts();