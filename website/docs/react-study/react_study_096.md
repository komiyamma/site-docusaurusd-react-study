# 第96章：`useRef`の型！
`useRef<HTMLInputElement | null>(null)` を味方にしよう ✨⌨️

---

## 1️⃣ この章のゴール

この章では、こんなことがサラッとできるようになるのがゴールです 💪

* `useRef` に「ちゃんとした型」を付けられる
* `useRef<HTMLInputElement | null>(null)` の意味が分かる
* `inputRef.current?.focus()` みたいなコードを「こわくなく」書ける
* React v19 の新しい `useRef` の型仕様にもついていける ([React][1])

---

## 2️⃣ まずはおさらい：`useRef` ってなに？🧠

`useRef` は「ずっと覚えておきたい箱」を作るフックでしたね。

* その箱の中身は `.current` プロパティに入る
* 画面を再描画しても、中身はずっと生き残る
* でも、中身を変えても画面は再描画されない（だから「状態(state)」とは別物）

React 公式の説明でも「レンダーに使わない値を覚えておくためのフック」と書かれています。([React][2])

**この章では、その「箱」の型をちゃんと決めよう！**という話です。

---

## 3️⃣ React v19 時代の `useRef`：ここが変わったポイント ✨

React v19 + TypeScript では、`useRef` の型まわりが少しスッキリしました。([React][1])

ざっくり押さえておきたいポイントはこの3つ👇

1. **`useRef()` は必ず引数が必要**

   * `useRef()` ← これは TypeScript エラーになります
   * `useRef(null)` や `useRef(undefined)` みたいに「最初の中身」を渡す必要あり

2. **全部「mutable な ref」になった**

   * `MutableRefObject` とか難しそうな型は気にしなくてOK
   * 返ってくるのはイメージ的にこんな感じ
     `RefObject<T> { current: T }`

3. **`useRef<T>(null)` は自動的に `T | null` になる**

   * `useRef<HTMLInputElement>(null)` → 実際の型は `RefObject<HTMLInputElement | null>`
   * `useRef<number>(0)` → `RefObject<number>`

なので、**「何を入れる箱なのか」を `<ここ>` に書いてあげる**だけでOK、という感覚で大丈夫です。

---

## 4️⃣ テンプレ：`useRef<HTMLInputElement | null>(null)` を分解してみる🔍

よく見るこの書き方：

```tsx
const inputRef = useRef<HTMLInputElement | null>(null);
```

これをパーツに分けて見てみましょう 👀

* `useRef<...>`
  → `useRef` に「箱の中身の型」を教えてあげてる（ジェネリクス）

* `<HTMLInputElement | null>`
  → `HTMLInputElement` か `null` が入る「どっちか」っていう意味

  * まだ input が画面に出てない最初の瞬間は `null`
  * 画面に表示されて、`ref` がつながったら実際の `<input>` 要素が入る

* `(null)`
  → 最初の中身は `null` ですよ〜という初期値

### つまりこういうイメージ 📦

* **型としては**：`RefObject<HTMLInputElement | null>`
* **中身の変化**：

  * 初期：`inputRef.current === null`
  * マウント後：`inputRef.current` に実際の `<input>` 要素が入る

---

## 5️⃣ 図解：`useRef` と DOM 要素の関係をイメージしよう 🧩

![react_study_096_useref_types](./picture/react_study_096_useref_types.png)

`useRef` の流れを Mermaid で図にしてみます ✏️

```mermaid
graph LR
  A["コンポーネントで<br/>useRef 呼び出し"] --> B["ref オブジェクト<br/>{ current: null }"]
  B --> C["JSX の input に<br/>ref={inputRef} を渡す"]
  C --> D["ブラウザが実際の<br/>input 要素を作る"]
  D --> E["React が inputRef.current に<br/>その input 要素を代入する"]
```

このイメージさえあれば、

> 「型は `HTMLInputElement | null` で、最初は `null`、あとから input が入る」

という流れがしっくり来るはずです ✨

---

## 6️⃣ 実例：読み込み時に自動でフォーカスする入力欄 🎯

さっそく、実際に `useRef<HTMLInputElement | null>(null)` を使った例を書いてみます。

### 例：ページを開いたら、名前入力欄にフォーカスするコンポーネント

```tsx
import { useEffect, useRef } from "react";

function AutoFocusInput() {
  // ★ 型付きの ref：HTMLInputElement か null が入る箱
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    // current が null じゃないかチェックしてから使うのが安全 ✅
    inputRef.current?.focus();
  }, []);

  return (
    <div style={{ padding: "16px" }}>
      <label>
        お名前：
        <input
          ref={inputRef}
          type="text"
          placeholder="ここに名前を入力してね ✍️"
        />
      </label>
    </div>
  );
}

export default AutoFocusInput;
```

ポイントを整理すると…

* `useRef<HTMLInputElement | null>(null);`

  * **型**：`HTMLInputElement | null`
  * **初期値**：`null`

* `ref={inputRef}`

  * React が、自動で `inputRef.current` に DOM 要素を入れてくれる

* `inputRef.current?.focus();`

  * `?.`（オプショナルチェーン）で「もし current が `null` じゃなかったら `focus` してね」って書き方
  * これなら TypeScript 的にも安全だし、実行時エラーも防げる ✨

---

## 7️⃣ DOM 要素ごとの「よく使う型」チートシート 📝

「タグ名 → TypeScript の型」の対応を覚えておくと、`useRef` の型付けが一気に楽になります 💡

| HTMLタグ       | TypeScript の型         | 例                 |
| ------------ | --------------------- | ----------------- |
| `<input>`    | `HTMLInputElement`    | テキスト入力、チェックボックスなど |
| `<textarea>` | `HTMLTextAreaElement` | 複数行入力             |
| `<button>`   | `HTMLButtonElement`   | ボタン               |
| `<div>`      | `HTMLDivElement`      | 汎用ブロック            |
| `<form>`     | `HTMLFormElement`     | フォーム要素            |
| `<video>`    | `HTMLVideoElement`    | 動画プレイヤー           |
| `<img>`      | `HTMLImageElement`    | 画像                |

**使うときのパターンは全部一緒：**

```tsx
const divRef = useRef<HTMLDivElement | null>(null);
const textareaRef = useRef<HTMLTextAreaElement | null>(null);
const buttonRef = useRef<HTMLButtonElement | null>(null);
```

---

## 8️⃣ React v19 ならではのポイント ✨

React 19 の TypeScript 型変更で、`useRef` まわりに少し仕様が入っています。([React][1])

### ✅ 1. 引数なしの `useRef()` は NG

```tsx
// ❌ React 19 + TS ではエラー
const badRef = useRef();

// ✅ OK（undefined を初期値にする）
const okRef = useRef<number | undefined>(undefined);
```

> 「とりあえず空で作って、あとでなんか入れよう〜」
> みたいな書き方はできなくなりました。
> **必ず初期値を渡す**、というルールです。

### ✅ 2. `useRef<T>(null)` のときは自動で `T | null`

`useRef<HTMLInputElement | null>(null)` と書いてあげれば、
中身は `HTMLInputElement | null` として扱われます。

* `useRef<number>(0)` → `RefObject<number>`
* `useRef<HTMLDivElement | null>(null)` → `RefObject<HTMLDivElement | null>`

React 公式のアップグレードガイドでも、「すべての ref は mutable で、`MutableRefObject` は `RefObject` に一本化された」と説明されています。([React][1])

> つまり「とりあえず `useRef` 書いとく → 型がよく分からなくて詰む」
> みたいなパターンが減るように整理されてます 🧹

---

## 9️⃣ よくあるエラー＆つまずきポイント 😵‍💫

### ❌ パターン1：`useRef()` を引数なしで呼ぶ

```tsx
const inputRef = useRef(); // ← React 19 + TS だとエラー
```

> 「1個引数がいるよ！」と TypeScript に怒られます。
> → **必ず初期値を渡す**ようにしましょう。

---

### ❌ パターン2：`null` を考えずに `current` に触る

```tsx
const inputRef = useRef<HTMLInputElement | null>(null);

// ❌ こう書くと「null かもしれないよ」と怒られる
inputRef.current.focus();
```

`current` は `HTMLInputElement | null` なので、
TypeScript は「null だったらどうするの？」と言ってきます。

✅ 安全な書き方はこれ：

```tsx
inputRef.current?.focus();
// or
if (inputRef.current) {
  inputRef.current.focus();
}
```

---

### ❌ パターン3：型をつけずに `any` に逃げる

```tsx
// ❌ これは型チェックの良さを殺してる…
const inputRef = useRef<any>(null);
```

たしかにコンパイルエラーは消えますが、

* `inputRef.current.` と打っても補完が弱くなる
* `focus` が本当にあるのかどうか分からない
* 間違っても TypeScript が守ってくれない

ので、**極力 HTMLXXXElement をちゃんと書く**クセをつけるのがおすすめです ✨

---

## 🔟 ミニ練習問題 📝（自分でやってみよう）

ノートに書くだけでもOKなので、ちょっと手を動かしてみてください 💪

### 問題1：`textarea` 用の ref を型付きで作る

やりたいこと：

* `<textarea>` に `ref` をつけたい
* 「コメント入力欄」として `placeholder` を入れる

**ヒント：**

* 型は `HTMLTextAreaElement`
* 初期値は `null` にする

---

### 問題2：`div` へスクロールするボタン

仕様：

* 下のほうにある `<div>` に `ref` をつける
* ボタンを押したら、その `div` に `scrollIntoView()` する

**ヒント：**

* 型は `HTMLDivElement`（`HTMLDivElement | null` にしよう）
* `divRef.current?.scrollIntoView({ behavior: "smooth" })` みたいな感じ

---

## まとめ 🌸

この章で覚えておきたいポイントを最後にもう一度 ✨

* `useRef` は「ずっと持っておきたい箱」→ 中身は `.current`
* React 19 + TS では **`useRef()` に必ず引数が必要** ([React][1])
* DOM 用の ref は **`useRef<HTML〜Element | null>(null)`** が定番
* `current` に触る時は **`?.` か `if (current)` で null チェック**
* `any` に逃げずに、`HTMLInputElement` などちゃんとした型を書くと VSCode がめちゃくちゃ助けてくれる 🧑‍💻✨

次の章（第97章）では、ここで作った型付きの `ref` を
実際に JSX の `ref={...}` でどう使っていくのかを、さらに丁寧に見ていきます 🚀

[1]: https://react.dev/blog/2024/04/25/react-19-upgrade-guide "React 19 Upgrade Guide – React"
[2]: https://react.dev/reference/react/useRef?utm_source=chatgpt.com "useRef"
