# 第145章：`<Link>` でページを移動する

この章では、**React Router の `<Link>` コンポーネント**を使って、
「ページっぽい画面」をサクサク行き来できるようにしていきます 💨

---

## 1. `<a>` と `<Link>` のちがいをざっくり 🎓

HTML でページ移動といえば、ふつうはこれですよね：

```html
<a href="/about.html">このサイトについて</a>
```

でも React + React Router の世界では、同じことをだいたい **こんな感じ** で書きます👇

```tsx
import { Link } from "react-router-dom";

<Link to="/about">このサイトについて</Link>
```

**ポイントはここ 👇**

* `<a href="...">`

  * ブラウザがページを**まるごと再読み込み**する
  * JS の状態（useState の値とか）がリセットされがち 🥲
* `<Link to="...">`

  * `react-router-dom` がブラウザの **履歴 API**（`history.pushState` など）を使って、
    **URL だけ変えて React の画面を差し替え**てくれる ([React Router][1])
  * 中身のコンポーネントだけ入れ替えるので、SPA らしく**ぬるっと切り替わる** ✨
  * でも、実体はちゃんと `<a>` タグで `href` も付いてるので、
    「右クリック → 新しいタブで開く」 も普通に動く ([React Router][1])

→ **見た目はリンク、裏ではSPAらしく賢く動いている**のが `<Link>` ちゃんです 💕

![aタグとLinkの比較](./picture/react_study_145_link.png)

---

## 2. 今日のゴール 🏁

この章のゴールはシンプルです 👍

* `/` … Home ページ
* `/about` … このサイトについて
* `/contact` … お問い合わせ

この 3 ページを、**画面上のメニュー（ナビ）から `<Link>` で移動できるようにする**こと 🎉

---

## 3. 前提：ルーターの基本セットアップを軽くおさらい 🧱

前の章まででだいたいこんな感じになっているとします（イメージです）：

### `main.tsx`（アプリ全体を `<BrowserRouter>` で囲む）

```tsx
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.tsx";
import "./index.css";

ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
```

### `App.tsx`（ルートの定義）

```tsx
import { Routes, Route } from "react-router-dom";

function Home() {
  return <h2>Home ページだよ 🏠</h2>;
}

function About() {
  return <h2>About ページだよ 📘</h2>;
}

function Contact() {
  return <h2>Contact ページだよ 💌</h2>;
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/about" element={<About />} />
      <Route path="/contact" element={<Contact />} />
    </Routes>
  );
}

export default App;
```

ここまでは「URL に応じて表示を切り替える」だけの状態です。
ここに **`<Link>` を足して、画面から移動できるようにする**のが今回のテーマです ✨

---

## 4. `<Link>` の基本の書き方 ✏️

### 4-1. import する

`App.tsx` に `<Link>` を追加で読み込みます：

```tsx
import { Routes, Route, Link } from "react-router-dom";
```

### 4-2. メニュー（ナビ）を作る

`App` コンポーネントの中で、ルートの上に**ナビゲーションバー**を置いてみましょう 🎀

```tsx
function App() {
  return (
    <div>
      <h1>My 小さなサイト ✨</h1>

      {/* ここがナビ部分 */}
      <nav>
        <ul>
          <li>
            <Link to="/">ホーム</Link>
          </li>
          <li>
            <Link to="/about">このサイトについて</Link>
          </li>
          <li>
            <Link to="/contact">お問い合わせ</Link>
          </li>
        </ul>
      </nav>

      {/* ページごとの中身 */}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
      </Routes>
    </div>
  );
}
```

👀 ポイント

* `<Link to="/">ホーム</Link>`

  * `to` に行き先のパスを書く（ここでは `/`）
* `<Route path="/" ...>` の `path` と、`<Link to="/">` の `to` が**ペアになる**イメージ

→ 「`to` = 行きたい URL」「`path` = その URL にきたら出すページ」みたいに覚えておくと分かりやすいです 🌸

---

## 5. 画面遷移のイメージを Mermaid で図解してみる 🧠🎨

```mermaid
graph LR
  A["ホーム (path: /)"] -- クリック<br/>to=#quot;/about#quot; --> B["このサイトについて (path: /about)"]
  B -- クリック<br/>to=#quot;/contact#quot; --> C["お問い合わせ (path: /contact)"]
  C -- クリック<br/>to=#quot;/#quot; --> A
```

* 丸っこい箱 = それぞれのページ（`Route`）
* 矢印 = `<Link>` のクリック

**全部同じ 1つの React アプリの中で画面を差し替えているだけ**、というイメージで OK です ✨

---

## 6. `<Link>` でよく使うプロパティ 🌟

この章では「まずは `to` だけ」で十分ですが、
ちょっとだけ「こんなオプションもあるよ〜」という紹介もしておきます 🙌

### 6-1. `to`（必須）

* 行き先の URL を指定する
* よく使うのは **文字列** 版：

```tsx
<Link to="/about">このサイトについて</Link>
<Link to="/contact">お問い合わせ</Link>
```

* 実はオブジェクトでも書ける（`pathname` / `search` / `hash` など）([React Router][1])

```tsx
<Link
  to={{
    pathname: "/search",
    search: "?q=react",
    hash: "#top",
  }}
>
  検索結果へ
</Link>
```

（オブジェクト版は「URL にクエリやハッシュをちゃんと付けたいとき」に便利です 💡）

---

### 6-2. `replace`（履歴を上書きする）

普通に `<Link>` を押すと、ブラウザの履歴に **1件追加** されます（`history.pushState`）。
`replace` を付けると「今のページを上書き」してくれて、戻るボタンで戻れなくなります（`history.replaceState`）。([React Router][1])

```tsx
<Link to="/login" replace>
  ログインページへ（戻るで戻らせたくないとき）
</Link>
```

ログイン後の「リダイレクト」的な場面などでたまに使います ✨

---

### 6-3. `reloadDocument`（どうしても普通の遷移をしたいとき）

`<Link>` は基本的に SPA っぽく「ページをリロードしない」で動きますが、
どうしても「普通の `<a href>` と同じように、ページ全体をリロードしたい」ケースもあります。

そのときは `reloadDocument` を付けます：([React Router][1])

```tsx
<Link to="/legacy-page" reloadDocument>
  昔のページを開く（完全リロード）
</Link>
```

* ふつうのアプリではあまり多用しません
* 会社サイトの「古い静的ページ」に飛ばすとき、みたいなレアケースで使うイメージです 🐣

---

## 7. `<a>` と `<Link>` を混ぜるときの注意 ⚠️

だんだんアプリが大きくなると、**うっかり `<a>` と `<Link>` を混ぜてしまう**ことがあります。

### こんなときは要注意 👇

```html
<!-- これは「外部サイト」に飛ばす時だけにしておく -->
<a href="https://example.com">公式サイトへ</a>
```

React Router で管理している **アプリ内のページ** に行きたいときは、

* ✅ 基本ルール：**アプリ内 → `<Link>`**
* ✅ 外部サイト → `<a href="https://...">`

としておくと、混乱が減ります ✨

---

## 8. ちょっとおしゃれに：シンプルなナビの CSS（おまけ） 🎀

CSS は別の章でじっくりやるので、ここでは軽く「最低限きれいに見せる例」だけ。

`App.tsx` 側で `className` を付けて：

```tsx
<nav className="nav">
  <Link to="/">ホーム</Link>
  <Link to="/about">このサイトについて</Link>
  <Link to="/contact">お問い合わせ</Link>
</nav>
```

`index.css` にちょこっと追記：

```css
.nav {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
}

.nav a {
  text-decoration: none;
  font-weight: 600;
}

.nav a:hover {
  text-decoration: underline;
}
```

「今どのページを開いているか」を強調したいときは、
次の章あたりで出てくる **`<NavLink>`** を使うと、
「アクティブなリンクだけスタイルを変える」こともできます 💅 ([GeeksforGeeks][2])

---

## 9. ミニ演習 📝✨

最後に、手を動かして確認してみましょう！

### 演習 1：3 ページのナビを完成させる

1. `App.tsx` に `<Link>` を import する
2. `Home` / `About` / `Contact` コンポーネントを用意する
3. `<nav>` の中に以下の 3 つの `<Link>` を並べる

   * `to="/"` … ホーム
   * `to="/about"` … このサイトについて
   * `to="/contact"` … お問い合わせ
4. ブラウザで確認：

   * クリックしてもページ全体はリロードされず、URL だけ変わるか？
   * 各ページの内容がちゃんと切り替わるか？

### 演習 2：外部リンクとの違いを確認してみる

1. ナビの下あたりに、普通の `<a>` も 1 つ追加する

```tsx
<a href="https://react.dev" target="_blank" rel="noreferrer">
  React 公式サイト（新しいタブで開く）
</a>
```

2. `<Link>` と `<a>` の動きの違いを、自分の言葉でメモしてみる ✍️

---

## 10. この章のまとめ 🌈

* `<Link>` は、React Router が提供する「SPA 用のリンク」コンポーネント
* `to` で行き先を指定し、`<Route path="...">` と組み合わせて使う
* 中身はちゃんと `<a>` タグ + `href` を持っているので、右クリックなども普通に使える ([React Router][1])
* `replace` や `reloadDocument` などのオプションで、履歴や遷移方法を細かくコントロールできる
* アプリの中のページ → `<Link>`、外部サイト → `<a>` が基本ルール 👍

次の章では、URL から ID などを取り出せる **`useParams`** に進んでいきます！
`/user/123` の「123」をゲットするテクニックなので、
今回の `<Link>` をしっかり押さえておくとスムーズに入れますよ〜 💪💖

[1]: https://reactrouter.com/6.30.2/components/link "Link v6.30.2 | React Router"
[2]: https://www.geeksforgeeks.org/reactjs/link-and-navlink-components-in-react-router-dom/?utm_source=chatgpt.com "Link and NavLink components in React-Router-Dom"
