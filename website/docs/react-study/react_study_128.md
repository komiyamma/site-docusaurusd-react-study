# 第128章：練習：`useFormStatus` で送信ボタンを「送信中...」に変える
**`useFormStatus` を使って「送信中...」ボタンに変身させるフォーム**を一緒につくっていきます💌✨

---

## 1. この章のゴール 🎯

この章が終わるころには、こんなことができるようになります👇

* フォームを送信すると…

  * 送信ボタンの文字が **「送信」 → 「送信中...」** に変わる
  * ボタンが **自動で `disabled`** になる
* この「送信中かどうか」は
  **`useFormStatus` フックで勝手に教えてもらう** 💡
* 親コンポーネントから「isPending」を props で渡さなくてもOK
  → 子コンポーネントが**自分でフォームの状態を知る**ようになる

---

## 2. 全体イメージを図で見る 🧠✨

`useActionState` でフォーム送信をしつつ、
`useFormStatus` で「送信中かどうか」をボタン側が受け取る、という流れです。

```mermaid
graph TD
  U[ユーザー] -->|入力して送信| F["<form action={formAction}>"]
  F -->|送信| A["Action関数<br/>（useActionStateで登録）"]
  A -->|処理が終わるまで待つ| F
  F -->|送信状態を共有| S["useFormStatus()<br/>（SubmitButtonの中）"]
  S -->|pending true/false| B["送信ボタンの<br/>ラベル & disabled"]
```

* `useActionState` で「送信処理」と「結果の state 管理」をやる 🧪([React][1])
* `useFormStatus` で「フォームの今の状態（pending など）」を子コンポーネントから読む ([React][2])

---

## 3. 今回つくるミニアプリの構成 🏗️

ファイルはシンプルにこんな感じにします：

* `src/App.tsx`
  → 画面全体。`<ContactForm />` を表示するだけ
* `src/ContactForm.tsx`
  → 実際のフォーム本体（`useActionState` を使う）
* `src/SubmitButton.tsx`
  → `useFormStatus` を使って「送信中...」に変身するボタン

※ すでに Vite + React + TS (react-ts テンプレ) でプロジェクトがある前提です。
（`npm create vite@latest` → テンプレ `react-ts` のやつ）

---

## 4. `SubmitButton` を作る：`useFormStatus` の主役登場 ✨

![送信ボタンの状態変化イメージ](./picture/react_study_128_submit_button.png)

まずは **「ボタンだけ」のコンポーネント**を作って、
その中で `useFormStatus` を使います。

📄 `src/SubmitButton.tsx`

```tsx
import { useFormStatus } from "react-dom";

export function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      aria-busy={pending}
      className="submitButton"
    >
      {pending ? "送信中..." : "送信"}
    </button>
  );
}
```

### ポイント解説 📝

* `useFormStatus` は **`react-dom` から import** します ([React][2])
* `{ pending }` を取り出して、

  * `disabled={pending}` → 送信中のときだけ押せないように
  * `aria-busy={pending}` → スクリーンリーダー向けに「今忙しいよ」と伝える
* `pending ? "送信中..." : "送信"`
  → 送信中だけラベルを変える 💫

⚠️ 大事なルール
`useFormStatus` は **必ず `<form>` の中（子孫コンポーネント）で使う**必要があります。
フォームの外で使うと、`pending` はずっと `false` のままです。([MintJams][3])

---

## 5. フォーム本体を作る：`useActionState` と仲良くする 🤝

次に、フォーム本体をつくります。
ここで **`useActionState`** を使って、

* 送信処理（Action関数）
* 送信結果のメッセージ

をまとめて管理します。

📄 `src/ContactForm.tsx`

```tsx
import { useActionState } from "react";
import { SubmitButton } from "./SubmitButton";

const initialState = {
  message: "",
};

async function submitContact(
  previousState: typeof initialState,
  formData: FormData
): Promise<typeof initialState> {
  const name = (formData.get("name") ?? "") as string;
  const body = (formData.get("body") ?? "") as string;

  // サーバーに送っている風のダミー処理（1.5秒待つだけ）
  await new Promise((resolve) => setTimeout(resolve, 1500));

  if (!name || !body) {
    return {
      message: "お名前とメッセージは必須です 🥺",
    };
  }

  return {
    message: `送信ありがとう、${name} さん！📨`,
  };
}

export function ContactForm() {
  const [state, formAction] = useActionState(submitContact, initialState);

  return (
    <div className="contactForm">
      <h1>ミニお問い合わせフォーム ✍️</h1>

      <form action={formAction}>
        <div className="field">
          <label>
            お名前：
            <input name="name" type="text" placeholder="React 太郎" />
          </label>
        </div>

        <div className="field">
          <label>
            メッセージ：
            <textarea
              name="body"
              rows={4}
              placeholder="何かひとことどうぞ 💬"
            />
          </label>
        </div>

        {/* ここがポイント：フォームの中で SubmitButton を使う */}
        <SubmitButton />
      </form>

      {state.message && (
        <p className="resultMessage" aria-live="polite">
          {state.message}
        </p>
      )}
    </div>
  );
}
```

### ここでやっていること 🧐

* `initialState`
  → フォームの「結果メッセージ」の初期値

* `submitContact(previousState, formData)`

  * `useActionState` 用の「Action関数」
  * 第1引数：前回の state（今回はあまり使ってない）
  * 第2引数：フォームから送られてきた `FormData`
  * 今回は **ダミーで 1.5 秒 `setTimeout`** しているだけ
    → ここを将来、本物の API 叩く処理に変えればOK👌

* `const [state, formAction] = useActionState(submitContact, initialState);` ([React][1])

  * `state` → 最新の送信結果（`{ message: string }`）
  * `formAction` → `<form action={formAction}>` に渡すための関数

* `<form action={formAction}>` の **子要素として** `<SubmitButton />` を置いているので、
  `SubmitButton` の中の `useFormStatus()` が、このフォームの `pending` 状態をちゃんと拾ってくれます 🎉([MintJams][3])

---

## 6. `App.tsx` で表示する 👀

最後に、`App.tsx` からこのフォームを表示します。

📄 `src/App.tsx`

```tsx
import { ContactForm } from "./ContactForm";

function App() {
  return (
    <div style={{ padding: "2rem" }}>
      <ContactForm />
    </div>
  );
}

export default App;
```

これでブラウザを開いて

* 名前とメッセージを入力
* 「送信」ボタンをクリック

すると…

* ボタンが「送信中...」に変わる
* ボタンが押せなくなる
* 1.5 秒後にメッセージが下に表示される

…という動きになるはずです ✨

---

## 7. 見た目をちょっとだけ整える（オプション）💄

CSS は軽くでOKですが、例としてこんな感じ。

📄 `src/index.css` など

```css
body {
  font-family: system-ui, sans-serif;
  background: #f9fafb;
}

.contactForm {
  max-width: 480px;
  margin: 0 auto;
  padding: 1.5rem;
  border-radius: 1rem;
  background: #ffffff;
  box-shadow: 0 10px 25px rgba(15, 23, 42, 0.08);
}

.contactForm h1 {
  font-size: 1.4rem;
  margin-bottom: 1rem;
}

.field {
  margin-bottom: 1rem;
}

.field label {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.field input,
.field textarea {
  padding: 0.5rem 0.75rem;
  border-radius: 0.5rem;
  border: 1px solid #d1d5db;
  font-size: 0.9rem;
}

.submitButton {
  margin-top: 0.5rem;
  padding: 0.6rem 1.4rem;
  border-radius: 999px;
  border: none;
  font-size: 0.95rem;
  cursor: pointer;
  background: linear-gradient(135deg, #3b82f6, #6366f1);
  color: #ffffff;
  font-weight: 600;
}

.submitButton[disabled] {
  opacity: 0.6;
  cursor: not-allowed;
}

.resultMessage {
  margin-top: 1rem;
  font-size: 0.95rem;
  color: #16a34a;
}
```

かわいいフォームになります🩵

---

## 8. よくあるハマりポイント 🔍

### ❌ 1. `<form>` の外で `useFormStatus` を使っている

```tsx
// ダメな例（外側）
export function Page() {
  const { pending } = useFormStatus(); // ← ここでは pending はずっと false...

  return (
    <form action={formAction}>
      {/* ... */}
    </form>
  );
}
```

✅ **必ず `<form>` の子孫コンポーネントの中**で使うこと！

```tsx
export function Page() {
  return (
    <form action={formAction}>
      {/* 中で呼ぶ */}
      <SubmitButton />
    </form>
  );
}
```

### ❌ 2. `type="submit"` を忘れている

`useFormStatus` は **フォーム送信**に反応します。
ボタンの `type` が `button` のままだと送信されないので、必ず

```tsx
<button type="submit">送信</button>
```

にしておきましょう ✅

### ❌ 3. `pending` を props でも渡して二重管理してしまう

`useFormStatus` の良さは「**props のバケツリレーを減らせる**」ことです。([manuelsanchezdev.com][4])

```tsx
// こう書くともったいない
<SubmitButton isPending={pending} />

// この章ではこっちのスタイルを練習👇
<SubmitButton />
// 中で useFormStatus() を呼ぶ
```

---

## 9. ミニ課題 📝（余裕があれば）

ちょっとだけ手を動かして慣れてみましょう✨

1. ボタンのラベルをアレンジしてみる

   * 例）`"送信"` → `"送信する"`
   * `"送信中..."` → `"送信中です ⏳"` など

2. 送信中だけ別のメッセージを表示してみる

   * 例）フォームの下に
     「送信中… 画面は閉じずにお待ちください🙏」
     と出す（`useFormStatus` を使う小さなコンポーネントを増やしてもOK）

3. 「送信完了！」メッセージの色をエラーと成功で変えてみる

   * `submitContact` でエラーかどうかも一緒に返すようにして
     それに応じて CSS クラスを切り替える 🔴🟢

---

## まとめ 🎀

この章では、

* `useFormStatus` を使ってフォームの「送信中」状態を読み取る
* その状態を使って

  * ボタンを「送信中...」に変える
  * ボタンを自動で無効化する
* しかも props の受け渡しなしで、
  **子コンポーネントが自分でフォームの状態を知る**

という、React 19 の新しいフォームスタイルを練習しました💡([React][2])

次のフォーム開発では、「とりあえず `useFormStatus` で pending を使えるかな？」と考えてみてくださいね ✨
だいぶコードがスッキリして、フォームまわりが好きになってくるはずです😍

[1]: https://react.dev/reference/react/useActionState?utm_source=chatgpt.com "useActionState"
[2]: https://react.dev/blog/2024/12/05/react-19?utm_source=chatgpt.com "React v19"
[3]: https://www.mintjams.jp/%E3%81%AA%E3%81%9C%E4%BB%8A%E3%81%99%E3%81%90%E4%BD%BF%E3%81%86%E3%81%B9%E3%81%8D%EF%BC%9FReact%2019%E3%81%AEActions%E3%81%A8%E3%83%95%E3%82%A9%E3%83%BC%E3%83%A0%E6%94%B9%E5%96%84%E3%81%8C%E3%82%82%E3%81%9F%E3%82%89%E3%81%99%E9%96%8B%E7%99%BA%E9%9D%A9%E5%91%BD/r/blog%2Carticles%2Cweb-development%2Creact-19-actions-forms%2Cindex.html/?utm_source=chatgpt.com "なぜ今すぐ使うべき？React 19のActionsとフォーム改善が ..."
[4]: https://www.manuelsanchezdev.com/blog/react-19-new-hooks-useoptimistic-useformstatus-useactionstate?utm_source=chatgpt.com "Exploring the New Hooks in React 19 - Manuel Sánchez"
