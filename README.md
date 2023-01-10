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
    headless: true // 初期値「true」
    addCookies: [
      { // 下記の例は example.com/fuga で hogeキーの「hogehoge_value」が適用される例
        name: "hoge", // Cookieのキー名
        value: "hogehoge_value", // Cookieキー「hoge」の値
        path: "/fuga/", // 「/fuga/」ページで適用
        domain: "example.com" // 「example.com」で適用
      }
    ],
    proxy: ["111.111.111.111:555"],
    images: false // ブラウザ上で画像データの受信を拒否する
  });
})();
```
