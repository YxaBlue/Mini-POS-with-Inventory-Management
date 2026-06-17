import { getProducts, addProduct, updateProduct, deleteProduct } from "../../api/productAPI.js";
import { renderSidebar, initSidebar } from "../../components/sidebar/sidebar.js";
import { showToast } from "../../components/toast/toast.js";
import { openModal, closeModal } from "../../components/modal/modal.js";
import { renderProductTable } from "../../components/product-table/product-table.js";
import { mountSearch } from "../../components/search/search.js";

let products = [];
let editingId = null;
let deletingId = null;
let activeCategory = "All";
let selectedCategories = [];

document.getElementById("sidebar-mount").outerHTML = renderSidebar("inventory");
initSidebar();

mountSearch("search-mount", {
    placeholder: "Search products…",
    onInput: () => renderTable(),
});

const stockInput  = document.getElementById("f-stock");
const nameInput   = document.getElementById("f-name");
const descInput   = document.getElementById("f-description");
const priceInput  = document.getElementById("f-price");

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

// ─── Render ───────────────────────────────────────────────────────────────────

function renderAll() {
    renderCategoryFilter();
    renderTable();
}

function renderCategoryFilter() {
    const categories = ["All", ...new Set(products.map(p => p.category).filter(Boolean))];
    const container = document.getElementById("cat-filter");

    container.innerHTML = categories
        .map(cat => `
            <button class="cat-pill ${cat === activeCategory ? "active" : ""}" data-category="${cat}">
                ${cat}
            </button>
        `)
        .join("");

    container.querySelectorAll(".cat-pill").forEach(btn => {
        btn.addEventListener("click", () => {
            activeCategory = btn.dataset.category;
            renderAll();
        });
    });
}

function renderTable() {
    const filtered = getFilteredProducts();
    document.getElementById("row-count").textContent = filtered.length;

    renderProductTable("product-tbody", filtered, {
        onEdit: openEditModal,
        onDelete: openDeleteModal,
    });
}

// ─── Category tag UI ──────────────────────────────────────────────────────────

function renderCategoryUI(selected = []) {
    selectedCategories = selected;

    const tagsContainer        = document.getElementById("category-tags");
    const suggestionsContainer = document.getElementById("category-suggestions");
    const input                = document.getElementById("f-category-input");

    // selected tags
    tagsContainer.innerHTML = selectedCategories.map(cat => `
        <span class="category-tag">
            ${cat}
            <button type="button" data-cat="${cat}" aria-label="Remove ${cat}">
                <i class="ti ti-x"></i>
            </button>
        </span>
    `).join("");

    tagsContainer.querySelectorAll("button").forEach(btn => {
        btn.addEventListener("click", () => {
            selectedCategories = selectedCategories.filter(c => c !== btn.dataset.cat);
            renderCategoryUI(selectedCategories);
        });
    });

    // existing categories as suggestion pills (excluding already selected)
    const existing = getExistingCategories().filter(c => !selectedCategories.includes(c));
    suggestionsContainer.innerHTML = existing.map(cat => `
        <button type="button" class="cat-pill" data-cat="${cat}">${cat}</button>
    `).join("");

    suggestionsContainer.querySelectorAll(".cat-pill").forEach(btn => {
        btn.addEventListener("click", () => {
            selectedCategories = [btn.dataset.cat];
            renderCategoryUI(selectedCategories);
        });
    });

    // type a new category and press Enter to set it
    input.onkeydown = (e) => {
        if (e.key === "Enter") {
            e.preventDefault();
            const val = input.value.trim();
            if (val) {
                selectedCategories = [val];
                renderCategoryUI(selectedCategories);
            }
            input.value = "";
        }
    };
}

// ─── Form helpers ─────────────────────────────────────────────────────────────

function resetForm() {
    document.getElementById("product-form").reset();
    selectedCategories = [];
    renderCategoryUI([]);
    document.getElementById("f-category-input").value = "";
    stockInput.placeholder = "0";
}

// ─── Modals ───────────────────────────────────────────────────────────────────

function openAddModal() {
    editingId = null;
    resetForm();
    document.getElementById("modal-heading").textContent = "Add product";
    document.getElementById("submit-label").textContent = "Add product";
    openModal("form-modal");
}

function openEditModal(id) {
    const product = products.find(p => p.id === id);
    if (!product) return;

    editingId = id;
    resetForm();

    document.getElementById("modal-heading").textContent = "Edit product";
    document.getElementById("submit-label").textContent = "Save changes";

    nameInput.value  = product.name;
    descInput.value  = product.description ?? "";
    priceInput.value = product.price;
    stockInput.value = product.stock_quantity;

    renderCategoryUI(product.category ? [product.category] : []);

    openModal("form-modal");
}

function openDeleteModal(id) {
    deletingId = id;
    openModal("delete-modal");
}

// ─── Submit ───────────────────────────────────────────────────────────────────

async function handleFormSubmit(e) {
    e.preventDefault();

    const categoryValue = selectedCategories[0] ?? "General";

    const payload = {
        name:           nameInput.value.trim(),
        category:       categoryValue,
        description:    descInput.value.trim(),
        price:          parseFloat(priceInput.value),
        stock_quantity: parseInt(stockInput.value, 10),
    };

    if (
        !payload.name ||
        !payload.category ||
        isNaN(payload.price) || payload.price < 0 ||
        isNaN(payload.stock_quantity) || payload.stock_quantity < 0
    ) {
        showToast("Please fill in all fields correctly.", "warning");
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
        closeModal("form-modal");
        await loadProducts();
    } catch (err) {
        console.error(err);
        showToast("Something went wrong. Please try again.", "danger");
    }
}

async function handleConfirmDelete() {
    if (!deletingId) return;

    try {
        await deleteProduct(deletingId);
        showToast("Product archived.", "success");
        closeModal("delete-modal");
        await loadProducts();
    } catch (err) {
        console.error(err);
        showToast("Failed to archive product.", "danger");
    } finally {
        deletingId = null;
    }
}

// ─── Event listeners ──────────────────────────────────────────────────────────

document.getElementById("add-product-btn").addEventListener("click", openAddModal);
document.getElementById("cancel-form-btn").addEventListener("click", () => closeModal("form-modal"));
document.getElementById("modal-close-btn").addEventListener("click", () => closeModal("form-modal"));
document.getElementById("product-form").addEventListener("submit", handleFormSubmit);

document.getElementById("cancel-delete-btn").addEventListener("click", () => closeModal("delete-modal"));
document.getElementById("confirm-delete-btn").addEventListener("click", handleConfirmDelete);

loadProducts();