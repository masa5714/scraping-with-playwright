import { rejects } from "assert";
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
  webFontEnable?: boolean;
  browserSize?: BrowserContextOptions["viewport"];
}

interface customFunction {
  (page: Page, response: Response, result: boolean): void;
}

interface watchResponseOptions {
  [index: string]: string | number | customFunction;
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
    this.setOptionWebFont(typeof options?.webFontEnable === "undefined" ? false : options.webFontEnable); // Webフォントの読み込み許可・拒否オプションを追加
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
    }
  }

  /** ================================================ **/
  // Webフォントの読み込みを適用する
  private setOptionWebFont(webFontEnable: boolean) {
    if (!webFontEnable && this.options.args) {
      this.options.args.push("--disable-remote-fonts");
    }
  }

  /** ================================================ **/
  // 複数ある要素に対して1つずつ任意の処理を実行する
  async eachElementFunction(elements: Locator, func: (element: Locator) => void): Promise<void> {
    return new Promise(async (resolve) => {
      for (let i = 0; i < (await elements.count()); i++) {
        const element: Locator = await elements.nth(i);
        func(element);
      }
      resolve();
    });
  }

  /** ================================================ **/
  // ネットワークの中身を監視する
  watchResponse({ domain, path, status, contentType }: watchResponseOptions, customFunction: (page: Page, response: Response, result: boolean) => void) {
    this.page?.on("response", async (response) => {
      const responseURL = response.url();
      const regexDomain = new RegExp(domain);
      const regexPath = new RegExp(path);
      if (responseURL.match(regexDomain) && responseURL.match(regexPath)) {
        const responseHeaders = await response.allHeaders();
        const statusCode = response.status();
        if (responseHeaders["content-type"] === contentType) {
          if (this.page) {
            if (statusCode === status) {
              customFunction(this.page, response, true);
            } else {
              customFunction(this.page, response, false);
            }
          }
        }
      }
    });
  }

  // gRPCのデータを処理する
  gRPC(text: string) {
    const removedLatinCharacters = this.removeLatinCharacters(text);
    let gRPCStatus = removedLatinCharacters.match(/(�grpc-status|grpc-status).*/g);
    let status = "Playwright_Failed";
    if (gRPCStatus) {
      const gRPCStatusNumber = gRPCStatus[0].replace(/(�grpc-status\:|grpc-status\:)/g, "");
      switch (gRPCStatusNumber) {
        case "0":
          status = "OK";
          break;
        case "1":
          status = "CANCELLED";
          break;
        case "2":
          status = "UNKNOWN";
          break;
        case "3":
          status = "INVALID_ARGUMENT";
          break;
        case "4":
          status = "DEADLINE_EXCEEDED";
          break;
        case "5":
          status = "NOT_FOUND";
          break;
        case "6":
          status = "ALREADY_EXISTS";
          break;
        case "7":
          status = "PERMISSION_DENIED";
          break;
        case "8":
          status = "RESOURCE_EXHAUSTED";
          break;
        case "9":
          status = "FAILED_PRECONDITION";
          break;
        case "10":
          status = "ABORTED";
          break;
        case "11":
          status = "OUT_OF_RANGE";
          break;
        case "12":
          status = "UNIMPLEMENTED";
          break;
        case "13":
          status = "INTERNAL";
          break;
        case "14":
          status = "UNAVAILABLE";
          break;
        case "15":
          status = "DATA_LOSS";
          break;
        case "16":
          status = "UNAUTHENTICATED";
          break;
      }
    }

    return {
      text: removedLatinCharacters.replace(/(�(.*)grpc-status).*/g, ""),
      status: status,
    };
  }

  removeLatinCharacters = (text: string) => {
    let result = text.replace(/[\u00C0-\u00D6\u00D8-\u00f6\u00f8-\u00ff]/g, "");
    return result;
  };

  // 指定した回数だけ実行を行い、成功するまでリトライする。（デフォルト5回、3秒毎に実行）
  getElementsRetrySuccessfully(cssSelector: string = "", retryCount: number = 5, retryInterval: number = 3000): Promise<Locator> {
    return new Promise(async (resolve, reject) => {
      let retryCounter = -1;
      while (true) {
        retryCounter = retryCounter + 1;
        if (retryCounter > retryCount) {
          // リトライ上限を超えたのでエラー扱いにして終了。
          reject(new Error(`${cssSelector}の取得に失敗しました。`));
          break;
        } else {
          if (retryCounter !== 0) {
            console.log(`${cssSelector}の取得をリトライしています。（${retryCounter}回目）`);
            await this.page?.waitForTimeout(retryInterval);
          }
          const targetElements = await this.page?.locator(cssSelector);
          if (targetElements) {
            if ((await targetElements.count()) > 0) {
              resolve(targetElements);
              break;
            }
          }
        }
      }
    });
  }

  // Next.jsで作られたサイトのpropsデータを取得する
  getPropsNextJS() {
    return new Promise(async (resolve, reject) => {
      if (this.page) {
        const nextDataElement = await this.page.locator("#__NEXT_DATA__");
        const nextDataText = await nextDataElement.innerText();
        const nextData = JSON.parse(nextDataText);
        resolve(nextData.props.pageProps);
      }
      reject("propsデータの取得に失敗しました。Next.jsで制作されていない可能性も視野に入れてください。");
    });
  }
}
