const express = require("express");
const { URL } = require("url");
const BestBuyApi = require("./BestBuyApi");
const { queryParser } = require("express-query-parser");
const Scraper = require("./scraper");
const { rmSync } = require("fs");

const scraper = new Scraper();
const scraperInitPromise = scraper.init();
global.scraper = scraper;
global.scraperInitPromise = scraperInitPromise;

const app = express();
app.set("view engine", "pug");
app.set("views", "./views"); // ! relative to project root
app.use("/static", express.static("public"));

app.use(
  queryParser({
    parseNull: true,
    parseUndefined: true,
    parseBoolean: true,
    parseNumber: true,
  })
);

app.get("/generator", (req, res) => {
  res.render("generator");
});

app.get("/generator-v2", (req, res) => {
  res.render("generator-v2");
});

const bestBuyApi = new BestBuyApi();
global.bestBuyApi = bestBuyApi;

const fixUrl = (url) => {
  if (!url.startsWith("https://www.")) {
    return "https://www." + url;
  }
  return url;
};

app.get("/validate-product-url", async (req, res) => {
  try {
    console.log("validate-product-url request", req.query);

    await global.scraperInitPromise;
    const query = req.query;
    let url = query.url;
    url = fixUrl(url);
    const validateUrlResult = global.scraper.validateProductUrl(url);
    return res.status(200).json(validateUrlResult);
  } catch {
    return res.status(200).json({
      success: false,
      errorCode: "INVALID_URL",
    });
  }
});

app.get("/price-widget-v2", async (req, res) => {
  await global.scraperInitPromise;

  const query = req.query;
  let url = query.productUrl;
  if (url == "") {
    return res.send("Please enter a URL...");
  }

  url = fixUrl(url);

  console.log("url", url);

  try {
    const validateUrlResult = global.scraper.validateProductUrl(url);
    if (!validateUrlResult.success) {
      return res.status(400).send("Invalid URL!");
    }
  } catch (err) {
    console.log("err", err);
    return res.status(400).send("Invalid URL!");
  }

  const productPrice = await global.scraper.getProductPrice(url);

  res.render("price-widget-v2", { query, productPrice });
});

app.get("/price-widget", async (req, res) => {
  const { productUrl, testMode = true } = req.query;
  console.log("productUrl", productUrl);
  if (!productUrl) {
    return res.send("No URL specified");
  }
  const urlObj = new URL(productUrl);
  if (urlObj.hostname != "www.bestbuy.com") {
    return res.send("Invalid URL specified!");
  }

  console.log("query", req.query);
  let product;
  if (testMode) {
    product = {
      name: `Definitive Technology - Descend DN8 8" Sub, 3XR Architecture, 500W Peak Class D Amplifier & (2) 8" Bass Radiators - Black`,
      price: "$100.00",
    };
  } else {
    product = await bestBuyApi.getProduct(productUrl + "&intl=nosplash");
  }
  res.render("price-widget", { product, query: req.query });
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`⚡️[server]: Server is running at https://localhost:${port}`);
});

// console.log("Hello");

// const delay = () => {
//   return new Promise((resolve) => {
//     setTimeout(() => {
//       resolve();
//     }, 1000);
//   });
// };

// new Scraper().init().then(async (scraper) => {
//   const urlValidateResult = scraper.amazonScraper.validateUrl(
//     "https://www.amazon.com/AmazonBasics-Ergonomic-Wireless-Mouse-adjustable/dp/B78D7D6SGQ/ref=sr_1_22_sspa?crid=2KDRIDSNTZ4KB&keywords=mouse&qid=1663167063&sprefix=mou%2Caps%2C272&sr=8-22-spons&psc=1&spLa=ZW5jcnlwdGVkUXVhbGlmaWVyPUEyVTlZNk02WEJFSkNGJmVuY3J5cHRlZElkPUEwNDk2ODQ5MTlGNUExOEk2WUs4UiZlbmNyeXB0ZWRBZElkPUEwODQ0ODQ5R0pPSlBKUUIyMVRIJndpZGdldE5hbWU9c3BfYnRmJmFjdGlvbj1jbGlja1JlZGlyZWN0JmRvTm90TG9nQ2xpY2s9dHJ1ZQ=="
//   );
//   console.log("amazon url validate result", urlValidateResult);

//   const urlValidateResult2 = scraper.bestbuyScraper.validateUrl(
//     "https://www.bestbuy.com/site/alienware-aw610m-l-wired-wireless-optical-gaming-mouse-with-rgb-lighting-lunar-light/6382729.p?skuId=6382729"
//   );
//   console.log("bestbuy url validate result", urlValidateResult2);

//   const urlValidateResult3 = scraper.neweggScraper.validateUrl(
//     "https://www.newegg.com/black-logitech-g915-lightspeed-clicky/p/N82E16823126553"
//   );
//   console.log("newegg url validate result", urlValidateResult3);

//   //https://www.walmart.com/ip/Hanes-Men-s-Woven-Boxers-3-Pack/958565673?athcpid=958565673&athpgid=AthenaHomepageDesktop__gm__-1.0&athcgid=null&athznid=ItemShowCase_98a0bae1-db56-44d5-b4ba-874ac4de85b2_items&athieid=null&athstid=CS020&athguid=NYoWAR5jVlWMLfmiYhg9Qn4AlW0U26StAdMZ&athancid=null&athena=true

//   const urlValidateResult4 = scraper.walmartScraper.validateUrl(
//     "https://www.walmart.com/ip/Hanes-Men-s-Woven-Boxers-3-Pack/958465673?athcpid=958565673&athpgid=AthenaHomepageDesktop__gm__-1.0&athcgid=null&athznid=ItemShowCase_98a0bae1-db56-44d5-b4ba-874ac4de85b2_items&athieid=null&athstid=CS020&athguid=NYoWAR5jVlWMLfmiYhg9Qn4AlW0U26StAdMZ&athancid=null&athena=true"
//   );
//   console.log("walmart url validate result", urlValidateResult4);

//   return;

//   const neweggPrice = await scraper.getProductPrice(
//     "https://www.newegg.com/black-logitech-g915-lightspeed-clicky/p/N82E16823126553"
//   );
//   console.log("newegg Price:", neweggPrice);

//   const amazonPrice = await scraper.getProductPrice(
//     "https://www.amazon.com/AmazonBasics-Ergonomic-Wireless-Mouse-adjustable/dp/B0787D6SGQ/ref=sr_1_22_sspa?crid=2KDRIDSNTZ4KB&keywords=mouse&qid=1663167063&sprefix=mou%2Caps%2C272&sr=8-22-spons&psc=1&spLa=ZW5jcnlwdGVkUXVhbGlmaWVyPUEyVTlZNk02WEJFSkNGJmVuY3J5cHRlZElkPUEwNDk2ODQ5MTlGNUExOEk2WUs4UiZlbmNyeXB0ZWRBZElkPUEwODQ0ODQ5R0pPSlBKUUIyMVRIJndpZGdldE5hbWU9c3BfYnRmJmFjdGlvbj1jbGlja1JlZGlyZWN0JmRvTm90TG9nQ2xpY2s9dHJ1ZQ=="
//   );
//   console.log("Amazon Price:", amazonPrice);

//   const walmartPrice = await scraper.getProductPrice(
//     "https://www.walmart.com/ip/Mrs-Butterworth-s-Original-Thick-and-Rich-Pancake-Syrup-24-oz/10849944?athbdg=L1600"
//   );
//   console.log("walmartPrice:", walmartPrice);

//   const bestbuyPrice = await scraper.getProductPrice(
//     "https://www.bestbuy.com/site/alienware-aw610m-l-wired-wireless-optical-gaming-mouse-with-rgb-lighting-lunar-light/6382729.p?skuId=6382729"
//   );
//   console.log("BestBuy price:", bestbuyPrice);
// });
