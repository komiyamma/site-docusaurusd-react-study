# 第109章：練習：`useImperativeHandle` で `MyInput` の `focus` だけ公開する
**練習：`useImperativeHandle` で `MyInput` の `focus` だけ公開する**

---

## 1️⃣ この章のゴール ✨

この章では、こんなことができるようになるのがゴールです👇

* 親コンポーネントから
  「`MyInput` さん、フォーカスお願い〜🙏」だけを呼び出す
* でも **本物の `<input>` DOM は親にベタっと渡さない**（カプセル化🧱）
* `useImperativeHandle` を使って
  「`focus` だけ公開するハンドル」を TypeScript で型付きで作る

React 19 では `ref` を普通の props と同じように受け取れるようになっているので、
`forwardRef` を使わずにこのパターンが書けます。([React][1])

---

## 2️⃣ ざっくり全体イメージ 🧠

![react_study_109_focus_control](./picture/react_study_109_focus_control.png)

「誰が何を持ってて、どうやって呼び出してるの？」を図にするとこんな感じです👇

```mermaid
sequenceDiagram
  participant Parent as "親: Appコンポーネント"
  participant MyInput as "子: MyInputコンポーネント"
  participant Dom as "本物の<input> DOM"

  Parent->>MyInput: refをpropsとして渡す
  MyInput->>Dom: useRefで<input>への参照を持つ
  MyInput->>Parent: useImperativeHandleで「focusだけ」公開
  Parent->>MyInput: ref.current.focus() を呼ぶ
  MyInput->>Dom: inputRef.current?.focus() で実際にフォーカス

```

ポイント💡

* 親は **`focus()` という「ボタン」だけ知っている**
* 実際にどうやって DOM をフォーカスしているかは **子の中の秘密**
* だから、親は `style` いじったり `remove()` したりできない＝安全＆キレイな設計💅([React][1])

---

## 3️⃣ まずは「公開するハンドルの型」を決める 🧩

「親が触っていいのは `focus` だけ」にしたいので、
**`focus()` メソッドだけを持つ型** を作ります。

### 🔹 `MyInputHandle` 型を作る

`src/MyInput.tsx` に書くことを想定します。

```ts
// MyInput が親に渡す「ハンドル（取っ手）」の型
export type MyInputHandle = {
  focus: () => void;
};
```

* これで、
  `ref.current` の型が **「focus だけを持つオブジェクト」** になります。
* 親からは `ref.current.focus()` は OK 👍
  でも `ref.current.style` みたいなアクセスは型エラーになります 🚫

---

## 4️⃣ 子コンポーネント MyInput を実装しよう ✍️

次に、`useImperativeHandle` を使って
「本物の `<input>` にフォーカスする処理」を `focus()` に閉じ込めます。

### 🔹 `MyInput.tsx` 全体（子コンポーネント）

`````tsx
// src/MyInput.tsx
import {
  useRef,
  useImperativeHandle,
  type RefObject,
} from "react";

export type MyInputHandle = {
  focus: () => void;
};

type MyInputProps = {
  // 親から渡される ref（中身は MyInputHandle）
  ref: RefObject<MyInputHandle | null>;
  label?: string;
};

export function MyInput({ ref, label }: MyInputProps) {
  // 本物の <input> DOM への ref（これは外には出さない）
  const inputRef = useRef<HTMLInputElement | null>(null);

  // 親に「どんなハンドルを見せるか」をカスタマイズする
  useImperativeHandle(
    ref,
    () => ({
      // 親が呼べるのはこの focus だけ ✨
      focus() {
        inputRef.current?.focus();
      },
    }),
    [] // 今回は依存なし（初回だけ作ればOK）
  );

  return (
    <div>
      {label && <label style={{ display: "block", marginBottom: 4 }}>{label}</label>}
      <input
        ref={inputRef}
        type="text"
        placeholder="ここに入力してね ✍️"
        style={{ padding: "4px 8px" }}
      />
    </div>
  );
}
```

ここでのポイント👇  

- `inputRef`  
  → 本物の `<input>` DOM をつかんでおくための `useRef`  
- `useImperativeHandle(ref, () => ({ ... }))`  
  → 親に見せる「ハンドルの中身」を自分で決めるフック:contentReference[oaicite:2]{index=2}  
- 返しているオブジェクトは `{ focus() { ... } }` だけなので、  
  親から触れるのは **`focus()` だけ** ✅

---

## 5️⃣ 親コンポーネントから呼び出してみる 🧑‍💻

次は `App.tsx` 側から `MyInput` を使ってみましょう。

### 🔹 `App.tsx`（親コンポーネント）

````tsx
// src/App.tsx
import { useRef } from "react";
import { MyInput, type MyInputHandle } from "./MyInput";

export default function App() {
  // 親が持つ ref：中身は MyInputHandle（= focusだけ）
  const inputRef = useRef<MyInputHandle | null>(null);

  const handleClick = () => {
    // ?. にしておくと、null のときも安全（アプリが落ちない）
    inputRef.current?.focus();
  };

  return (
    <div style={{ padding: 24, fontFamily: "sans-serif" }}>
      <h1>useImperativeHandle 練習 ✨</h1>
      <p>ボタンを押すと、下の入力欄にフォーカスが移動します 👇</p>

      <MyInput ref={inputRef} label="お名前" />

      <button
        type="button"
        onClick={handleClick}
        style={{ marginTop: 12, padding: "4px 12px" }}
      >
        入力欄にフォーカスする 🔍
      </button>
    </div>
  );
}
`````

ここでの流れ🧵

1. 親で `const inputRef = useRef<MyInputHandle | null>(null);`
2. `<MyInput ref={inputRef} />` で子に渡す
3. 子の中で `useImperativeHandle` が
   `ref.current = { focus() { ... } }` をセット
4. 親の `handleClick` で `inputRef.current?.focus()` を呼ぶと
   → 実際には子の中で `inputRef.current?.focus()`（本物の `<input>`）が動く

---

## 6️⃣ 動かしてみよう 🚀（Vite 前提）

すでに Vite + React + TS プロジェクトがある前提で進めます。

1. `src/MyInput.tsx` を作って、上のコードをコピペ
2. `src/App.tsx` を、さっきのコードに差し替え
3. ターミナルで：

   ```bash
   npm run dev
   ```
4. ブラウザで `http://localhost:5173`（ポート番号は環境で変わるかも）を開く
5. 「入力欄にフォーカスする 🔍」ボタンをクリック
   → 下のテキストボックスにカーソルがピッと移動していたら成功 🎉

---

## 7️⃣ なんで「focusだけ公開」するの？🤔

もし `useImperativeHandle` を使わずに、子でこう書いたとします👇

```tsx
function MyInput({ ref }: { ref: React.RefObject<HTMLInputElement | null> }) {
  return <input ref={ref} />;
}
```

この場合、親はこんなこともできちゃいます：

* `ref.current.style.color = "red";`
* `ref.current.remove();`
* `ref.current.value = "なんでも書き換えられる"`

＝ 子コンポーネントの実装にベッタリ依存しちゃうんですね 🥲([Qiita][2])

`useImperativeHandle` で

* 親が使えるのは `focus()` だけ
* 内部が `<input>` じゃなくて `<textarea>` に変わっても
  `focus()` さえ守っていれば親側は修正不要

という **「約束（インターフェース）」** を作れるのがメリットです 💍

---

## 8️⃣ もう一歩：DOM 型をそのまま再利用したい場合（おまけ）💎

TS に慣れてきたら、こんな書き方もできます👇

* HTMLInputElement 型から `focus` だけを `Pick` で取り出すパターン
* React 19 + TypeScript でおすすめされている書き方の一つです([Zenn][3])

```ts
// HTMLInputElement から "focus" だけを取り出した型
type InputFocusHandle = Pick<HTMLInputElement, "focus">;
```

これをさっきの `MyInputHandle` の代わりに使うと、

```ts
type MyInputProps = {
  ref: React.RefObject<InputFocusHandle | null>;
};
```

のように書けて、

* 「`focus` は本物の DOM の `focus` と同じシグネチャである」
* ということも型で保証できます 🛡️

（本編ではまず `MyInputHandle` 方式で慣れて、
　余裕が出てきたらこのスタイルにチャレンジする感じでOKです👌）

---

## 9️⃣ よくあるハマりポイント 🐛

### ❌ 1. `ref.current.focus()` と書いて `.focus` を忘れる

* `ref.current` 自体はオブジェクトなので、そのままでは何も起きません
* 実際に呼ぶのは **関数としての `focus()`**

👉 正しくは `ref.current?.focus()` ✅

---

### ❌ 2. `useImperativeHandle` の第1引数に `inputRef` を渡してしまう

```ts
// ❌ 間違い
useImperativeHandle(inputRef, () => ({ /* ... */ }));
```

* 第1引数に渡すのは **親から受け取ったほうの `ref`** です
* 本物の `<input>` への ref は、第2引数の中で使うだけ

👉 正しくは：

```ts
useImperativeHandle(
  ref,           // ✅ 親からもらった ref
  () => ({
    focus() {
      inputRef.current?.focus(); // ✅ ここで本物のDOMを使う
    },
  }),
  []
);
```

---

### ❌ 3. なんでもかんでも useImperativeHandle で公開しちゃう

* 「scroll」「reset」「getValue」「setValue」…と何でもかんでも公開すると、
  それはもう「ただの DOM をそのまま渡してるのと同じ」状態になりがちです 🥹([React][1])
* 本当に **「命令として親にさせたいことだけ」** を公開するのがおすすめです

---

## 🔟 ミニ演習 💪

時間があれば、こんな改造もやってみてください ✨

1. **`clear()` メソッドを追加してみる**

   * `MyInputHandle` に `clear: () => void;` を足す
   * `inputRef.current.value = ""` で中身を消す
   * 親側に「クリア」ボタンを追加して `ref.current?.clear()` を呼ぶ

2. **エラーメッセージ付きのフォームにする**

   * `MyInput` に `errorMessage?: string` を props で渡す
   * `errorMessage` があれば、入力欄の下に赤文字で表示する
   * それでも親は `focus()` だけ呼べる状態をキープする（DOM は隠したまま）

3. **キーボードショートカットでフォーカス**

   * 親で `useEffect` と `keydown` イベントを使って
     `Ctrl + K` が押されたら `inputRef.current?.focus()` を呼ぶようにしてみる

---

これで **「`MyInput` の `focus` だけを親に公開する」** パターンはバッチリです 💯
次の章では、この考え方をもう少し広げていったり、他のフックと組み合わせて使っていきましょう〜🌈

[1]: https://react.dev/reference/react/useImperativeHandle "useImperativeHandle – React"
[2]: https://qiita.com/JavaLangRuntimeException/items/c670b741a0fcbcce4358?utm_source=chatgpt.com "【Qiita Advent Calender 2025企画】React Hooks を Hack ..."
[3]: https://zenn.dev/mayuyu/articles/75cb2e2c90b1ef "TypeScriptでuseImperativeHandleを使う"
