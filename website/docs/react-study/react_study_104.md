# 第104章：練習：`useLayoutEffect` でDOMのサイズを測る

今回は、

> 「画面に *実際に* 出た要素のサイズ（幅・高さ）を、Reactの中で知る」
> ということをやってみます 🌟

`useLayoutEffect` の「タイミングの良さ」を、体で覚える回です 💪

---

## 1️⃣ ゴールのイメージ

![react_study_104_measure_dom](./picture/react_study_104_measure_dom.png)

こんな感じのコンポーネントを作ります 👇

* カラフルなボックス 📦 が1つ表示される
* そのボックスの「幅」と「高さ」を、実際の DOM から測って、画面に数字で表示する
* ウィンドウのサイズを変えると、数字も変わる（＝ちゃんと測り直している）

イメージとしてはこんな流れです 👇

```mermaid
graph TD;
  A[Reactコンポーネントの描画] --> B["ブラウザがDOM要素を作る"];
  B --> C[useLayoutEffectが実行される];
  C --> D["ref経由で要素のサイズを取得<br/>getBoundingClientRect()];"];
  D --> E["State更新 setSize()];"];
  E --> F[サイズが表示された状態で再レンダリング];
```

`useLayoutEffect` は

> 「DOMができた直後、画面に見えるタイミングの直前」
> で動いてくれるので、レイアウトに関すること（サイズ計測など）と相性バツグンです ✨

---

## 2️⃣ 準備：ファイルを1つ追加しよう 📁

Vite + React + TS のプロジェクトがある前提で進めます。
`src` フォルダの中に、新しくこんなファイルを作ってください。

> `src/MeasureBox.tsx`

ここに練習用コンポーネントを書いていきます ✍️

---

## 3️⃣ コード全体を先に見る 👀

まずは完成コードをドーンと載せます。
あとで分解して説明していくスタイルでいきますね 😊

```tsx
// src/MeasureBox.tsx
import { useLayoutEffect, useRef, useState } from "react";

type BoxSize = {
  width: number;
  height: number;
};

export function MeasureBox() {
  const boxRef = useRef<HTMLDivElement | null>(null);

  const [size, setSize] = useState<BoxSize | null>(null);

  useLayoutEffect(() => {
    function updateSize() {
      if (boxRef.current === null) {
        return;
      }

      const rect = boxRef.current.getBoundingClientRect();

      setSize({
        width: Math.round(rect.width),
        height: Math.round(rect.height),
      });
    }

    updateSize();

    window.addEventListener("resize", updateSize);

    return () => {
      window.removeEventListener("resize", updateSize);
    };
  }, []);

  return (
    <div
      style={{
        fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
        padding: "24px",
      }}
    >
      <h2 style={{ fontSize: "20px", marginBottom: "16px" }}>
        useLayoutEffect で DOM のサイズを測る練習 📏
      </h2>

      <p style={{ marginBottom: "12px", lineHeight: 1.6 }}>
        下のカラフルなボックスの「実際のサイズ」を、DOM から計測して表示しています。
        ウィンドウの幅を変えてみてね！ 👀
      </p>

      <div
        ref={boxRef}
        style={{
          width: "60%",
          minWidth: "260px",
          padding: "24px",
          background:
            "linear-gradient(135deg, rgba(255,182,193,0.9), rgba(135,206,235,0.9))",
          borderRadius: "16px",
          boxShadow: "0 6px 20px rgba(0,0,0,0.12)",
          color: "#333",
          marginBottom: "16px",
          transition: "width 0.2s ease",
        }}
      >
        <strong>こんにちは 👋</strong>
        <br />
        <span>
          このボックスの幅と高さを、
          <code style={{ background: "rgba(255,255,255,0.7)", padding: "2px 4px", borderRadius: "4px" }}>
            useLayoutEffect
          </code>
          で測っています。
        </span>
      </div>

      <div
        style={{
          padding: "12px 16px",
          borderRadius: "12px",
          backgroundColor: "#f5f5f5",
          display: "inline-block",
          fontSize: "14px",
        }}
      >
        {size === null ? (
          <span>サイズを測定中です… ⏳</span>
        ) : (
          <span>
            現在のサイズ 👉 <strong>{size.width}px</strong>（幅） ×{" "}
            <strong>{size.height}px</strong>（高さ）
          </span>
        )}
      </div>

      <p style={{ marginTop: "16px", fontSize: "13px", color: "#555" }}>
        💡 ウィンドウの幅を変えると、ボックスの幅も変わるので、
        表示されている数値も変わるはずです。
      </p>
    </div>
  );
}
```

このコンポーネントを `App.tsx` から呼び出してあげます。

```tsx
// src/App.tsx
import { MeasureBox } from "./MeasureBox";

function App() {
  return <MeasureBox />;
}

export default App;
```

`npm run dev` で開いて、
ウィンドウの幅を動かしてみてください 🪟
数字が変われば成功です 🎉

---

## 4️⃣ ひとつずつ分解して理解しよう 🔍

### 4-1. `ref` で実際の DOM をつかまえる ✋

```tsx
const boxRef = useRef<HTMLDivElement | null>(null);
```

* `useRef` で「あとで DOM を入れてもらう箱」を作っています
* 型は `HTMLDivElement | null`

  * 最初はまだ何もないので `null`
  * 描画が終わると、React がここに `<div>` の実体を入れてくれます

この `boxRef` を、サイズを測りたいボックスにつなげます。

```tsx
<div
  ref={boxRef}
  style={{ /* いろいろスタイル */ }}
>
  ...
</div>
```

こうすると、描画後に `boxRef.current` の中身が
「実際の `<div>`（DOM要素）」になります ✨

---

### 4-2. サイズを State で持っておく 🧠

```tsx
type BoxSize = {
  width: number;
  height: number;
};

const [size, setSize] = useState<BoxSize | null>(null);
```

* サイズは `{ width, height }` のセットで扱いたいので `BoxSize` 型を作成
* 最初はまだ測っていないので `null`
* 測れたら `{ width: 〇〇, height: △△ }` をセット

`size === null` のときは「測定中」と表示して、
そうでないときは数字を出すようにしています 👇

```tsx
{size === null ? (
  <span>サイズを測定中です… ⏳</span>
) : (
  <span>
    現在のサイズ 👉 <strong>{size.width}px</strong>（幅） ×{" "}
    <strong>{size.height}px</strong>（高さ）
  </span>
)}
```

UI的にも、こういう「まだ分からない状態」をちゃんと表現してあげると、
ユーザーにやさしいアプリになります 💗

---

### 4-3. 主役：`useLayoutEffect` の中身 🧪

```tsx
useLayoutEffect(() => {
  function updateSize() {
    if (boxRef.current === null) {
      return;
    }

    const rect = boxRef.current.getBoundingClientRect();

    setSize({
      width: Math.round(rect.width),
      height: Math.round(rect.height),
    });
  }

  updateSize();

  window.addEventListener("resize", updateSize);

  return () => {
    window.removeEventListener("resize", updateSize);
  };
}, []);
```

やっていることを順番に見ると… 👀

1. **`updateSize` 関数を定義**

   * `boxRef.current` に DOM が入っているかチェック
   * `getBoundingClientRect()` でサイズを取得
   * `setSize(...)` で State に保存

2. **`updateSize()` をすぐ1回実行**

   * 初回の描画直後にサイズを測る
   * `useLayoutEffect` なので、「画面に見える直前」にサイズが決まるイメージ

3. **`resize` イベントを登録**

   * ウィンドウのサイズが変わると `updateSize` をもう一回実行
   * つまり、ボックスのサイズも測り直す

4. **クリーンアップでイベント解除**

   * コンポーネントが消えるときに `removeEventListener`
   * これを書いておくことで、メモリリークを防げます 👍

---

### 4-4. なんで `useEffect` じゃなくて `useLayoutEffect` なの？🤔

`useEffect` でも、サイズを測ることはできます。
ただしタイミングが少し遅くて、

* 画面に一度「古いレイアウト」が出る
* そのあと `useEffect` が動いて、サイズを測って、再描画

という流れになります。

レイアウトに関わる処理は、

> 「画面に見える瞬間より前に済ませておきたい」
> ので、`useLayoutEffect` のほうが向いています ✅

今回の例はシンプルなので、違いが分かりにくいかもですが、
「**レイアウト計測・位置計算系は useLayoutEffect**」
と覚えておくと良い感じです ✨

---

## 5️⃣ ちょっと遊んでみよう ✏️ ミニお題

ここまでできたら、少しアレンジしてみましょう 🧸

### お題1：ボックスの高さを変えてみる

* `padding` をもっと増やしたり、
* 文章を増やして、2〜3行にしてみたり

して、`height` の数字がどう変わるか試してみてください。

---

### お題2：ボックスの幅を `80%` にしてみる

```tsx
style={{
  width: "80%",
  // ...
}}
```

に変えて、ウィンドウサイズを動かしたときの挙動を観察してみてください 👀

---

### お題3：サイズに応じてメッセージを変える

たとえばこんな感じで、表示を変えてみるのも楽しいです 💬

```tsx
let message = "ふつうサイズです ✨";

if (size !== null) {
  if (size.width < 320) {
    message = "ちょっと小さめサイズだよ 📱";
  } else if (size.width > 600) {
    message = "かなりワイド！ 🖥️";
  }
}
```

そして JSX で：

```tsx
<p>{message}</p>
```

みたいにすると、
画面サイズに応じてテキストが変わる、ちょっとリッチな UI になります ✨

---

## 6️⃣ まとめ 🧵

この章でやったことを振り返ると…

* `ref` で「実際の DOM 要素」をつかまえた ✋
* `useLayoutEffect` の中で

  * `getBoundingClientRect()` でサイズを取得
  * `State` に保存して、画面に表示した
* ウィンドウの `resize` イベントを使って、サイズを測り直すようにした
* レイアウト系の処理は `useLayoutEffect` が向いている、という感覚をつかんだ

ここまでできれば、
「**React + TypeScript で DOM をちゃんと意識したコードを書く**」
っていう一歩をしっかり踏み出せています 👟✨

---

もし「ここもうちょっと詳しく聞きたい」「`useEffect` との比較をコードで見たい」などあれば、
続きも一緒に練習していきましょ〜 🥰💻
