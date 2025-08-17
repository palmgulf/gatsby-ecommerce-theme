const API_URL = 'https://cart-api.rough-haze-95d9.workers.dev'; // Update if changed
const cartKey = 'cart';
const cartIdKey = 'cartId';

// Get or generate unique cart/user ID
function getCartId() {
    let id = localStorage.getItem(cartIdKey);
    if (!id) {
        id = crypto.randomUUID();
        localStorage.setItem(cartIdKey, id);
    }
    return id;
}

// Fetch latest cart from backend (source of truth)
export async function loadCartFromBackend() {
    const cartId = getCartId();
    try {
        const response = await fetch(API_URL, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'X-Cart-Id': cartId
            }
        });

        if (!response.ok) {
            console.warn('Failed to load cart from backend:', response.status);
            return;
        }

        const cart = await response.json();
        localStorage.setItem(cartKey, JSON.stringify(cart));
        renderCart();
    } catch (err) {
        console.error('Error loading cart:', err);
    }
}

// Add item to cart
export async function addToCart(product) {
    console.log("adding", product);
    if (!product || !product.name || !product.price) {
        console.error('Invalid product format:', product);
        return;
    }

    // Ensure there's a productId
    if (!product.productId) {
        product.productId = crypto.randomUUID(); // fallback for now
    }

    const cart = getLocalCart();
    cart.push(product);
    await saveCart(cart);
}

// Save cart locally + sync to backend
async function saveCart(cart) {
    localStorage.setItem(cartKey, JSON.stringify(cart));

    const cartId = getCartId();
    try {
        await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Cart-Id': cartId
            },
            body: JSON.stringify(cart)
        });
    } catch (err) {
        console.error('Error syncing cart to backend:', err);
    }

    renderCart();
}

// Render cart UI
export function renderCart() {
    const container = document.getElementById('cart-items');
    if (!container) {
        console.warn('Cart container not found');
        return;
    }

    const cart = getLocalCart();
    container.innerHTML = '';

    if (cart.length === 0) {
        container.innerHTML = '<p>Your cart is empty.</p>';
        return;
    }

    let total = 0;

    cart.forEach(item => {
        const price = parseFloat(item.price) || 0;
        total += price;

        const el = document.createElement('div');
        el.className = 'cart-item';
        el.innerHTML = `
            <p><strong>${item.name}</strong> - $${price.toFixed(2)}</p>
            <button class="remove-button" data-id="${item.productId}">Remove</button>
        `;
        container.appendChild(el);
    });

    // Cart total (optional)
    let totalDiv = document.getElementById('cart-total');
    if (!totalDiv) {
        totalDiv = document.createElement('div');
        totalDiv.id = 'cart-total';
        container.appendChild(totalDiv);
    }
    totalDiv.innerHTML = `<p><strong>Total:</strong> $${total.toFixed(2)}</p>`;

    // Add click handlers
    container.querySelectorAll('.remove-button').forEach(button => {
        button.addEventListener('click', () => {
            const id = button.getAttribute('data-id');
            removeFromCart(id);
        });
    });
}


// Remove item from cart by productId
export async function removeFromCart(productId) {
    if (!productId) return;

    const cartId = getCartId();

    try {
        await fetch(`${API_URL}/remove`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ userId: cartId, productId })
        });

        await loadCartFromBackend(); // reload latest state after removal
    } catch (err) {
        console.error('Failed to remove item from cart:', err);
    }
}

// Local helper to parse cart
function getLocalCart() {
    try {
        const raw = localStorage.getItem(cartKey);
        return raw ? JSON.parse(raw) : [];
    } catch (err) {
        console.error('Invalid cart in localStorage:', err);
        return [];
    }
}

// Auto-render cart on page load
document.addEventListener('DOMContentLoaded', loadCartFromBackend);
