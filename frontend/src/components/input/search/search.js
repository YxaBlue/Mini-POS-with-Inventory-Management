/**
 * Search component
 *
 * Usage:
 *   import { mountSearch } from "../../components/search/search.js";
 *
 *   mountSearch("search-mount", {
 *       placeholder: "Search products…",   // optional, defaults to "Search…"
 *       onInput: (query) => { ... },        // called on every keystroke
 *   });
 *
 * The component renders itself into the element with the given id, replacing
 * it with the full .search-box markup. The onInput callback receives the
 * current trimmed lowercase query string.
 */

export function mountSearch(mountId, { placeholder = "Search…", onInput } = {}) {
    const mount = document.getElementById(mountId);
    if (!mount) return;

    mount.outerHTML = `
        <div class="search-box" id="${mountId}">
            <i class="ti ti-search" aria-hidden="true"></i>
            <input
                type="text"
                id="search-input"
                class="search-input"
                placeholder="${placeholder}"
                autocomplete="off"
            >
        </div>
    `;

    // outerHTML replacement detaches the original element, so re-query
    document.getElementById("search-input").addEventListener("input", (e) => {
        onInput?.(e.target.value.toLowerCase().trim());
    });
}