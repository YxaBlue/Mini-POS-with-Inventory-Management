export function mountCart(mountId, { onCheckout } = {}) {
    const container = document.getElementById(mountId);
    if (!container) return;

    let items = []; // [{ id, name, price, stock_quantity, quantity }]

    // ── Render ──────────────────────────────────────────────────────────────

    function render() {
        container.innerHTML = cartTemplate(items);
        bindEvents();
    }

    function bindEvents() {
        // Increase quantity
        container.querySelectorAll(".cart-qty-btn[data-action='inc']").forEach(btn => {
            btn.addEventListener("click", () => {
                const id = parseInt(btn.dataset.id);
                const item = items.find(i => i.id === id);
                if (item && item.quantity < item.stock_quantity) {
                    item.quantity++;
                    render();
                }
            });
        });

        // Decrease quantity
        container.querySelectorAll(".cart-qty-btn[data-action='dec']").forEach(btn => {
            btn.addEventListener("click", () => {
                const id = parseInt(btn.dataset.id);
                const item = items.find(i => i.id === id);
                if (!item) return;
                if (item.quantity > 1) {
                    item.quantity--;
                } else {
                    items = items.filter(i => i.id !== id);
                }
                render();
            });
        });

        // Remove item
        container.querySelectorAll(".cart-remove-btn").forEach(btn => {
            btn.addEventListener("click", () => {
                const id = parseInt(btn.dataset.id);
                items = items.filter(i => i.id !== id);
                render();
            });
        });

        // Clear all
        const clearBtn = container.querySelector("#cart-clear-btn");
        clearBtn?.addEventListener("click", () => {
            if (!items.length) return;
            items = [];
            render();
        });

        // Checkout
        const checkoutBtn = container.querySelector("#cart-checkout-btn");
        checkoutBtn?.addEventListener("click", async () => {
            if (!items.length) return;

            checkoutBtn.disabled = true;
            checkoutBtn.innerHTML = `<i class="ti ti-loader-2 spin" aria-hidden="true"></i> Processing…`;

            try {
                const cartItems = items.map(i => ({
                    product_id: i.id,
                    quantity:   i.quantity,
                }));
                await onCheckout?.(cartItems);
            } finally {
                checkoutBtn.disabled = false;
                checkoutBtn.innerHTML = `<i class="ti ti-shopping-cart-check" aria-hidden="true"></i> Checkout`;
            }
        });
    }

    // ── Public API ───────────────────────────────────────────────────────────

    function addItem(product) {
        const existing = items.find(i => i.id === product.id);
        if (existing) {
            if (existing.quantity < product.stock_quantity) {
                existing.quantity++;
            }
        } else {
            items.push({ ...product, quantity: 1 });
        }
        render();
    }

    function clear() {
        items = [];
        render();
    }

    function getItems() {
        return [...items];
    }

    // ── Init ────────────────────────────────────────────────────────────────
    render();

    return { addItem, clear, getItems };
}

// ── Template ─────────────────────────────────────────────────────────────────

function cartTemplate(items) {
    const total    = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
    const isEmpty  = items.length === 0;

    return `
        <div class="cart-panel">

            <div class="cart-header">
                <div class="flex items-center gap-2">
                    <i class="ti ti-shopping-cart" aria-hidden="true"></i>
                    <h3>Cart</h3>
                    ${items.length
                        ? `<span class="badge badge-info">${items.reduce((s, i) => s + i.quantity, 0)}</span>`
                        : ""}
                </div>
                <button class="btn btn-ghost btn-icon" id="cart-clear-btn" aria-label="Clear cart" ${isEmpty ? "disabled" : ""}>
                    <i class="ti ti-trash" aria-hidden="true"></i>
                </button>
            </div>

            <div class="cart-items ${isEmpty ? "cart-empty-state" : ""}">
                ${isEmpty
                    ? `<div class="cart-empty">
                            <i class="ti ti-shopping-cart-off" aria-hidden="true"></i>
                            <p>Cart is empty</p>
                            <span>Tap a product to add it</span>
                       </div>`
                    : items.map(item => cartItemTemplate(item)).join("")
                }
            </div>

            <div class="cart-footer">
                <div class="cart-totals">
                    <div class="cart-total-row">
                        <span class="text-secondary">Items</span>
                        <span class="font-mono">${items.reduce((s, i) => s + i.quantity, 0)}</span>
                    </div>
                    <div class="cart-total-row cart-total-main">
                        <span>Total</span>
                        <span class="font-mono cart-total-amount">₱${total.toFixed(2)}</span>
                    </div>
                </div>

                <button
                    class="btn btn-primary cart-checkout-btn"
                    id="cart-checkout-btn"
                    ${isEmpty ? "disabled" : ""}
                >
                    <i class="ti ti-shopping-cart-check" aria-hidden="true"></i>
                    Checkout
                </button>
            </div>
        </div>
    `;
}

function cartItemTemplate(item) {
    const subtotal = item.price * item.quantity;
    const atMax    = item.quantity >= item.stock_quantity;

    return `
        <div class="cart-item">
            <div class="cart-item-top">
                <p class="cart-item-name">${item.name}</p>
                <button
                    class="cart-remove-btn"
                    data-id="${item.id}"
                    aria-label="Remove ${item.name}"
                >
                    <i class="ti ti-x" aria-hidden="true"></i>
                </button>
            </div>

            <span class="cart-item-unit font-mono">Unit price: ₱${parseFloat(item.price).toFixed(2)}</span>

            <div class="cart-item-controls">
                <div class="cart-qty-control">
                    <button
                        class="cart-qty-btn"
                        data-action="dec"
                        data-id="${item.id}"
                        aria-label="Decrease quantity"
                    >
                        <i class="ti ti-minus" aria-hidden="true"></i>
                    </button>

                    <span class="cart-qty-value font-mono">${item.quantity}</span>

                    <button
                        class="cart-qty-btn"
                        data-action="inc"
                        data-id="${item.id}"
                        aria-label="Increase quantity"
                        ${atMax ? "disabled" : ""}
                    >
                        <i class="ti ti-plus" aria-hidden="true"></i>
                    </button>
                </div>

                <span class="cart-item-subtotal font-mono">₱${subtotal.toFixed(2)}</span>
            </div>
        </div>
    `;
}