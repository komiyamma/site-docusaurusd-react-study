# 第146章：`useParams` でURLのパラメータを取る
(`/user/123` の `123` をちゃんと受け取ろう！)

---

## 1️⃣ この章でできるようになること

この章では、こんなことができるようになります👇

* URL の一部（`/users/123` の `123` みたいなやつ）を **パラメータとして受け取る** ✨
* `useParams` フックを使って、コンポーネントの中でその値を読む 🧠
* TypeScript で `useParams` に **ちゃんと型をつける**（`id: string` って言い切る）📘
* 数字っぽい ID を `number` に変換して使う 🧮

---

## 2️⃣ まずはイメージをつかもう 🧭

URL がこんな感じだとします：

* `/users/1`
* `/users/2`
* `/users/999`

全部「ユーザー詳細ページ」なんだけど、
**表示する中身だけが ID によって変わる**イメージです。

そこで、React Router ではこんなルートを書きます👇

```tsx
<Route path="/users/:id" element={<UserDetail />} />
```

`/users/:id` の `:id` の部分が「パラメータ」です。
実際の URL が `/users/123` のとき、`id` は `"123"` という文字列になります。

---

## 3️⃣ URL → Router → コンポーネント → useParams の流れを図で見る 🧊

Mermaid で流れを図解してみます 💡

```mermaid
flowchart LR
  A["ブラウザのURLバー<br/>/users/123"] --> B["React Router<br/>path: /users/:id"]
  B --> C[UserDetail コンポーネント]
  C -->  D["useParams() で<br/>id = #quot;123#quot; を取得"]
```

だいたいこんな感じの流れです 😊

![useParamsのイメージ](./picture/react_study_146_useparams.png)

---

## 4️⃣ サンプルプロジェクトの前提 🎒

この章では、以下が **もうできている前提** で話を進めます：

* Vite + React + TypeScript プロジェクトがある
* `react-router-dom` がインストール済み
* `BrowserRouter` / `Routes` / `Route` / `<Link>` を、前の章で触っている

もし `react-router-dom` をまだ入れてなければ、一応コマンドだけ貼っておきます👇

```bash
npm install react-router-dom
```

---

## 5️⃣ `useParams` のいちばんシンプルな使い方 ✨

まずは雰囲気をつかむために、**完全にシンプル版** を見てみましょう。

`UserDetail.tsx` というコンポーネントを用意して、
URL から `id` を受け取り、そのまま画面に表示してみます。

### 🔹 UserDetail コンポーネント（型なし版）

```tsx
// src/UserDetail.tsx
import { useParams } from "react-router-dom";

export function UserDetail() {
  // URLパラメータを取得
  const params = useParams();
  const id = params.id;

  return (
    <div>
      <h1>ユーザー詳細ページ</h1>
      <p>このページのユーザーIDは {id} です。</p>
    </div>
  );
}
```

ポイント 👇

* `useParams()` は **オブジェクト** を返します（例：`{ id: "123" }`）
* ルート定義で `:id` と書いておけば、オブジェクトのキーも `id` になります

---

## 6️⃣ `Route` 側の設定も確認しよう 🛣

さっきの `UserDetail` をちゃんと呼び出すために、
`App.tsx` 側でルート設定をしておきます。

### 🔹 App.tsx の例（`/users/:id` を追加）

```tsx
// src/App.tsx
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import { UserDetail } from "./UserDetail";

export function App() {
  return (
    <BrowserRouter>
      <nav style={{ display: "flex", gap: "12px", marginBottom: "16px" }}>
        <Link to="/users/1">ユーザー1</Link>
        <Link to="/users/2">ユーザー2</Link>
        <Link to="/users/123">ユーザー123</Link>
      </nav>

      <Routes>
        <Route path="/users/:id" element={<UserDetail />} />
        {/* 他のルートがあればここに書く */}
      </Routes>
    </BrowserRouter>
  );
}
```

🌟 ここまで書けたら、

1. `npm run dev`
2. ブラウザで `http://localhost:5173`（Vite のデフォルト）にアクセス
3. ナビゲーションのリンクをクリックしてみる

URL が `/users/1` になったら、`UserDetail` が表示されて
`id` の部分がちゃんと変わっているのを確認してみてください 🎉

---

## 7️⃣ TypeScript で `useParams` に型をつける 💪

さっきの `UserDetail` は、型的にはちょっと甘めです。

`useParams()` は TypeScript 的にはこんな感じの型になっていて 👇([React Router][1])

* 返り値の各プロパティは **`string | undefined`** とみなされがち

でも、今回のルートは `/users/:id` なので、
**ちゃんとマッチしている限り `id` は絶対あるはず** ですよね。

そこで、ジェネリクスを使って
「このルートでは `id` は必ず `string` だよ」と教えてあげます。

### 🔹 型付き `useParams` の書き方

```tsx
// src/UserDetail.tsx
import { useParams } from "react-router-dom";

type UserDetailParams = {
  id: string; // このURLでは id は絶対 string だよ、という前提
};

export function UserDetail() {
  const { id } = useParams<UserDetailParams>();

  return (
    <div>
      <h1>ユーザー詳細ページ</h1>
      <p>このページのユーザーIDは {id} です。</p>
    </div>
  );
}
```

ここが TypeScript 的イイところ 🥰

* `useParams<UserDetailParams>()` とすることで、

  * VSCode が `id` を **string として扱ってくれる**
  * `id.toUpperCase()` とかをしても **型エラーにならない**

---

## 8️⃣ 数字として使いたいときは？ 🔢

URL の ID は文字列として取れますが、
データベースや配列検索では **数値として扱いたい** こともよくあります。

そんなときは、`Number()` や `parseInt()` を使って明示的に `number` に変換します。

### 🔹 `id` を number に変換する例

```tsx
// src/UserDetail.tsx
import { useParams } from "react-router-dom";

type UserDetailParams = {
  id: string;
};

export function UserDetail() {
  const { id } = useParams<UserDetailParams>();

  // id は string なので、number に変換
  const numericId = Number(id);

  // 変換に失敗したときのチェック（NaN になる）
  const isValidId = !Number.isNaN(numericId);

  if (!isValidId) {
    return <p>URLのIDが正しくありません…😢</p>;
  }

  return (
    <div>
      <h1>ユーザー詳細ページ</h1>
      <p>数値としてのユーザーID：{numericId}</p>
    </div>
  );
}
```

💡 実務だと、ここからさらに

* `numericId` を使って API からユーザー情報を取ってきたり
* ユーザー一覧の配列から `find` したり

…という流れにつながっていきます。

---

## 9️⃣ よくあるハマりポイント 🚨

`useParams` でやりがちなミスを、先に知っておきましょう。

### ❌ 1. `Route` のパスと `useParams` のキー名が違う

```tsx
// Route側
<Route path="/users/:userId" element={<UserDetail />} />

// コンポーネント側
const { id } = useParams(); // ← ここ、キーが違う！
```

こうすると、`id` は `undefined` になっちゃいます 💦
**`:userId` と書いたら、`useParams().userId` で受け取る**、という対応関係を忘れないようにしましょう。

---

### ❌ 2. `useParams` をルート外で使っている

`useParams` は **React Router に管理されているコンポーネントの中** でないと使えません。

例えばこんな感じは NG です👇

```tsx
// App.tsx で <BrowserRouter> の外側に書いている…など
function App() {
  const params = useParams(); // ❌ ここではまだRouterがない

  return <div>...</div>;
}
```

必ず、

* `BrowserRouter`
* またはそれに相当する Router コンポーネント

の **内側** にあるコンポーネントの中で使いましょう ✅

---

### ❌ 3. URL の書き間違い

ナビゲーション側で、`to` の URL を間違えるパターンです。

```tsx
// Route
<Route path="/users/:id" element={<UserDetail />} />

// Link
<Link to="/user/1">ユーザー1</Link> // ❌ "users" じゃなく "user" になってる！
```

これだと `UserDetail` に届きません 🥲
`path` と `to` が一致しているか、VSCode の検索などでチェックしてみてください。

---

## 🔟 ちょっと実践：ミニ演習コーナー ✍️

小さな演習を通して、手を動かして覚えましょう 💪

### 📝 練習1：記事の詳細ページ

**やりたいこと**

* `/articles/:slug` というルートを作る
* `slug` を画面に表示する

  * 例： `/articles/react-19-intro` → `react-19-intro` と表示

**ヒント**

1. `ArticleDetail.tsx` を作る
2. 型は `type ArticleParams = { slug: string }`
3. `useParams<ArticleParams>()` で受け取る
4. `App.tsx` に `<Route path="/articles/:slug" ...>` を追加する
5. `<Link to="/articles/react-19-intro">` などで試す

---

### 📝 練習2：複数パラメータを受け取る

**やりたいこと**

* `/users/:userId/posts/:postId`
* `userId` と `postId` を両方受け取る

**ヒント**

```ts
type UserPostParams = {
  userId: string;
  postId: string;
};
```

`const { userId, postId } = useParams<UserPostParams>();` で受け取ってみてください 👀

---

## 1️⃣1️⃣ まとめ 🌈

この章のポイントをおさらいすると…👇

* `path="/users/:id"` の `:id` みたいな部分が **URLパラメータ**
* `useParams()` でその値を **オブジェクトとして取得** できる
* TypeScript では `useParams<{ id: string }>()` のように
  **ジェネリクスで型をつけるとすごく安全＆便利**
* ID を数字として扱いたいときは `Number(id)` / `parseInt(id, 10)` で変換
* ルートの `:名前` と、`useParams` で取り出すキー名は **必ず一致させる！**

---

## 1️⃣2️⃣ ミニクイズ 🧠✨

最後に、3問だけクイズでチェックしてみましょう♪

1. `path="/products/:productId"` のとき、`useParams` から `productId` を受け取るコードとして正しいのはどれ？

   * a) `const { id } = useParams();`
   * b) `const { productId } = useParams();`
   * c) `const params = useParams(); const { product } = params;`

2. TypeScript で「`id` は必ず string」と言いたいときの書き方で正しいのは？

   * a) `useParams<{ id: string }>()`
   * b) `useParams(id: string)`
   * c) `useParams<string>()`

3. `useParams` を使っているのに `undefined` になりやすい原因として「ありそう」なのはどれ？

   * a) `<BrowserRouter>` の外で `useParams` を呼んでいる
   * b) コンポーネント名が小文字で始まっている
   * c) React のバージョンが 19 だから

---

次の第147章では、`useNavigate` を使って
**「コードからページ移動」** をしてみます 🚀
ボタンを押したら別ページに飛ばすような動きが作れるようになりますよ〜！

[1]: https://reactrouter.com/api/hooks/useParams?utm_source=chatgpt.com "useParams"
