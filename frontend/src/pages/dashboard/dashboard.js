import { getProducts }                from "../../api/productAPI.js";
import { getSales }                   from "../../api/saleAPI.js";
import { renderSidebar, initSidebar } from "../../components/navigation/sidebar/sidebar.js";
import { renderHeader }               from "../../components/headers/header/header.js";
import { showToast }                  from "../../components/output/toast/toast.js";
import { mountStatGrid }              from "../../components/output/stat-card/stat-card.js";
import { renderWidget }               from "../../components/output/widget/widget.js";
import { mountCatFilter }             from "../../components/output/cat-filter/cat-filter.js";
import { openModal, closeModal }      from "../../components/modals/modal/modal.js";

// ── Sidebar & Header ─────────────────────────────────────────────────────────

document.getElementById("sidebar-mount").outerHTML = renderSidebar("dashboard");
initSidebar();

document.getElementById("header-mount").outerHTML = renderHeader({
    title:    "Dashboard",
    subtitle: "Overview of your store",
});

// ── Widgets ──────────────────────────────────────────────────────────────────

document.getElementById("stock-widget-mount").outerHTML = renderWidget({
    title:        "Current stock",
    countId:      "stock-count",
    viewAllHref:  "../inventory/inventory.html",
    catFilterId:  "stock-cat-filter",
    tableHeaders: ["ID", "Product", "Stock", "Status"],
    colWidths:    ["70px", "200px", "90px", "150px"],
    tbodyId:      "stock-tbody",
});

document.getElementById("recent-widget-mount").outerHTML = renderWidget({
    title:        "Recent transactions",
    countId:      "recent-count",
    viewAllHref:  "../sales/sales.html",
    tableHeaders: ["Receipt", "Date", "Items", "Total", ""],
    colWidths:    ["220px", "120px", "80px", "110px", "125px"],
    tbodyId:      "recent-tbody",
});

// ── State ─────────────────────────────────────────────────────────────────────

let products       = [];
let sales          = [];
let activeCategory = "All";

const RECENT_LIMIT = 10;

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
    if (qty === 0)  return `<span class="badge badge-danger">NO STOCK</span>`;
    if (qty <= 5)   return `<span class="badge badge-warning">LOW STOCK</span>`;
    return `<span class="badge badge-success">IN STOCK</span>`;
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

    const todaySales = sales.filter(s => new Date(s.transaction_date).toDateString() === todayStr());
    const txToday     = todaySales.length;
    const txTotal     = sales.length;
    const revToday    = todaySales.reduce((sum, s) => sum + parseFloat(s.total_amount), 0);
    const revTotal    = sales.reduce((sum, s) => sum + parseFloat(s.total_amount), 0);

    mountStatGrid("stats-mount", [
        { id: "stat-total-products", label: "Total products",     value: totalProducts,             },
        { id: "stat-tx-today",       label: "Transactions today", value: txToday,                   },
        { id: "stat-tx-total",       label: "Total transactions", value: txTotal,                   },
        { id: "stat-rev-today",      label: "Revenue today",      value: `₱${revToday.toFixed(2)}`, },
        { id: "stat-rev-total",      label: "Total revenue",      value: `₱${revTotal.toFixed(2)}`, },
    ]);
}

function renderCategoryFilter() {
    const categories = ["All", ...new Set(products.map(p => p.category).filter(Boolean))];

    mountCatFilter("stock-cat-filter", {
        categories,
        active: activeCategory,
        onChange: (cat) => {
            activeCategory = cat;
            renderCategoryFilter();
            renderStockTable();
        },
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
    const recent = [...sales]
        .sort((a, b) => new Date(b.transaction_date) - new Date(a.transaction_date))
        .slice(0, RECENT_LIMIT);

    document.getElementById("recent-count").textContent = recent.length;

    const tbody = document.getElementById("recent-tbody");

    if (!recent.length) {
        tbody.innerHTML = `
            <tr><td colspan="5">
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
                <td>
                    <button class="view-details-btn" data-id="${sale.id}">
                        <i class="ti ti-eye" aria-hidden="true"></i>
                        View
                    </button>
                </td>
            </tr>
        `;
    }).join("");

    tbody.querySelectorAll(".view-details-btn").forEach(btn => {
        btn.addEventListener("click", () => {
            const id = parseInt(btn.dataset.id);
            const sale = sales.find(s => s.id === id);
            if (sale) openDetailsModal(sale);
        });
    });
}

function openDetailsModal(sale) {
    const content = document.getElementById("details-modal-content");
    content.innerHTML = detailsTemplate(sale);

    content.querySelector(".tx-detail-close")?.addEventListener("click", () => {
        closeModal("details-modal");
    });

    openModal("details-modal");
}

function detailsTemplate(sale) {
    const { date, time } = formatDateTime(sale.transaction_date);

    return `
        <div class="tx-detail">
            <div class="tx-detail-header">
                <div class="tx-detail-title">
                    <h3>Transaction details</h3>
                    <span class="tx-detail-receipt font-mono">${sale.receipt_number}</span>
                </div>
                <button class="tx-detail-close" aria-label="Close">
                    <i class="ti ti-x" aria-hidden="true"></i>
                </button>
            </div>

            <div class="tx-detail-meta">
                <div class="tx-detail-meta-row">
                    <span>Date</span>
                    <span>${date}</span>
                </div>
                <div class="tx-detail-meta-row">
                    <span>Time</span>
                    <span>${time}</span>
                </div>
                <div class="tx-detail-meta-row">
                    <span>Items purchased</span>
                    <span>${sale.items.reduce((s, i) => s + i.quantity, 0)}</span>
                </div>
            </div>

            <div class="tx-divider"><span>Items</span></div>

            <div class="tx-items">
                ${sale.items.map(item => `
                    <div class="tx-item">
                        <div class="tx-item-left">
                            <p class="tx-item-name">${item.name}</p>
                            <span class="tx-item-qty font-mono">
                                ${item.quantity} × ₱${parseFloat(item.price).toFixed(2)}
                            </span>
                        </div>
                        <span class="tx-item-subtotal font-mono">
                            ₱${parseFloat(item.subtotal).toFixed(2)}
                        </span>
                    </div>
                `).join("")}
            </div>

            <div class="tx-divider"><span>Total</span></div>

            <div class="tx-total">
                <span>Amount paid</span>
                <span class="tx-total-amount font-mono">₱${parseFloat(sale.total_amount).toFixed(2)}</span>
            </div>
        </div>
    `;
}

function formatDateTime(isoString) {
    const d = new Date(isoString);
    return {
        date: d.toLocaleDateString("en-PH", { year: "numeric", month: "short", day: "numeric" }),
        time: d.toLocaleTimeString("en-PH", { hour: "2-digit", minute: "2-digit" }),
    };
}

// ── Init ──────────────────────────────────────────────────────────────────────

loadAll();