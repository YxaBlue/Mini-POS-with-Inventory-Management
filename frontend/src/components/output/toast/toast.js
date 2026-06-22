let toastTimer = null;

function ensureToastElement() {
    let toast = document.getElementById("toast");

    if (!toast) {
        toast = document.createElement("div");
        toast.id = "toast";
        toast.className = "toast";
        document.body.appendChild(toast);
    }

    return toast;
}

export function showToast(message, type = "success") {
    const toast = ensureToastElement();

    const icons = {
        success: "ti-circle-check",
        danger:  "ti-circle-x",
        warning: "ti-alert-triangle",
    };

    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
        <i class="ti ${icons[type] ?? icons.success}" aria-hidden="true"></i>
        <span>${message}</span>
    `;

    // Force reflow so the transition re-triggers if called back-to-back
    void toast.offsetWidth;
    toast.classList.add("show");

    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove("show"), 3000);
}