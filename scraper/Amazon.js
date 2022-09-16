const jsdom = require("jsdom");
const { JSDOM } = jsdom;

class AmazonScraper {
  settings;

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

  constructor(settings) {
    this.settings = settings;
  }

  getProductPrice(url) {
    return JSDOM.fromURL(url, {
      referrer: "https://www.amazon.com/",
      includeNodeLocations: true,
      storageQuota: 10000000,
      pretendToBeVisual: true,
      userAgent:
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/105.0.0.0 Safari/537.36",
      cookieJar: new jsdom.CookieJar(),
    }).then((dom) => {
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
}

module.exports = AmazonScraper;
