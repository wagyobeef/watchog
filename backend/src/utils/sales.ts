const ALT_GRAPHQL_URL = 'https://alt-platform-server.production.internal.onlyalt.com/graphql';
const ALT_TYPESENSE_HOST = 'https://tlzfv6xaq81nhsbyp.a1.typesense.net';

let typesenseApiKey: string | null = null;
let typesenseKeyExpiresAt: number = 0;

async function getTypesenseApiKey(): Promise<string> {
    // Return cached key if not expired (with 5 min buffer)
    if (typesenseApiKey && Date.now() / 1000 < typesenseKeyExpiresAt - 300) {
        return typesenseApiKey;
    }

    const response = await fetch(`${ALT_GRAPHQL_URL}/SearchServiceConfig`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Origin': 'https://app.alt.xyz',
            'Referer': 'https://app.alt.xyz/',
        },
        body: JSON.stringify({
            query: `query SearchServiceConfig { serviceConfig { search { universalSearch { clientConfig { apiKey } } } } }`
        })
    });

    if (!response.ok) {
        throw new Error(`Failed to fetch Typesense config: ${response.status}`);
    }

    const data: any = await response.json();
    const apiKey = data?.data?.serviceConfig?.search?.universalSearch?.clientConfig?.apiKey;

    if (!apiKey) {
        throw new Error('No Typesense API key found in SearchServiceConfig response');
    }

    typesenseApiKey = apiKey;

    // Parse expiry from the base64-encoded JSON embedded in the key
    try {
        const base64Match = apiKey.match(/eyJ[A-Za-z0-9+/=]+$/);
        if (base64Match) {
            const parsed = JSON.parse(Buffer.from(base64Match[0], 'base64').toString());
            typesenseKeyExpiresAt = parsed.expires_at || 0;
        }
    } catch {
        // If we can't parse expiry, refresh every hour
        typesenseKeyExpiresAt = Date.now() / 1000 + 3600;
    }

    return typesenseApiKey;
}

async function searchAltAsset(query: string): Promise<{ assetId: string; gradingCompany: string; grade: string } | null> {
    const apiKey = await getTypesenseApiKey();

    const params = new URLSearchParams({
        q: query,
        query_by: 'rawName',
        per_page: '1'
    });

    const response = await fetch(
        `${ALT_TYPESENSE_HOST}/collections/production_universal_search/documents/search?${params}`,
        { headers: { 'X-TYPESENSE-API-KEY': apiKey } }
    );

    if (!response.ok) {
        throw new Error(`Typesense search failed: ${response.status}`);
    }

    const data: any = await response.json();
    const hit = data?.hits?.[0]?.document;

    if (!hit?.assetId) {
        return null;
    }

    return {
        assetId: hit.assetId,
        gradingCompany: hit.gradingCompany || '',
        grade: hit.grade || ''
    };
}

function formatGradeNumber(grade: string): string {
    if (!grade) return '';
    const num = parseFloat(grade);
    if (isNaN(num)) return grade;
    return num.toFixed(1);
}

async function getAssetTransactions(assetId: string, gradingCompany: string, gradeNumber: string): Promise<any[]> {
    const filter: any = {};
    if (gradingCompany) filter.gradingCompany = gradingCompany;
    if (gradeNumber) filter.gradeNumber = gradeNumber;

    const response = await fetch(`${ALT_GRAPHQL_URL}/AssetMarketTransactions`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Origin': 'https://app.alt.xyz',
            'Referer': 'https://app.alt.xyz/',
        },
        body: JSON.stringify({
            query: `query AssetMarketTransactions($assetId: ID!, $marketTransactionFilter: MarketTransactionFilter!) {
                asset(id: $assetId) {
                    id
                    marketTransactions(marketTransactionFilter: $marketTransactionFilter) {
                        id
                        date
                        auctionHouse
                        auctionType
                        price
                        attributes { url }
                    }
                }
            }`,
            variables: {
                assetId,
                marketTransactionFilter: filter
            }
        })
    });

    if (!response.ok) {
        throw new Error(`GraphQL request failed: ${response.status}`);
    }

    const data: any = await response.json();

    if (data.errors?.length > 0) {
        throw new Error(`GraphQL errors: ${data.errors.map((e: any) => e.message).join(', ')}`);
    }

    return data?.data?.asset?.marketTransactions || [];
}

function formatAuctionType(auctionType: string): string {
    switch (auctionType) {
        case 'BUY_IT_NOW': return 'Buy now';
        case 'AUCTION': return 'Auction';
        case 'BEST_OFFER': return 'Best offer';
        default: return auctionType;
    }
}

async function getItemSales(query: string): Promise<any[]> {
    // Step 1: Search for the asset by query text
    const asset = await searchAltAsset(query);
    if (!asset) {
        console.log(`No Alt.xyz asset found for "${query}"`);
        return [];
    }

    // Step 2: Fetch recent transactions for the asset
    const gradeNumber = formatGradeNumber(asset.grade);
    const transactions = await getAssetTransactions(asset.assetId, asset.gradingCompany, gradeNumber);

    // Step 3: Map to the existing shape the frontend expects
    const sales = transactions
        .slice(0, 10)
        .map((tx: any) => {
            const url = tx.attributes?.url || '';
            const isRealUrl = url.startsWith('http');

            return {
                itemWebUrl: isRealUrl ? url : null,
                saleType: formatAuctionType(tx.auctionType),
                saleDate: tx.date,
                price: {
                    value: tx.price,
                    currency: 'USD'
                },
                itemId: tx.id,
                auctionHouse: tx.auctionHouse
            };
        });

    console.log(`Fetched ${sales.length} sales for "${query}" via Alt.xyz API`);
    return sales;
}

export {
    getItemSales
};
