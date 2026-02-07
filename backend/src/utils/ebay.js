let ebayAccessToken = null;

function getEbayOauthUrl() {
    return "https://api.ebay.com/identity/v1/oauth2/token";
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
    ebayAccessToken = data.access_token
    return ebayAccessToken;
  }

function getEbaySearchUrl() {
    return "https://api.ebay.com/buy/browse/v1/item_summary/search";
}

async function getEbayItemResults(query, options = {}) {
    if (!ebayAccessToken) {
        await getEbayAccessToken();
    }

    const searchUrl = getEbaySearchUrl();

    const params = new URLSearchParams({
        q: query,
        limit: options.limit || 50,
        ...options
    });

    const res = await fetch(`${searchUrl}?${params}`, {
        method: "GET",
        headers: {
            "Authorization": `Bearer ${ebayAccessToken}`,
            "Content-Type": "application/json"
        }
    });

    if (!res.ok) {
        const text = await res.text();

        // If unauthorized, token might be expired, retry once with new token
        if (res.status === 401) {
            ebayAccessToken = null;
            await getEbayAccessToken();

            // Retry the search with new token
            return searchEbayItem(query, options);
        }

        throw new Error(`eBay search failed (${res.status}): ${text}`);
    }

    const data = await res.json();
    return data;
}

export {
  getEbayAccessToken,
  getEbayOauthUrl,
  getEbayItemResults
};