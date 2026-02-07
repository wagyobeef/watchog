function getEbayOauthUrl() {
    const isProduction = process.env.IS_PRODUCTION === "true";
    if (isProduction) {
        return "https://api.ebay.com/identity/v1/oauth2/token";
    } else {
        return "https://api.sandbox.ebay.com/identity/v1/oauth2/token";
    }
}

async function getEbayAccessToken(scopes = ["https://api.ebay.com/oauth/api_scope"]) {
    const { EBAY_CLIENT_ID, EBAY_CLIENT_SECRET } = process.env;
    if (!EBAY_CLIENT_ID || !EBAY_CLIENT_SECRET) {
      throw new Error("Missing eBay credentials");
    }

    const oauthUrl = getEbayOauthUrl();

    const basicAuth = Buffer
      .from(`${EBAY_CLIENT_ID}:${EBAY_CLIENT_SECRET}`)
      .toString("base64");

    const scopeString = scopes.join(" ");

    const res = await fetch(oauthUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "Authorization": `Basic ${basicAuth}`
      },
      body: new URLSearchParams({
        grant_type: "client_credentials",
        scope: scopeString
      })
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`eBay OAuth failed (${res.status}): ${text}`);
    }

    const data = await res.json();
    return data.access_token;
  }

export {
  getEbayAccessToken,
  getEbayOauthUrl
};