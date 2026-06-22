import { getSales }                   from "../../api/saleAPI.js";
import { renderSidebar, initSidebar } from "../../components/navigation/sidebar/sidebar.js";
import { showToast }                  from "../../components/output/toast/toast.js";
import { openModal, closeModal }      from "../../components/modals/modal/modal.js";
import { renderHeader }               from "../../components/headers/header/header.js";
import { mountSearch }                from "../../components/input/search/search.js";
import { mountStatGrid }              from "../../components/output/stat-card/stat-card.js";

// ── Sidebar ──────────────────────────────────────────────────────────────────
document.getElementById("sidebar-mount").outerHTML = renderSidebar("sales");
initSidebar();

// ── Header ──────────────────────────────────────────────────────────────────
document.getElementById("header-mount").outerHTML = renderHeader({
    title:       "Transactions",
    subtitle:    "View past sales and receipts",
    rightSlotId: "search-mount",
});

// ── State ─────────────────────────────────────────────────────────────────────
let sales = [];
let searchQuery = "";

// ── Search Mount ─────────────────────────────────────────────────────────────────────
mountSearch("search-mount", {
    placeholder: "Search by receipt number…",
    onInput: (query) => { searchQuery = query; renderTable(); },
});

// ── Data ─────────────────────────────────────────────────────────────────────

async function loadSales() {
    try {
        sales = await getSales();
    } catch (err) {
        console.error(err);
        showToast("Failed to load transactions.", "danger");
        sales = [];
    }
    renderAll();
}

function getFilteredSales() {
    if (!searchQuery) return sales;
    return sales.filter(s => s.receipt_number.toLowerCase().includes(searchQuery));
}

// ── Render ────────────────────────────────────────────────────────────────────

function renderAll() {
    renderStats();
    renderTable();
}

function renderStats() {
    const totalCount   = sales.length;
    const totalRevenue = sales.reduce((sum, s) => sum + parseFloat(s.total_amount), 0);

    const todayStr = new Date().toDateString();
    const todayRevenue = sales
        .filter(s => new Date(s.transaction_date).toDateString() === todayStr)
        .reduce((sum, s) => sum + parseFloat(s.total_amount), 0);

    mountStatGrid("stats-mount", [
        { id: "stat-count",   label: "Total transactions", value: totalCount },
        { id: "stat-revenue", label: "Total revenue",      value: `₱${totalRevenue.toFixed(2)}` },
        { id: "stat-today",   label: "Today's sales",      value: `₱${todayRevenue.toFixed(2)}` },
    ]);
}

function renderTable() {
    const filtered = getFilteredSales();
    const tbody     = document.getElementById("sales-tbody");

    document.getElementById("row-count").textContent = filtered.length;

    if (!filtered.length) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6">
                    <div class="sales-empty">
                        <i class="ti ti-receipt-off" aria-hidden="true"></i>
                        <p>No transactions found</p>
                    </div>
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = filtered.map(sale => saleRowTemplate(sale)).join("");

    tbody.querySelectorAll(".view-details-btn").forEach(btn => {
        btn.addEventListener("click", () => {
            const id = parseInt(btn.dataset.id);
            const sale = sales.find(s => s.id === id);
            if (sale) openDetailsModal(sale);
        });
    });
}

function saleRowTemplate(sale) {
    const { date, time } = formatDateTime(sale.transaction_date);
    const itemCount = sale.items.reduce((sum, i) => sum + i.quantity, 0);

    return `
        <tr>
            <td data-label="Receipt">
                <span class="font-mono receipt-number-cell">${sale.receipt_number}</span>
            </td>
            <td data-label="Date">${date}</td>
            <td data-label="Time">${time}</td>
            <td data-label="Items">
                <span class="items-count-badge">${itemCount} item${itemCount !== 1 ? "s" : ""}</span>
            </td>
            <td data-label="Total">
                <span class="font-mono" style="font-weight:700;">₱${parseFloat(sale.total_amount).toFixed(2)}</span>
            </td>
            <td data-label="">
                <button class="view-details-btn" data-id="${sale.id}">
                    <i class="ti ti-eye" aria-hidden="true"></i>
                    View
                </button>
            </td>
        </tr>
    `;
}

// ── Details modal ────────────────────────────────────────────────────────────

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

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatDateTime(isoString) {
    const d = new Date(isoString);
    return {
        date: d.toLocaleDateString("en-PH", { year: "numeric", month: "short", day: "numeric" }),
        time: d.toLocaleTimeString("en-PH", { hour: "2-digit", minute: "2-digit" }),
    };
}

// ── Init ──────────────────────────────────────────────────────────────────────

loadSales();