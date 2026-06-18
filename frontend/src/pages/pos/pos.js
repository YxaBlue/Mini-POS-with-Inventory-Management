import { getProducts }                         from "../../api/productAPI.js";
import { createSale }                           from "../../api/saleAPI.js";
import { renderSidebar, initSidebar }           from "../../components/sidebar/sidebar.js";
import { showToast }                            from "../../components/toast/toast.js";
import { mountCart }                            from "../../components/cart/cart.js";
import { renderProductGrid }                    from "../../components/product-card/product-card.js";
import { showReceipt }                          from "../../components/receipt-modal/receipt-modal.js";

// ── Sidebar ──────────────────────────────────────────────────────────────────

document.getElementById("sidebar-mount").outerHTML = renderSidebar("pos");
initSidebar();

// ── State ─────────────────────────────────────────────────────────────────────

let products       = [];
let activeCategory = "All";

// ── Cart mount ───────────────────────────────────────────────────────────────

const cart = mountCart("cart-mount", {
    onCheckout: handleCheckout,
});

// ── Data ─────────────────────────────────────────────────────────────────────

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
    const query = document.getElementById("pos-search").value.toLowerCase().trim();

    return products.filter(p => {
        const matchesCategory = activeCategory === "All" || p.category === activeCategory;
        const matchesQuery    =
            !query ||
            p.name.toLowerCase().includes(query) ||
            (p.category  ?? "").toLowerCase().includes(query) ||
            (p.description ?? "").toLowerCase().includes(query);
        return matchesCategory && matchesQuery;
    });
}

// ── Render ────────────────────────────────────────────────────────────────────

function renderAll() {
    renderCategories();
    renderGrid();
}

function renderCategories() {
    const categories  = ["All", ...new Set(products.map(p => p.category).filter(Boolean))];
    const container   = document.getElementById("cat-filter");

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

function renderGrid() {
    renderProductGrid("product-grid-mount", getFilteredProducts(), {
        onAddToCart: (product) => {
            cart.addItem(product);
        },
    });
}

// ── Checkout ──────────────────────────────────────────────────────────────────

async function handleCheckout(cartItems) {
    try {
        const sale = await createSale(cartItems);

        // The API returns { id, receipt_number, total_amount } but not item names.
        // Enrich with names from local state for the receipt display.
        const enrichedSale = {
            ...sale,
            items: cartItems.map(ci => {
                const product = products.find(p => p.id === ci.product_id);
                return {
                    name:     product?.name ?? `Product #${ci.product_id}`,
                    quantity: ci.quantity,
                    price:    product?.price ?? 0,
                    subtotal: (product?.price ?? 0) * ci.quantity,
                };
            }),
        };

        cart.clear();
        await loadProducts(); // refresh stock quantities

        showReceipt(enrichedSale, () => {
            // onClose callback — nothing extra needed, cart is already cleared
        });

    } catch (err) {
        console.error(err);
        showToast(err.message || "Checkout failed. Please try again.", "danger");
        throw err; // rethrow so cart re-enables the checkout button
    }
}

// ── Search ────────────────────────────────────────────────────────────────────

document.getElementById("pos-search").addEventListener("input", renderGrid);

// ── Init ──────────────────────────────────────────────────────────────────────

loadProducts();