const jsdom = require("jsdom");
const { JSDOM } = jsdom;

const url = `https://www-walmart-com.translate.goog/ip/Hanes-Men-s-Woven-Boxers-3-Pack/958565673?athcpid=958565673&athpgid=AthenaHomepageDesktop__gm__-1.0&athcgid=null&athznid=ItemShowCase_98a0bae1-db56-44d5-b4ba-874ac4de85b2_items&athieid=null&athstid=CS020&athguid=NYoWAR5jVlWMLfmiYhg9Qn4AlW0U26StAdMZ&athancid=null&athena=true&_x_tr_sl=tr&_x_tr_tl=en&_x_tr_hl=en&_x_tr_pto=wapp`;
JSDOM.fromURL(url, {
  //   url: url,
  referrer: "https://www.walmart.com/",
  //   contentType: "text/html",
  includeNodeLocations: true,
  storageQuota: 10000000,
  pretendToBeVisual: true,
  userAgent:
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/105.0.0.0 Safari/537.36",
  cookieJar: new jsdom.CookieJar(),
}).then((dom) => {
  require("fs").writeFileSync("walmartpageresponse.html", dom.serialize());
  console.log(dom.serialize());
});
