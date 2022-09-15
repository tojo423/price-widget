const jsdom = require("jsdom");
const { JSDOM } = jsdom;
const { onlyLettersAndNumbers } = require("../util");

class WalmartScraper {
  priceSpanSelector = `div[data-testid="add-to-cart-section"] span[itemprop="price"]`;

  scraper;

  constructor(scraper) {
    this.scraper = scraper;
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
      throw new Error("Invalid URL: " + JSON.stringify(validateUrlResult));
    }

    url = url.replace("www.walmart.com", "www-walmart-com.translate.goog");
    if (url.includes("?")) {
      url += "&_x_tr_sl=tr&_x_tr_tl=en&_x_tr_hl=en&_x_tr_pto=wapp";
    } else {
      url += "?_x_tr_sl=tr&_x_tr_tl=en&_x_tr_hl=en&_x_tr_pto=wapp";
    }

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
    }).then(async (dom) => {
      //require("fs").writeFileSync("walmartpageresponse.html", dom.serialize());
      //console.log(dom.serialize());

      const document = dom.window.document;
      const priceSpan = document.querySelector(this.priceSpanSelector);
      const price = priceSpan.textContent;

      return price;
    });
  }

  async test() {
    console.log("[Walmart] Running Tests");

    // walmart.com/ip/The-Nightmare-Before-Christmas-6in-Jack-Skellington-Light-Up-Halloween-Pumpkin/544649836
    const url = `https://www.walmart.com/ip/Hanes-Men-s-Woven-Boxers-3-Pack/958565673?athcpid=958565673&athpgid=AthenaHomepageDesktop__gm__-1.0&athcgid=null&athznid=ItemShowCase_98a0bae1-db56-44d5-b4ba-874ac4de85b2_items&athieid=null&athstid=CS020&athguid=NYoWAR5jVlWMLfmiYhg9Qn4AlW0U26StAdMZ&athancid=null&athena=true`;

    const price = await this.getProductPrice(url);

    console.log("[Walmart] Price:", price);
  }

  validateUrl(url) {
    // const url = `https://www.walmart.com/ip/Hanes-Men-s-Woven-Boxers-3-Pack/958565673?athcpid=958565673&athpgid=AthenaHomepageDesktop__gm__-1.0&athcgid=null&athznid=ItemShowCase_98a0bae1-db56-44d5-b4ba-874ac4de85b2_items&athieid=null&athstid=CS020&athguid=NYoWAR5jVlWMLfmiYhg9Qn4AlW0U26StAdMZ&athancid=null&athena=true`;

    const urlObj = new URL(url);
    const hostname = urlObj.hostname;

    const pathname = urlObj.pathname;
    const pathComps = pathname.split("/");

    const ipToken = pathComps[1];
    const slug = pathComps[2];
    const productId = pathComps[3];

    const hasIpToken = ipToken == "ip";
    const hasCorrectHostname = hostname == "www.walmart.com";
    const hasValidProductId =
      productId.length == 9 && onlyLettersAndNumbers(productId);

    const searchParams = urlObj.searchParams;
    const hasSearchAthcpid = !!searchParams.get("athcpid");

    if (!hasCorrectHostname) {
      return {
        success: false,
        errorCode: "INVALID_HOSTNAME",
      };
    }

    if (!hasIpToken) {
      return {
        success: false,
        errorCode: "IP_TOKEN_MISSING",
      };
    }

    if (!hasValidProductId) {
      return {
        success: false,
        errorCode: "INVALID_PRODUCT_ID",
      };
    }

    // if (!hasSearchAthcpid) {
    //   return {
    //     success: false,
    //     errorCode: "SEARCH_ATHCPID_MISSING",
    //   };
    // }

    return {
      success: true,
    };
  }
}

module.exports = WalmartScraper;
