const jsdom = require("jsdom");
const { onlyLettersAndNumbers } = require("../util");
const { JSDOM } = jsdom;

class AmazonScraper {
  scraper;

  // selectors
  buyBoxDivSelector = "#buybox";

  outOfStockBuyBoxDivSelector = "#outOfStockBuyBox_feature_div";

  unqualifiedBuyBoxDivSelector = "#unqualifiedBuyBox";
  seeAllBuyingChoicesLinkSelector = "#buybox-see-all-buying-choices";
  allOffersDisplayScrollerDivSelector = "#all-offers-display-scroller";
  offerDivSelector = "#aod-offer";
  offerPriceSpanSeletor = "#aod-offer .a-offscreen";

  qualifiedBuyBoxDivSelector = "#qualifiedBuybox";
  priceDivSelector = "#corePrice_feature_div .a-offscreen";

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

  validateUrl(url) {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname;

    const pathname = urlObj.pathname;
    const pathComps = pathname.split("/");

    const slug = pathComps[1];
    const dpToken = pathComps[2];
    const productId = pathComps[3];

    const hasCorrectHostname = hostname == "www.amazon.com";
    const hasDpTokenAfterSlug = dpToken == "dp";
    const hasValidId =
      productId.length == 10 && onlyLettersAndNumbers(productId);

    const searchParams = urlObj.searchParams;
    const hasSearchQid = !!searchParams.get("qid");

    if (!hasCorrectHostname) {
      return {
        success: false,
        errorCode: "INVALID_HOSTNAME",
      };
    }

    if (!hasDpTokenAfterSlug) {
      return {
        success: false,
        errorCode: "DP_TOKEN_MISSING",
      };
    }

    if (!hasValidId) {
      return {
        success: false,
        errorCode: "INVALID_PRODUCT_ID",
      };
    }

    if (!hasSearchQid) {
      return {
        success: false,
        errorCode: "SEARCH_QID_MISSING",
      };
    }

    return {
      success: true,
    };
  }

  async test() {
    console.log("[Amazon] Running Tests");

    const qualifiedProductUrl =
      "https://www.amazon.com/StarTech-com-10Gbps-Enclosure-SATA-Drives/dp/B00XLAZEFC/ref=sr_1_3_sspa?qid=1662637948&s=computers-intl-ship&sr=1-3-spons&spLa=ZW5jcnlwdGVkUXVhbGlmaWVyPUExUlFDMkJYRkMwRURCJmVuY3J5cHRlZElkPUEwMjYzNDA5M0FPSERKUE4wRzNPRyZlbmNyeXB0ZWRBZElkPUEwOTkzNTU0MlJNUjVQREVEM1czTCZ3aWRnZXROYW1lPXNwX2F0Zl9icm93c2UmYWN0aW9uPWNsaWNrUmVkaXJlY3QmZG9Ob3RMb2dDbGljaz10cnVl&th=1";

    // const unqualifiedProductUrl =
    //   "https://www.amazon.com/Cubii-Elliptical-Adjustable-Resistance-Turquoise/dp/B074F1S194/ref=sr_1_2?crid=XECM0KZTN4BX&keywords=work+from+home+fitness&qid=1662626879&sprefix=%2Caps%2C242&sr=8-2";

    // const outOfStockProductUrl =
    //   "https://www.amazon.com/Apple-AirPods-Charging-Latest-Model/dp/B07PXGQC1Q/ref=sr_1_2?qid=1662637711&s=electronics&sr=1-2";

    const qualifiedProductPrice = await await this.getProductPrice(
      qualifiedProductUrl
    );
    console.log(
      "[Amazon] Qualified Product Price:",
      qualifiedProductPrice,
      "\n\n"
    );

    // const unqualifiedProductPrice = await this.getProductPrice(
    //   await unqualifiedProductUrl
    // );
    // console.log(
    //   "[Amazon] Unqualified Product Price:",
    //   unqualifiedProductPrice,
    //   "\n\n"
    // );

    // const outOfStockProductPrice = await this.getProductPrice(
    //   outOfStockProductUrl
    // );
    // console.log(
    //   "[Amazon] Out of Stock Product Price:",
    //   outOfStockProductPrice,
    //   "\n\n"
    // );
  }

  getProductPrice(url) {
    const validateUrlResult = this.validateUrl(url);
    if (!validateUrlResult.success) {
      throw new Error("Invalid URL:", JSON.stringify(validateUrlResult));
    }

    //url = url.replace("www.amazon.com", "www-amazon-com.translate.goog");
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

      const qualifiedBuyBoxDiv = document.querySelector(
        this.qualifiedBuyBoxDivSelector
      );

      if (!qualifiedBuyBoxDiv) {
        return "N/A";
      }

      const priceDiv = qualifiedBuyBoxDiv.querySelector(this.priceDivSelector);

      const price = priceDiv.textContent;

      return price;
    });
  }

  // async getProductPrice(url) {
  //   const page = await this.scraper.browser.newPage();

  //   await page.setUserAgent(
  //     `Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/105.0.0.0 Safari/537.36`
  //   );

  //   await page.goto(url, {
  //     timeout: 0, // !important as our page may load after 30000 ms
  //   });
  //   console.log("[Amazon] Navigated to Page:", url);

  //   console.log("[Amazon] Waiting for <Buy Box>");
  //   const buyBoxDiv = await page.waitForSelector(this.buyBoxDivSelector);

  //   // const buyBox = await page.$(this.buyBoxSelector);
  //   const qualifiedBuyBoxDiv = await buyBoxDiv.$(
  //     this.qualifiedBuyBoxDivSelector
  //   );
  //   const unqualifiedBuyBoxDiv = await buyBoxDiv.$(
  //     this.unqualifiedBuyBoxDivSelector
  //   );
  //   const outOfStockBuyBoxDiv = await buyBoxDiv.$(
  //     this.outOfStockBuyBoxDivSelector
  //   );

  //   if (qualifiedBuyBoxDiv) {
  //     console.log("[Amazon] Product is Qualified");
  //     const priceDiv = await buyBoxDiv.$(this.priceDivSelector);
  //     const price = await (await priceDiv.getProperty("innerText")).jsonValue();

  //     // page.close();

  //     return price;
  //   }

  //   if (unqualifiedBuyBoxDiv) {
  //     console.log("[Amazon] Product is Unqualified");

  //     console.log("[Amazon] Clicking on <See All Buying Choices Link>...");
  //     const seeAllBuyingChoicesLink = await buyBoxDiv.$(
  //       this.seeAllBuyingChoicesLinkSelector
  //     );
  //     await seeAllBuyingChoicesLink.click();

  //     console.log("[Amazon] Waiting for <All Offers Display Scroller Div>...");
  //     const allOffersDisplayScrollerDiv = await page.waitForSelector(
  //       this.allOffersDisplayScrollerDivSelector
  //     );

  //     console.log("[Amazon] Waiting for At Least 1 <Offer Div>...");
  //     await page.waitForSelector(this.offerDivSelector);

  //     console.log("[Amazon] Getting <Price Spans>...");
  //     const priceSpans = await allOffersDisplayScrollerDiv.$$(
  //       this.offerPriceSpanSeletor
  //     );

  //     const prices = priceSpans.map(async (priceSpan) => {
  //       let priceString = await (
  //         await priceSpan.getProperty("innerText")
  //       ).jsonValue();
  //       priceString = priceString.slice(1);
  //       //console.log("[Amazon] Price String:", priceString);
  //       const priceNum = Number(priceString);
  //       //console.log("[Amazon] Price Number:", priceNum);
  //       return priceNum;
  //     });
  //     const pricesSorted = prices.sort((a, b) => {
  //       return a - b;
  //     });

  //     const lowestPrice = pricesSorted[0];
  //     const priceFormatted = "$" + (Math.round(50.99 * 100) / 100).toFixed(2);

  //     //console.log("[Amazon] Price Formatted:", priceFormatted);

  //     // page.close();

  //     return priceFormatted;
  //   }

  //   if (outOfStockBuyBoxDiv) {
  //     console.log("[Amazon] Product is Out of Stock");

  //     // page.close();

  //     return "N/A";
  //   }
  // }
}

module.exports = AmazonScraper;
