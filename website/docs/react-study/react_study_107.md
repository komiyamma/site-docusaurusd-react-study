# 第107章：練習：`ref` を受け取れるカスタム`MyInput`部品を作る
**`ref` を受け取れるカスタム `MyInput` 部品を作ろう！** ✨

---

## 107-1 今日のゴール ✅

今日は、

> 親コンポーネント → `MyInput` → `<input>` に `ref` をバトンリレーして、
> 親から「フォーカスして〜」と命令できるようにする 🎤

という「**Ref リレー**」をやってみます 💪

React 19 では、もう `forwardRef` を書かなくても、
**コンポーネントがふつうの Props と同じように `ref` を受け取れる** ようになりました 🧡([Qiita][1])

なので今回は、その「新しい書き方」で
`MyInput` コンポーネントを作っていきます。

---

## 107-2 ざっくり完成イメージ 🧠

![react_study_107_custom_input_ref](./picture/react_study_107_custom_input_ref.png)

最終的には、`App.tsx` からこんな風に使えるようにします。

* `App` が `inputRef` を作る
* `MyInput` に `ref={inputRef}` で渡す
* ボタンを押すと、その `ref` を使ってフォーカス ✨

イメージとしてはこんな感じ 👇

```mermaid
sequenceDiagram
  actor User as ユーザー 👩‍🎓
  participant App as App.tsx
  participant MyInput as MyInput.tsx
  participant Input as "#lt;input#gt;"

  User->>App: フォーカスボタンをクリック 🖱
  App->>Input: inputRef.current?.focus()
  Note right of Input: カーソルがピョコッと動く ✨
```

実際のコードでは、

* `App.tsx`：`useRef` で `inputRef` を作る
* `MyInput.tsx`：`ref` を含んだ Props の型を作り、`<input>` にそのまま渡す

という流れで実装します。

---

## 107-3 `MyInput.tsx` を作ろう 🛠

### 1️⃣ ファイルを作成

Vite のプロジェクトで、`src/components/MyInput.tsx` を作ります。

（フォルダ構成例）

* `src/`

  * `App.tsx`
  * `main.tsx`
  * `components/`

    * `MyInput.tsx` ← いま作るやつ

---

### 2️⃣ Props の型を考える 🧩

React 19 では「**`ref` もふつうの Props の一員**」として扱えるようになりました。([React][2])

さらに、TypeScript 側では

> **`ComponentPropsWithRef<"input">`**

というユーティリティ型を使うと、
`<input>` が本来持っている

* `value`
* `onChange`
* `placeholder`
* `ref` など…

を **まるごとセットで受け取る** ことができます 🎁([Qiita][1])

そこに、`MyInput` 独自の `label` プロパティだけ足してあげる、というスタイルにします。

---

### 3️⃣ `MyInput.tsx` のコード ✍️

```tsx
// src/components/MyInput.tsx
import type { ComponentPropsWithRef, FC } from "react";

// 🔸 <input> が本来受け取れる Props + ref をぜんぶ持っている型
type InputBaseProps = ComponentPropsWithRef<"input">;

// 🔸 MyInput 独自の props を足した型
type MyInputProps = InputBaseProps & {
  label: string;
};

export const MyInput: FC<MyInputProps> = ({ label, ...inputProps }) => {
  return (
    <label style={{ display: "block", marginBottom: "12px" }}>
      <span
        style={{
          display: "block",
          fontSize: "14px",
          marginBottom: "4px",
        }}
      >
        {label}
      </span>

      {/* ⭐ ここがポイント：ref も含めて {...inputProps} でそのまま渡す */}
      <input
        {...inputProps}
        style={{
          padding: "8px 12px",
          borderRadius: "4px",
          border: "1px solid #ccc",
          width: "100%",
          boxSizing: "border-box",
        }}
      />
    </label>
  );
};
```

📌 ポイント

* `ComponentPropsWithRef<"input">`

  * `<input>` が受け取れる props（`type`, `placeholder`, `onChange` など）
  * ＋ `ref`
  * を **ぜんぶまとめた型** です。
* `{ label, ...inputProps }`

  * `label` だけ取り出して
  * `ref` を含む残り全部 (`inputProps`) を `<input>` に渡しています。
* つまり
  **`App` から `<MyInput ref={inputRef} />` と書くと、
  その `ref` は最終的に `<input>` までちゃんと届く**、という仕組みです ✨

---

## 107-4 `App.tsx` から使ってみる 🎮

次は、`App.tsx` 側で `MyInput` を使ってみましょう。

### 1️⃣ `useRef` で `inputRef` を作る

```tsx
// src/App.tsx
import { useRef } from "react";
import { MyInput } from "./components/MyInput";

export default function App() {
  // 🔸 HTMLInputElement を指す ref
  const inputRef = useRef<HTMLInputElement | null>(null);

  const handleFocusClick = () => {
    // current が null じゃなければ focus する
    inputRef.current?.focus();
  };

  return (
    <div style={{ maxWidth: 400, margin: "40px auto", padding: "0 16px" }}>
      <h1 style={{ fontSize: "20px", marginBottom: "16px" }}>
        MyInput + ref 練習 💡
      </h1>

      <MyInput
        label="お名前"
        placeholder="ここに入力してね ✨"
        ref={inputRef} // ← ここが大事！
      />

      <button
        type="button"
        onClick={handleFocusClick}
        style={{
          padding: "8px 16px",
          borderRadius: "4px",
          border: "none",
          backgroundColor: "#4f46e5",
          color: "white",
          cursor: "pointer",
        }}
      >
        入力欄にフォーカスする 🔍
      </button>
    </div>
  );
}
```

### 2️⃣ 実際の動きをチェック 👀

1. `npm run dev` で開く
2. 画面に

   * ラベル「お名前」
   * テキスト入力
   * 「入力欄にフォーカスする」ボタン
     が見えるはずです。
3. ボタンをクリックすると、
   👉 入力欄にカーソルがピッと当たるはずです ✨

うまく動いたら、
**React 19 の「ref を prop として渡す」書き方ができた！** ということです 🎉

---

## 107-5 「ref の流れ」をもう一回だけ整理 🧵

文字だけだとイメージしづらいので、
もう一度、流れをざっくり図にしておきます 🧠

```mermaid
flowchart LR
  subgraph Parent[App.tsx]
    A["inputRef = useRef&lt;HTMLInputElement | null&gt;(null)"]
    B["&lt;MyInput ref={inputRef} /&gt; を描画"]
    C["ボタン onClick で inputRef.current?.focus()"]
  end

  subgraph Child[MyInput.tsx]
    D[props に ref が入ってくる]
    E["&lt;input {...inputProps} /&gt; に ref も一緒に渡す"]
  end

  A --> B
  B --> D
  D --> E
  C --> A
```

* `App.tsx` で作った `inputRef` を、
* `MyInput` が「ただ受け取って、そのまま `<input>` に渡す」だけ、というシンプル構造です ✨

ここが理解できていれば OK です ✅

---

## 107-6 よくあるエラー＆ハマりポイント 😵‍💫

### 🧨 1. `Property 'ref' does not exist on type ...`

**原因候補**

* `MyInputProps` に `ref` が含まれていない書き方をしている
* 例：`type MyInputProps = { label: string }` だけ、など

**対策**

* この章では必ず
  `ComponentPropsWithRef<"input">` をベースにしましょう。

```ts
type InputBaseProps = ComponentPropsWithRef<"input">;
type MyInputProps = InputBaseProps & { label: string };
```

---

### 🧨 2. ref を `<input>` に渡し忘れる

`MyInput` 内で `<input>` をこう書いてしまうパターン：

```tsx
<input placeholder="..." /> // ← ref が渡ってない！
```

これだと `App.tsx` から `ref` を渡しても、
**最終的に `<input>` に届かない** ので、`focus()` も効きません 🥲

✅ 正しいパターン（この章のやり方）：

```tsx
<input {...inputProps} />
```

`inputProps` の中に `ref` も入っているので、
まとめて渡してあげるイメージです。

---

### 🧨 3. React 19 じゃない環境で同じ書き方をしている

React 18 以前では、`ref` は特別扱いされていて、
コンポーネントの引数 `{ ref }` に素直には入ってきませんでした。

React 19 では **新しい JSX トランスフォームが必須**で、
これが有効になっていると `ref` を Props として扱えるようになります。([React][2])

Vite + 最新の React テンプレートなら、
ふつうはもう新しいトランスフォームになっているので、
この章のコードでそのまま動くはずです 💡

もし古いプロジェクトを React 19 に上げた場合は、
公式の Upgrade Guide に沿って JSX トランスフォームを
更新しておくと安心です。([React][2])

---

## 107-7 ミニ練習問題 📝（やれたら超えらい）

時間と気力があれば、次の 2 つにチャレンジしてみてください 💪

### ✅ 練習1：エラーメッセージ付き `MyInput`

`MyInput` に、こんな Props を追加してみましょう。

* `errorMessage?: string`

仕様：

* `errorMessage` が渡されているときだけ、

  * `<input>` の下に赤い文字でエラー文を表示する
  * `<input>` の枠線の色も赤くする

ヒント：

* `MyInputProps` にプロパティを足すだけで OK
* スタイルは `style={{ ... }}` で軽くやってしまって大丈夫 👍

---

### ✅ 練習2：ページ読み込み時に自動フォーカス

`App.tsx` を少し改造して、

* 画面を開いた瞬間に `inputRef.current?.focus()` する
* つまり「ページ読み込みで自動フォーカス」する

ようにしてみましょう。

ヒント：

* すでに学んでいる `useEffect` を使う
* 依存配列は `[]`（マウント時に1回だけ）

---

## 107-8 今日のまとめ 🍵

* React 19 では、**コンポーネントがふつうに `ref` を Props として受け取れる** ようになった 🎉([Qiita][1])
* TypeScript では

  * `ComponentPropsWithRef<"input">` を使うと、
  * `<input>` の Props + `ref` を **まるごと再利用** できて超ラク ✨([Qiita][1])
* `MyInput` は、

  * 親から `ref` を受け取る
  * `<input {...inputProps} />` にそのまま渡すだけ
  * 親は `useRef`＋`ref={inputRef}`＋`inputRef.current?.focus()` で操作できる

ここまでできていれば、
**「ref as prop」× TypeScript の基本パターンはクリア** です 🎊

次の章では、さらに一歩進んで
`useImperativeHandle` で「`ref` から呼べるメソッドだけ公開する」
というテクニックに進んでいきます 💪✨

[1]: https://qiita.com/honey32/items/958e085f074662f9ef79 "React19はforwardRef絡みの長ったらしい型記述を無くしてくれる #TypeScript - Qiita"
[2]: https://react.dev/blog/2024/04/25/react-19-upgrade-guide "React 19 Upgrade Guide – React"
