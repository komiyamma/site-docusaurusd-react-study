# 第64章：練習：タイマー（`setInterval`）と、その止め方（お片付け）

![タイマーのクリーンアップ](./picture/react_study_064_timer_interval.png)

**練習：タイマー（`setInterval`）と、その止め方（お片付け）⏱️**

---

## 1. この章でやること 🎓

この章では、こんなタイマーを作ります 👇

* 画面に「○秒」とカウントアップしていく数字が出る
* 「スタート」「ストップ」「リセット」ボタンで操作できる
* コンポーネントが消えたとき・止めたときに、`setInterval` をちゃんと止める（クリーンアップ）

タイマーは **「時間システム」という外部のしくみ（ブラウザの時計）を使う処理** なので、まさに `useEffect` の出番です。([Qiita][1])

---

## 2. タイマーと `useEffect` の関係をイメージしよう 🧠

タイマーの流れを、ざっくり図にするとこんな感じです 🧩

```mermaid
flowchart TD
  A[コンポーネントが表示される] --> B["useEffect が実行される"]
  B --> C[setInterval でタイマー開始]
  C --> D["1秒ごとに setSeconds(prev => prev + 1)"]
  D -->|ストップボタン or コンポーネントが消える| E["クリーンアップ関数が呼ばれる"]
  E --> F["clearInterval でタイマー停止 ✅"]
```

ポイントはここ👇

* ⏱️ `setInterval` は「外部の仕組み」に仕事をお願いしている
* 🧹 だから **コンポーネントの都合で「もういらないよ」ってなったら、自分で片付け（`clearInterval`）してあげる必要がある**
* その「片付け係」が `useEffect` の **クリーンアップ関数** です([react.dev][2])

---

## 3. ゴールの UI を決める 🎨

今回作るコンポーネントのイメージはこんな感じ：

* 秒数を表示：`経過時間：10 秒`
* ボタン3つ：

  * ▶️ スタート
  * ⏸️ ストップ
  * 🔁 リセット

**ファイル構成（例）**

* `src/Timer.tsx` … タイマーコンポーネント（この章の主役）
* `src/App.tsx` … `Timer` を読み込んで表示するだけ

---

## 4. `Timer` コンポーネントの骨組みを作る 🦴

まずはタイマーの「状態」だけ決めちゃいます。

* `seconds`：今何秒か
* `isRunning`：動いているかどうか（true / false）

`src/Timer.tsx` を新規作成して、まずはこんな感じにします ✍️

```tsx
import { useState } from "react";

type TimerProps = {
  /** 最初の秒数（指定しなければ 0 秒からスタート） */
  start?: number;
};

export function Timer({ start = 0 }: TimerProps) {
  const [seconds, setSeconds] = useState<number>(start);
  const [isRunning, setIsRunning] = useState<boolean>(false);

  return (
    <div>
      <p>経過時間：{seconds} 秒</p>
      <div>
        <button>スタート</button>
        <button>ストップ</button>
        <button>リセット</button>
      </div>
      <p>状態：{isRunning ? "動作中 ⏱️" : "停止中 ⏹️"}</p>
    </div>
  );
}
```

この時点では、ボタンを押しても何も起こりません。
ここに **`useEffect + setInterval` の魔法✨** を足していきます。

---

## 5. `useEffect` でタイマーを動かす 🏃‍♀️💨

やりたいことはこうです：

1. `isRunning` が `true` になったら、`setInterval` で 1 秒ごとに `seconds` を増やす
2. `isRunning` が `false` になったら、タイマーを止める（`clearInterval`）
3. コンポーネントが消えるときも、ちゃんと `clearInterval` する

### 5-1. 完成形のコード（まずは全体）

先に完成形を出してしまいます。
あとで細かく分解して説明するので、「ふんふん」と眺めるだけでOKです 👀

```tsx
import { useEffect, useState } from "react";

type TimerProps = {
  start?: number;
};

export function Timer({ start = 0 }: TimerProps) {
  const [seconds, setSeconds] = useState<number>(start);
  const [isRunning, setIsRunning] = useState<boolean>(false);

  useEffect(() => {
    // 動いていないときは、タイマーを作らないで終了
    if (!isRunning) {
      return;
    }

    // 1秒ごとに seconds を 1 増やすタイマーを作成
    const id = window.setInterval(() => {
      // ここ大事！ 前の値から計算する「関数形式」の更新
      setSeconds((prev) => prev + 1);
    }, 1000);

    // 🧹 クリーンアップ関数
    // isRunning が false に変わったとき or コンポーネントが消えるときに呼ばれる
    return () => {
      window.clearInterval(id);
    };
  }, [isRunning]); // ← isRunning に反応する Effect

  const handleStart = () => {
    setIsRunning(true);
  };

  const handleStop = () => {
    setIsRunning(false);
  };

  const handleReset = () => {
    setIsRunning(false);
    setSeconds(0);
  };

  return (
    <div style={{ border: "1px solid #ccc", padding: "16px", borderRadius: "8px" }}>
      <h2>タイマー ⏱️</h2>
      <p style={{ fontSize: "24px", margin: "8px 0" }}>
        経過時間：<strong>{seconds}</strong> 秒
      </p>

      <div style={{ display: "flex", gap: "8px", marginBottom: "8px" }}>
        <button onClick={handleStart} disabled={isRunning}>
          ▶️ スタート
        </button>
        <button onClick={handleStop} disabled={!isRunning}>
          ⏸️ ストップ
        </button>
        <button onClick={handleReset}>
          🔁 リセット
        </button>
      </div>

      <p>
        状態：{isRunning ? "動作中 ⏱️" : "停止中 ⏹️"}
      </p>
    </div>
  );
}
```

---

### 5-2. `useEffect` の中で何が起きてるの？🔍

```ts
useEffect(() => {
  if (!isRunning) {
    return;
  }

  const id = window.setInterval(() => {
    setSeconds((prev) => prev + 1);
  }, 1000);

  return () => {
    window.clearInterval(id);
  };
}, [isRunning]);
```

#### ✅ 1. `isRunning` を見張る Effect

* 依存配列が `[isRunning]` なので、

  * 初回表示時
  * `isRunning` の値が変わったとき
    だけこの Effect が動きます。

#### ✅ 2. 「動いてないなら何もしない」ガード

```ts
if (!isRunning) {
  return;
}
```

* `isRunning` が `false` のときは、タイマーを新しく作りません。
* これによって

  * ストップした後に、余計な `setInterval` が作られない
  * リセット後も余計なタイマーが走らない
    という安心設計になります ✨

#### ✅ 3. `setInterval` で 1秒ごとにカウントアップ

```ts
const id = window.setInterval(() => {
  setSeconds((prev) => prev + 1);
}, 1000);
```

ここで大事なのが `setSeconds((prev) => prev + 1)` という **関数形式の更新** です。

* `prev` には「直前の `seconds` の値」が入る
* それを使って `prev + 1` を計算するので

  * 多少タイミングがずれても安全
  * 依存配列に `seconds` を入れなくてもOK（Effectが無限に作り直されない！）([react.dev][2])

#### ✅ 4. クリーンアップで `clearInterval` する

```ts
return () => {
  window.clearInterval(id);
};
```

この関数が呼ばれるタイミングは：

* `isRunning` が `true → false` に変わるとき
* コンポーネントが画面から消えるとき（アンマウント）

なので、

* **常に「最後に作ったタイマー」だけをきちんと止める**
* タイマーが二重・三重に動き出す 🥵 という事故を防げます

---

## 6. `App.tsx` に組み込んでみよう 🧩

`src/App.tsx` をこんな感じにすれば、`Timer` が画面に出ます。

```tsx
import "./App.css";
import { Timer } from "./Timer";

function App() {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "#f7f7ff",
      }}
    >
      <Timer start={0} />
    </div>
  );
}

export default App;
```

ブラウザで `npm run dev` をして、

* ▶️ スタート → 秒数が増える
* ⏸️ ストップ → 秒数が止まる
* 🔁 リセット → 0 秒に戻る（タイマーも止まる）

を確認してみてください ✨

---

## 7. よくあるつまずきポイント 😵‍💫

### ❌ 1. クリーンアップを書き忘れる

```ts
useEffect(() => {
  const id = setInterval(..., 1000);
}, []);
```

こう書いてしまうと：

* ページを離れてもタイマーが動き続ける
* React 19 の開発モード（Strict っぽい動き）では Effect が余分に実行されることもあり、
  **意図せずタイマーが2倍速で動いてるように見える** などのバグのもとになります ([Kinsta®][3])

👉 必ず **`return () => clearInterval(id)`** を書くクセをつけましょう 🧹

---

### ❌ 2. 依存配列に `seconds` を入れてしまう

```ts
useEffect(() => {
  const id = window.setInterval(() => {
    setSeconds(seconds + 1); // ← そのときの seconds をそのまま使っている
  }, 1000);

  return () => window.clearInterval(id);
}, [seconds]); // ← seconds が変わるたびに Effect が再実行…
```

この書き方だと：

* `seconds` が変わるたびに

  * 古い `id` を片付けて
  * 新しい `setInterval` を作る
* つまり **毎秒「作り直し」** が起きてしまい、ムダが多いです 🥲

👉 さっきのように **関数形式の更新** を使い、依存配列から `seconds` を消すのがベターです。

```ts
setSeconds((prev) => prev + 1);
```

---

### ❌ 3. スタートを連打してタイマーが増殖する

今回のコードでは、

```ts
if (!isRunning) {
  return;
}
```

とガードしているうえに、スタートボタンは `disabled={isRunning}` にしてあるので、
スタート連打でもタイマーが増えません ✨

もし `disabled` を外すなら、

* 「スタートした瞬間に `isRunning` を true にする」
* 依存配列とクリーンアップの挙動

をしっかり意識する必要があります。

---

## 8. ちょこっと発展練習 💡

余裕があれば、こんなアレンジもしてみてください 🧪

1. 秒ではなく「分:秒」で表示する
   例）`01:05` みたいな形で表示してみる

2. 初期値を Props で変えてみる

   * `<Timer start={30} />` なら「30 秒」からカウント開始

3. 1 秒ではなく 0.1 秒ごとに増やしてみる

   * `1000` を `100` に変えて、表示を少数1桁にしてみる

---

## 9. まとめ 📝

この章のキーワードをおさらい 👇

* ⏱️ タイマー (`setInterval`) は **外部の仕組み** → `useEffect` で扱う
* 🧹 クリーンアップ関数で必ず `clearInterval` する
* 🔁 `setSeconds((prev) => prev + 1)` のように **前の値から計算する更新** が便利
* 👀 依存配列 `[isRunning]` で「いつタイマーを作る／壊すか」をコントロール

タイマーが作れたら、`useEffect` の「お片付け」のイメージはかなりバッチリです 💪
次の章では、これを応用してさらに実践的な副作用にチャレンジしていきましょう✨

[1]: https://qiita.com/morioka1206/items/ae282605c2691ad84374?utm_source=chatgpt.com "useEffectをとりあえず理解する #React"
[2]: https://react.dev/learn/you-might-not-need-an-effect?utm_source=chatgpt.com "You Might Not Need an Effect"
[3]: https://kinsta.com/jp/blog/react-useeffect/?utm_source=chatgpt.com "【使い方解説】ReactのuseEffectフックの仕組みを解き明かす"
