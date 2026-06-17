const API_URL = "http://localhost:3000/products";

export async function getProducts() {
    const response = await fetch(API_URL);
    if (!response.ok) throw new Error(`Failed to fetch products: ${response.status}`);
    return response.json();
}

export async function addProduct(product) {
    const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(product)
    });
    if (!response.ok) throw new Error(`Failed to add product: ${response.status}`);
    return response.json();
}

export async function updateProduct(id, product) {
    const response = await fetch(`${API_URL}/${id}`, {
        method: "PUT",
        headers: { "Content-Type" : "application/json" },
        body: JSON.stringify(product)
    });
    if (!response.ok) throw new Error(`Failed to update product: ${response.status}`);
    return response.json();
}

export async function deleteProduct(id) {
    const response = await fetch(`${API_URL}/${id}`, {
        method: "DELETE"
    });
    if (!response.ok) throw new Error(`Failed to delete product: ${response.status}`);
    return response.json();
}