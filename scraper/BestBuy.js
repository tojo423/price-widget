const jsdom = require("jsdom");
const { JSDOM } = jsdom;
const { onlyLettersAndNumbers } = require("../util");

class BestBuyScraper {
  priceItemSelector = `.priceView-hero-price.priceView-customer-price span`;

  scraper;

  constructor(scraper) {
    this.scraper = scraper;
  }

  validateUrl(url) {
    // onst url = `https://www.bestbuy.com/site/alienware-aw610m-l-wired-wireless-optical-gaming-mouse-with-rgb-lighting-lunar-light/6382729.p?skuId=6382729`;

    const urlObj = new URL(url);
    const hostname = urlObj.hostname;

    const pathname = urlObj.pathname;
    const pathComps = pathname.split("/");

    const siteToken = pathComps[1];
    const slug = pathComps[2];
    const productId = pathComps[3].slice(0, -2);

    const hasSiteToken = siteToken == "site";
    const hasCorrectHostname = hostname == "www.bestbuy.com";
    const hasValidProductId =
      productId.length == 7 && onlyLettersAndNumbers(productId);

    const searchParams = urlObj.searchParams;
    const hasSearchSkuId = !!searchParams.get("skuId");

    if (!hasCorrectHostname) {
      return {
        success: false,
        errorCode: "INVALID_HOSTNAME",
      };
    }

    if (!hasSiteToken) {
      return {
        success: false,
        errorCode: "SITE_TOKEN_MISSING",
      };
    }

    if (!hasValidProductId) {
      return {
        success: false,
        errorCode: "INVALID_PRODUCT_ID",
      };
    }

    if (!hasSearchSkuId) {
      return {
        success: false,
        errorCode: "SEARCH_SKU_ID_MISSING",
      };
    }

    return {
      success: true,
    };
  }

  getProductId(url) {
    const urlObj = new URL(url);
    const pathname = urlObj.pathname;
    const pathComps = pathname.split("/");
    const productId = pathComps[3];
    return productId;
  }

  async getProductPrice(url) {
    const validateUrlResult = this.validateUrl(url);
    if (!validateUrlResult.success) {
      throw new Error("Invalid URL:", JSON.stringify(validateUrlResult));
    }

    url += "&intl=nosplash";
    //url = url.replace("www.bestbuy.com", "www-bestbuy-com.translate.goog");
    //url += "&_x_tr_sl=tr&_x_tr_tl=en&_x_tr_hl=en&_x_tr_pto=wapp";

    //const url = `https://www-walmart-com.translate.goog/ip/Hanes-Men-s-Woven-Boxers-3-Pack/958565673?athcpid=958565673&athpgid=AthenaHomepageDesktop__gm__-1.0&athcgid=null&athznid=ItemShowCase_98a0bae1-db56-44d5-b4ba-874ac4de85b2_items&athieid=null&athstid=CS020&athguid=NYoWAR5jVlWMLfmiYhg9Qn4AlW0U26StAdMZ&athancid=null&athena=true&_x_tr_sl=tr&_x_tr_tl=en&_x_tr_hl=en&_x_tr_pto=wapp`;
    return JSDOM.fromURL(url, {
      //   url: url,
      referrer: "https://www.google.com/",
      //   contentType: "text/html",
      includeNodeLocations: true,
      storageQuota: 10000000,
      pretendToBeVisual: true,
      userAgent:
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/105.0.0.0 Safari/537.36",
      cookieJar: new jsdom.CookieJar(),
    }).then((dom) => {
      //require("fs").writeFileSync("walmartpageresponse.html", dom.serialize());
      //console.log(dom.serialize());

      const document = dom.window.document;
      const priceSpan = document.querySelector(this.priceItemSelector);

      const price = priceSpan.textContent;

      return price;
    });
  }

  async test() {
    console.log("[BestBuy] Running Tests");

    const url = `https://www.bestbuy.com/site/alienware-aw610m-l-wired-wireless-optical-gaming-mouse-with-rgb-lighting-lunar-light/6382729.p?skuId=6382729`;

    const price = await this.getProductPrice(url);

    console.log("[BestBuy] Price:", price);
  }
}

module.exports = BestBuyScraper;
