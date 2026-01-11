# 第142章：`react-router-dom` をインストール

この章では、**Reactアプリに「道案内係（ルーター）」を入れる準備**をします 🌈
ゴールはただひとつ：

> 「自分の Vite + React プロジェクトに、React Router をインストールして、使える状態にする」✨

---

## 1. 今日やることチェック ✅

この章でやるのは、ざっくり言うとこの3つです：

1. `react-router` と `react-router-dom` の**2025年版の違い**を知る
2. VS Code のターミナルから、ルーターを**インストールするコマンド**を打つ
3. ちゃんとインストールできたかを **`package.json` で確認**する

全部「コマンドを1行打つ＋確認する」くらいなので、肩の力をぬいてやっていきましょ〜 😸

---

## 2. いまどこ？これからどこ？を図で見る 🗺️

まずは、今のプロジェクトの状態と、これからの状態をざっくり図にしてみます ✍️

（Mermaid 図 👇）

```mermaid
flowchart LR
  A[既にある<br/>Vite + React + TypeScript プロジェクト] --> B[npm install react-router]
  B --> C[package.json に<br/>react-router が追加される]
  C --> D[BrowserRouter, Routes などを<br/>import できる状態になる]
  D --> E[次の章で<br/>実際に画面をルーティング！]
```

この章では **A → B → C** のところをやります。
**D（`BrowserRouter` でアプリを囲む）以降は次の章（第143章）**でやるので、今は「準備だけ」と思ってOKです 🌸

![react-router インストールのイメージ](./picture/react_study_142_router_install.png)

---

## 3. 名前がややこしい問題：`react-router` vs `react-router-dom` 🤯

章タイトルには「`react-router-dom` をインストール」と書いてありますが、
**2025年時点ではちょっと事情が変わっています**。

### 3-1. 昔からよく見る `react-router-dom` 🏙️

* チュートリアルやブログ記事を見ると、今でも
  `npm install react-router-dom` という説明がたくさん出てきます。
* これは「React Router を **ブラウザ（DOM）で使うためのパッケージ**」という位置づけでした。

ところが最新版（v7 系）では、`react-router-dom` は

> 「中身は `react-router` を**そのまま再エクスポートしているだけのラッパ」

という役割になってきています。([npm][1])

### 3-2. 公式ドキュメントの「いまどきのおすすめ」📚

React Router の公式ドキュメントでは、**新しいアプリを作る場合**は

> `react-router` をインストールして、そこから `BrowserRouter` などを import する ✅

という形が紹介されています。([React Router][2])

```text
npm i react-router
```

↑ これが **2025年時点の公式おすすめスタイル** と思って大丈夫です ✨

### 3-3. この教材ではどうする？🧭

* ロードマップ上の章タイトルはそのまま **「react-router-dom をインストール」** にしておきます（歴史的理由で有名な名前だから）。
* **実際に打つコマンドは、公式どおり `react-router` をインストール** します。
* もし他のサイトで `react-router-dom` と書いてあっても

  > 「あ、今は `react-router` でいけるやつだな〜」
  > と理解できればOKです 👍

---

## 4. 事前チェック 🕵️‍♀️

React Router を入れる前に、サクッと環境チェックをしておきましょう。

### 4-1. Node.js と npm が入っているか確認 👀

Windows で **「スタートメニュー → `cmd`」** や
VS Code の **Terminal → New Terminal** を開いて、次を打ってみます：

```bash
node -v
npm -v
```

* 両方とも `v18.○○` / `10.○○` みたいに数字が出てくればOK 🎉
* もし「`node` は内部コマンドまたは外部コマンド…」みたいなエラーが出たら
  Node.js のインストールに問題があるので、第4章を見直してみてください。

### 4-2. Vite プロジェクトのフォルダにいるか確認 📁

この教材では、すでに

* Vite + React + TypeScript (`react-ts` テンプレート)
* React 19 系

のプロジェクトがある前提です。React 19 自体は `react@^19.0.0` / `react-dom@^19.0.0` を入れる形で導入されています。([React][3])

VS Code でそのプロジェクトを開いたうえで、ターミナルにこんな感じで表示されているか確認します：

```text
PS C:\Users\あなたの名前\projects\my-react-app>
```

`my-react-app` のところは自分のプロジェクト名になっていればOKです 🥳

---

## 5. 実際に React Router をインストールしよう 🛠️

ではいよいよ本番！
**ターミナルにコマンドを1行打つだけ**です。落ち着いていきましょう〜。

### 5-1. コマンドを打つ 💻

プロジェクトのルート（`package.json` がある場所）で、次を実行します：

```bash
npm install react-router
```

* `install` は短くして `i` と書いてもOKです（`npm i react-router`）。
* エンターキーを押すと、しばらくカチャカチャとログが流れます。

> ※ もし `pnpm` や `yarn` を使っている場合：
>
> * `pnpm add react-router`
> * `yarn add react-router`
>   みたいに書き換えても意味は同じです ✨

### 5-2. 終わったときのログのイメージ 📜

うまくいくと、最後にこんな感じの行が出てきます（数字は例です）：

```text
+ react-router@7.x.x
added 10 packages, and audited 150 packages in 3s
```

`+ react-router@7...` みたいに出ていれば、
**React Router 7 系が入ったよ！**というサインです。([npm][4]) 🎉

---

## 6. `package.json` でインストールを確認する 👓

コマンドが成功したら、VS Code で **`package.json`** を開いてみましょう。

だいたいこんな感じの `dependencies` があるはずです：

```json
{
  "dependencies": {
    "react": "^19.2.0",
    "react-dom": "^19.2.0",
    "react-router": "^7.10.1",
    // そのほか Vite が入れてくれたパッケージたち……
  }
}
```

ポイントはここ 👇

* `"react-router": "^7.x.x"` という行が入っていればOK ✨
* バージョンの数字（`7.10.1` など）は多少違っても大丈夫です（`^7.` で始まっていれば7系）。

> 💡 補足：`react-router-dom` を入れたときは
> `"react-router-dom": "^7.x.x"` という行になります。
> 今回は **`react-router` だけ** が入っていればOKです。

---

## 7. ちょっとだけ深掘り：「TypeScript と相性いいの？」🧠

React Router 7 は、**TypeScript 前提でかなり強力な型サポート**が用意されています。
ルートのパラメータや、ロードしたデータに型をつけられる仕組みが入っていて、

> 「ルーティング周りで `any` だらけになっちゃう…」問題をかなり減らしてくれる

という方向で作られています。([React Router][5])

この章ではまだ「インストールしただけ」ですが、

* `useParams`
* ルートごとの型定義

などを進めていくときに、
**TypeScript の恩恵をがっつり感じられるようになっていきます ✨**

---

## 8. よくあるつまずきポイント Q&A 🩹

### Q1. `npm install react-router` でエラーがいっぱい出た…😢

よくある原因：

* インターネットが一瞬切れた
* npm のキャッシュが壊れている
* プロジェクトフォルダじゃない場所で `npm install` している

対処の順番：

1. もう一度同じコマンドを打ってみる（案外これで直ることも多いです）
2. `package.json` がちゃんとあるフォルダにいるか確認する
3. 必要なら

   * `rm -rf node_modules package-lock.json`
   * `npm install`（再インストール）
     をやってから `npm install react-router` をやり直す

---

### Q2. 他のサイトには「`react-router-dom` を入れろ」って書いてあるんだけど…？🤔

> A. それは **昔からの慣習** ＋ **v6 時代の説明** だと思ってOKです。

* `react-router-dom` も **今でも動きます**。中では `react-router` を再エクスポートしています。([npm][1])
* 公式としては、**新規プロジェクトは `react-router` をインストール → そちらから import** という流れが推しになっています。([React Router][2])

将来、他の教材を読むときも、

> 「あ、これは `react-router` のことね」

と頭の中で変換できればOKです 🌟

---

## 9. ミニ演習・チェックテスト ✍️✨

最後に、ちゃんと理解できているか **軽くセルフチェック**してみましょう。

### ✅ やってみてほしいこと

1. VS Code で自分の Vite プロジェクトを開く
2. ターミナルから

   * `node -v`
   * `npm -v`
     を打って、バージョンが出るか確認
3. プロジェクトのルートで

   * `npm install react-router`
     を実行
4. `package.json` を開いて

   * `"react-router": "^7...` の行があるか確認

ここまで出来たら、**第142章のゴール達成です！** 🎉🎉🎉

---

## 10. 次の章への予告 🎬

次の **第143章** では、いよいよ

* `BrowserRouter` を使ってアプリ全体を「ルーター対応」モードにする

ところに進みます 🚀

* 今回インストールした `react-router` から、
* `BrowserRouter` を import して、
* `main.tsx`（または `main.jsx`）をちょこっと書き換える 💡

という実践ステップに入るので、お楽しみに〜！🌸✨

[1]: https://www.npmjs.com/package/react-router-dom?utm_source=chatgpt.com "react-router-dom"
[2]: https://reactrouter.com/start/declarative/installation?utm_source=chatgpt.com "Installation"
[3]: https://react.dev/blog/2024/04/25/react-19-upgrade-guide?utm_source=chatgpt.com "React 19 Upgrade Guide"
[4]: https://www.npmjs.com/package/react-router?utm_source=chatgpt.com "react-router"
[5]: https://reactrouter.com/?utm_source=chatgpt.com "React Router Official Documentation"
