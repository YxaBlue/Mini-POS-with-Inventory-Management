export function renderSubheader({ left = "", right = "" } = {}) {
    return `
        <div class="subheader">
            ${left  ? `<div class="subheader-left flex items-center gap-2">${left}</div>`   : ""}
            ${right ? `<div class="subheader-right flex items-center gap-2">${right}</div>` : ""}
        </div>
    `;
}