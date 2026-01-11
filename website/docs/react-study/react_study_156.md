# 第156章：`@testing-library/user-event`

この章では、テストで「実際のユーザーっぽい操作」を再現するための **`@testing-library/user-event`** を使っていくよ〜！🎮🖱️
`fireEvent`より「人間がやりそうな一連のイベント」に近い形で動くのがポイント👍 ([testing-library.com][1])

---

## 1) `user-event`って何がうれしいの？😊

![User Centric](./picture/react_study_156_user_centric_visual.png)

たとえばボタンをクリックするとき、実際のブラウザではクリック関連のイベントがいろいろ順番に起きるんだけど、`user-event`はそれを「それっぽく」再現してくれる感じ🖱️✨ ([testing-library.com][1])

そして大事なのがこれ👇
**`user-event`の操作メソッドは基本 `await` が必要**（非同期でイベントループに流したりするため）⚠️ ([GitHub][2])

---

## 2) まずは使える状態にする（インストール）📦

すでに入ってたらスキップでOKだよ〜🙆‍♀️
PowerShell（またはVSCodeのターミナル）で👇

```bash
npm i -D @testing-library/user-event
```

---

## 3) いちばん基本の型：`userEvent.setup()` ✨

公式的にも **`userEvent.setup()` を使うのが推奨**だよ〜！
これで「ユーザー1人分の操作状態（キーが押されてる、など）」を共有できるのがポイント👤⌨️ ([testing-library.com][3])

基本の形はこれ👇

```ts
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

test("基本形", async () => {
  const user = userEvent.setup(); // ← まず作る✨
  render(<div />);

  // await user.click(...)
});
```

---

## 4) まずは最小サンプルで「クリック」をやってみよ🖱️💕

### ✅ コンポーネント（`Counter.tsx`）

```tsx
import { useState } from "react";

export function Counter() {
  const [count, setCount] = useState(0);

  return (
    <div>
      <p>Count: {count}</p>

      <button
        type="button"
        onClick={() => setCount((c) => c + 1)}
      >
        ＋1
      </button>
    </div>
  );
}
```

### ✅ テスト（`Counter.test.tsx`）

```tsx
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Counter } from "./Counter";

test("ボタンをクリックするとCountが増える🖱️", async () => {
  const user = userEvent.setup();

  render(<Counter />);

  const button = screen.getByRole("button", { name: "＋1" });

  await user.click(button);

  const label = screen.getByText("Count: 1");
  expect(label).toBeInTheDocument();
});
```

> 💡ポイント：`await user.click(...)` を忘れると、操作が終わる前に `expect` しちゃって失敗しやすいよ⚠️ ([GitHub][2])

---

## 5) よく使う操作たち（チートシート）🪄✨

### クリック系🖱️

* `await user.click(el)`
* `await user.dblClick(el)`
* `await user.tripleClick(el)`

### 入力系⌨️

* `await user.type(input, "hello")`
* `await user.clear(input)`
* `await user.keyboard("{Enter}")`（キーボード操作）

### フォーカス移動🧭

* `await user.tab()`（Tab移動！地味に便利✨）

### セレクト/チェック系✅

* `await user.selectOptions(select, "A")`
* `await user.click(checkbox)`（チェックON/OFF）

### ファイルアップロード📎

* `await user.upload(inputFile, file)`

---

## 6) 図でイメージ：`user-event`テストの流れ🧠🗺️

```mermaid
flowchart TD
  A["テスト開始 🧪"] --> B["userEvent.setup() 👤"]
  B --> C["render() 🖼️"]
  C --> D["要素を探す getByRole など 🔎"]
  D --> E["await user.click/type... 🖱️⌨️"]
  E --> F["画面の変化を確認 expect ✅"]
  F --> G["テスト終了 🎉"]
```

![user-eventのイメージ](./picture/react_study_156_user_event_robot.png)

---

## 7) ちょい注意：フェイクタイマー（`vi.useFakeTimers()`）と一緒に使う時⏱️⚠️

`user-event`は入力の間に小さな遅延を入れることがあって、**フェイクタイマーと組み合わせるとタイムアウトしやすい**ことがあるよ😵‍💫 ([testing-library.com][4])
そんな時は `setup` に **`advanceTimers`** を渡すのが定番！🛠️ ([testing-library.com][5])

例（Vitest想定）👇

```ts
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";

test("fake timers と user-event を合わせる⏱️", async () => {
  vi.useFakeTimers();

  const user = userEvent.setup({
    advanceTimers: (ms) => vi.advanceTimersByTime(ms),
  });

  // ...renderして操作して...
  // await user.type(...)

  vi.useRealTimers();
});
```

---

## 8) ミニ練習🎒✨（今日のゴール！）

次の2つをテストで再現してみてね💪💕

1. ✅ 入力欄に文字を入れる（`user.type`）⌨️
2. ✅ ボタンを押して表示が変わるのを確認（`user.click` + `expect`）🖱️

「できた！」の目安は👇

* `await` を忘れてない✅
* 操作対象は変数に入れてから操作してる✅（読みやすさUP🌸）
* `expect` が「画面の見た目（テキスト）」を見てる✅

---

## まとめ🎀

* `user-event`は「実ユーザーっぽい操作」を再現する相棒🧑‍💻✨ ([testing-library.com][1])
* 基本は **`const user = userEvent.setup()`** からスタート👤 ([testing-library.com][3])
* 操作は **`await` がほぼ必須**！（先に`expect`しないようにね）⚠️ ([GitHub][2])
* フェイクタイマーを使うなら `advanceTimers` を検討⏱️🛠️ ([testing-library.com][4])

次の第157章は、ここで覚えた「クリック操作」を使って、**“画面が変わったかどうか” をテストでちゃんと確認する**練習に行くよ〜！🎉

[1]: https://testing-library.com/docs/user-event/intro/?utm_source=chatgpt.com "Introduction"
[2]: https://github.com/testing-library/user-event/discussions/910?utm_source=chatgpt.com "Proper use of async UserEvent methods #910"
[3]: https://testing-library.com/docs/user-event/setup?utm_source=chatgpt.com "Setup"
[4]: https://testing-library.com/docs/using-fake-timers/?utm_source=chatgpt.com "Using Fake Timers"
[5]: https://testing-library.com/docs/user-event/options/?utm_source=chatgpt.com "Options"
