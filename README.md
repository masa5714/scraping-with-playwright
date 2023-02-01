# このリポジトリは何？

Playwright をスクレイピング用途で利用する際、便利に使えるように自分用に構築したパッケージです。

主に下記の要件を満たす目的で作成しています。

- ブラウザ立ち上げから実行までの記述を簡略化
- ヘッドレスモードの切り替え
- Cookie に任意の値を適用する
- プロキシの適用とランダムでプロキシを決定する
- 画像の読み込みの許可切り替え（プロキシの帯域幅を節約する目的）
- Web フォントの読み込みの許可・拒否切り替え（プロキシの帯域幅を節約する目的）
- 立ち上げブラウザのサイズを指定

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

| オプション名  | デフォルト | 説明                                                                                                                                                                     |
| ------------- | ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| headless      | true       | ヘッドレスモード<br>true -> ブラウザを表示しない<br>false -> ブラウザを表示する                                                                                          |
| addCookies    | 適用しない | 値ごとに配列で追加する。<br>name -> Cookie のキー名<br>value -> キーに格納する Cookie 値<br>path -> この値を適用するページ<br>domain -> この値を適用するサイトのドメイン |
| proxy         | 適用しない | プロキシの適用<br>username -> プロキシの認証用ユーザー名<br>password -> プロキシの認証用パスワード<br>items -> プロキシ接続先（配列形式で入力）                          |
| imageEnable   | false      | 画像の受信<br>true -> 画像を受信する<br>false -> 画像を受信しない                                                                                                        |
| webFontEnable | false      | Web フォントの受信<br>true -> Web フォントを受信する<br>false -> Web フォントを受信しない                                                                                |
| browserSize   | 1280 x 720 | ブラウザサイズを指定<br>width -> 横方向のサイズ<br>height -> 縦方向のサイズ                                                                                              |

上記オプションは何も指定しなくとも、  
スクレイピングに適したオプションを適用した状態でブラウザを起動します。

ちなみに、スクレイピング用途のプロキシについては[こちらのサービス](https://www.webshare.io/?referral_code=pvyuamiwwexo)がとても安く利用できてオススメです。

プロキシサービスを利用するにあたって最も注意すべきが「帯域幅」の節約です。帯域幅とは、データ通信量のことを指します。データサイズが大きくなるとスクレイピングできるページ数も限られてしまいます。scraping-with-playwright では画像と Web フォントをデフォルトで無効化しており、予め帯域幅の節約を考慮した作りになっています。

# 通常の Playwright の機能を利用する

`scraping` でラップしておりますが、通常の Playwright の機能はそのまま使えます。

例：

```javascript
(async () => {
  const scraping = new Scraping();
  const element = await scraping.page.locator("body");
  console.log(await element.innerText());
})();
```

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

# gRPC のレスポンスデータにフィルタを使いやすい状態で受け取る

※Flutter on Web で制作され、CanvasKit が使われているサイトで検証しました。これに当てはまるサイトは大変稀なため、この関数は有効に動かないかもしれません。その場合、issues に対象サイトの URL を添えてお教え頂けますと幸いです。

```javascript
scraping.watchResponse(
  {
    domain: "hogehoge.jp",
    path: "CheckDeliveryArea",
    status: 200,
    contentType: "application/grpc-web+proto",
  },
  async (page, response) => {
    const gRPC = scraping.gRPC(await response.text());
    console.log(gRPC.text);
  }
);
```

通常、 `await response.text()` の中身にはラテン文字が含まれています。  
一般的にラテン文字はスクレイピングでは不要な文字列となりますので、 `scraping.gRPC()` 関数 で不要なラテン文字を取り除くことができます。
また、末尾に含まれる grpc-status の文字列も不要ですので、こちらも併せて削除してくれます。
