# 第140章：練習：`useState` を `useImmer` に置き換えてみる

「配列やオブジェクトの state を更新するとき、`...`（スプレッド）だらけで頭こんがらがる…😵‍💫」
そんな子を一気にラクにしてくれるのが **`useImmer`** でしたね ✨

この章では、

> **「ふつうの `useState` で書いたコンポーネント」を
> 👉 **そのまま `useImmer` 版に書き換える****

という、実戦っぽい練習をやっていきます 💪

---

## 🎯 この章のゴール

* `useState` で書いたコードを **どこをどう直せば** `useImmer` になるか分かる
* `draft` を使った書き換えスタイルに慣れる
* 「ここは `useState` のまま」「ここは `useImmer` にしたい」を自分で選べるようになる

---

## 1️⃣ まずはベースとなる `useState` 版 TODO リスト 📝

![useImmerへのリファクタリングイメージ](./picture/react_study_140_immer_refactor.png)

まず、**よくある TODO リスト**を
「全部 `useState` だけで書いたバージョン」で用意します。

> ✅ 追加
> ✅ 完了フラグの ON/OFF
> ✅ 削除

ができるシンプルなやつです。

> ※ すでに似た TODO を作っている場合は、
> 「自分のコードを `useImmer` に置き換える練習」として見てください 💡

### 型定義＆`useState` 版コンポーネント

```ts
// Todo の型
type Todo = {
  id: number;
  title: string;
  done: boolean;
};

import { useState, type ChangeEvent } from "react";

const initialTodos: Todo[] = [
  { id: 1, title: "React の勉強をする", done: false },
  { id: 2, title: "ゼミのレポートを書く", done: true },
];

export function TodoListUseState() {
  const [todos, setTodos] = useState<Todo[]>(initialTodos);
  const [text, setText] = useState<string>("");

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setText(e.target.value);
  };

  const handleAdd = () => {
    const trimmed = text.trim();
    if (!trimmed) return;

    setTodos((prev) => [
      ...prev,
      {
        id: Date.now(),
        title: trimmed,
        done: false,
      },
    ]);

    setText("");
  };

  const handleToggle = (id: number) => {
    setTodos((prev) =>
      prev.map((todo) =>
        todo.id === id ? { ...todo, done: !todo.done } : todo
      )
    );
  };

  const handleDelete = (id: number) => {
    setTodos((prev) => prev.filter((todo) => todo.id !== id));
  };

  return (
    <div>
      <h2>TODO リスト（useState 版）</h2>

      <div>
        <input value={text} onChange={handleChange} placeholder="やることを書く" />
        <button onClick={handleAdd}>追加</button>
      </div>

      <ul>
        {todos.map((todo) => (
          <li key={todo.id}>
            <label>
              <input
                type="checkbox"
                checked={todo.done}
                onChange={() => handleToggle(todo.id)}
              />
              <span style={{ textDecoration: todo.done ? "line-through" : "none" }}>
                {todo.title}
              </span>
            </label>
            <button onClick={() => handleDelete(todo.id)}>削除</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
```

### ここでの「つらみ」ポイント 😢

* `handleAdd` で `setTodos(prev => [...prev, 新しいTodo])`
* `handleToggle` で
  `prev.map(...)` & `{ ...todo, done: !todo.done }`
* `handleDelete` で `prev.filter(...)`

全部 **「新しい配列を自分で作る」** 必要があって、
慣れないとちょっと読みづらいですよね 🌀

---

## 2️⃣ `useState` の更新の流れを図でイメージしてみる 🧠

`useState` のときのイメージを、軽く図解しておきます。

```mermaid
flowchart LR
  A[クリック or 入力] --> B[setTodos を呼ぶ]
  B --> C["自分で<br>新しい配列を作る<br>(map / filter / スプレッド...)"]
  C --> D["React が state を<br>新しい配列に置き換える"]
  D --> E["コンポーネントが<br>再レンダリングされる"]
```

`useImmer` は、この「**新しい配列を作る**」部分を
**代わりにやってくれる相棒**でしたね 🧙‍♀️✨

---

## 3️⃣ `useImmer` 版に書き換えるためのステップ 👣

では、本題！
この `TodoListUseState` を **`useImmer` 版に書き換えてみましょう**。

やることは大きく 3 つだけ👇

1. `useImmer` をインポートする
2. `useState` を `useImmer` に変える
3. 更新関数の中身を `draft` 書き換えスタイルに変える

---

### 🪄 ステップ 1：`useImmer` をインポート

前の章で `use-immer` を入れている前提ですが、
もしまだなら一応コマンドはこれです 👇

```bash
npm install use-immer
```

コンポーネントで `useImmer` をインポートします。

```ts
import { useImmer } from "use-immer";
```

---

### 🪄 ステップ 2：`useState` を `useImmer` に置き換える

この行を：

```ts
const [todos, setTodos] = useState<Todo[]>(initialTodos);
```

こう変えます👇

```ts
const [todos, updateTodos] = useImmer<Todo[]>(initialTodos);
```

ポイント 💡

* `setTodos` の名前を、`updateTodos` とか `setTodosDraft` みたいに
  **「draft を更新するよ」感のある名前**にすると読みやすいです
* ジェネリクス `<Todo[]>` は、`initialTodos` から推論もされるので
  実は省略しても OK（慣れるまでは付けておくのもアリ）

---

### 🪄 ステップ 3：更新ロジックを `draft` スタイルに変える

ここが今日のメイン練習です ✍️
`setTodos(prev => ...)` になっているところを、
順番に `updateTodos(draft => { ... })` に変えていきます。

---

#### 3-1. 追加処理：`push` で OK に 🎉

もともと：

```ts
const handleAdd = () => {
  const trimmed = text.trim();
  if (!trimmed) return;

  setTodos((prev) => [
    ...prev,
    {
      id: Date.now(),
      title: trimmed,
      done: false,
    },
  ]);

  setText("");
};
```

👉 `useImmer` 版：

```ts
const handleAdd = () => {
  const trimmed = text.trim();
  if (!trimmed) return;

  updateTodos((draft) => {
    draft.push({
      id: Date.now(),
      title: trimmed,
      done: false,
    });
  });

  setText("");
};
```

✨ ここでのポイント

* `draft` は **「下書き用の配列」** だと思ってください
* `draft.push(...)` のように、**普通の配列みたいに書き換えて OK**
* Immer が裏で「新しい配列」をいい感じに作ってくれるので、
  **イミュータブル（元のを直接変えない）ルールはちゃんと守られてます** ✅

---

#### 3-2. 完了フラグの ON/OFF：`map` → `find` でスッキリ ✨

もともと：

```ts
const handleToggle = (id: number) => {
  setTodos((prev) =>
    prev.map((todo) =>
      todo.id === id ? { ...todo, done: !todo.done } : todo
    )
  );
};
```

👉 `useImmer` 版：

```ts
const handleToggle = (id: number) => {
  updateTodos((draft) => {
    const todo = draft.find((t) => t.id === id);
    if (!todo) return;

    // ここは「直接代入」して OK！（draft だから）
    todo.done = !todo.done;
  });
};
```

ここ、めちゃくちゃスッキリしませんか？🥹

* もう `{ ...todo, done: !todo.done }` みたいに
  オブジェクトをコピーしなくていい
* 「対象を探して」「そのまま書き換える」という
  **素直なストーリーのコード**になります 💕

---

#### 3-3. 削除：`filter` → `splice` にしてもいいし、`filter` のままでも OK

もともと：

```ts
const handleDelete = (id: number) => {
  setTodos((prev) => prev.filter((todo) => todo.id !== id));
};
```

`useImmer` だと、2 パターン書き方があります。

##### ① そのまま `filter` を返すパターン（少し上級）

`updateTodos` では、**`draft` を返しても OK** なので、
こんな書き方もできます 👇

```ts
const handleDelete = (id: number) => {
  updateTodos((draft) => draft.filter((todo) => todo.id !== id));
};
```

> 「`draft` を元に、**新しい配列を return** してもいいよ」という仕様です。

##### ② `splice` で「その場で消す」パターン（初心者さん向け）

こっちの方が、「配列を直接いじってる感」が分かりやすいかもです。

```ts
const handleDelete = (id: number) => {
  updateTodos((draft) => {
    const index = draft.findIndex((t) => t.id === id);
    if (index === -1) return;

    draft.splice(index, 1);
  });
};
```

👉 どっちでも OK なので、
**自分が読みやすい方**を選んでください ✨

---

## 4️⃣ フルコード：`useImmer` 版 TODO リスト 🎉

ここまでの変更を全部まとめると、こうなります。

```ts
import { useState, type ChangeEvent } from "react";
import { useImmer } from "use-immer";

type Todo = {
  id: number;
  title: string;
  done: boolean;
};

const initialTodos: Todo[] = [
  { id: 1, title: "React の勉強をする", done: false },
  { id: 2, title: "ゼミのレポートを書く", done: true },
];

export function TodoListUseImmer() {
  const [todos, updateTodos] = useImmer<Todo[]>(initialTodos);
  const [text, setText] = useState<string>("");

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setText(e.target.value);
  };

  const handleAdd = () => {
    const trimmed = text.trim();
    if (!trimmed) return;

    updateTodos((draft) => {
      draft.push({
        id: Date.now(),
        title: trimmed,
        done: false,
      });
    });

    setText("");
  };

  const handleToggle = (id: number) => {
    updateTodos((draft) => {
      const todo = draft.find((t) => t.id === id);
      if (!todo) return;

      todo.done = !todo.done;
    });
  };

  const handleDelete = (id: number) => {
    updateTodos((draft) => {
      const index = draft.findIndex((t) => t.id === id);
      if (index === -1) return;

      draft.splice(index, 1);
    });
  };

  return (
    <div>
      <h2>TODO リスト（useImmer 版）</h2>

      <div>
        <input value={text} onChange={handleChange} placeholder="やることを書く" />
        <button onClick={handleAdd}>追加</button>
      </div>

      <ul>
        {todos.map((todo) => (
          <li key={todo.id}>
            <label>
              <input
                type="checkbox"
                checked={todo.done}
                onChange={() => handleToggle(todo.id)}
              />
              <span style={{ textDecoration: todo.done ? "line-through" : "none" }}>
                {todo.title}
              </span>
            </label>
            <button onClick={() => handleDelete(todo.id)}>削除</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
```

---

## 5️⃣ `useImmer` のイメージ図 🧠💭

`useImmer` の流れも、図でイメージを固めておきましょう。

```mermaid
flowchart LR
  A[クリック or 入力] --> B[updateTodos を呼ぶ]
  B --> C["draft (下書き) を受け取る"]
  C --> D["配列やオブジェクトを<br>普通に書き換える<br>(push, =, splice...)"]
  D --> E["Immer が「差分」から<br>新しい state を生成"]
  E --> F["React が state を更新して<br>再レンダリング"]
```

💡 大事な点

* **`todos` 自体は絶対に直接書き換えない**

  * ❌ `todos.push(...)`
  * ✅ `updateTodos(draft => { draft.push(...) })`
* `draft` の中でだけ「ミュータブルっぽく」書いて OK
  → 外から見るとちゃんとイミュータブル 🎀

---

## 6️⃣ ミニ練習ミッション 🚀

最後に、自分の手で書き換えてみる用ミッションを置いておきます ✍️

### ミッション1：自分の `useState` コンポーネントを変えてみる

1. これまでの章で作った

   * フォーム
   * TODO
   * カウンター（オブジェクト版）
     など、**配列 or オブジェクトを `useState` で持っているコンポーネント**を1つ選ぶ
2. その state を `useImmer` に置き換えてみる
3. `setXXX` を全部 `updateXXX(draft => { ... })` スタイルに書き換える

> ✅ ゴール：`draft` を見るだけで「中身がイメージできる」ようになること

---

### ミッション2：ネストしたオブジェクトで挑戦してみる 🧩

例えばこんな state を想像してみてください：

```ts
type Profile = {
  name: string;
  favorites: {
    food: string;
    color: string;
  };
};
```

* `favorites.color` だけ変えたいとき、

  * `useState` だと `{ ...prev, favorites: { ...prev.favorites, color: "pink" } }`
  * `useImmer` だと `draft.favorites.color = "pink";` で OK 🎀

👉 実際にコンポーネントを作って、
`useState` 版 → `useImmer` 版 に変えてみてください 💪

---

### ミッション3：どこまで `useImmer` にするか考える 🧠

* すべての state を `useImmer` にする必要はありません ✋
* **配列やオブジェクトがややこしくなってきたら `useImmer` を検討する**
  くらいの気持ちで OK です。

自分の中で、

* 「これは単なる数値だから `useState` でいいや」
* 「これは配列だし、しょっちゅう更新するから `useImmer` かな」

という **ゆるいルール** を決めてみてください 🧸

---

## まとめ 🌈

* `useState` → `useImmer` の変換は、基本的に

  * `useState` の行を `useImmer` に変える
  * 更新部分を `draft` 書き換えスタイルに変える
    だけで OK ✅
* `draft` の中では

  * `push`
  * `splice`
  * プロパティへの代入 `=`
    など、**ふつうの JS の書き方で state を更新できる** 🎉
* でも **`todos` 本体は絶対に直接書き換えない**、これだけは守る！

---

次の React コーディングで、
「うわ、スプレッドだらけでしんど…😇」となったら、

> ✨「ここ、`useImmer` に変えてみよっかな？」

ってぜひ思い出してあげてください 🪄💕
