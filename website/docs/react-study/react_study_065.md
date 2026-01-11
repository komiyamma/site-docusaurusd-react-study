# 第65章：`useEffect` でネットからデータを取ってくる

![Fetch API のイメージ](./picture/react_study_065_fetch_api.png)

（v19 では “ちょっと古め” の書き方だけど、まだまだ現役！）

---

### 1. なんで今さら `useEffect` でデータ取得なの？🤔

React v19 では、本当は `use(Promise)` ＋ `Suspense` っていう **新世代のデータ取得スタイル** が推されてます。
`useState` と `useEffect` を組み合わせなくても、Promise を直接読めちゃう感じです。([react.dev][1])

でも、それでも **この章であえて「旧スタイル」を学ぶ理由** はちゃんとあります👇

* 既存の React 教材・ブログ・Qiita 記事は、まだまだほとんどが
  👉 **`useEffect + fetch` スタイル** で書かれている
* 会社やインターン先のプロジェクトも、いきなり v19 スタイルにはなってないことが多い
* 「画面の表示 → データを取りに行く → State を更新 → 再レンダー」
  という **React の基本の流れ** を体で覚えるのにちょうどいい

> なのでこの章は
> **「歴史も学びつつ、今でも普通に使えるやり方」** を身につける回です 🏫✨

---

### 2. まずはイメージから：何をやりたいの？👀

今回目指すのは、こんな流れです。

1. コンポーネントが画面に表示される
2. `useEffect` が「よし、データ取りに行くぞ〜」と動き出す
3. `fetch` でネット上の API にリクエストを飛ばす
4. データが返ってきたら `useState` で State を更新
5. 画面が **自動で** 最新のデータに書き換わる ✨

これを図にすると、こんな感じ👇

```mermaid
flowchart TD
  A[コンポーネントが初回レンダー] --> B["useEffect が実行される"]
  B --> C[fetch で API にリクエスト]
  C -->|成功| D["setPosts / setIsLoading(false)"]
  C -->|失敗| E["setError / setIsLoading(false)"]
  D --> F[再レンダーして一覧を表示]
  E --> F[再レンダーしてエラー文を表示]
```

「コンポーネントは **表示のことだけ考える**」
それ以外の“裏の仕事”（通信、エラー処理など）を、`useEffect` にやってもらうイメージです 💼

---

### 3. 作ってみるミニアプリ：記事一覧ビューア 📰

今回作るのは、**無料のテスト用 API** から記事一覧を取ってきて表示するコンポーネントです。

* API：`https://jsonplaceholder.typicode.com/posts?_limit=5`
  → テスト用のダミー記事が 5 件返ってきます
* やること：

  * 読み込み中は「Loading...」を表示
  * 失敗したらエラーメッセージを表示
  * 成功したら記事タイトルの一覧を表示

---

### 4. TypeScript でデータの「型」を決める 🧱

まずは「API から返ってくるデータの形」を `type` で決めちゃいましょう。
（こうしておくと、VS Code がめちゃくちゃ優しく教えてくれます 💻）

`src/features/posts/Posts.tsx` みたいなファイルを作る想定で書きます。

```ts
// src/features/posts/Posts.tsx
import { useEffect, useState } from "react";

type Post = {
  userId: number;
  id: number;
  title: string;
  body: string;
};
```

ここまでで、「`Post` ってこういう形のデータだよ〜」と TS に教えた状態です。

---

### 5. State を用意しよう：`data / isLoading / error` trio 🎲

データ取得系では、だいたいこの 3 つの State を使います。

* `posts`：取得した記事の配列
* `isLoading`：今読み込み中かどうか
* `error`：エラーが起きたら、そのメッセージ（なければ `null`）

```ts
export function Posts() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <div>
      <h2>記事一覧</h2>
      {/* ここにあとで表示処理を書く */}
    </div>
  );
}
```

まだ `useEffect` は書いてないけど、**受け皿だけ作った状態** です 🍽️

---

### 6. `useEffect` で「初回だけ」データを取りに行く 🚀

いよいよデータ取得パートです。
ポイントはこの 2 つ！

1. `useEffect(() => { ... }, [])`
   → 「最初に表示されたときに 1 回だけ」動く
2. `useEffect` の中で **async 関数を作って呼ぶ**
   → `useEffect` 自体には `async` を付けない書き方が定番

```ts
export function Posts() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // ① まずは読み込み開始！
    setIsLoading(true);
    setError(null);

    // ② 非同期の関数を中で定義
    async function fetchPosts() {
      try {
        const response = await fetch(
          "https://jsonplaceholder.typicode.com/posts?_limit=5"
        );

        if (!response.ok) {
          throw new Error("サーバーエラーが起きました");
        }

        const data: Post[] = await response.json();
        setPosts(data); // ③ データを State に保存
      } catch (err) {
        console.error(err);
        setError("データの取得に失敗しました 😢");
      } finally {
        setIsLoading(false); // ④ 読み込み終了
      }
    }

    // ⑤ 関数を実行
    fetchPosts();
  }, []); // ← 見張りリストが [] だから「初回だけ」

  // ⑥ 状況に応じて表示を切り替える
  if (isLoading) {
    return <p>Loading... ⏳</p>;
  }

  if (error) {
    return <p style={{ color: "red" }}>{error}</p>;
  }

  return (
    <div>
      <h2>記事一覧 📰</h2>
      <ul>
        {posts.map((post) => (
          <li key={post.id}>
            <strong>{post.title}</strong>
          </li>
        ))}
      </ul>
    </div>
  );
}
```

#### ここまでの流れをおさらい 👇

* 初回レンダー → `useEffect` が発動
* `fetchPosts()` が呼ばれて API にリクエスト
* 成功 → `setPosts(data)` → 再レンダー → リスト表示 🎉
* 失敗 → `setError("…")` → 再レンダー → エラー表示 ⚠️
* どちらにしても最後に `setIsLoading(false)`

---

### 7. `App.tsx` に組み込んで動かしてみよう 🧪

Vite のテンプレにそのまま追加するイメージです。

`src/App.tsx` をこんな感じにします。

```ts
import "./App.css";
import { Posts } from "./features/posts/Posts";

function App() {
  return (
    <div className="App">
      <h1>React × useEffect データ取得の練習 ✨</h1>
      <Posts />
    </div>
  );
}

export default App;
```

ターミナルで：

```bash
npm run dev
```

ブラウザで `http://localhost:5173/` を開いて…

* 最初に `Loading...` ⏳ が出て
* ちょっとしたら記事のタイトルが並んだら **大成功** です 🎉🎉

---

### 8. ちょっとだけ “お片づけ” の話（AbortController）🧹

第62章で `useEffect` の「お片づけ関数」やりましたよね？🧼
データ取得でも、**コンポーネントが消えたときに通信を中止する** というお片づけができます。

これは、`AbortController` というブラウザの機能を使います。

```
ts
useEffect(() => {
  const controller = new AbortController();

  async function fetchPosts() {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(
        "https://jsonplaceholder.typicode.com/posts?_limit=5",
        { signal: controller.signal } // ← ここに signal を渡す
      );

      if (!response.ok) {
        throw new Error("サーバーエラーが起きました");
      }

      const data: Post[] = await response.json();
      setPosts(data);
    } catch (err) {
      // 中断された場合は何もしない
      if (err instanceof DOMException && err.name === "AbortError") {
        console.log("リクエストは中断されました");
        return;
      }
      console.error(err);
      setError("データの取得に失敗しました 😢");
    } finally {
      setIsLoading(false);
    }
  }

  fetchPosts();

  // ★ お片づけ関数
  return () => {
    controller.abort();
  };
}, []);
```

最初のうちは「へぇ〜こういう書き方もあるんだ」くらいで OK です。
実務で大きな画面を書くようになったら、ちゃんと中断処理も意識できるとカッコいいです 😎✨

---

### 9. よくあるつまづきポイント Q&A 💬

#### Q1. `useEffect` に直接 `async` 付けちゃダメなの？ 🤯

```ts
// これはあまり推奨されない書き方
useEffect(async () => {
  const res = await fetch("...");
  ...
}, []);
```

技術的には動く場合もあるんですが、`useEffect` の戻り値は
「お片づけ関数」か `undefined` であることが期待されています。

`async` を付けると、**Promise を返す関数** になってしまうので、
「お片づけ関数と Promise がごちゃごちゃになる」問題があり、
**中で async 関数を定義して呼ぶスタイル** がよく使われます。

#### Q2. 依存配列 `[]` を付け忘れるとどうなる？ 🌀

```ts
useEffect(() => {
  fetchPosts();
}); // ← [] がない
```

この場合、**レンダーのたびに毎回 `fetchPosts` が呼ばれます**。
State を更新 → 再レンダー → また `fetch` → 無限ループ… という地獄に陥ることも 😇

「初回だけでよい処理」は、必ず `[]` を付けてあげましょう。

---

### 10. React 19 との関係：これからどう使い分ける？ 🔮

React 19 では、`use(Promise)` ＋ `Suspense` を使うことで
**「ロード中」「エラー表示」も含めたデータ取得を、もっと宣言的に書ける」** ようになりました。([react.dev][1])

といっても、**`useEffect + useState` がいきなり消えるわけではありません**。

* 既存プロジェクト：ほぼ確実にこのスタイルで書かれている
* 小さめのページや「とりあえず動けばOK」なツール：
  いまだにこの書き方で十分なことも多い
* 他のライブラリ（例：TanStack Query など）を使う場合も、
  `useEffect` 的な考え方をベースにしていることが多い([marmelab.com][2])

> この章で学んだことは
> **「古いからもう不要」じゃなくて「今後もずっと読むことになるコードの基礎」**
> だと思ってもらえれば OK です 🌈

---

### 11. 練習課題 🎓（自分で手を動かしてみよう）

最後に、ちょっとだけ宿題です ✍️

#### 🥐 練習1：表示件数を変えてみる

今は `?_limit=5` で 5件だけ取っています。これを自分で変えてみてください。

* 10 件にしてみる
* 1 件だけにして、タイトルの横に `ID: xxx` も表示してみる

#### 🐱 練習2：別の API を試してみる

自分でググって、**キー不要で使える無料の公開 API** を探してみてください。

例：

* 犬・猫の画像 API
* ジョーク API
* 国の情報 API など

そして：

1. その API のレスポンスの形をドキュメントで確認
2. それに合わせて `type` を作る
3. `useEffect` でデータを取得して画面に表示 ✨

---

### 12. まとめ 🌺

この章でできるようになったこと：

* `useEffect` を使って **コンポーネントの初回表示時にだけ処理を走らせる**
* `fetch` ＋ `async/await` でネットからデータを取ってくる
* `data / isLoading / error` の 3 つの State で、状態に応じた UI を作る
* 必要に応じて `AbortController` で通信を中断するお片づけもできる

次のモジュールでは、React 19 で追加された
**`use(Promise)` や `Suspense` を使った “新世代スタイル” のデータ取得** に進んでいきます。
今回学んだ「旧スタイル」と比べながら進めると、理解がグッと深まりますよ 💡

おつかれさまでした〜！🙌✨

[1]: https://react.dev/reference/react/use?utm_source=chatgpt.com "use"
[2]: https://marmelab.com/blog/2024/01/23/react-19-new-hooks.html?utm_source=chatgpt.com "New client-side hooks coming to React 19"
