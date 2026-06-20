import { getProducts }                from "../../api/productAPI.js";
import { getSales }                   from "../../api/saleAPI.js";
import { renderSidebar, initSidebar } from "../../components/sidebar/sidebar.js";
import { renderHeader }               from "../../components/header/header.js";
import { showToast }                  from "../../components/toast/toast.js";

// ── Sidebar & Header ─────────────────────────────────────────────────────────

document.getElementById("sidebar-mount").outerHTML = renderSidebar("dashboard");
initSidebar();

document.getElementById("header-mount").outerHTML = renderHeader({
    title:    "Dashboard",
    subtitle: "Overview of your store",
});

// ── State ─────────────────────────────────────────────────────────────────────

let products       = [];
let sales          = [];
let activeCategory = "All";

const RECENT_LIMIT = 10; // how many recent transactions to show

// ── Data ─────────────────────────────────────────────────────────────────────

async function loadAll() {
    try {
        [products, sales] = await Promise.all([getProducts(), getSales()]);
    } catch (err) {
        console.error(err);
        showToast("Failed to load dashboard data.", "danger");
    }
    renderAll();
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function todayStr() {
    return new Date().toDateString();
}

function formatDate(isoString) {
    return new Date(isoString).toLocaleDateString("en-PH", {
        month: "short",
        day:   "numeric",
        year:  "numeric",
    });
}

function stockBadge(qty) {
    if (qty === 0)  return `<span class="badge badge-danger">Out of stock</span>`;
    if (qty <= 5)   return `<span class="badge badge-warning">Low stock</span>`;
    return `<span class="badge badge-success">In stock</span>`;
}

// ── Render ────────────────────────────────────────────────────────────────────

function renderAll() {
    renderStats();
    renderCategoryFilter();
    renderStockTable();
    renderRecentTransactions();
}

function renderStats() {
    const totalProducts = products.length;

    const todaySales   = sales.filter(s => new Date(s.transaction_date).toDateString() === todayStr());
    const txToday      = todaySales.length;
    const txTotal      = sales.length;
    const revToday     = todaySales.reduce((sum, s) => sum + parseFloat(s.total_amount), 0);
    const revTotal     = sales.reduce((sum, s) => sum + parseFloat(s.total_amount), 0);

    document.getElementById("stat-total-products").textContent = totalProducts;
    document.getElementById("stat-tx-today").textContent       = txToday;
    document.getElementById("stat-tx-total").textContent       = txTotal;
    document.getElementById("stat-rev-today").textContent      = `₱${revToday.toFixed(2)}`;
    document.getElementById("stat-rev-total").textContent      = `₱${revTotal.toFixed(2)}`;
}

function renderCategoryFilter() {
    const categories  = ["All", ...new Set(products.map(p => p.category).filter(Boolean))];
    const container   = document.getElementById("stock-cat-filter");

    container.innerHTML = categories.map(cat => `
        <button class="cat-pill ${cat === activeCategory ? "active" : ""}" data-cat="${cat}">
            ${cat}
        </button>
    `).join("");

    container.querySelectorAll(".cat-pill").forEach(btn => {
        btn.addEventListener("click", () => {
            activeCategory = btn.dataset.cat;
            renderCategoryFilter();
            renderStockTable();
        });
    });
}

function renderStockTable() {
    const filtered = activeCategory === "All"
        ? products
        : products.filter(p => p.category === activeCategory);

    document.getElementById("stock-count").textContent = filtered.length;

    const tbody = document.getElementById("stock-tbody");

    if (!filtered.length) {
        tbody.innerHTML = `
            <tr><td colspan="4">
                <div class="dash-empty">
                    <i class="ti ti-package-off" aria-hidden="true"></i>
                    No products found
                </div>
            </td></tr>
        `;
        return;
    }

    tbody.innerHTML = filtered.map(p => `
        <tr>
            <td class="td-id">#${p.id}</td>
            <td class="td-name">${p.name}</td>
            <td class="td-stock">${p.stock_quantity}</td>
            <td>${stockBadge(p.stock_quantity)}</td>
        </tr>
    `).join("");
}

function renderRecentTransactions() {
    // Sort newest first, then take the first RECENT_LIMIT
    const recent = [...sales]
        .sort((a, b) => new Date(b.transaction_date) - new Date(a.transaction_date))
        .slice(0, RECENT_LIMIT);

    document.getElementById("recent-count").textContent = recent.length;

    const tbody = document.getElementById("recent-tbody");

    if (!recent.length) {
        tbody.innerHTML = `
            <tr><td colspan="4">
                <div class="dash-empty">
                    <i class="ti ti-receipt-off" aria-hidden="true"></i>
                    No transactions yet
                </div>
            </td></tr>
        `;
        return;
    }

    tbody.innerHTML = recent.map(sale => {
        const itemCount = sale.items?.reduce((sum, i) => sum + i.quantity, 0) ?? "—";

        return `
            <tr>
                <td class="td-receipt">${sale.receipt_number}</td>
                <td>${formatDate(sale.transaction_date)}</td>
                <td>${itemCount}</td>
                <td class="td-amount">₱${parseFloat(sale.total_amount).toFixed(2)}</td>
            </tr>
        `;
    }).join("");
}

// ── Init ──────────────────────────────────────────────────────────────────────

loadAll();