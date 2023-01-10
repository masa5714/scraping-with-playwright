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
