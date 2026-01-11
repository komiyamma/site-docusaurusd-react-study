# 第174章：アクション（関数）でストアを更新する

Zustandの「ストア」って、みんなで共有する“データ置き場”でしたよね？
この章では、そのデータを**安全＆キレイに更新するための「アクション（関数）」**を作ります😊🛠️

---

## この章のゴール 🎯

* ストアの中に「更新用の関数（アクション）」を用意できる ✅
* `set` を使って **安全に state を更新**できる ✅
* Reactコンポーネントから **アクションを呼んで更新**できる ✅

---

## アクションってなに？🤔➡️💡

**アクション = ストアの値を更新するための“専用ボタン（関数）”**です🎮✨
コンポーネント側でゴチャゴチャ更新ロジックを書くより、**ストアにまとめる**とスッキリします💅

---

## 図でイメージしよう 🗺️

![アクションフロー](./picture/react_study_174_actions.png)

```mermaid
flowchart LR
  A["コンポーネント"] -->|アクションを呼ぶ| B["ストア内の関数 action()"]
  B -->|setで更新| C["Zustand Store State"]
  C -->|購読してるコンポーネントが再描画| A
```

---

## `set` の更新方法は2種類あるよ ✌️✨

### ① そのまま上書き（単純な更新）🧼

`set({ count: 0 })` みたいに、部分的に上書きできます。

### ② 関数で更新（前の state を使う）🧠⚡

`set((state) => ({ count: state.count + 1 }))`
**前の値に依存する更新**（+1 とか）はこっちが基本です🙆‍♀️

---

## 実装してみよう：カウンターストア（アクション付き）🔢🐻

### 1) `src/stores/counterStore.ts` を作る ✍️

```ts
import { create } from "zustand";

type CounterStore = {
  count: number;
  increment: () => void;
  decrement: () => void;
  reset: () => void;
  setCount: (value: number) => void;
  incrementBy: (delta: number) => void;
};

export const useCounterStore = create<CounterStore>((set) => ({
  count: 0,

  // ✅ 前の値に +1 するので「関数更新」
  increment: () => set((state) => ({ count: state.count + 1 })),

  // ✅ -1 も同じ
  decrement: () => set((state) => ({ count: state.count - 1 })),

  // ✅ 固定値にするなら「上書き」でもOK
  reset: () => set({ count: 0 }),

  // ✅ 任意の値を入れる（上書き）
  setCount: (value) => set({ count: value }),

  // ✅ まとめて増やす（前の値を使う）
  incrementBy: (delta) => set((state) => ({ count: state.count + delta })),
}));
```

---

## コンポーネントから使う（アクションを呼ぶ）🧩🎉

### 2) `src/components/Counter.tsx`

```tsx
import { useState } from "react";
import { useCounterStore } from "../stores/counterStore";

export function Counter() {
  const count = useCounterStore((s) => s.count);
  const increment = useCounterStore((s) => s.increment);
  const decrement = useCounterStore((s) => s.decrement);
  const reset = useCounterStore((s) => s.reset);
  const setCount = useCounterStore((s) => s.setCount);
  const incrementBy = useCounterStore((s) => s.incrementBy);

  const [input, setInput] = useState("0");
  const [delta, setDelta] = useState("5");

  return (
    <div style={{ padding: 16 }}>
      <h2>カウンター: {count} 🧸</h2>

      <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
        <button onClick={decrement}>-1 ➖</button>
        <button onClick={increment}>+1 ➕</button>
        <button onClick={reset}>Reset 🔁</button>
      </div>

      <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 12 }}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          style={{ width: 120 }}
        />
        <button
          onClick={() => setCount(Number(input))}
        >
          この値にする ✨
        </button>
      </div>

      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        <input
          value={delta}
          onChange={(e) => setDelta(e.target.value)}
          style={{ width: 120 }}
        />
        <button onClick={() => incrementBy(Number(delta))}>
          まとめて足す 🚀
        </button>
      </div>
    </div>
  );
}
```

### 3) `App.tsx` で表示

```tsx
import { Counter } from "./components/Counter";

export default function App() {
  return <Counter />;
}
```

---

## よくあるミスあるある 😵‍💫💥（回避しよ！）

### ❌ ミス1：ストアの state を直接いじる（やっちゃダメ）🙅‍♀️

Zustandでは、更新は **set 経由**でやるのがルールです✅

### ❌ ミス2：`set({ count: state.count + 1 })` みたいに書こうとする

その `state` どこの？ってなるやつです😂
**前の値を使うなら**こう👇

```ts
set((state) => ({ count: state.count + 1 }));
```

### ✅ コツ：更新ロジックは「ストア側」に寄せる 🧠🏡

コンポーネントがスッキリして、あとで直すのも楽になります🎀

---

## ミニ演習（手を動かすと最強）✍️🔥

### 演習A：`decrementBy(delta)` を追加しよ ➖➖

* ストアに `decrementBy: (delta: number) => void` を追加
* 実装は `set((s) => ({ count: s.count - delta }))`

### 演習B：`double()` を追加しよ ✨×2

* `double: () => void`
* 実装は `set((s) => ({ count: s.count * 2 }))`

---

## まとめ 🧸✅

* **アクションは「更新専用の関数」**で、ストア内に置くとキレイ✨
* **前の値を使う更新は `set((state) => ...)`** が基本🧠
* コンポーネントは **アクションを呼ぶだけ**にすると気持ちいい🎉

次の章（第175章）では、さらに気持ちよくする **「セレクター」**で「必要なときだけ再レンダリング」へ進みます🐻⚡
