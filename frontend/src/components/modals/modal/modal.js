export function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) return;
    modal.classList.add("active");

    //close if clicking backdrop
    modal.addEventListener("click", (e) => {
        if (e.target === modal) closeModal(modalId);
    }, { once: true});
}

export function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) return;
    modal.classList.remove("active");
}