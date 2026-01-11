# 第45章：練習：TODOリスト(表示のみ)。TODOアイテムの`type`（型）も定義しよう。

**〜 TODOアイテム用の `type`（型）もちゃんと決める！〜** ✅📝

---

## 1️⃣ この章でやること

この章では、**「表示だけ」できるシンプルな TODO リスト**を作ります。
まだ「追加」「削除」とかはやりません（それは 49〜50 章でやる予定 💪）。

やることはこの3つです👇

* ✅ TODOアイテムの「型（`type`）」を自分で設計する
* ✅ 型を使って、TODOリストを TypeScript で安全に表現する
* ✅ `.map()` と `key` を使って、TODO をずら〜っと表示する

完成イメージはこんな感じです 👀

* 「買い物に行く」
* 「レポートを書く ✅（完了）」
* 「React の勉強をする」

---

## 2️⃣ TODOリストってどんなデータ？💭

まずは「TODO 1個分」を、**ただの情報**として考えてみます。

たとえば、1つの TODO にはこんな情報が入っていそうですよね 👇

| 項目       | 型         | 例                          |
| -------- | --------- | -------------------------- |
| `id`     | `number`  | `1`, `2`, `3`（一意の番号）       |
| `title`  | `string`  | `"レポートを書く"`                |
| `isDone` | `boolean` | `true`（終わった） / `false`（まだ） |

この「セット」を TypeScript の `type` で表現して、
**「これが TODO アイテムのかたちだよ！」** と決めてあげます ✨

---

## 3️⃣ `Todo` 型を定義してみよう ✍️

では `src/App.tsx` を開いて、
コンポーネントの上あたりに **`Todo` 型** を定義してみましょう。

```tsx
// TODOアイテム1つ分の「型」を決める
type Todo = {
  id: number;
  title: string;
  isDone: boolean;
};
```

ポイント 💡

* `Todo` の中に、

  * `id`（番号）
  * `title`（やることの名前）
  * `isDone`（終わったかどうか）
    を入れているよ。
* `isDone` を `boolean` にしておくことで、
  **「終わった？まだ？」を true / false で管理** できます。

---

## 4️⃣ サンプル用の TODO データを作る 📋

今回は「表示だけ」なので、
**固定の TODO データ** をひとまずベタ書きしちゃいましょう。

同じ `App.tsx` にこれも追加します👇

```tsx
// 表示用のサンプル TODO データ
const sampleTodos: Todo[] = [
  { id: 1, title: "React の教科書を読む", isDone: false },
  { id: 2, title: "TypeScript の復習をする", isDone: true },
  { id: 3, title: "友だちとカフェで作業会 ☕", isDone: false },
];
```

ポイント ✨

* `Todo[]` は「`Todo` 型の配列」って意味です。
* **配列の中身が `Todo` じゃないとエラー**になるので、
  入れ忘れ・書き間違いを TypeScript が守ってくれます 🛡️

---

## 5️⃣ `TodoItem` コンポーネントを作る 🧩

1つぶんの TODO を表示する「部品」を作ります。
名前は **`TodoItem`** にしましょう。

まずは Props の型から 💁‍♀️

```tsx
type TodoItemProps = {
  todo: Todo; // 1つ分の Todo データ
};
```

次にコンポーネント本体 👇

```tsx
function TodoItem({ todo }: TodoItemProps) {
  const textStyle: React.CSSProperties = {
    textDecoration: todo.isDone ? "line-through" : "none",
    opacity: todo.isDone ? 0.6 : 1,
  };

  return (
    <li>
      <span style={textStyle}>
        {todo.title}
      </span>
      {todo.isDone && <span style={{ marginLeft: 8 }}>✅</span>}
    </li>
  );
}
```

ここでのポイント 😊

* `TodoItem` は **「1つの Todo をどう見せるか」** だけを担当。
* `todo.isDone ? "line-through" : "none"`
  → 終わっていたら取り消し線、そうでなければ普通の文字。
* `{todo.isDone && <span>✅</span>}`
  → `isDone` が `true` の時だけ ✅ を表示（42章の `&&` のおさらい！）

---

## 6️⃣ `TodoList` コンポーネントで `.map()` & `key` を復習 🌀

次は、配列 `Todo[]` を受け取って、
それをずらっと並べる **`TodoList` コンポーネント** を作ります。

Props の型からいきましょう 👇

```tsx
type TodoListProps = {
  todos: Todo[]; // Todo の配列
};
```

本体はこちら ✨

```tsx
function TodoList({ todos }: TodoListProps) {
  if (todos.length === 0) {
    return <p>やることはありません 🎉</p>;
  }

  return (
    <ul>
      {todos.map((todo) => (
        <TodoItem key={todo.id} todo={todo} />
      ))}
    </ul>
  );
}
```

ポイント 📝

* `todos.map((todo) => ( ... ))`
  → 43章でやった「配列から JSX を量産する」パターン。
* `key={todo.id}`
  → 44章で出てきた **`key` プロパティ**。
  「このアイテムはこれ！」という目印になります 👀
* TODO がゼロのときは、先に
  `return <p>やることはありません 🎉</p>;`
  と返して、リストを表示しないようにしています（41〜42章のおさらい）。

---

## 7️⃣ `App` で全部つなげる 🔗

最後に、`App` コンポーネントから `TodoList` を呼び出してあげましょう。

`src/App.tsx` の全体イメージはこんな感じです 👇
（初期テンプレートを少し書き換えるイメージ）

```tsx
import React from "react";
import "./App.css";

// 1. Todo の「型」を決める
type Todo = {
  id: number;
  title: string;
  isDone: boolean;
};

// 2. サンプル Todo データ
const sampleTodos: Todo[] = [
  { id: 1, title: "React の教科書を読む", isDone: false },
  { id: 2, title: "TypeScript の復習をする", isDone: true },
  { id: 3, title: "友だちとカフェで作業会 ☕", isDone: false },
];

// 3. TodoItem コンポーネント
type TodoItemProps = {
  todo: Todo;
};

function TodoItem({ todo }: TodoItemProps) {
  const textStyle: React.CSSProperties = {
    textDecoration: todo.isDone ? "line-through" : "none",
    opacity: todo.isDone ? 0.6 : 1,
  };

  return (
    <li>
      <span style={textStyle}>{todo.title}</span>
      {todo.isDone && <span style={{ marginLeft: 8 }}>✅</span>}
    </li>
  );
}

// 4. TodoList コンポーネント
type TodoListProps = {
  todos: Todo[];
};

function TodoList({ todos }: TodoListProps) {
  if (todos.length === 0) {
    return <p>やることはありません 🎉</p>;
  }

  return (
    <ul>
      {todos.map((todo) => (
        <TodoItem key={todo.id} todo={todo} />
      ))}
    </ul>
  );
}

// 5. App コンポーネント
function App() {
  return (
    <div style={{ padding: "16px" }}>
      <h1>TODOリスト 📝</h1>
      <TodoList todos={sampleTodos} />
    </div>
  );
}

export default App;
```

ブラウザで開くと、
**TODOが3つ並んだシンプルなリスト**が表示されていれば成功です 🎉

---

## 8️⃣ コンポーネントとデータの関係を図で見る 🧬

![TODOリストの構造図](./picture/react_study_045_todo_structure.png)

「データがどう流れているか」を Mermaid で図にしてみます。

```mermaid
graph TD
  A["App コンポーネント"] -->|"todos: Todo#91;#93;"| B["TodoList コンポーネント"]
  B -->|todo: Todo| C1["TodoItem (1)"]
  B -->|todo: Todo| C2["TodoItem (2)"]
  B -->|todo: Todo| C3["TodoItem (3)"]

  subgraph "Todo の型"
    D1["id: number"]
    D2["title: string"]
    D3["isDone: boolean"]
  end
```

イメージとしては 👇

* `App` が **Todo の配列（`Todo[]`）** を持っていて
* それを `TodoList` に渡し
* `TodoList` が 1つずつ `TodoItem` に渡して、表示している

という感じです 💡

---

## 9️⃣ ミニ演習 ✨（余裕があればやってみよう）

時間があれば、次のようなアレンジも試してみてください 🧪

1. `Todo` 型にフィールドを追加してみる

   * 例：`priority: "low" | "medium" | "high"`
   * 高い優先度の TODO だけ色を変えて表示してみる（41〜42章の条件表示の復習）

2. 「完了した TODO の数」を表示してみる

   * `todos.filter((todo) => todo.isDone).length` を使うと数えられます 👀
   * 例：`完了済み: 1 / 3 件` みたいに表示

3. TODO が 0件の場合のメッセージを、好きな文言に変える

   * 例：`今日は自由時間だよ〜✨` とか、自分っぽいメッセージにしてみる。

---

## 🔟 まとめ 🎀

この章でやったことをおさらいすると…

* ✅ `type Todo = { ... }` で、**TODO 1件分の「型」** を決めた
* ✅ `Todo[]` で「TODO一覧」を表現して、
* ✅ `TodoList` + `TodoItem` に分けて **きれいに表示用の部品を作った**
* ✅ `.map()` と `key` で、配列からリスト表示する流れを復習した

次の章からは、
ここで作った TODO を **`useState` や配列の更新**と組み合わせて、
「追加」「削除」などの**動く TODO リスト**に育てていきます 💪🔥

おつかれさまでした〜！🥳
