import { openModal, closeModal } from "../modal/modal.js";

/**
 * Product modals component
 *
 * Renders the "add/edit product" form modal and the "delete product"
 * confirm modal, and owns all of their internal behavior: opening,
 * populating fields for edit, the category tag picker, and submit/delete
 * callbacks back out to the page.
 *
 * Usage:
 *   import { mountProductModals } from "../../components/modals/product-modals.js";
 *
 *   const productModals = mountProductModals("modals-mount", {
 *       getExistingCategories: () => [...],
 *       onSubmit:  (payload, editingId) => { ... },  // called with form data
 *       onDelete:  (id) => { ... },                   // called when archive confirmed
 *   });
 *
 *   productModals.openAdd();
 *   productModals.openEdit(product);
 *   productModals.openDelete(id);
 */
export function mountProductModals(mountId, { getExistingCategories, onSubmit, onDelete } = {}) {
    const mount = document.getElementById(mountId);
    if (!mount) return null;

    mount.innerHTML = `
        <!-- ADD/EDIT MODAL -->
        <div id="form-modal" class="modal-overlay">
            <div class="modal card">
                <div class="modal-header flex items-center justify-between">
                    <h3 id="modal-heading">Add product</h3>
                    <button class="btn-icon btn-ghost" id="modal-close-btn" aria-label="Close">
                        <i class="ti ti-x" aria-hidden="true"></i>
                    </button>
                </div>

                <form id="product-form">
                    <div class="field">
                        <label class="field-label" for="f-name">Product name</label>
                        <input type="text" id="f-name" class="input" placeholder="e.g. Wireless Mouse" required>
                    </div>

                    <div class="field">
                        <label class="field-label">Category</label>
                        <div id="category-tags" class="category-tags"></div>
                        <input type="text" id="f-category-input" class="input" placeholder="Type to add category…">
                        <div id="category-suggestions" class="category-suggestions"></div>
                    </div>

                    <div class="field">
                        <label class="field-label" for="f-description">Description</label>
                        <textarea id="f-description" class="input" placeholder="Brief product description…"></textarea>
                    </div>

                    <div class="flex gap-2">
                        <div class="field" style="flex:1">
                            <label class="field-label" for="f-price">Price (₱)</label>
                            <input type="number" id="f-price" class="input" placeholder="0.00" min="0" step="0.01" required>
                        </div>
                        <div class="field" style="flex:1">
                            <label class="field-label" for="f-stock">Stock qty</label>
                            <input type="number" id="f-stock" class="input" placeholder="0" min="0" step="1" required>
                        </div>
                    </div>

                    <div class="modal-footer flex justify-between gap-2">
                        <button type="button" class="btn btn-secondary" id="cancel-form-btn">Cancel</button>
                        <button type="submit" class="btn btn-primary" id="submit-btn">
                            <i class="ti ti-check" aria-hidden="true"></i>
                            <span id="submit-label">Add product</span>
                        </button>
                    </div>
                </form>
            </div>
        </div>

        <!-- DELETE CONFIRM MODAL -->
        <div id="delete-modal" class="modal-overlay">
            <div class="modal card" style="max-width:320px; text-align:center;">
                <div class="delete-icon">
                    <i class="ti ti-trash" aria-hidden="true"></i>
                </div>
                <h3>Delete product?</h3>
                <p>This product will be removed from the catalog.</p>
                <div class="modal-footer flex justify-between gap-2">
                    <button class="btn btn-secondary" id="cancel-delete-btn">Cancel</button>
                    <button class="btn btn-danger" id="confirm-delete-btn">
                        <i class="ti ti-archive" aria-hidden="true"></i> Delete
                    </button>
                </div>
            </div>
        </div>
    `;

    // ─── Element refs ───────────────────────────────────────────────────────────
    const stockInput  = document.getElementById("f-stock");
    const nameInput   = document.getElementById("f-name");
    const descInput   = document.getElementById("f-description");
    const priceInput  = document.getElementById("f-price");

    const tagsContainer        = document.getElementById("category-tags");
    const suggestionsContainer = document.getElementById("category-suggestions");
    const categoryInput        = document.getElementById("f-category-input");

    let editingId = null;
    let deletingId = null;
    let selectedCategories = [];

    // ─── Category tag UI ────────────────────────────────────────────────────────

    function renderCategoryUI(selected = []) {
        selectedCategories = selected;

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

        const existing = (getExistingCategories?.() ?? []).filter(c => !selectedCategories.includes(c));
        suggestionsContainer.innerHTML = existing.map(cat => `
            <button type="button" class="cat-pill" data-cat="${cat}">${cat}</button>
        `).join("");

        suggestionsContainer.querySelectorAll(".cat-pill").forEach(btn => {
            btn.addEventListener("click", () => {
                selectedCategories = [btn.dataset.cat];
                renderCategoryUI(selectedCategories);
            });
        });

        categoryInput.onkeydown = (e) => {
            if (e.key === "Enter") {
                e.preventDefault();
                const val = categoryInput.value.trim();
                if (val) {
                    selectedCategories = [val];
                    renderCategoryUI(selectedCategories);
                }
                categoryInput.value = "";
            }
        };
    }

    // ─── Form helpers ───────────────────────────────────────────────────────────

    function resetForm() {
        document.getElementById("product-form").reset();
        selectedCategories = [];
        renderCategoryUI([]);
        categoryInput.value = "";
        stockInput.placeholder = "0";
    }

    // ─── Public open methods ────────────────────────────────────────────────────

    function openAdd() {
        editingId = null;
        resetForm();
        document.getElementById("modal-heading").textContent = "Add product";
        document.getElementById("submit-label").textContent = "Add product";
        openModal("form-modal");
    }

    function openEdit(product) {
        if (!product) return;

        editingId = product.id;
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

    function openDelete(id) {
        deletingId = id;
        openModal("delete-modal");
    }

    // ─── Submit / delete handlers ───────────────────────────────────────────────

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
            onSubmit?.({ error: "Please fill in all fields correctly." });
            return;
        }

        await onSubmit?.({ payload, editingId });
    }

    async function handleConfirmDelete() {
        if (!deletingId) return;
        const id = deletingId;
        deletingId = null;
        await onDelete?.(id);
    }

    // ─── Wiring ──────────────────────────────────────────────────────────────────

    document.getElementById("cancel-form-btn").addEventListener("click", () => closeModal("form-modal"));
    document.getElementById("modal-close-btn").addEventListener("click", () => closeModal("form-modal"));
    document.getElementById("product-form").addEventListener("submit", handleFormSubmit);

    document.getElementById("cancel-delete-btn").addEventListener("click", () => closeModal("delete-modal"));
    document.getElementById("confirm-delete-btn").addEventListener("click", handleConfirmDelete);

    return {
        openAdd,
        openEdit,
        openDelete,
        closeForm:   () => closeModal("form-modal"),
        closeDelete: () => closeModal("delete-modal"),
    };
}