export function renderHeader({ title, subtitle = "", rightSlotId = "" } = {}) {
    return `
        <header class="header">
            <div class="header-left">
                <h1>${title}</h1>
                ${subtitle ? `<p class="text-muted">${subtitle}</p>` : ""}
            </div>

            ${rightSlotId
                ? `<div class="header-right flex items-center gap-2"
                   >
                        <div id="${rightSlotId}"></div>
                   </div>`
                : ""
            }
        </header>
    `;
}