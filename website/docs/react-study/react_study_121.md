# 第121章：復習：`useState` と `onSubmit` のフォーム

---

## 1️⃣ この章でやること 💌

この章のゴールはこんな感じです👇

* React で **フォームを作る基本パターン** をもう一度ちゃんと整理する
* `useState` で入力値を管理する「**コントロールされたフォーム**」を思い出す
* `<form onSubmit={...}>` で **送信処理を1か所にまとめる** 書き方を復習する
* 「従来のやり方」がどんな感じだったのかを押さえて、
  次の章から出てくる **React 19 の Form Actions** と比較できるようにしておく ✨([React][1])

---

## 2️⃣ まずは思い出そう：ブラウザのフォームってどう動くんだっけ？ 🌊

![useState でフォームを構築するイメージ](./picture/react_study_121_form_basic.png)

ふつうの HTML フォームは、こんな流れでしたよね👇

1. ユーザーが `<input>` に文字を入れる
2. 「送信」ボタンを押す
3. `<form>` の `action` に設定した URL にデータが送られる
4. ページごとガッツリ **リロード** される（画面がまるっと切り替わる）

でも、React で作る SPA（シングルページアプリ）では：

* **ページのリロードはしたくない**（状態も UI も飛んでしまう 🥲）
* 送信されたデータを **JavaScript の中で受け取って、自分で好きに処理したい**

なので React では、

* `<form>` に `onSubmit` を付けてイベントをキャッチする
* `event.preventDefault()` で「ブラウザのデフォルト送信」を止める
* `useState` に入っている値を使って、自分で送信処理を書く

というスタイルが「従来の基本パターン」でした ✍️

---

## 3️⃣ ミニアプリを作って復習しよう ✨

### 🏁 作るもの：かんたん「ひとことメッセージ」フォーム

* 名前 (`name`)
* メッセージ (`message`)

を入力して、「送信」したら
下に「こんな内容で送信したよ〜」と表示するだけのシンプルなフォームです 😊

---

### 🔧 Step 1：ファイルを作る

`src/Chap121Form.tsx` みたいな名前でコンポーネントを1つ作ります。

#### コード全体（まずは眺めるだけでOK 👀）

> ※ TypeScript / React 19 前提です

```tsx
import { useState, type ChangeEvent, type FormEvent } from "react";

type FormValues = {
  name: string;
  message: string;
};

export function Chap121Form() {
  // 入力中の値
  const [formValues, setFormValues] = useState<FormValues>({
    name: "",
    message: "",
  });

  // 直近で送信した内容（画面に表示する用）
  const [submitted, setSubmitted] = useState<FormValues | null>(null);

  // フォームの入力が変わったとき
  function handleChange(event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const { name, value } = event.target;

    setFormValues((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  // フォームが送信されたとき
  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); // ブラウザのデフォルト送信を止める

    // 本当はここでAPIに送信したりする
    // ここでは「送信したことにする」ため、ちょっと待ってから表示
    await new Promise((resolve) => setTimeout(resolve, 500));

    setSubmitted(formValues);

    // 送信後にフォームを空にする
    setFormValues({
      name: "",
      message: "",
    });
  }

  return (
    <div style={{ maxWidth: 480, margin: "0 auto", padding: "1rem" }}>
      <h2>ひとことメッセージフォーム ✉️</h2>

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: "0.5rem" }}>
          <label>
            名前：
            <input
              name="name"
              value={formValues.name}
              onChange={handleChange}
              placeholder="山田 花子"
            />
          </label>
        </div>

        <div style={{ marginBottom: "0.5rem" }}>
          <label>
            メッセージ：
            <br />
            <textarea
              name="message"
              value={formValues.message}
              onChange={handleChange}
              rows={3}
              placeholder="よろしくお願いします！"
            />
          </label>
        </div>

        <button type="submit">送信する 🔺</button>
      </form>

      <hr />

      <section>
        <h3>送信された内容 💡</h3>
        {submitted ? (
          <div>
            <p>
              <strong>名前：</strong>
              {submitted.name}
            </p>
            <p>
              <strong>メッセージ：</strong>
              {submitted.message}
            </p>
          </div>
        ) : (
          <p>まだ何も送信されていません〜 💤</p>
        )}
      </section>
    </div>
  );
}
```

---

## 4️⃣ ポイントごとに分解して復習する 🔍

### ✅ 4-1. `useState` でフォームの値を全部まとめて持つ

```tsx
type FormValues = {
  name: string;
  message: string;
};

const [formValues, setFormValues] = useState<FormValues>({
  name: "",
  message: "",
});
```

* `FormValues` という **型** で「フォームの形」を決めておく
* `useState<FormValues>(...)` で、
  「今の入力値（オブジェクト）」をまるごと State に入れているイメージです ✨

👉 フィールドが増えても、
`name`, `message`, `email` ... をバラバラに `useState` するよりスッキリします 💇‍♀️

---

### ✅ 4-2. 「コントロールされたコンポーネント」にする

```tsx
<input
  name="name"
  value={formValues.name}
  onChange={handleChange}
/>
```

ここが React フォームのキモです 👇

* `value={formValues.name}`
  → 入力欄の中身は **常に State からきている**
* `onChange={handleChange}`
  → ユーザーが打つたびに **State を更新** する

つまり：

> 画面の見た目（inputの中身）は
> ぜんぶ `formValues` によって決まる 🤝

この状態を **「コントロールされたフォーム」**（controlled form）と呼びます。

---

### ✅ 4-3. `handleChange` で共通処理を書く

```tsx
function handleChange(event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
  const { name, value } = event.target;

  setFormValues((prev) => ({
    ...prev,
    [name]: value,
  }));
}
```

* `event.target.name` に `<input name="...">` で書いた文字が入っている
* `event.target.value` に入力中の文字が入っている
* `[name]: value` という書き方で、
  `name` が `"name"` なら `prev.name` を、
  `name` が `"message"` なら `prev.message` を更新する、という仕組みです 🧠

1つ1つ `handleNameChange`, `handleMessageChange` … と関数を分けることもできますが、
フィールドが増えたときに大変なので、
**「名前でスイッチする共通ハンドラ」** のパターンをよく使います。

---

### ✅ 4-4. `onSubmit` で送信処理をまとめる

```tsx
<form onSubmit={handleSubmit}>
  ...
  <button type="submit">送信する 🔺</button>
</form>
```

```tsx
async function handleSubmit(event: FormEvent<HTMLFormElement>) {
  event.preventDefault(); // これが超だいじ！

  await new Promise((resolve) => setTimeout(resolve, 500));

  setSubmitted(formValues);

  setFormValues({
    name: "",
    message: "",
  });
}
```

大事なポイントはこのあたり👇

* `event.preventDefault()`
  → ブラウザの「ページリロードしちゃう送信」を止める
* `onSubmit` に書くことで、

  * Enter キーで送信
  * ボタンをクリックで送信
    を **まとめて1か所で処理** できる ✨
* `FormEvent<HTMLFormElement>` という型を付けておくと、
  VS Code が `event.` の後に候補を出してくれるので楽ちんです 💻

---

## 5️⃣ 従来スタイルでの「もうちょい本気フォーム」の形 🌪

React 19 以前は、
API に送るような「ちゃんとしたフォーム」を作るとき、

* 入力値の State
* エラーの State
* ローディング中かどうかの State

…みたいに、**`useState` が増えがち** でした。([React][1])

イメージだけつかんでおきましょう👇

```tsx
const [formValues, setFormValues] = useState<FormValues>({ name: "", message: "" });
const [error, setError] = useState<string | null>(null);
const [isSubmitting, setIsSubmitting] = useState(false);

async function handleSubmit(event: FormEvent<HTMLFormElement>) {
  event.preventDefault();
  setError(null);
  setIsSubmitting(true);

  try {
    // ここでAPIに送るイメージ
    await fakeApiRequest(formValues);
    alert("送信できました 🎉");
  } catch (e) {
    setError("送信に失敗しました…もう一度ためしてね 🥲");
  } finally {
    setIsSubmitting(false);
  }
}
```

こういう「`useState` をたくさん使ってフォームの状態を自分で管理する」スタイルが
**従来の基本形** です。

React 19 では、これをもっと楽にするための

* `useActionState`
* `useFormStatus`
* `useOptimistic`

といったフォーム用の新機能が追加されました 💡([Zenn][2])

この章は「昔からあるやり方」をちゃんと分かっておくステップだと思ってください ✨

---

## 6️⃣ 図で整理：フォーム送信の流れを Marmaid で見る 🌈

（※Mermaid 対応の環境で見てください）

```mermaid
flowchart TD
  A[ユーザーが文字を入力] --> B["onChange が発火"]
  B --> C["useState で formValues を更新"]
  C --> D["React が再レンダリング"]
  D --> E["入力欄の value に新しい formValues が反映"]

  E --> F["ユーザーが送信ボタンをクリック or Enter"]
  F --> G["onSubmit( handleSubmit ) が呼ばれる"]
  G --> H["event.preventDefault() でページリロードを止める"]
  H --> I["formValues を使って送信処理"]
  I --> J["送信結果を State に保存して画面に表示"]
```

こんな感じで、

> 入力 → `onChange` → `useState` → 再描画 → `onSubmit` → 送信処理

という流れになっていることが分かればバッチリです 👍

---

## 7️⃣ よくあるつまずきポイント 😵‍💫

フォームでよくやりがちなミスも、ここでまとめておきます。

1. **`event.preventDefault()` を書き忘れる**

   * 👉 ページがリロードされて「あれ？state消えた！？」ってなるやつ
2. `<button>` に `type="submit"` を付けるのを忘れる

   * 👉 デフォルトは `submit` ですが、
     `type="button"` にしてしまうと `onSubmit` が動きません
3. `value` を付けてるのに `onChange` を用意していない

   * 👉 入力しても文字が変わらない「読取専用」状態になります 📵
4. State をオブジェクトで持っているのに

   * `setFormValues({ name: value })` みたいに **他のプロパティを消しちゃう**
   * 👉 いつも `...prev` を付けるクセをつけると安全です

---

## 8️⃣ ミニ課題 ✏️（できたら次の章がラクになるよ）

1. この章の `Chap121Form` をベースにして、

   * `email` フィールドを追加してみる（型も忘れずに！）
2. 送信結果の表示に

   * 日時（`new Date().toLocaleString()`）も一緒に表示してみる
3. エラーチェックとして

   * `name` が空だったら `alert("名前を入力してね"); return;`
   * みたいなチェックを `handleSubmit` の最初に入れてみる

---

## 9️⃣ まとめ 🎀

この章でおさえておきたいのはこの4つです👇

* フォームの入力値は **`useState` で管理する（コントロールされたフォーム）**
* `value` と `onChange` をセットで使って、State と入力欄をつなぐ
* `<form onSubmit={...}>` と `event.preventDefault()` で
  **ページリロードなしの送信処理**を書く
* React 19 ではこの「従来スタイル」を、
  Actions や新しいフックでグッと楽にしてくれる
  → 次の章でそこに進化していく 🛫

ここまで理解できていれば、
React 19 の Form Actions にステップアップする準備はばっちりです 💪💗

[1]: https://react.dev/blog/2024/12/05/react-19?utm_source=chatgpt.com "React v19"
[2]: https://zenn.dev/m0t0taka/articles/5de5cb152246e9?utm_source=chatgpt.com "React19で追加された 3 つの hook（useActionState, ..."
