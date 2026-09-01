export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    const corsHeaders = {
      "Access-Control-Allow-Origin": "https://dexfans.world",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
      "Access-Control-Max-Age": "86400"
    };

    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: corsHeaders
      });
    }

    const json = (data, status = 200) => {
      return new Response(
        JSON.stringify(data),
        {
          status,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json"
          }
        }
      );
    };

    if (url.pathname === "/") {
      return json({
        success: true,
        service: "DexFans API",
        status: "online",
        version: "1.0.0"
      });
    }

    if (
      url.pathname === "/api/health" &&
      request.method === "GET"
    ) {
      return json({
        success: true,
        service: "dexfans-api",
        status: "healthy"
      });
    }

    if (
      url.pathname === "/api/config" &&
      request.method === "GET"
    ) {
      return json({
        success: true,
        platform: "DexFans.world",
        network: "solana-mainnet",
        payments: {
          SOL: true,
          GOJIPOWER: true
        }
      });
    }

    return json(
      {
        success: false,
        error: "Endpoint not found"
      },
      404
    );
  }
};