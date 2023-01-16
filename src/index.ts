import { chromium } from "playwright";
import { ChromiumBrowser, BrowserContext, Page, LaunchOptions, Locator, BrowserContextOptions, Response } from "playwright-core";

interface Options {
  headless?: boolean;
  addCookies?: BrowserContext["addCookies"] | [];
  proxy?: {
    [index: string]: string | string[];
    username: string;
    password: string;
    items: string[];
  } | null;
  imageEnable?: boolean;
  browserSize?: BrowserContextOptions["viewport"];
}

interface watchResponseOptions {
  [index: string]: string | number;
  domain: string;
  path: string;
  status: number;
  contentType: string;
}

export class Scraping {
  browser: ChromiumBrowser | null;
  context: BrowserContext | null;
  page: Page | null;
  options: LaunchOptions;

  addCookies: Options["addCookies"];
  browserSize: Options["browserSize"];

  /** ================================================ **/
  constructor(options?: Options) {
    this.browser = null;
    this.context = null;
    this.page = null;
    this.addCookies = typeof options?.addCookies === "undefined" ? [] : options.addCookies;
    this.browserSize = typeof options?.browserSize === "undefined" ? null : options.browserSize;
    this.options = {
      headless: typeof options?.headless === "undefined" ? true : options.headless,
      args: [],
    };
    this.setOptionProxy(typeof options?.proxy === "undefined" ? null : options.proxy); // プロキシのオプションを追加
    this.setOptionImage(typeof options?.imageEnable === "undefined" ? false : options.imageEnable); // 画像の読み込み許可・拒否オプションを追加
  }
  /** ================================================ **/
  // ブラウザの立ち上げを実行する
  async start(): Promise<string> {
    return new Promise(async (resolve, reject) => {
      try {
        if (typeof this.addCookies === "object") {
          await this.initialBrowser();
          resolve("success");
        }
      } catch (e) {
        reject(e);
      }
    });
  }
  /** ================================================ **/
  /** ================================================ **/
  /** ================================================ **/
  // ブラウザの立ち上げ前の準備を行う
  private async initialBrowser() {
    this.browser = await chromium.launch(this.options);

    if (!this.browser) {
      throw new Error("Google Chromeの起動に失敗しました。");
    }

    this.context = await this.browser.newContext();
    await this.setCookies(); // Cookieのオプションを適用
    this.page = await this.context.newPage();
    if (this.browserSize) {
      await this.page.setViewportSize(this.browserSize);
    }
  }
  /** ================================================ **/
  // Cookieの適用をする
  private async setCookies() {
    if (this.context && typeof this.addCookies === "object") {
      await this.context.addCookies(this.addCookies);
    }
  }
  /** ================================================ **/
  // プロキシオプションの適用をする
  private setOptionProxy(proxy: Options["proxy"]) {
    if (proxy !== null && proxy) {
      this.options.proxy = {
        server: `http://${this.getTheProxyByRandom(proxy.items)}`,
        username: proxy.username,
        password: proxy.password,
      };
    }
  }
  /** ================================================ **/
  // プロキシリストからランダムでプロキシを1つ選んで返す
  private getTheProxyByRandom(proxyItems: string[]): string {
    return proxyItems[Math.floor(Math.random() * proxyItems.length)];
  }
  /** ================================================ **/
  // 画像読み込みの設定を適用する
  private setOptionImage(imageEnable: boolean) {
    if (!imageEnable && this.options.args) {
      this.options.args.push("--blink-settings=imagesEnabled=false");
      console.log(this.options);
    }
  }

  /** ================================================ **/
  // 複数ある要素に対して1つずつ任意の処理を実行する
  async eachElementFunction(elements: Locator, func: any): Promise<void> {
    return new Promise(async (resolve) => {
      for (let i = 0; i < (await elements.count()); i++) {
        const element: Locator = await elements.nth(i);
        await func(element);
      }
      resolve();
    });
  }

  /** ================================================ **/
  // ネットワークの中身を監視する
  watchResponse({ domain, path, status, contentType }: watchResponseOptions, customFunction: (page: Page, response: Response) => void) {
    this.page?.on("response", async (response) => {
      const responseURL = response.url();
      const regexDomain = new RegExp(domain);
      const regexPath = new RegExp(path);
      if (responseURL.match(regexDomain) && responseURL.match(regexPath)) {
        const responseHeaders = await response.allHeaders();
        const statusCode = response.status();
        if (statusCode === status && responseHeaders["content-type"] === contentType) {
          if (this.page) {
            customFunction(this.page, response);
          }
        }
      }
    });
  }
}
