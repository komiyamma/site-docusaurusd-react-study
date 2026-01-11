# 第70章：練習：カウンターアプリを `useReducer` で作り直す (Actionの型もちゃんと定義して！)
「型のついた `State` ＋ `Action` ＋ `reducer`」の流れを、手を動かしながら体に覚えさせちゃいましょう 💪

---

## 1️⃣ この章のゴール

この章が終わるころには…

* `useState` で作ったカウンターを
  👉 `useReducer` で書き直せるようになる
* `State` の型と `Action` の型を
  👉 自分で定義できるようになる
* `dispatch({ type: "..." })` の流れが
  👉 なんとなくじゃなくて「ちゃんと分かってる！」状態になる

という感じを目指します 🎯

---

## 2️⃣ ファイルを用意しよう ✍️

プロジェクトはすでに Vite＋React＋TS でできている前提で進めます。

1. `src` フォルダの中に
   **`CounterWithReducer.tsx`** というファイルを作る
2. いったん、最小構成だけ書いておきます。

```tsx
// src/CounterWithReducer.tsx
import { useReducer } from "react";

export function CounterWithReducer() {
  return (
    <div>
      <h2>useReducer カウンター</h2>
      <p>ここにカウンターを作るよ！</p>
    </div>
  );
}
```

次に、`App.tsx` から呼び出せるようにします。

```tsx
// src/App.tsx
import { CounterWithReducer } from "./CounterWithReducer";

export function App() {
  return (
    <div>
      <h1>第70章：useReducer カウンター 💫</h1>
      <CounterWithReducer />
    </div>
  );
}
```

`npm run dev` をして、ブラウザに
「useReducer カウンター」と表示されていれば準備OKです ✅

---

## 3️⃣ State と Action の「型」を決める 🧩

この章の主役は `State` と `Action` の型づけです！
まずは「カウンターがどんな状態を持っているか？」を言葉で整理してみましょう。

* 今回の State はとってもシンプル
  👉 **「数字がひとつ」だけ**

なので、`CounterState` の型はこんな感じになります。

```tsx
type CounterState = {
  count: number;
};
```

次に、どんな「操作（Action）」ができるかを決めます。

今回はこの3つにしましょう ✨

1. 1 増やす（`increment`）
2. 1 減らす（`decrement`）
3. 0 にリセットする（`reset`）

それを型にすると、こうなります👇

```tsx
type CounterAction =
  | { type: "increment" }
  | { type: "decrement" }
  | { type: "reset" };
```

ポイント 💡

* `type` プロパティが「どのアクションか」を表す「ラベル」
* `|` でつないで「どれか1つ」という形にしている（**ユニオン型**）

この2つを `CounterWithReducer` の上あたりに書きます。

```tsx
// src/CounterWithReducer.tsx
import { useReducer } from "react";

type CounterState = {
  count: number;
};

type CounterAction =
  | { type: "increment" }
  | { type: "decrement" }
  | { type: "reset" };

export function CounterWithReducer() {
  // ここにあとで useReducer を書くよ！
  return (
    <div>
      <h2>useReducer カウンター</h2>
      <p>ここにカウンターを作るよ！</p>
    </div>
  );
}
```

---

## 4️⃣ reducer 関数を書く 🔁

次は、`State` と `Action` を受け取って
**「次の State を返す」だけの関数** を作ります。

イメージはこんな感じ 👇

> 「今の状態」と「指示書（Action）」を渡すと、
> 「じゃあ新しい状態はこうだね！」って返してくれる係。

コードで書くとこうなります。

```tsx
function counterReducer(state: CounterState, action: CounterAction): CounterState {
  switch (action.type) {
    case "increment":
      return {
        count: state.count + 1,
      };
    case "decrement":
      return {
        count: state.count - 1,
      };
    case "reset":
      return {
        count: 0,
      };
    default:
      // ここには基本的に来ないはずだけど、型的に必要な保険
      return state;
  }
}
```

ここで大事なポイント ✨

* **必ず新しいオブジェクトを返す**
  `state.count++` みたいに、元の `state` を直接いじらない！
* `switch (action.type)` の中で
  **「どの Action ならどう変えるか」** を全部書く

この `counterReducer` 関数も、さっきの型定義のすぐ下に書いておきます。

---

## 5️⃣ `useReducer` でコンポーネント完成させる 🌟

いよいよ `useReducer` の出番です！

1. 最初の状態（初期値）を用意
2. `useReducer` で `state` と `dispatch` を受け取る
3. ボタンから `dispatch({ type: "..." })` を呼ぶ

という流れになります。

完成形のコンポーネントをいったんドン！と置きますね 💥

```tsx
// src/CounterWithReducer.tsx
import { useReducer } from "react";

type CounterState = {
  count: number;
};

type CounterAction =
  | { type: "increment" }
  | { type: "decrement" }
  | { type: "reset" };

function counterReducer(state: CounterState, action: CounterAction): CounterState {
  switch (action.type) {
    case "increment":
      return {
        count: state.count + 1,
      };
    case "decrement":
      return {
        count: state.count - 1,
      };
    case "reset":
      return {
        count: 0,
      };
    default:
      return state;
  }
}

const initialState: CounterState = {
  count: 0,
};

export function CounterWithReducer() {
  const [state, dispatch] = useReducer(counterReducer, initialState);

  return (
    <div style={{ border: "1px solid #ccc", padding: "16px", borderRadius: "8px" }}>
      <h2>useReducer カウンター 🧮</h2>
      <p style={{ fontSize: "24px", fontWeight: "bold" }}>{state.count}</p>

      <div style={{ display: "flex", gap: "8px" }}>
        <button onClick={() => dispatch({ type: "decrement" })}>−1</button>
        <button onClick={() => dispatch({ type: "increment" })}>+1</button>
        <button onClick={() => dispatch({ type: "reset" })}>リセット</button>
      </div>
    </div>
  );
}
```

### コードの中身を分解してみる 🪄

#### ✅ `initialState`

```tsx
const initialState: CounterState = {
  count: 0,
};
```

* 最初の状態をひとまとめにしておく
* 型はちゃんと `CounterState` と一致させる

#### ✅ `useReducer` のところ

```tsx
const [state, dispatch] = useReducer(counterReducer, initialState);
```

* `state` 👉 今の状態（`{ count: number }`）
* `dispatch` 👉 「この Action を実行して〜」とお願いする関数

#### ✅ ボタンから Action を飛ばす

```tsx
<button onClick={() => dispatch({ type: "increment" })}>+1</button>
```

* `onClick` の中で `dispatch` を呼んでいる
* 渡しているのは **`CounterAction` のどれか1つ**
  （`type: "increment"` だから OK ✅）

VS Code で `dispatch` にカーソルを当てると、
`dispatch(action: CounterAction): void` みたいな型が出てくるはずです 👀
「Action の型ちゃんと効いてるんだ〜」と確認してみてください ✨

---

## 6️⃣ データの流れを図でイメージしよう 🎨

![Reducerカウンターの仕組み](./picture/react_study_070_reducer_counter.png)

`useReducer` の流れは、ざっくりいうとこんな感じです。

1. ボタンをクリック
2. `dispatch({ type: "..." })` が呼ばれる
3. `counterReducer(state, action)` が呼ばれる
4. 新しい `state` が返ってくる
5. React が画面を描き直す

Mermaid で図にすると、こう 👇

```mermaid
graph LR
  A["ボタンをクリック ✋"] --> B[dispatch に Action を渡す]
  B --> C["counterReducer(state, action) が実行される"]
  C --> D[新しい state を返す]
  D --> E["コンポーネントが再レンダリング 🎨"]
  E --> F["画面の数字が更新される ✨"]
```

「イベント → dispatch → reducer → 新しい state → 再描画」
この流れをなんとなく頭に置いておくと、
もう `useReducer` は怖くなくなります 🥰

---

## 7️⃣ ちょこっとアレンジ練習 ✏️💕

ここからは**自分の手でコードを変えてみる**ミッションです！

### 🔁 練習1：2ずつ増えるボタンを追加

やってみてほしいこと：

1. Action に `type: "add2"` を追加する
2. `counterReducer` に `"add2"` のケースを追加して
   `count: state.count + 2` にする
3. ボタンを1つ増やして、`dispatch({ type: "add2" })` を呼ぶ

👉 ヒント：Action の型はこんな感じで増やせます。

```tsx
type CounterAction =
  | { type: "increment" }
  | { type: "decrement" }
  | { type: "reset" }
  | { type: "add2" };
```

### 🌈 練習2：マイナスにならないようにしてみる

`count` が 0 以下にならないようにしてみましょう。

* `"decrement"` のところで
  `state.count - 1` が 0 未満になりそうなら、`0` を返すようにしてみる

---

## 8️⃣ まとめ：`useReducer` の「型」が守ってくれる 🛡️

この章でやったことを整理すると…

* `State` の型（`CounterState`）を定義した
* `Action` の型（`CounterAction`）を
  ラベル付きのユニオン型として定義した
* `counterReducer(state, action)` の中で
  `switch (action.type)` で分岐して、新しい state を返した
* `useReducer` ＋ `dispatch` で
  **「指示書（Action）」を投げて状態を変えるスタイル** に慣れた

`useState` よりちょっと手順は増えますが、そのぶん

* 状態の変化が**一本の道**にまとまる
* Action の型で「ありえない操作」を防げる
* アプリが大きくなっても整理しやすい

というメリットがあります ✨

次にもっと複雑な画面を作るときも、
このカウンターのコードを**テンプレート**としてコピペして
ちょっとずつ書き換えていけば OK です 🥳

おつかれさまでした〜！💐
`useReducer`、だいぶ仲良くなれたはずです 💘
