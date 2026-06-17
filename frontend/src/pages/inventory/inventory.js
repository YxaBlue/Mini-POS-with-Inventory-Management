import { getProducts, addProduct, updateProduct, deleteProduct } from "../../api/productAPI.js";
import { renderSidebar, initSidebar } from "../../components/sidebar/sidebar.js";
import { showToast } from "../../components/toast/toast.js";
import { openModal, closeModal } from "../../components/modal/modal.js";
import { renderProductTable } from "../../components/product-table/product-table.js";

let products = [];
let editingId = null;
let restockingId = null;   // NEW: tracks restock mode separately from edit mode
let restockMode = "add";   // NEW: "add" or "set"
let deletingId = null;
let activeCategory = "All";

document.getElementById("sidebar-mount").outerHTML = renderSidebar("inventory");
initSidebar();

const categorySelect = document.getElementById("f-category");
const categoryNewInput = document.getElementById("f-category-new");
const stockModeToggle = document.getElementById("stock-mode-toggle");   // NEW
const stockInput = document.getElementById("f-stock");                  // NEW
const nameInput = document.getElementById("f-name");                    // NEW (for disabling in restock mode)
const descInput = document.getElementById("f-description");             // NEW
const priceInput = document.getElementById("f-price");                 // NEW

categorySelect.addEventListener("change", () => {
    if (categorySelect.value === "__new__") {
        categoryNewInput.style.display = "block";
        categoryNewInput.focus();
    } else {
        categoryNewInput.style.display = "none";
        categoryNewInput.value = "";
    }
});

// NEW: handle +Add / Set exact toggle clicks
stockModeToggle.querySelectorAll(".mode-btn").forEach(btn => {
    btn.addEventListener("click", () => {
        restockMode = btn.dataset.mode;
        stockModeToggle.querySelectorAll(".mode-btn").forEach(b =>
            b.classList.toggle("active", b.dataset.mode === restockMode)
        );
        stockInput.value = "";
        stockInput.placeholder = restockMode === "add" ? "Quantity to add" : "New total stock";
        stockInput.focus();
    });
});

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
    const query = document.getElementById("search-input").value.toLowerCase();
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
        onRestock: openRestockModal,   // NEW
    });
}

// NEW: reset toggles fields back to normal editable Add/Edit state
function setFieldsEditable(editable) {
    nameInput.disabled = !editable;
    categorySelect.disabled = !editable;
    descInput.disabled = !editable;
    priceInput.disabled = !editable;
}

function resetForm() {
    document.getElementById("product-form").reset();
    document.getElementById("f-category").value = "General";
    categoryNewInput.style.display = "none";
    categoryNewInput.value = "";
    stockModeToggle.style.display = "none";   // NEW
    stockInput.placeholder = "0";              // NEW
    setFieldsEditable(true);                   // NEW
}

function openAddModal() {
    editingId = null;
    restockingId = null;   // NEW
    resetForm();
    document.getElementById("modal-heading").textContent = "Add product";
    document.getElementById("submit-label").textContent = "Add product";
    openModal("form-modal");
}

function openEditModal(id) {
    const product = products.find(p => p.id === id);
    if (!product) return;

    editingId = id;
    restockingId = null;   // NEW
    resetForm();            // NEW: ensures restock UI is hidden, fields editable

    document.getElementById("modal-heading").textContent = "Edit product";
    document.getElementById("submit-label").textContent = "Save changes";

    nameInput.value = product.name;
    descInput.value = product.description ?? "";
    priceInput.value = product.price;
    stockInput.value = product.stock_quantity;

    const knownCategories = ["General", "Electronics", "Beverages", "Food", "Accessories"];
    const productCategory = product.category ?? "General";

    if (knownCategories.includes(productCategory)) {
        categorySelect.value = productCategory;
        categoryNewInput.style.display = "none";
        categoryNewInput.value = "";
    } else {
        categorySelect.value = "__new__";
        categoryNewInput.style.display = "block";
        categoryNewInput.value = productCategory;
    }

    openModal("form-modal");
}

// NEW: open the same modal in restock mode
function openRestockModal(id) {
    const product = products.find(p => p.id === id);
    if (!product) return;

    editingId = null;
    restockingId = id;
    restockMode = "add";

    resetForm();
    setFieldsEditable(false);   // lock name/category/description/price as context only

    document.getElementById("modal-heading").textContent = `Restock — ${product.name}`;
    document.getElementById("submit-label").textContent = "Update stock";

    nameInput.value = product.name;
    categorySelect.value = "General"; // irrelevant while disabled, just avoid blank
    descInput.value = product.description ?? "";
    priceInput.value = product.price;

    stockModeToggle.style.display = "flex";
    stockModeToggle.querySelectorAll(".mode-btn").forEach(b =>
        b.classList.toggle("active", b.dataset.mode === "add")
    );
    stockInput.placeholder = "Quantity to add";
    stockInput.value = "";

    openModal("form-modal");
    stockInput.focus();
}

async function handleFormSubmit(e) {
    e.preventDefault();

    // NEW: restock mode has its own simpler submit path
    if (restockingId) {
        const product = products.find(p => p.id === restockingId);
        if (!product) return;

        const enteredValue = parseInt(stockInput.value, 10);
        if (isNaN(enteredValue) || enteredValue < 0) {
            showToast("Please enter a valid quantity.", "warning");
            return;
        }

        const newStock = restockMode === "add"
            ? product.stock_quantity + enteredValue
            : enteredValue;

        try {
            await updateProduct(restockingId, { ...product, stock_quantity: newStock });
            showToast("Stock updated.", "success");
            closeModal("form-modal");
            await loadProducts();
        } catch (err) {
            console.error(err);
            showToast("Failed to update stock.", "danger");
        }
        return;
    }

    const categoryValue = categorySelect.value === "__new__"
        ? categoryNewInput.value.trim()
        : categorySelect.value;

    const payload = {
        name: nameInput.value.trim(),
        category: categoryValue,
        description: descInput.value.trim(),
        price: parseFloat(priceInput.value),
        stock_quantity: parseInt(stockInput.value, 10),
    };

    if (!payload.name || !payload.category || isNaN(payload.price) || payload.price < 0 || isNaN(payload.stock_quantity) || payload.stock_quantity < 0) {
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

function openDeleteModal(id) {
    deletingId = id;
    openModal("delete-modal");
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

document.getElementById("add-product-btn").addEventListener("click", openAddModal);
document.getElementById("cancel-form-btn").addEventListener("click", () => closeModal("form-modal"));
document.getElementById("modal-close-btn").addEventListener("click", () => closeModal("form-modal"));
document.getElementById("product-form").addEventListener("submit", handleFormSubmit);

document.getElementById("cancel-delete-btn").addEventListener("click", () => closeModal("delete-modal"));
document.getElementById("confirm-delete-btn").addEventListener("click", handleConfirmDelete);

document.getElementById("search-input").addEventListener("input", renderTable);

loadProducts();