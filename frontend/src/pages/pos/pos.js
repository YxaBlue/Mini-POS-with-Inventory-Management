import { getProducts }                from "../../api/productAPI.js";
import { createSale }                 from "../../api/saleAPI.js";
import { renderSidebar, initSidebar } from "../../components/navigation/sidebar/sidebar.js";
import { showToast }                  from "../../components/output/toast/toast.js";
import { mountCart }                  from "../../components/input/cart/cart.js";
import { renderProductGrid }          from "../../components/input/product-card/product-card.js";
import { showReceipt }                from "../../components/modals/receipt-modal/receipt-modal.js";
import { renderHeader }               from "../../components/headers/header/header.js";
import { mountSearch }                from "../../components/input/search/search.js";
import { renderSubheader }            from "../../components/headers/subheader/subheader.js";
import { mountCatFilter }             from "../../components/output/cat-filter/cat-filter.js";

// ── Sidebar ──────────────────────────────────────────────────────────────────

document.getElementById("sidebar-mount").outerHTML = renderSidebar("pos");
initSidebar();

// ── Header ──────────────────────────────────────────────────────────────────

document.getElementById("header-mount").outerHTML = renderHeader({
    title:       "Point of Sale",
    subtitle:    "Select products to add to cart",
    rightSlotId: "search-mount",
});

document.getElementById("subheader-mount").outerHTML = renderSubheader({
    right: `<div class="cat-filter flex gap-1" id="cat-filter-mount"></div>`,
});

syncPageOffset();
window.addEventListener("resize", syncPageOffset);

// ── State ─────────────────────────────────────────────────────────────────────

let products       = [];
let activeCategory = "All";
let searchQuery     = "";

// ── Search mount ─────────────────────────────────────────────────────────────

mountSearch("search-mount", {
    placeholder: "Search products…",
    onInput: (query) => { searchQuery = query; renderGrid(); },
});

function syncPageOffset() {
    const header    = document.querySelector(".header");
    const subheader = document.querySelector(".subheader");

    const totalHeight = (header?.offsetHeight ?? 0) + (subheader?.offsetHeight ?? 0);
    document.documentElement.style.setProperty("--page-offset", `${totalHeight}px`);
}

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
    return products.filter(p => {
        const matchesCategory = activeCategory === "All" || p.category === activeCategory;
        const matchesQuery    =
            !searchQuery ||
            p.name.toLowerCase().includes(searchQuery) ||
            (p.category    ?? "").toLowerCase().includes(searchQuery) ||
            (p.description ?? "").toLowerCase().includes(searchQuery);
        return matchesCategory && matchesQuery;
    });
}

// ── Render ────────────────────────────────────────────────────────────────────

function renderAll() {
    renderCategories();
    renderGrid();
}

function renderCategories() {
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
        await loadProducts();

        showToast("Sale completed successfully.", "success");
        showReceipt(enrichedSale, () => {});

    } catch (err) {
        console.error(err);
        showToast(err.message || "Checkout failed. Please try again.", "danger");
        throw err;
    }
}

// ── Init ──────────────────────────────────────────────────────────────────────

loadProducts();