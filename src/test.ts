import { Scraping } from ".";

(async () => {
  try {
    const scraping = new Scraping({
      headless: false,
      imageEnable: false,
    });
    await scraping.start();

    scraping.page?.goto("https://www.life-netsuper.jp/ns/introduction");

    scraping.watchResponse(
      {
        domain: "rpc.stailer.jp",
        path: "CheckDeliveryArea",
        status: 200,
        contentType: "application/grpc-web+proto",
      },
      async (page, response) => {
        const title = await page?.title();
        console.log(await response.text());
      }
    );
  } catch (e) {
    console.log(e);
  }
})();
