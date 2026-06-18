/**
 * receipt-modal component
 *
 * Displays a sale receipt after a successful transaction.
 * Reuses the existing modal.js open/close system.
 *
 * Usage:
 *   import { showReceipt } from "../../components/receipt-modal/receipt-modal.js";
 *
 *   showReceipt({
 *       receipt_number: "RCP-20260619-143022-4821",
 *       total_amount:   349.97,
 *       items:          [{ name, quantity, price, subtotal }]
 *   }, onClose);
 */

import { openModal, closeModal } from "../modal/modal.js";

export function showReceipt(sale, onClose) {
    const content = document.getElementById("receipt-modal-content");
    if (!content) return;

    content.innerHTML = receiptTemplate(sale);

    // New sale button
    document.getElementById("receipt-new-btn")?.addEventListener("click", () => {
        closeModal("receipt-modal");
        onClose?.();
    });

    openModal("receipt-modal");
}

function receiptTemplate(sale) {
    const now  = new Date();
    const date = now.toLocaleDateString("en-PH", { year: "numeric", month: "long", day: "numeric" });
    const time = now.toLocaleTimeString("en-PH", { hour: "2-digit", minute: "2-digit" });

    return `
        <div class="receipt">
            <div class="receipt-header">
                <div class="receipt-brand">
                    <span class="receipt-logo">🏪</span>
                    <div>
                        <p class="receipt-store-name">Mini POS</p>
                        <p class="receipt-tagline">Thank you for your purchase</p>
                    </div>
                </div>
                <div class="receipt-meta">
                    <div class="receipt-meta-row">
                        <span>Receipt</span>
                        <span class="font-mono receipt-number">${sale.receipt_number}</span>
                    </div>
                    <div class="receipt-meta-row">
                        <span>Date</span>
                        <span>${date}</span>
                    </div>
                    <div class="receipt-meta-row">
                        <span>Time</span>
                        <span>${time}</span>
                    </div>
                </div>
            </div>

            <div class="receipt-divider"><span>Items</span></div>

            <div class="receipt-items">
                ${sale.items.map(item => `
                    <div class="receipt-item">
                        <div class="receipt-item-left">
                            <p class="receipt-item-name">${item.name}</p>
                            <span class="receipt-item-qty font-mono">
                                ${item.quantity} × ₱${parseFloat(item.price).toFixed(2)}
                            </span>
                        </div>
                        <span class="receipt-item-subtotal font-mono">
                            ₱${parseFloat(item.subtotal ?? item.price * item.quantity).toFixed(2)}
                        </span>
                    </div>
                `).join("")}
            </div>

            <div class="receipt-divider"><span>Total</span></div>

            <div class="receipt-total">
                <span>Amount due</span>
                <span class="receipt-total-amount font-mono">₱${parseFloat(sale.total_amount).toFixed(2)}</span>
            </div>

            <button class="btn btn-primary receipt-new-btn" id="receipt-new-btn">
                <i class="ti ti-plus" aria-hidden="true"></i>
                New sale
            </button>
        </div>
    `;
}