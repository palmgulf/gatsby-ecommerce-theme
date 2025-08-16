
// Simple cart manager
const cartKey = 'palmgulf_cart';

function getCartId() {
    let id = localStorage.getItem('cartId');
    if (!id) {
        id = crypto.randomUUID();
        localStorage.setItem('cartId', id);
    }
    return id;
}

function getCart() {
    return JSON.parse(localStorage.getItem(cartKey) || '[]');
}

function saveCart(cart) {
    localStorage.setItem(cartKey, JSON.stringify(cart));
    renderCart();
    syncCartWithBackend(cart);
}


export function addToCart(product) {
    console.log('Adding to cart:', product);
    if (!product || !product.name || !product.price) {
        console.error('Invalid product:', product);
        return;
    }
    // Add product to cart
    const cart = getCart();
    cart.push(product);
    saveCart(cart);
}

function removeFromCart(index) {
    const cart = getCart();
    cart.splice(index, 1);
    saveCart(cart);
}

export function renderCart() {
    const cart = getCart();
    const container = document.getElementById('cart-items');
    if (!container) {
        console.warn('renderCard() skipped: #Cart-items not found');
        return;
    }
    container.innerHTML = '';

    if (cart.length === 0) {
        container.innerHTML = '<p>Your cart is empty.</p>';
        return;
    }

    cart.forEach((item, index) => {
        const el = document.createElement('div');
        el.className = 'cart-item';
        el.innerHTML = `<p><strong>${item.name}</strong> - ${item.price}</p>
                        <button onclick="removeFroCart(${index})">Remove</button>`;
        container.appendChild(el);
    });
}

async function syncCartWithBackend(cart) {
    const cartId = getCartId();
    try {
        await fetch('https://cart-api.rough-haze-95d9.workers.dev',{ //'/api/cart', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json',
                'X-Cart-Id': cartId
             },
            body: JSON.stringify(cart)
        });
    } catch (err) {
        console.error('Failed to sync cart:', err);
    }
}

function sendCartToBackend() {
    const cart = getCart();
    fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cart)
    })
    .then(response => response.json())
    .then(data => console.log('Cart sent successfully:', data))
    .catch(error => console.error('Error sending cart:', error));
}


document.addEventListener('DOMContentLoaded', renderCart);