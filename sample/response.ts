import { Scraping } from "./../src/index";

const watchFontManifest = async (scraping: Scraping) => {
  scraping.watchResponse(
    {
      domain: "flutter-canvas-89807.web.app",
      path: "FontManifest.json",
      status: 200,
      contentType: "application/json",
    },
    async (page, response) => {
      console.log(await response.text());
    }
  );
};

(async () => {
  const scraping = new Scraping({ headless: false });
  await scraping.start();

  await scraping.page?.goto("https://flutter-canvas-89807.web.app/");
  watchFontManifest(scraping); // flutter-canvas-89807.web.appのFontManifest.jsonを監視
})();
