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

    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET,HEAD,POST,OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, X-Cart-Id'
    };

    // Handle CORS preflight
    if (method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: corsHeaders
      });
    }

    // Handle POST request
    if (method === 'POST') {
      try {
        const cart = await request.json();
		const userId = request.headers.get("X-Cart-Id");
        console.log('Received cart:', cart);

		if (!userId) {
			return new Response(JSON.stringify({ error: 'Missing User ID' }), {
		  status: 400,
		  headers: {
			'Content-Type': 'application/json',
			...corsHeaders
		  }
		});
		}
		// Store the cart in KV
		await env.CART_KV.put(userId, JSON.stringify(cart));

        return new Response(JSON.stringify({ status: 'cart received' }), {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders
          }
        });
      } catch (err) {
        return new Response(JSON.stringify({ error: 'Invalid JSON' }), {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders
          }
        });
      }
    }

    // Handle all other methods
    return new Response('Method Not Allowed', {
      status: 405,
      headers: corsHeaders
    });
  }
}