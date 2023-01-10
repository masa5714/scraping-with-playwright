import { Scraping } from ".";

(async () => {
  try {
    const scraping = new Scraping({
      headless: false,
      imageEnable: false,
    });
    await scraping.start();

    scraping.page?.goto("https://yahoo.co.jp");
  } catch (e) {
    console.log(e);
  }
})();
