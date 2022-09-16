const express = require("express");
const { URL } = require("url");
const { queryParser } = require("express-query-parser");
const {
  AmazonScraper,
  BestBuyScraper,
  NeweggScraper,
  WalmartScraper,
} = require("./scraper");

const amazonScraper = new AmazonScraper();
const bestBuyScraper = new BestBuyScraper();
const neweggScraper = new NeweggScraper();
const walmartScraper = new WalmartScraper();

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

const fixUrl = (url) => {
  if (!url.startsWith("https://www.")) {
    return "https://www." + url;
  }
  return url;
};

app.get("/generator-v2", (req, res) => {
  res.render("generator-v2");
});

app.get("/price-widget-v2", async (req, res) => {
  const query = req.query;
  let productUrl = query.productUrl;
  if (productUrl == "") {
    return res.send("Please enter a URL...");
  }

  productUrl = fixUrl(productUrl);

  let productUrlObj;
  try {
    productUrlObj = new URL(productUrl);
  } catch {
    return res.send("URL is invalid");
  }

  const hostname = productUrlObj.hostname;
  let productPrice;
  switch (hostname) {
    case "www.amazon.com":
      productPrice = await amazonScraper.getProductPrice(productUrl);
      break;
    case "www.newegg.com":
      console.log("[price-widget] newegg URL detected");
      productPrice = await neweggScraper.getProductPrice(productUrl);
      break;
    case "www.walmart.com":
      productPrice = await walmartScraper.getProductPrice(productUrl);
      if (productPrice.includes("Now")) {
        productPrice = productPrice.slice(3);
      }
      break;
    case "www.bestbuy.com":
      productPrice = await bestBuyScraper.getProductPrice(productUrl);
      break;
    default:
      return res.send("Store not recognized");
      break;
  }

  res.render("price-widget-v2", { query, productPrice });
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`⚡️[server]: Server is running at https://localhost:${port}`);
});
