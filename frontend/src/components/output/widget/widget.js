/**
 * dash-widget component
 *
 * A reusable card shell: title + count badge + optional "View all" link +
 * optional category-filter slot, sitting above a scrollable table.
 *
 * Usage:
 *   import { renderWidget } from "../../components/widget/widget.js";
 *
 *   document.getElementById("stock-widget-mount").outerHTML = renderWidget({
 *       title:        "Current stock",
 *       countId:      "stock-count",
 *       viewAllHref:  "../inventory/inventory.html",
 *       catFilterId:  "stock-cat-filter",   // omit if the widget has no filter
 *       tableHeaders: ["ID", "Product", "Stock", "Status"],
 *       tbodyId:      "stock-tbody",
 *   });
 *
 * The caller is responsible for populating #stock-tbody and (if present)
 * #stock-cat-filter — this component only renders the shell.
 */
export function renderWidget({
    title,
    countId,
    viewAllHref,
    catFilterId = "",
    tableHeaders = [],
    colWidths = [],   // ← new: array of CSS width strings, same order as tableHeaders
    tbodyId,
} = {}) {
    return `
        <div class="dash-widget">
            <div class="dash-widget-header">
                <div class="dash-widget-header-left flex items-center gap-2">
                    <h3>${title}</h3>
                    <span class="badge badge-neutral" id="${countId}">0</span>
                    ${viewAllHref
                        ? `<a href="${viewAllHref}" class="dash-view-all">
                               View all <i class="ti ti-arrow-right" aria-hidden="true"></i>
                           </a>`
                        : ""}
                </div>

                ${catFilterId
                    ? `<div id="${catFilterId}"></div>`
                    : ""}
            </div>

            <div class="table-wrapper">
                <table class="table">
                    <thead>
                        <tr>
                            ${tableHeaders.map((h, i) => `
                                <th${colWidths[i] ? ` style="width:${colWidths[i]}"` : ""}>${h}</th>
                            `).join("")}
                        </tr>
                    </thead>
                    <tbody id="${tbodyId}"></tbody>
                </table>
            </div>
        </div>
    `;
}