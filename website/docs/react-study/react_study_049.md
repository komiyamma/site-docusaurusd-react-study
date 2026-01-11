# 第49章：練習：配列のStateにアイテムを追加する (`...` スプレッド構文)
キーワードは **`...`（スプレッド構文）** と **「元の配列はそのままにしておく」** です！

---

## 🎯 この章のゴール

* `useState` で **配列のState** を持てる ✅
* 入力フォームから新しいアイテムを作って、配列に **追加** できる ✅
* `...` スプレッド構文で
  `setTodos([...todos, newTodo])` の意味が分かる ✅

テーマはちょっとゆるく、**「やりたいことリスト（WANTリスト）」アプリ**を作っていきます ✨

---

## 🧠 ちょっと復習：なんでスプレッド構文が必要なの？

ReactのStateには、こんなルールがありましたね 👇

> **「元の配列やオブジェクトを** 直接書き換えない **」**

やっちゃダメな例（NG😢）：

```ts
todos.push(newTodo);      // ← 配列を書き換えてる
setTodos(todos);          // ← これはNGパターン
```

こうではなくて、新しい配列を**作り直して** から `setTodos` します ✅

```ts
setTodos([...todos, newTodo]);  // ← 新しい配列をつくって渡す
```

ここで使っている `...` が **スプレッド構文** です 🌟
`[...todos, newTodo]` は、

> 「`todos` の中身を全部コピーして、その後ろに `newTodo` をくっつけた新しい配列」

という意味になります。

---

## 🛠 実践：WANTリストアプリを作ろう ✍️

### 🔧 Step 0: `App.tsx` をこの章専用にしてOK

Viteで作ったReact+TSプロジェクトを使います。

* `src/App.tsx` を開いて、
  **この章のあいだだけ** 下のコードにまるっと差し替えてOKです 🙆‍♀️

---

### ✅ 完成形のコード（まずは全体）

先に完成形をドーンと貼ります。
このあとで、少しずつ分解して見ていきます 👀

```tsx
import { useState, type ChangeEvent, type FormEvent } from "react";

type Todo = {
  id: number;
  title: string;
};

export function App() {
  const [title, setTitle] = useState("");
  const [todos, setTodos] = useState<Todo[]>([]);

  const handleTitleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
  };

  const handleAddTodo = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const trimmed = title.trim();
    if (trimmed === "") {
      // から文字は追加しない
      return;
    }

    const newTodo: Todo = {
      id: Date.now(),
      title: trimmed,
    };

    // ✨ ここがこの章の主役 ✨
    setTodos((prevTodos) => [...prevTodos, newTodo]);

    // 入力欄を空に戻す
    setTitle("");
  };

  return (
    <div style={{ maxWidth: 480, margin: "0 auto", padding: "1.5rem" }}>
      <h1>やりたいことリスト ✨</h1>

      <form onSubmit={handleAddTodo}>
        <label>
          やりたいこと：
          <input
            type="text"
            value={title}
            onChange={handleTitleChange}
            placeholder="例：韓国カフェ巡り ☕"
            style={{ width: "100%", padding: "0.5rem", marginTop: "0.25rem" }}
          />
        </label>
        <button
          type="submit"
          style={{
            marginTop: "0.75rem",
            padding: "0.5rem 1rem",
            cursor: "pointer",
          }}
        >
          追加する ➕
        </button>
      </form>

      <hr style={{ margin: "1.5rem 0" }} />

      {todos.length === 0 ? (
        <p>まだ何もないよ〜。やりたいことを書いてみよう ✍️</p>
      ) : (
        <ul>
          {todos.map((todo) => (
            <li key={todo.id} style={{ marginBottom: "0.25rem" }}>
              {todo.title}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
```

ブラウザで `npm run dev` をして、

* テキストボックスに「やりたいこと」を入力
* 「追加する ➕」をクリック or Enter

で、下のリストにどんどん増えていけば成功です 🎉

---

## 🔍 コード分解①：型とState

### ✏️ `Todo` 型

```ts
type Todo = {
  id: number;
  title: string;
};
```

* `id`: 各アイテムを見分けるための番号（ここでは `Date.now()` で作る）
* `title`: 実際に画面に表示する文字列

ReactのStateには、こういう「型付き」のデータを入れておくと
安心＆VS Codeがたくさん助けてくれて便利です 💻✨

---

### 📦 State の宣言

```ts
const [title, setTitle] = useState("");
const [todos, setTodos] = useState<Todo[]>([]);
```

* `title`: 入力欄に今書かれている文字列
* `todos`: `Todo` 型の配列（最初は空の配列 `[]`）

`Todo[]` は「`Todo` がずらっと並んだ配列」という意味です。

---

## 🔍 コード分解②：イベントの型

### 🖊 入力欄が変わったとき

```ts
const handleTitleChange = (e: ChangeEvent<HTMLInputElement>) => {
  setTitle(e.target.value);
};
```

* `ChangeEvent<HTMLInputElement>` は
  「`<input>` が変わったときのイベント」の型
* `e.target.value` で入力された文字を取り出して、`title` に保存しています。

---

### 📮 フォームが送信されたとき

```ts
const handleAddTodo = (e: FormEvent<HTMLFormElement>) => {
  e.preventDefault();
  // ...
};
```

* `<form onSubmit={handleAddTodo}>` の `onSubmit` イベントの型が
  `FormEvent<HTMLFormElement>` です。
* `e.preventDefault()` を呼ぶことで、
  **本来のフォーム送信（ページリロード）を止める** ことができます。

---

## ⭐ 主役：配列のStateにアイテムを追加する

![配列への追加イメージ](./picture/react_study_049_array_add.png)

いよいよこの章のメインです ✨

```ts
const newTodo: Todo = {
  id: Date.now(),
  title: trimmed,
};

// ✨ ここがポイント ✨
setTodos((prevTodos) => [...prevTodos, newTodo]);
```

### 💬 `setTodos((prevTodos) => [...prevTodos, newTodo])` の意味

* `setTodos` に **関数** を渡しているのがポイントです。
* `prevTodos` は「今の `todos` の中身」が入ってきます。
* `[...prevTodos, newTodo]` で**新しい配列**を作って、Stateを上書きしています。

図にするとこんな感じ 🎨

```mermaid
flowchart LR
  A["以前の State<br/>prevTodos"] --> B["[...prevTodos]"]
  C["新しい newTodo"] --> D[["新しい配列<br/>[...prevTodos, newTodo]"]]
  B --> D
  D --> E[setTodos で<br/>State を更新]
```

### 🧊 なんで「prevパターン」を使うの？

```ts
setTodos([...todos, newTodo]);
```

でも動くんですが、
**「更新が連続したとき」** に `prev` を使っておいたほうが安全です。

ReactはStateの更新を**まとめて処理**することがあるので、

* 常に「一番新しいState」を元に更新したい
* だから `setTodos((prev) => ...)` パターンが推奨

というイメージでOKです 💡

---

## 👀 表示部分のポイント

```tsx
{todos.length === 0 ? (
  <p>まだ何もないよ〜。やりたいことを書いてみよう ✍️</p>
) : (
  <ul>
    {todos.map((todo) => (
      <li key={todo.id} style={{ marginBottom: "0.25rem" }}>
        {todo.title}
      </li>
    ))}
  </ul>
)}
```

* `todos.length === 0` なら「まだ何もないよ〜」メッセージを表示
* 1件以上あるときは `.map()` で `<li>` を並べて表示
* `key={todo.id}` を付けるのを忘れないようにしましょう ✅

---

## 🌈 アレンジしてみようチャレンジ

ここからは、ちょっと自分好みにいじってみる練習です 💪

### チャレンジ①：先頭に追加してみる

新しいアイテムを一番上に出したいときは、こう書き換えてみましょう 👇

```ts
setTodos((prevTodos) => [newTodo, ...prevTodos]);
```

* `[新しいの, ...前の配列]` にすることで、
  **新しいアイテムが先頭にくるリスト**になります。

---

### チャレンジ②：テーマを変えてみる

例えば…

* 「行きたいカフェリスト ☕」
* 「読みたい本リスト 📚」
* 「行きたい国リスト ✈️」
* 「推しのイベント参加予定リスト 💖」

などなど、自分がワクワクするテーマに変えてみてください ✨
`placeholder` の文言や、`<h1>` のタイトルを変えるだけでも気分が変わります。

---

## ✅ この章でできるようになったことチェック！

* [ ] `Todo` みたいな **配列用の型** を自分で定義できた
* [ ] `useState<Todo[]>()` で **配列のState** を持てた
* [ ] `setTodos((prev) => [...prev, newTodo])` の意味が分かった
* [ ] `...` スプレッド構文で
  「前の配列 + 新しいアイテム = 新しい配列」が作れるようになった

ここまでできていれば、
**第50章の「削除・更新」もぜんぜん怖くないです** 💪🔥

おつかれさま〜！次は、今つくったリストに
「削除・更新」機能をつけて、さらにパワーアップさせていきましょう 🚀
