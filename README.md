# このリポジトリは何？

Playwright をスクレイピング用途で利用する際、便利に使えるように自分用に構築したパッケージです。

主に下記の要件を満たす目的で作成しています。

- ブラウザ立ち上げから実行までの記述を簡略化
- ヘッドレスモードの切り替え
- Cookie に任意の値を適用する
- プロキシの適用とランダムでプロキシを決定する
- 画像の読み込みの許可切り替え（プロキシの帯域幅を節約する目的）

```javascript
(async () => {
  const scraping = new Scraping({
    headless: true, // 初期値「true」
    addCookies: [
      {
        // 下記の例は example.com/fuga で hogeキーの「hogehoge_value」が適用される例
        name: "hoge", // Cookieのキー名
        value: "hogehoge_value", // Cookieキー「hoge」の値
        path: "/fuga/", // 「/fuga/」ページで適用
        domain: "example.com", // 「example.com」で適用
      },
    ],
    proxy: {
      username: "hoge-name",
      password: "hoge-pass",
      items: ["111.111.111.111:5555", "222.222.222.222:5555"],
    },
    imageEnable: false, // ブラウザ上で画像データの受信を拒否する
    webFontEnable: false, // Webフォントのデータの受信を拒否する
    browserSize: {
      // ブラウザサイズ
      width: 1280, // 横サイズ
      height: 720, // 縦サイズ
    },
  });

  await scraping.start(); // ブラウザの立ち上げを実行
})();
```

# オプション

オプションは全て任意です。
何も記入しなくても動きます。

◆ headless（デフォルト： true ）  
true -> ヘッドレスモードで実行する  
false -> 見える状態のブラウザを開いて実行する

◆ addCookies（デフォルト： 適用なし）  
通常の Playwright と同じ addCookies の記述方法を使用します。

◆ proxy（デフォルト： 適用なし）  
プロキシの適用をしたい場合はこのオプションを設定します。  
username -> プロキシ認証のユーザー名を指定します。  
password -> プロキシ認証のパスワードを指定します。  
items -> プロキシサーバーのホストを指定します。（http:// は省略してください。）

◆ imageEnable（デフォルト： false）  
ブラウザで画像の読み込みをするかを指定します。  
このオプションはプロキシの帯域幅の節約に有効的です。  
true -> 画像の読み込みを許可する。  
false -> 画像の読み込みを拒否する。

# 特定の通信を監視し、動きがあれば任意の関数を実行する方法

```javascript
scraping.watchResponse(
  {
    domain: "hoge.jp",
    path: "fugafuga",
    status: 200,
    contentType: "application/grpc-web+proto",
  },
  async (page, response, status) => {
    console.log(await page.title());
    console.log(await response.text());
    console.log(status);
  }
);
```

上記コードの場合、 `hoge.jp` ドメインの通信のうち、「fugafuga」が含まれるパスの通信を監視する。ステータスコードが 200 で、尚且つ content-type が 「application/grpc-web+proto」の通信が確認できると関数が実行される。

必ず `async (page, response)` として関数を定義してください。
page には `scraping.page` と同じものが、response には対象の通信のレスポンスデータが格納されています。

例のように `await response.text()` とすることで fugafuga のレスポンスの中身を参照できます。

# Next.js の props データを取得する

```javascript
const props = await scraping.getPropsNextJS();
```

上記の関数を実行すると、Next.js で制作された Web サイトの props データを JSON 形式 で取得できます。
`id="__NEXT_DATA__"` が付与された script タグを innerText() で取得しているだけでの簡単なものです。場合によっては使えないこともありますのでご注意ください。
