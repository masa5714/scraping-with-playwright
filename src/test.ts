import { Scraping } from ".";
import { Locator } from "playwright-core";

(async () => {
  try {
    const scraping = new Scraping({
      headless: false,
    });
    await scraping.start();

    await scraping.page?.goto("https://www.life-netsuper.jp/ns/introduction");

    scraping.watchResponse(
      {
        domain: "rpc.stailer.jp",
        path: "CheckDeliveryArea",
        status: 200,
        contentType: "application/grpc-web+proto",
      },
      async (page, response) => {
        const gRPC = scraping.gRPC(await response.text());
        console.log(gRPC.text);
      }
    );

    await scraping.page?.waitForTimeout(5000);
    await scraping.page?.mouse.click(640, 686);
    await scraping.page?.locator("input.flt-text-editing").fill("1000000");
    await scraping.page?.mouse.click(640, 760);
  } catch (e) {
    console.log(e);
  }
})();
