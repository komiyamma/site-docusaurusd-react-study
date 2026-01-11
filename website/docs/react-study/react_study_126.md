# 第126章：練習：`useActionState` でエラーメッセージを表示する

「フォーム送信したけど、入力ミスは画面にどう出すの？🤔」
この章では、その **エラーメッセージ表示** を `useActionState` を使って実装してみるよ ✨

---

## 1. 今日やるゴール 🏁

![バリデーションエラーのイメージ](./picture/react_study_126_validation_error.png)

シンプルなフォームで、こんな動きを作ります。

* 入力が足りない → フォームの下に **赤いエラーメッセージ** を出す ❌
* 条件を満たす → エラーは消える ✅
* エラー状態は **`useActionState` の「state」部分** に入れて管理する

`useActionState` は React 19 で追加された、フォームのアクション処理と状態管理をまとめてやってくれるフックです。([React][1])
戻り値はだいたいこんな感じでした：

> `[state, formAction, isPending]`
> （state：アクションの結果、formAction：`<form action={...}>` に渡す関数、isPending：処理中フラグ）([React][1])

この「state」の部分を **エラーメッセージ専用** にしてしまおう、というのが今回の練習です 🧡

---

## 2. ざっくり流れを図で見る 🧠🌀

```mermaid
flowchart TD
  A[ユーザーがフォームに入力] --> B[送信ボタンを押す]
  B --> C["<form action={formAction}> が発火"]
  C -->  D["useActionStateに渡した<br/>アクション関数が実行"]
  D --> E{バリデーションOK?}
  E -- いいえ --> F[エラーメッセージの文字列を return]
  E -- はい --> G[null を return]
  F & G -->  H["error state が更新される<br/>(string または null)"]
  H --> I[コンポーネントが再レンダリング]
  I --> J{error はある？}
  K["画面に<p>でエラーを表示"]
  J -- ない --> L[エラー文は表示しない]
```

やることはこの図のとおりで、

1. `useActionState` で **エラー状態 (`error`) を持つ**
2. アクション関数の中で **文字列（エラーメッセージ）か `null` を返す**
3. JSX で `{error && <p>...</p>}` として表示する

この 3 ステップがメインになります 🌟

---

## 3. 小さなサンプルを作ろう ✍️

テーマは「**ニックネーム登録フォーム**」にしてみます。

* ニックネーム必須
* 3文字未満ならエラー
* OKならエラーは消える

### 3-1. `App.tsx` にフォームコンポーネントを置く

まずは `src/App.tsx` をこんな感じにして、
これから作る `NicknameForm` コンポーネントを呼び出します。

```ts
// src/App.tsx
import "./App.css";
import { NicknameForm } from "./NicknameForm";

function App() {
  return (
    <div className="app">
      <h1>ニックネーム登録 ✨</h1>
      <NicknameForm />
    </div>
  );
}

export default App;
```

---

## 4. `useActionState` を使ったフォーム本体を作る 💡

### 4-1. エラーの「型」を決める

今回は「エラーの文」（日本語の文章）か「エラーなし」のどちらかなので、

* エラーあり → `string`
* エラーなし → `null`

という **`string | null`** にします。
`useActionState` は React 19 でジェネリクスによる型付けにも対応しているので、TypeScript でも素直に書けます。([Zenn][2])

`src/NicknameForm.tsx` を新規作成して、こう書いてみてください 👇

```ts
// src/NicknameForm.tsx
import { useActionState } from "react";

type ErrorMessage = string | null;

export function NicknameForm() {
  const [error, formAction, isPending] = useActionState<ErrorMessage>(
    async (_previousError: ErrorMessage, formData: FormData): Promise<ErrorMessage> => {
      // ① フォームの値を取り出す
      const rawNickname = formData.get("nickname");
      const nickname = typeof rawNickname === "string" ? rawNickname.trim() : "";

      // ② バリデーション（チェック）する
      if (!nickname) {
        return "ニックネームを入力してね 🥺";
      }

      if (nickname.length < 3) {
        return "ニックネームは3文字以上にしてみよう 💡";
      }

      // ちょっとだけ「サーバーと話している風」に待ってみる（見た目のためだけ）
      await new Promise((resolve) => setTimeout(resolve, 500));

      // ここまで来たらエラーなし
      return null;
    },
    null // 初期状態は「エラーなし」
  );

  return (
    <form className="nickname-form" action={formAction}>
      <label className="field">
        ニックネーム
        <input
          type="text"
          name="nickname"
          placeholder="例：sakura123"
          disabled={isPending}
        />
      </label>

      <button type="submit" disabled={isPending}>
        {isPending ? "送信中..." : "登録する"}
      </button>

      {/* error に文字列が入っていたら表示する */}
      {error && <p className="error-message">{error}</p>}
    </form>
  );
}
```

### ここで押さえたいポイント 🧷

1. **`useActionState<ErrorMessage>(...)` で「stateの型」を指定**

   * 今回は `ErrorMessage`（= `string | null`）が `error` の型になります。
2. `useActionState` の第1引数は **「アクション関数」**

   * 第1引数：前回の state（今回は使わないので `_previousError` にして無視）
   * 第2引数：フォームから渡される `FormData` オブジェクト
   * 戻り値：今回の state（= エラーメッセージ or `null`）を返す
     React 19 ではこのようにアクション（非同期処理）の結果を state にして返すのが基本パターンになっています。([React][3])
3. 戻り値の state（ここでは `error`）は、

   * 配列の **1番目** に入る → `[error, formAction, isPending]` という順番です。([Zenn][4])

---

## 5. JSX側でエラーを表示する仕組み ✨

この1行がエラーメッセージ表示のキモです 👇

```tsx
{error && <p className="error-message">{error}</p>}
```

* `error` が `null` → `false && <p>...</p>` なので何も表示されない
* `error` が `"ニックネームを入力してね"` → `<p>ニックネームを入力してね</p>` が表示される

つまり、**「エラーがある時だけ `<p>` を出す」** という条件付きレンダリングになっています 💡

---

## 6. ちょっとだけ見た目を整える（お好みで）🎨

CSS はお好みだけど、エラーだけ少し目立たせておくとわかりやすいです。

`src/App.css` に、ざっくりこんな感じを足してみてください。

```css
.app {
  max-width: 400px;
  margin: 40px auto;
  padding: 24px;
  border-radius: 12px;
  background: #ffffff;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
  font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
}

.nickname-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: 14px;
}

.nickname-form input {
  padding: 8px 10px;
  border-radius: 8px;
  border: 1px solid #ccc;
}

.nickname-form button {
  padding: 10px 12px;
  border-radius: 999px;
  border: none;
  cursor: pointer;
  font-weight: bold;
}

.nickname-form button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.error-message {
  color: #e53935;
  font-size: 13px;
}
```

これで、

* 入力ミス → 下に赤いエラー文 🔴
* 正しい入力 → エラー非表示 ✨

という、実用的な「フォーム＋エラー表示」が完成です 🥳

---

## 7. もう一歩だけ応用してみようチャレンジ 💪

余裕があれば、こんな拡張もやってみてください：

1. **成功メッセージも出す**

   * state を `ErrorMessage` ではなく

     ```ts
     type FormState = {
       error: string | null;
       success: string | null;
     };
     ```

     のようなオブジェクトにして、

     * エラーのとき → `{ error: "〜〜", success: null }`
     * 成功のとき → `{ error: null, success: "登録できたよ！🎉" }`
2. **エラー文をフィールドごとに分ける**

   * 例：`nicknameError` と `passwordError` を持つ state にする
3. **`isPending` をもっと活用**

   * ボタンだけでなく、入力欄も `disabled={isPending}` にして、
   * 「送信中は全部触れない」フォームにしてみる

`useActionState` は、フォーム処理の
**「状態（エラー・成功・処理中）」をひとまとめに管理できるフック** です。([React][1])
React 19 のフォーム周りは、この考え方がベースになっているので、
ここでしっかり手を動かして慣れておくと、このあと学ぶ `useFormStatus` や `useOptimistic` もスッと入ってきますよ ✨

---

## 8. まとめ 🌸

この章でできるようになったこと：

* `useActionState` の **state部分に「エラーメッセージ」を持たせる** ✅
* アクション関数の中でバリデーションして

  * エラー → 文字列を return
  * OK → `null` を return
* JSX で `{error && <p>...</p>}` の形で **エラーを表示** ✅
* `isPending` で「送信中...」表示やボタンの無効化 ✅

次の章では、このフォーム周りの仕組みをさらに便利にしてくれる
`useFormStatus` を使って、**子コンポーネントから「送信中かどうか」を知る**練習をしていきます 🚀✨

[1]: https://react.dev/reference/react/useActionState?utm_source=chatgpt.com "useActionState"
[2]: https://zenn.dev/daijinload/articles/7fbe73e040c0a2?utm_source=chatgpt.com "React19のuseActionsStateをTypeScriptで書く"
[3]: https://react.dev/blog/2024/12/05/react-19?utm_source=chatgpt.com "React v19"
[4]: https://zenn.dev/papanyanko/articles/react19-beta-release-blog-1?utm_source=chatgpt.com "<form> Actions, useActionState, useFormStatus 編"
