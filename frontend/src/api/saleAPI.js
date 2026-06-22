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
        let reason = `Checkout failed (${response.status})`;
        try {
            const body = await response.json();
            if (body.message) reason = body.message;
        } catch {}
        throw new Error(reason);
    }

    return response.json();
}