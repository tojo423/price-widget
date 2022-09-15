const jsdom = require("jsdom");
const { JSDOM } = jsdom;
const { onlyLettersAndNumbers } = require("../util");

class NeweggScraper {
  priceItemSelector = `div.product-price  li.price-current`;

  scraper;

  constructor(scraper) {
    this.scraper = scraper;
  }

  getProductId(url) {
    const urlObj = new URL(url);
    const pathname = urlObj.pathname;
    const pathComps = pathname.split("/");
    const p1 = pathComps[1];
    const p2 = pathComps[2];
    let productId;
    if (p1 == "p") {
      productId = pathComps[2];
    } else if (p2 == "p") {
      productId = pathComps[3];
    }
    return productId;
  }

  async getProductPrice(url) {
    const validateUrlResult = this.validateUrl(url);
    if (!validateUrlResult.success) {
      throw new Error("Invalid URL:", JSON.stringify(validateUrlResult));
    }

    //url = url.replace("www.newegg.com", "www-newegg-com.translate.goog");
    //url += "?_x_tr_sl=tr&_x_tr_tl=en&_x_tr_hl=en&_x_tr_pto=wapp";

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
      const priceSpans = [...document.querySelectorAll(this.priceItemSelector)];

      console.log("[Newegg] Price Spans:", priceSpans);

      const probablePriceSpan = priceSpans[Math.min(1, priceSpans.length - 1)];

      const price = probablePriceSpan.textContent;

      return price;
    });
  }

  async test() {
    console.log("[Newegg] Running Tests");

    const url = `https://www.newegg.com/black-logitech-g915-lightspeed-clicky/p/N82E16823126553`;

    const price = await this.getProductPrice(url);

    console.log("[Newegg] Price:", price);
  }

  validateUrl(url) {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname;

    const pathname = urlObj.pathname;
    const pathComps = pathname.split("/");

    const pToken1 = pathComps[1];
    const pToken2 = pathComps[2];
    let productId;
    if (pToken1 == "p") {
      productId = pathComps[2];
    } else if (pToken2 == "p") {
      productId = pathComps[3];
    }

    const hasCorrectHostname = hostname == "www.newegg.com";
    const hasPToken = pToken1 == "p" || pToken2 == "p";
    const hasValidId =
      productId && productId.length == 15 && onlyLettersAndNumbers(productId);

    if (!hasCorrectHostname) {
      return {
        success: false,
        errorCode: "INVALID_HOSTNAME",
      };
    }

    if (!hasPToken) {
      return {
        success: false,
        errorCode: "P_TOKEN_MISSING",
      };
    }

    if (!hasValidId) {
      return {
        success: false,
        errorCode: "INVALID_PRODUCT_ID",
      };
    }

    return {
      success: true,
    };
  }
}

module.exports = NeweggScraper;
