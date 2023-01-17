import { Scraping } from ".";
import { Locator } from "playwright-core";

(async () => {
  try {
    const scraping = new Scraping();
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
