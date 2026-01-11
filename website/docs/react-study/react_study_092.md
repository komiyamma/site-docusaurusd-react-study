# 第92章：`useState` と `useRef` のガチな使い分け

（画面が変わる？変わらない？がポイント！）

---

## 1️⃣ 今日のゴール 🎯

この章では、

> **「この値は `useState`？ それとも `useRef`？」**

と聞かれたときに、自信を持って答えられるようになることがゴールです 💪

キーワードはたったひとつ：

> **「この値が変わったとき、画面も変わってほしい？」**

* 「うん、ユーザーに見せたい！」 → **`useState`**
* 「ううん、裏でこっそり覚えておきたいだけ」 → **`useRef`** ([React][1])

---

## 2️⃣ 超ざっくりまとめ表 📋

```
text
🧩 共通点：
  ・どっちも「レンダーをまたいで値を覚えておける」仲間

🔥 いちばん大事な違い：
  ・`useState` → 値が変わると **コンポーネントが再レンダー** される
  ・`useRef`   → 値が変わっても **再レンダーされない** :contentReference[oaicite:1]{index=1}

👀 向いてる役割：
  ・`useState` → 画面に表示される情報、UIに関係するもの
  ・`useRef`   → タイマーID / 前回の値 / 外部ライブラリの情報 / DOMへの参照 など
```

---

## 3️⃣ 「画面が変わる値」と「裏方の値」イメージ 🧃

![react_study_092_state_vs_ref](./picture/react_study_092_state_vs_ref.png)

React の世界では、こんなイメージで考えると楽です👇

```
mermaid
flowchart TD
    A[値を保存したい！] --> B{ユーザーに見える？}
    B -->|はい！👀| C[useState]
    B -->|いいえ💻| D[useRef]

    C --> E[値が変わる]
    E --> F[コンポーネント再レンダー✨]
    D --> G[値が変わる]
    G --> H[画面そのまま / 中だけ更新]
```

* **ユーザーに見せたい情報 → `useState`**

  * カウンターの数字
  * 入力フォームの文字
  * エラーのメッセージ
* **裏方の情報 → `useRef`**

  * `setInterval` のID
  * 「直前の値」
  * 「何回レンダーされたか」のカウンター
  * DOMノード（`<input>` など）への参照

---

## 4️⃣ 実験①：カウンター＋「レンダー回数カウンター」🧪

同じコンポーネントの中で、

* 表示されるカウンター：`useState`
* 画面には出さないレンダー回数：`useRef`

という組み合わせをやってみます。

```
tsx
import { useState, useRef } from "react";

export function RenderCounter() {
  // 画面に表示したい → useState
  const [count, setCount] = useState(0);

  // 画面には出さなくてもOKな「裏のメモ」 → useRef
  const renderCountRef = useRef(0);

  // コンポーネントがレンダーされるたびに +1
  renderCountRef.current += 1;

  const handleClick = () => {
    setCount((prev) => prev + 1);
  };

  return (
    <div>
      <h2>クリックカウンター 🐾</h2>
      <p>ボタンを押した回数：{count}</p>

      <button onClick={handleClick}>＋1する</button>

      <hr />

      <p style={{ fontSize: "12px", color: "#666" }}>
        （デバッグ用）レンダー回数：{renderCountRef.current}
      </p>
    </div>
  );
}
```

### どう動くか 💡

1. 初回表示

   * `count = 0`
   * `renderCountRef.current = 1`
2. ボタンを1回クリック

   * `setCount` が呼ばれる → **再レンダー**
   * `count = 1`
   * `renderCountRef.current = 2`
3. 2回、3回…クリックしていくと

   * `count` は画面に出る
   * `renderCountRef.current` は「何回レンダーされたか」をずっと覚えてる

ここでのポイントは：

* `renderCountRef.current++` しても、それ **だけ** では再レンダーは起きない
* 画面が変わっているのは **`useState` の更新がトリガー** になっているから

---

## 5️⃣ 実験②：タイマーIDは `useRef` 向き ⏱

タイマーを止めるときに必要なのは、`setInterval` が返してくれた **ID** です。

このIDは…

* 画面に表示する必要はない
* でも、スタート/ストップの間で **ずっと覚えておきたい**

→ まさに **`useRef` 向きの値** です ([React][1])

ここでは「考え方」だけ見たいので、ざっくりコードでイメージを掴みましょう。

```
tsx
import { useState, useRef } from "react";

export function SimpleTimer() {
  const [seconds, setSeconds] = useState(0);

  // タイマーIDは画面に表示しなくていい → useRef
  const timerIdRef = useRef<number | null>(null);

  const handleStart = () => {
    if (timerIdRef.current !== null) {
      // すでに動いているなら何もしない
      return;
    }

    const id = window.setInterval(() => {
      // 秒数は画面に表示したい → useState
      setSeconds((prev) => prev + 1);
    }, 1000);

    timerIdRef.current = id;
  };

  const handleStop = () => {
    if (timerIdRef.current !== null) {
      window.clearInterval(timerIdRef.current);
      timerIdRef.current = null;
    }
  };

  const handleReset = () => {
    setSeconds(0);
  };

  return (
    <div>
      <h2>シンプルタイマー ⏱</h2>
      <p>{seconds} 秒</p>
      <button onClick={handleStart}>スタート</button>
      <button onClick={handleStop}>ストップ</button>
      <button onClick={handleReset}>リセット</button>
    </div>
  );
}
```

### ここでの使い分け ✅

* `seconds`
  → 画面に出したい値 → **`useState`**

* `timerIdRef.current`
  → 画面に出さない & ただ覚えておきたいだけの値 → **`useRef`**

もし `timerId` を `useState` で持つと…

* IDが変わるたびに **無駄な再レンダー**
* UIに関係ないのに、レンダーが発生してしまう 🙃

---

## 6️⃣ 使い分けチェックリスト 📝

コードを書いていて迷ったら、これを自分に聞いてみてください👇

### Q1. 「この値は画面に直接 or 間接的に影響する？」

* Yes → **`useState`**
* No → 次の質問へ

### Q2. 「この値が変わっても、画面は変わらなくていい？」

* Yes → **`useRef`** 候補
* No → **`useState`**

### Q3. よくある `useRef` 向きのもの 🧱

* ✅ タイマーID (`setTimeout` / `setInterval`)
* ✅ 「前回の値」や「前回のスクロール位置」
* ✅ 「もうAPIを呼んだかどうか」のフラグ
* ✅ フォーカスしたい `<input>` のDOMノード
* ✅ 外部ライブラリ（地図 / グラフ / エディタ）のインスタンス

---

## 7️⃣ やりがちなNGパターン 🙅‍♀️

### ❌ パターン1：DOMノードを `useState` に入れる

```
tsx
// これはNG例
const [inputElement, setInputElement] = useState<HTMLInputElement | null>(null);
```

DOMノードは「画面に表示するための値」じゃなくて「裏で触りたいもの」なので、**`useRef` の仕事** です。

```
tsx
// こっちが◎
const inputRef = useRef<HTMLInputElement | null>(null);
```

### ❌ パターン2：UIに関係ないカウンターを `useState` で管理する

「この処理が何回呼ばれたか」など、**デバッグ専用の値** を `useState` で管理すると、
呼ばれるたびに再レンダーが起きて、逆にコードが読みにくくなります 🥲

→ こういうのは **`useRef`** にそっと入れておくとスマートです。

---

## 8️⃣ ミニ演習 🧩

### 🧩 演習1：どっちを使う？

次の値は `useState` / `useRef` のどちらが向いているでしょう？

1. ショッピングカートの「合計金額」
2. 「APIをもう呼んだかどうか」のフラグ (`alreadyFetched: boolean`)
3. モーダルが開いているかどうか (`isOpen: boolean`)
4. `setTimeout` が返してくれたID
5. ユーザーが最後に押したボタンのラベル（画面に表示する）

---

### ✅ 解答チェック（例）

1. **合計金額** → 画面に表示する → `useState`
2. **alreadyFetched フラグ** → 画面に出さないなら `useRef` が有力
3. **isOpen** → モーダルの表示・非表示に関わる → `useState`
4. **タイムアウトID** → 画面に出さない → `useRef`
5. **最後のボタン名を画面に表示する** → `useState`

---

## 9️⃣ まとめ 🌈

最後に、この章のいちばん大事なところをもう一度 ✨

```
text
🎯 useState
  ・値が変わると再レンダー
  ・「ユーザーに見せたい」「UIが変わってほしい」情報を入れる

🎯 useRef
  ・値が変わっても再レンダーしない
  ・「裏でこっそり覚えておきたい」情報を入れる
  ・DOMノードやタイマーID、前回の値などにピッタリ
```

次の章（第93章）では、
**「画面は変わらないけど、覚えておきたい値」** にフォーカスして、`useRef` の具体的な使い方をガッツリ練習していきます 💻✨

ゆっくりでOKなので、
「**画面が変わる？変わらない？**」だけ、まずは頭に置いておいてくださいね〜 😊💕

[1]: https://react.dev/reference/react/useRef?utm_source=chatgpt.com "useRef"
