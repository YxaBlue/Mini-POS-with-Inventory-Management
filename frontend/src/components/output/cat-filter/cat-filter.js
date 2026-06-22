/**
 * Category Filter component
 *
 * Renders a row of filterable category pills into a given mount element.
 *
 * Usage:
 *   import { mountCatFilter } from "../../components/cat-filter/cat-filter.js";
 *
 *   mountCatFilter("cat-filter-mount", {
 *       categories: ["All", "Drinks", "Snacks"],
 *       active:     "All",
 *       onChange:   (category) => { ... },
 *   });
 *
 * To update pills after products load, just call mountCatFilter again
 * with the same mountId and the new categories list.
 */

export function mountCatFilter(mountId, { categories = ["All"], active = "All", onChange } = {}) {
    const mount = document.getElementById(mountId);
    if (!mount) return;

    // ensure the mount element always has the right classes
    mount.classList.add("cat-filter", "flex", "gap-1");

    mount.innerHTML = categories
        .map(cat => `
            <button class="cat-pill ${cat === active ? "active" : ""}" data-category="${cat}">
                ${cat}
            </button>
        `)
        .join("");

    mount.querySelectorAll(".cat-pill").forEach(btn => {
        btn.addEventListener("click", () => {
            onChange?.(btn.dataset.category);
        });
    });
}