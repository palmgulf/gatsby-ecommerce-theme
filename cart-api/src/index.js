/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `npm run dev` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `npm run deploy` to publish your worker
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */

export default {
  async fetch(request, env, ctx) {
    const { method } = request;
    const url = new URL(request.url);

    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET,HEAD,POST,OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, X-Cart-Id',
      'Content-Type': 'application/json',
    };

    // Handle CORS preflight
    if (method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: corsHeaders,
      });
    }

    // Route handling
    if (url.pathname === '/remove' && method === 'POST') {
      return await handleRemoveFromCart(request, env, corsHeaders);
    }

    if (method === 'GET') {
      return await handleGetCart(request, env, corsHeaders);
    }

    if (method === 'POST') {
      return await handleAddOrUpdateCart(request, env, corsHeaders);
    }

    return new Response(JSON.stringify({ error: 'Method Not Allowed' }), {
      status: 405,
      headers: corsHeaders,
    });
  },
};

// 🛒 Add or Update Cart
async function handleAddOrUpdateCart(request, env, headers) {
  try {
    const cart = await request.json();
    const userId = request.headers.get('X-Cart-Id');

    if (!userId) {
      return new Response(JSON.stringify({ error: 'Missing User ID' }), {
        status: 400,
        headers,
      });
    }

    await env.CART_KV.put(userId, JSON.stringify(cart));

    return new Response(JSON.stringify({ success: true, message: 'Cart saved' }), {
      status: 200,
      headers,
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: 'Invalid JSON' }), {
      status: 400,
      headers,
    });
  }
}

// 🛒 Get Cart
async function handleGetCart(request, env, headers) {
  const userId = request.headers.get('X-Cart-Id');

  if (!userId) {
    return new Response(JSON.stringify({ error: 'Missing Cart ID' }), {
      status: 400,
      headers,
    });
  }

  const cart = await env.CART_KV.get(userId);
  const cartData = cart ? JSON.parse(cart) : [];

  return new Response(JSON.stringify(cartData), {
    status: 200,
    headers,
  });
}

// 🗑 Remove From Cart
async function handleRemoveFromCart(request, env, headers) {
  try {
    const { userId, productId } = await request.json();

    if (!userId || !productId) {
      return new Response(JSON.stringify({ error: 'Missing userId or productId' }), {
        status: 400,
        headers,
      });
    }

    const cart = await env.CART_KV.get(userId, 'json') || [];
    const updatedCart = cart.filter(item => item.productId !== productId);

    await env.CART_KV.put(userId, JSON.stringify(updatedCart));

    return new Response(JSON.stringify({ success: true, updatedCart }), {
      status: 200,
      headers,
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: 'Server error', details: err.message }), {
      status: 500,
      headers,
    });
  }
}