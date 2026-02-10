import { chromium } from 'playwright';
import * as cheerio from 'cheerio';

async function navigateToItemSales(query) {
    const browser = await chromium.launch({
        headless: true
    });

    try {
        const page = await browser.newPage({
            userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        });

        // Navigate to the browse page
        const encodedQuery = encodeURIComponent(query);
        const browseUrl = `https://app.alt.xyz/browse/fixed-price?query=${encodedQuery}&sortBy=newest_first`;

        await page.goto(browseUrl, {
            waitUntil: 'domcontentloaded',
            timeout: 30000
        });

        await page.waitForTimeout(5000);

        // Get the first listing link
        const firstListingHref = await page.$eval('a[href^="/browse/external-listing"]', el => el.getAttribute('href'));

        if (!firstListingHref) {
            throw new Error('No listings found');
        }

        // Navigate to the first listing's detail page
        const listingUrl = `https://app.alt.xyz${firstListingHref}`;
        console.log(`Navigating to listing: ${listingUrl}`);

        await page.goto(listingUrl, {
            waitUntil: 'domcontentloaded',
            timeout: 30000
        });

        // Wait for the "Recent transactions" section to appear
        await page.waitForSelector('h3:has-text("Recent transactions")', { timeout: 10000 });

        // Wait for dynamic content to load (Alt.xyz fetches listings via API)
        await page.waitForTimeout(10000);

        // Get the HTML content of the listing detail page
        const html = await page.content();

        return html;
    } catch (error) {
        console.error('Error navigating to Alt.xyz:', error);
        throw error;
    } finally {
        await browser.close();
    }
}

function extractItemSales(html) {
    const $ = cheerio.load(html);

    // Find the "Recent transactions" heading
    const recentTransactionsHeading = $('h3:contains("Recent transactions")');

    if (recentTransactionsHeading.length === 0) {
        console.log('Could not find "Recent transactions" heading');
        return [];
    }

    // Go up two parents to get the outer container
    const container = recentTransactionsHeading.parent().parent();

    const allLinks = container.find('a[href*="ebay.com"]');

    // Find all eBay listing links within that container only
    const listings = [];
    allLinks.each((index, element) => {
        const $el = $(element);
        const href = $el.attr('href');

        // Only process eBay links
        if (!href || !href.includes('ebay.com')) {
            return;
        }

        const ebayUrl = href;

        // Use MUI Typography classes which are more stable
        // Find all subtitle2 and body3 elements within this link
        const allSubtitle2 = $el.find('.MuiTypography-vegaSubtitle2');
        const allBody3 = $el.find('.MuiTypography-vegaBody3');

        // Based on the structure:
        // - First subtitle2 is the sale type (Auction/Buy now)
        // - First body3 is the sale date
        // - Last subtitle2 is the price
        const saleType = allSubtitle2.first().text().trim();
        const saleDate = allBody3.first().text().trim();
        const salePrice = allSubtitle2.last().text().trim();

        // Only add if we found actual data
        if (ebayUrl && salePrice && salePrice.includes('$')) {
            listings.push({
                itemWebUrl: ebayUrl,
                saleType: saleType,
                saleDate: saleDate,
                price: {
                    value: salePrice.replace('$', '').replace(',', ''),
                    currency: 'USD'
                },
                itemId: ebayUrl.match(/itm\/(\d+)/)?.[1] || 'unknown'
            });
        }
    });

    return listings;
}

async function getItemSales(query) {
    const html = await navigateToItemSales(query);
    const listings = extractItemSales(html);

    console.log(`Extracted ${listings.length} sales for "${query}"`);

    return listings;
}

export {
    getItemSales
};
