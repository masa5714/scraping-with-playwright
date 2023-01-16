import { Scraping } from "./../src/index";

const watchFontManifest = async (scraping: Scraping) => {
  scraping.watchResponse({
    domain: "flutter-canvas-89807.web.app",
    path: "FontManifest.json",
    status: 200,
    contentType: "application/json",
    successFunction: async (page, response) => {
      // 成功したときの処理
      console.log(await response.text());
    },
    errorFunction: async (page, response) => {
      // 失敗したときの処理
      console.log("failed");
      // await page.waitForLoadState("domcontentloaded");
      // await page.reload();
    },
  });
};

(async () => {
  const scraping = new Scraping({ headless: false });
  await scraping.start();

  await scraping.page?.goto("https://flutter-canvas-89807.web.app/");
  watchFontManifest(scraping); // flutter-canvas-89807.web.appのFontManifest.jsonを監視
})();
