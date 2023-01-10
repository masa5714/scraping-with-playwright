import { chromium } from "playwright";
import { ChromiumBrowser, BrowserContext, Page, LaunchOptions } from "playwright-core";

interface Options {
  headless: boolean;
  addCookies: BrowserContext["addCookies"] | [];
  proxy: {
    [index: string]: string | string[];
    username: string;
    password: string;
    items: string[];
  } | null;
  imageEnable: boolean;
}

export class Scraping {
  browser: ChromiumBrowser | null;
  context: BrowserContext | null;
  page: Page | null;
  option: LaunchOptions;
  /** ================================================ **/
  constructor({ headless = true, addCookies = [], proxy = null, imageEnable = false }: Options) {
    this.browser = null;
    this.context = null;
    this.page = null;
    this.option = {
      headless: headless,
      args: [],
    };
    this.setOptionProxy(proxy); // プロキシのオプションを追加
    this.setOptionImage(imageEnable); // 画像の読み込み許可・拒否オプションを追加
  }
  /** ================================================ **/
  // ブラウザの立ち上げを実行する
  async start({ addCookies = [] }: Options): Promise<string> {
    return new Promise(async (resolve, reject) => {
      try {
        if (this.context && typeof addCookies === "object") {
          await this.initialBrowser(addCookies);
          resolve("success");
        }
      } catch (e) {
        reject(e);
      }
    });
  }

  /** ================================================ **/
  // ブラウザの立ち上げ前の準備を行う
  private async initialBrowser(addCookies: Options["addCookies"]) {
    this.browser = await chromium.launch(this.option);

    if (!this.browser) {
      throw new Error("Google Chromeの起動に失敗しました。");
    }

    this.context = await this.browser.newContext();
    await this.setCookies(addCookies); // Cookieのオプションを適用
    this.page = await this.context.newPage();
  }
  /** ================================================ **/
  // Cookieの適用をする
  private async setCookies(addCookies: Options["addCookies"]) {
    if (this.context && typeof addCookies === "object") {
      await this.context.addCookies(addCookies);
    }
  }
  /** ================================================ **/
  // プロキシオプションの適用をする
  private setOptionProxy(proxy: Options["proxy"]) {
    if (proxy !== null) {
      this.option.proxy = {
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
    if (imageEnable && this.option.args !== undefined) {
      this.option.args.push("--blink-settings=imagesEnabled=false");
    }
  }
}
