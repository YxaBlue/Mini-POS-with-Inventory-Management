/**
 * Stat Card component
 *
 * Renders a responsive grid of stat cards (label + value), 2 per row.
 * If the number of cards is odd, the last card spans the full row width.
 * Long values automatically shrink their font size to fit within the card.
 *
 * Each card supports an optional icon. Cards without an icon render as a
 * centered label/value stack (e.g. sales page). Cards with an icon render
 * as a horizontal icon + left-aligned text layout (e.g. dashboard).
 * iconVariant maps to a color: primary | success | warning | info | danger.
 *
 * Usage:
 *   import { mountStatGrid, updateStatValue } from "../../components/stat-card/stat-card.js";
 *
 *   // Without icons (sales page style)
 *   mountStatGrid("stats-mount", [
 *       { id: "stat-count",   label: "Total transactions", value: "128" },
 *       { id: "stat-revenue", label: "Total revenue",      value: "₱128,450.00" },
 *       { id: "stat-today",   label: "Today's sales",      value: "₱4,200.00" },
 *   ]);
 *
 *   // With icons (dashboard style)
 *   mountStatGrid("stats-mount", [
 *       { id: "stat-total-products", label: "Total products", value: 42, icon: "ti-package", iconVariant: "primary" },
 *   ]);
 *
 *   // To update a single value later without re-rendering the whole grid:
 *   updateStatValue("stat-revenue", "₱130,000.00");
 */
export function mountStatGrid(mountId, cards = []) {
    const mount = document.getElementById(mountId);
    if (!mount) return;

    mount.innerHTML = `
        <div class="stat-grid">
            ${cards.map(card => statCardTemplate(card)).join("")}
        </div>
    `;

    shrinkAllValues(mount);
}

export function updateStatValue(id, value) {
    const card     = document.getElementById(id);
    const valueEl  = card?.querySelector(".stat-card-value");
    if (!valueEl) return;

    valueEl.textContent = value;
    valueEl.style.fontSize = ""; // reset before re-measuring against new content
    requestAnimationFrame(() => shrinkValue(valueEl));
}

function statCardTemplate({ id, label, value, icon, iconVariant = "primary" }) {
    return `
        <div class="card stat-card ${icon ? "stat-card--icon" : ""}" id="${id}">
            ${icon ? `
                <div class="stat-card-icon stat-card-icon--${iconVariant}">
                    <i class="ti ${icon}" aria-hidden="true"></i>
                </div>
            ` : ""}
            <div class="stat-card-text">
                <span class="text-muted stat-card-label">${label}</span>
                <span class="stat-card-value font-mono">${value}</span>
            </div>
        </div>
    `;
}

// ── Auto-shrink long values to fit their card ───────────────────────────────

function shrinkAllValues(container) {
    requestAnimationFrame(() => {
        container.querySelectorAll(".stat-card-value").forEach(shrinkValue);
    });
}

function shrinkValue(el) {
    const MIN_FONT_SIZE = 13; // px floor — never shrink below this
    const STEP          = 1;

    let fontSize = parseFloat(getComputedStyle(el).fontSize);

    while (el.scrollWidth > el.clientWidth && fontSize > MIN_FONT_SIZE) {
        fontSize -= STEP;
        el.style.fontSize = `${fontSize}px`;
    }
}