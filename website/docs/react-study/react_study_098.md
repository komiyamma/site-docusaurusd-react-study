# 第98章：練習：型を付けた`useRef`で、ページを開いたら入力欄にカーソルを合わせる

---

この章のゴールはシンプルです 💪

> **ページを開いた瞬間に、指定した入力欄にカーソルが自動で入るフォーム**
> を、**型付き `useRef`** を使って作れるようになること 🎯

---

## 1. 今回やりたいことイメージ 💡

* 画面を開く（リロードする）➡ 何もクリックしてないのに…
* あるテキストボックスに、カーソル（キャレット）が最初から入っている ✨
* 「ログインフォーム」「検索ボックス」みたいな UX でよくあるやつです。

これを実現するためのポイントは3つです👇

1. `useRef` で **入力欄への参照（ref）** を作る
2. `useRef<HTMLInputElement | null>(null)` のように **型をキッチリ付ける**
3. `useEffect` で **初回表示のタイミングで `focus()` を呼ぶ**

React 19 では `useRef` に **必ず初期値（引数）を渡す書き方** が推奨されているので、`null` を入れておく形が自然です。([React][1])

---

## 2. 流れをざっくり図で見る 🌀

![react_study_098_autofocus](./picture/react_study_098_autofocus.png)

Mermaid で「何が先に起こるのか」をイメージしてみましょう 🌈

```mermaid
flowchart TD
  A[コンポーネント初回レンダリング] --> B[input が画面に描画される]
  B --> C[inputRef.current に input 要素が入る]
  C --> D[useEffect が実行される]
  D --> E["inputRef.current?.focus() を呼ぶ"]
  E --> F["カーソルが入力欄に自動で移動 ✨"]
```

ざっくり言うと、

1. まず **画面が描画されてから**
2. React が `ref` に **DOM 要素を入れて**
3. そのあと `useEffect` が呼ばれて `focus()` する

という順番です 💡

---

## 3. 新しいコンポーネントファイルを作ろう 📁

プロジェクトはすでに Vite + React + TS で動いている前提にします（前の章までで作ったやつ）🖥️

`src` フォルダ直下に、こんなファイルを作ります：

> `src/AutoFocusInput.tsx`

中身をいったん丸ごと書いてみましょう ✍️

```tsx
import { useEffect, useRef } from "react";

export const AutoFocusInput = () => {
  // ★ 1) 型付きの ref を用意する
  // HTMLInputElement | null 型の current を持つ ref
  const inputRef = useRef<HTMLInputElement | null>(null);

  // ★ 2) コンポーネントが「初めて」表示されたタイミングで focus する
  useEffect(() => {
    // current が null じゃないときだけ focus() を呼ぶ
    inputRef.current?.focus();
  }, []);

  return (
    <div style={{ padding: "1.5rem" }}>
      <label
        htmlFor="username"
        style={{ display: "block", marginBottom: "0.5rem" }}
      >
        ユーザー名
      </label>

      <input
        id="username"
        ref={inputRef}
        type="text"
        placeholder="ここにカーソルがくるよ！"
        style={{
          padding: "0.5rem 0.75rem",
          fontSize: "1rem",
          borderRadius: "4px",
          border: "1px solid #ccc",
          width: "100%",
          maxWidth: "320px",
        }}
      />

      <p style={{ marginTop: "0.75rem", fontSize: "0.9rem", color: "#555" }}>
        ページをリロードして、最初からカーソルが当たっているか試してみてね ✨
      </p>
    </div>
  );
};
```

---

## 4. それぞれのポイントを分解して理解しよう 🔍

### 4-1. 型付き `useRef` の書き方 🎯

```tsx
const inputRef = useRef<HTMLInputElement | null>(null);
```

* `HTMLInputElement`
  → ブラウザの「`<input>` タグ」を表す TypeScript の型（DOM 型）です。([React][2])
* `| null`
  → 最初のレンダリングの直後など、**まだ DOM が入っていない瞬間** もあるので、`null` も許可。
* `null`（引数）
  → React 19 + TypeScript では `useRef()` を **引数なしで呼ぶのは NG** で、初期値を必ず渡すスタイルになっています。ここでは「最初は何もささってないよ」という意味で `null` を渡しています。([React][1])

この1行で、

> 「この ref は、将来 `HTMLInputElement` か `null` が入ります」

という情報を TypeScript に教えているイメージです 👩‍🏫

---

### 4-2. `ref` を input に渡す ✋

```tsx
<input
  id="username"
  ref={inputRef}
  type="text"
  placeholder="ここにカーソルがくるよ！"
/>
```

* `ref={inputRef}` と書くことで、

  * React がこの `<input>` の **実物の DOM 要素** を
  * `inputRef.current` の中に入れてくれます。

`value` や `onChange` のような「通常の props」とはちょっと違う、**「裏口のような特別ルート」** だと思っておくとイメージしやすいです 😎

---

### 4-3. 初回表示で `focus()` する `useEffect` ⏱️

```tsx
useEffect(() => {
  inputRef.current?.focus();
}, []);
```

ここも大事なポイントがいくつかあります 👇

* `[]`（依存配列が空）
  → 「**初回表示のときに 1回だけ** 実行してね」という意味。
* `inputRef.current?.focus();`
  → `?.` は「オプショナルチェーン」。
  `current` が `null` のときは何もせず、安全にスルーしてくれます。
* なぜ `useEffect` の中で呼ぶの？
  → `focus()` したいのは **「DOM が確実に存在してから」** だからです。
  描画前に呼ぼうとしても、まだ `inputRef.current` に何も入っていません。([React][3])

---

## 5. `App.tsx` に組み込んで動かしてみよう 🚀

今度は `App.tsx` にこのコンポーネントを読み込んでみます。

> `src/App.tsx`

```tsx
import "./App.css";
import { AutoFocusInput } from "./AutoFocusInput";

export const App = () => {
  return (
    <main style={{ fontFamily: "system-ui, sans-serif", padding: "2rem" }}>
      <h1 style={{ fontSize: "1.5rem", marginBottom: "1rem" }}>
        第98章：useRef で自動フォーカス ✨
      </h1>
      <AutoFocusInput />
    </main>
  );
};
```

### 実行手順 ✅

1. ターミナルでプロジェクトのフォルダを開く
2. 開発サーバーを起動

   ```bash
   npm run dev
   ```
3. ブラウザで表示されているページを開く（または更新する）
4. ページが読み込まれた瞬間に、
   👉 入力欄にカーソルが入っていれば成功です 🎉

---

## 6. よくあるハマりポイント 🐛

### ❌ `useRef()` を引数なしで呼んでいる

```tsx
// これは React 19 + TypeScript だとエラーになる
const inputRef = useRef();
```

* 「引数が足りません」みたいなエラーが出ます。
* かならず初期値を渡しましょう ✅

```tsx
const inputRef = useRef<HTMLInputElement | null>(null);
```

---

### ❌ `inputRef.current.focus()` と書いてエラー

```tsx
// エラー: Object is possibly 'null'.
inputRef.current.focus();
```

* `current` の型が `HTMLInputElement | null` なので、

  * TypeScript 的には「null かもしれないでしょ？」と怒られます。
* 解決方法：

  * オプショナルチェーン `?.` を使う
  * もしくは `if` 文で `null` チェックをする

```tsx
inputRef.current?.focus();

// または
if (inputRef.current !== null) {
  inputRef.current.focus();
}
```

---

### ❌ `useEffect` を書いていない（or 依存配列がない）

```tsx
// これだとレンダリングのたびに focus してしまう
useEffect(() => {
  inputRef.current?.focus();
}); // ← [] を忘れている
```

* 入力している最中に、別の state 更新で再レンダリングが走ると…

  * 毎回カーソルが先頭に戻る、みたいなイライラ挙動になります 😇
* 「最初の1回だけ」にしたいなら、**必ず `[]` を付ける** ✅

---

## 7. ミニ練習問題で定着させよう ✍️

### 📝 練習1：パスワード入力欄にも自動フォーカス

1. `AutoFocusInput` をコピーして、

   * `AutoFocusPassword.tsx` のようなコンポーネントを作る
2. `type="password"` の `<input>` に `ref` を付けて、
3. ページを開いたらパスワード欄に自動でフォーカスされるようにしてみよう。

👉 ポイント：
`useRef<HTMLInputElement | null>(null)` と `useEffect` のセットは同じです ✔️

---

### 📝 練習2：ボタンを押したら別の入力欄にフォーカス

1. `AutoFocusInput` を少し改造して、入力欄を **2つ** 作る
2. 2つ目の入力欄用に、もうひとつ `useRef` を用意する
3. ボタンを押したら、2つ目の入力欄に `focus()` するようにしてみよう

ヒント：

```tsx
const firstInputRef = useRef<HTMLInputElement | null>(null);
const secondInputRef = useRef<HTMLInputElement | null>(null);

const handleMoveFocus = () => {
  secondInputRef.current?.focus();
};
```

---

## 8. この章のまとめ 🎀

* `useRef` は **DOM 要素を直接触りたいときの「窓口」** みたいなもの 🪟
* React 19 + TypeScript では `useRef` に **必ず初期値を渡す** スタイルになるので、
  `useRef<HTMLInputElement | null>(null)` の形を覚えておくと安心 💡([React][1])
* 初回表示で `focus()` したいときは、

  * `ref` を input に付ける
  * `useEffect`（依存配列は `[]`）の中で `ref.current?.focus()` を呼ぶ
* オプショナルチェーン `?.` で **null チェックも同時にできる** のが便利 ✨

---

次の章では、この `useRef` をさらに応用して、
「前の値を覚えておく」「動画を再生・停止する」など、もう一歩進んだ使い方も見ていきます 🎬📦

[1]: https://react.dev/blog/2024/04/25/react-19-upgrade-guide?utm_source=chatgpt.com "React 19 Upgrade Guide"
[2]: https://react.dev/reference/react/useRef?utm_source=chatgpt.com "useRef"
[3]: https://react.dev/learn/manipulating-the-dom-with-refs?utm_source=chatgpt.com "Manipulating the DOM with Refs"
