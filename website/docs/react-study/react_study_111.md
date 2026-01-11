# 第111章：復習：`useEffect` でのデータ取得

この章では、**「昔ながら（v19より前）」の `useEffect` を使ったデータ取得のやり方**を
もう一度サクッと振り返って、「どこがしんどいのか？」をハッキリさせます 💡

このあと出てくる **v19 の `use(Promise)` ＋ `Suspense`** を「神〜🙏」って思えるように、
あえて一回、旧スタイルのツラミを整理しておきます。

---

## 🎯 この章のゴール

* `useEffect` でデータを取ってくるコードを **ちゃんと読める＆書ける**
* そのやり方が **なにをやっているのか** がイメージできる 🧠
* 「でも、これってちょっと大変だよね…」というポイントが分かる 😇

---

## 1️⃣ 復習：`useEffect` でデータ取得する基本パターン 📡

よくある「ユーザー情報を取ってくるコンポーネント」の例です。

* 画面に出たら（マウントされたら）APIにリクエスト
* 返ってきたデータを state に保存
* ローディング中とエラーも state で管理

みたいな流れです。

```tsx
import { useEffect, useState } from "react";

type User = {
  id: number;
  name: string;
  email: string;
};

export function UserInfo() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // 👇 データ取得用の async 関数を中で定義
    const fetchUser = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await fetch(
          "https://jsonplaceholder.typicode.com/users/1"
        );

        if (!response.ok) {
          throw new Error("ユーザー情報の取得に失敗しました。");
        }

        const data: User = await response.json();
        setUser(data);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "不明なエラーが発生しました。"
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();
  }, []); // ← 最初に表示されたときだけ実行

  if (isLoading) {
    return <p>読み込み中です…⏳</p>;
  }

  if (error) {
    return <p>エラーが発生しました：{error} 😢</p>;
  }

  if (!user) {
    return <p>ユーザーが見つかりませんでした。</p>;
  }

  return (
    <div>
      <h2>ユーザー情報👤</h2>
      <p>名前：{user.name}</p>
      <p>メール：{user.email}</p>
    </div>
  );
}
```

### ここでやっていることを分解すると…🔍

1. `useState` で 3つの状態を持つ

   * `user`: 実際のデータ
   * `isLoading`: 読み込み中かどうか
   * `error`: エラーメッセージ（なければ `null`）

2. `useEffect(..., [])` で「最初に1回だけ実行される処理」を書く

   * コンポーネントが表示されたときに **自動で** API を叩く

3. `try / catch / finally` で

   * 成功 → `user` にデータを入れる
   * 失敗 → `error` にメッセージを入れる
   * 最後 → `isLoading` を `false` にする

4. JSX 側では状態によって出すものを切り替え

   * `isLoading === true` → 「読み込み中…」
   * `error !== null` → エラー表示
   * それ以外 → ユーザー情報を表示 ✨

---

## 2️⃣ データ取得の「仕事量」、実はけっこう多い…😵‍💫

`useEffect` でデータを取るとき、毎回こんなことを考えないといけません👇

* ✅ 読み込み中フラグ（`isLoading`）を管理する
* ✅ エラーの状態（`error`）を管理する
* ✅ 実データ（`user` や `posts` など）を管理する
* ✅ `useEffect` の中で `async` な処理を書く
* ✅ 依存配列（`[]` とか `[userId]` とか）を正しく設定する
* ✅ コンポーネントが消えるとき（アンマウント時）のキャンセル（できれば）

**1画面ごとに全部これを書く** って、なかなか負担大きくないですか…？🥲

---

## 3️⃣ 図でイメージしよう：`useEffect` データ取得の流れ 🧠✨

![react_study_111_useeffect_fetch](./picture/react_study_111_useeffect_fetch.png)

Mermaid でフローを図解してみます。

```mermaid
flowchart TD
  A["コンポーネントが表示される<br>(マウント)"] --> B["useEffect が実行される"]
  B --> C["isLoading を true にする<br>error を null にする"]
  C --> D[fetch でサーバーへリクエスト📡]
  D -->|成功| E[レスポンスを JSON に変換]
  E --> F[user state に保存]
  D -->|失敗| G[error state にメッセージを保存]
  F --> H[isLoading を false にする]
  G --> H
  H --> I["JSX で表示を切り替え<br> (読み込み中 / エラー / データ表示)"]
```

こんな感じで、**1回のデータ取得だけでもステップ多め**なんです 📚

---

## 4️⃣ どこが大変？よくある「つらみ」ポイント 🥲

### 💥 つらみ 1：毎回ほぼ同じコードを書くハメに

画面が増えるたびに、こんな感じのコードを何度も書くことになります。

* `const [isLoading, setIsLoading] = useState(true);`
* `const [error, setError] = useState<string | null>(null);`
* `try { ... } catch { ... } finally { ... }`
* `if (isLoading) return ...`
* `if (error) return ...`

「**コピペ地獄**」になりがちです 🕳
→ 後の章でやる **カスタムフック (`useXxx`)** でだいぶマシにできますが、
　それでも最初の設計はそこそこ大変。

---

### 💥 つらみ 2：依存配列問題（[] 地獄 / 無限ループ地獄）🔁

`useEffect` の第2引数、つまりコレです 👇

```tsx
useEffect(() => {
  // 何か処理
}, [/* ここ */]);
```

* 空配列 `[]` にすると「最初の1回だけ」
* `[userId]` みたいに変数を入れると、「その変数が変わるたびに実行」

これをミスると…

* `[]` を付け忘れて、**レンダーのたびに fetch → 無限リクエスト** 😱
* 必要なものを入れ忘れて、**データが古いまま** になる 🥶

**型では守れない部分** なので、頭でちゃんと考えないといけないのがしんどいポイントです。

---

### 💥 つらみ 3：リクエストのキャンセル問題 🚫

ユーザーが画面を切り替えたり、検索条件を素早く変えたりすると、

1. 古いリクエストがまだ帰ってきてないのに
2. 新しいリクエストを飛ばして
3. **古いレスポンスが後から返ってきて、state を上書きしちゃう**

みたいなことが起きます。

一応、`AbortController` を使えばキャンセルできますが、コードはさらにややこしくなります。

```tsx
useEffect(() => {
  const controller = new AbortController();

  const fetchUser = async () => {
    try {
      const response = await fetch(url, {
        signal: controller.signal,
      });
      // ...
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") {
        // キャンセルされた時は無視
        return;
      }
      // それ以外は普通のエラー
    }
  };

  fetchUser();

  return () => {
    // 👇 コンポーネントが消えるときにキャンセル
    controller.abort();
  };
}, [/* 依存配列 */]);
```

「ちゃんとやろう」とすると、
**サンプルコードより実務コードのほうが2〜3倍くらい長くなる** のが現実…😇

---

### 💥 つらみ 4：UI とロジックがごちゃごちゃになりがち 🍝

さっきの `UserInfo` コンポーネントを思い出してください。

* state の定義がいくつもある
* `useEffect` の中で async 処理
* JSX 側で `if (isLoading) ... if (error) ...` みたいな条件分岐

全部 1つのコンポーネントの中でやると、すぐに **スパゲッティっぽく** なります 🍝

後の章でやる

* カスタムフック（`useUser` みたいなやつ）
* `Suspense` と エラーバウンダリ

を使うと、
**「データ取得のゴチャゴチャ」と「見た目」を分けやすくなります。**

---

### 💥 つらみ 5：サーバーサイド / ストリーミングとの相性 🌐

`useEffect` は「クライアント側（ブラウザ側）」でしか動きません。

そのため、

* サーバー側で先にデータを取っておいて
* HTML をまとめて返して
* 画面表示をサクサクにする

みたいなことが **やりづらい** です。

React v19 では、

* `use(Promise)` ＋ `Suspense`
* サーバーコンポーネント

などを組み合わせて、
**「データ取得込みで UI を設計する」** 時代になってきています 🧠

この章ではまだ「昔ながらのやり方」を復習するだけですが、
「**あ、これをもっとキレイにしたいから新機能が生まれたんだな**」と感じてもらえればOKです ✨

---

## 5️⃣ ハンズオン：ミニ API ビューアを作ってみよう ✍️

最後に、小さな復習として「投稿データ」を取ってくるコンポーネントも見ておきましょう。

```tsx
import { useEffect, useState } from "react";

type Post = {
  id: number;
  title: string;
  body: string;
};

export function PostViewer() {
  const [post, setPost] = useState<Post | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await fetch(
          "https://jsonplaceholder.typicode.com/posts/1"
        );

        if (!response.ok) {
          throw new Error("投稿の取得に失敗しました。");
        }

        const data: Post = await response.json();
        setPost(data);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "不明なエラーが発生しました。"
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchPost();
  }, []); // ← ここを [id] とかにすると、id ごとに取り直したりできる

  if (isLoading) {
    return <p>投稿を読み込み中…📚</p>;
  }

  if (error) {
    return <p>エラー：{error}</p>;
  }

  if (!post) {
    return <p>投稿が見つかりませんでした。</p>;
  }

  return (
    <article>
      <h2>投稿タイトル：{post.title}</h2>
      <p>{post.body}</p>
    </article>
  );
}
```

> 🔁 余力があれば：
>
> * `posts/1` を `posts/2` に変えてみる
> * `PostViewer` に `postId` を Props で渡して、`useEffect` の依存配列に `[postId]` を入れてみる
>   などを試すと、**「依存配列が何をしているか」** がもっと分かります 🧪

---

## 6️⃣ まとめ：だから v19 の新スタイルがうれしいんだよね…😊

この章でのポイントをざっくり振り返ると…

* `useEffect` でデータ取得するには

  * `data / isLoading / error` の 3つの state をセットで管理
  * `try / catch / finally` でごちゃごちゃ書く必要がある
  * 依存配列をミスるとバグりやすい
  * キャンセルやレースコンディションまでケアするとさらに複雑
* つまり、**ちゃんと書こうとするとかなり忙しい** 🥲

次の章から出てくる **`use(Promise)` と `Suspense`** は、

> 「データ取得も含めて、UI をもっと素直に書けるようにする」
> 「ローディングやエラーの扱いを、より React 的に整理する」

ための仕組みです 💫

この章の内容がモヤモヤっと頭に残っていれば、
次の **第112章：`use(Promise)`** がきっとスッと入ってきますよ〜！✨😄
