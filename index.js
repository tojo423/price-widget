const express = require("express");
const { URL } = require("url");
const BestBuyApi = require("./BestBuyApi");
const { queryParser } = require("express-query-parser");

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

const bestBuyApi = new BestBuyApi();
global.bestBuyApi = bestBuyApi;

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

console.log("Hello");
