const API_URL = "http://localhost:3000/sales";

export async function getSales() {
    const response = await fetch(API_URL);
    if (!response.ok) throw new Error("Failed to fetch sales");
    return response.json();
}

export async function getSaleById(id) {
    const response = await fetch(`${API_URL}/${id}`);
    if (!response.ok) throw new Error("Failed to fetch sale");
    return response.json();
}

export async function createSale(items) {
    const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items }),
    });

    if (!response.ok) {
        const err = await response.json();
        throw new Error(err.message || "Failed to create sale");
    }

    return response.json();
}