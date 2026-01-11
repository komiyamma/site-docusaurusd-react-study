# 第110章：【フック】`useId`

`htmlFor` と `id` をいい感じにペアにしてくれる相棒フック ✨

---

## 1️⃣ まずは「`id` と `htmlFor`」のおさらいから

フォームでよくある、この組み合わせ👇

```tsx
<label htmlFor="username">ユーザー名</label>
<input id="username" type="text" />
```

* `label` の `htmlFor="username"`
* `input` の `id="username"`

この **2つが同じ文字列** になることで：

* ラベルをクリックすると入力欄にフォーカスが移る
* スクリーンリーダー（読み上げソフト）が
  「ユーザー名、テキスト入力」みたいに正しく読んでくれる
  👉 アクセシビリティ（使いやすさ）がグッと上がる✨

だからフォームでは
**「label と input はペアにしてあげる」** のがとっても大事なんだよ〜、という話です 😊

---

## 2️⃣ React だと「`id` の管理」がちょっとめんどい問題 🙃

コンポーネントでフォームを作るとき、こんな感じに書きたくなりますよね：

```tsx
export function NameField() {
  return (
    <div>
      <label htmlFor="name">お名前</label>
      <input id="name" type="text" />
    </div>
  );
}
```

でも、この `NameField` をページの中で **2回** 使ったら…？

```tsx
export function App() {
  return (
    <>
      <NameField />
      <NameField />
    </>
  );
}
```

ページの中には `id="name"` が **2つ** 出現してしまいます 🥲

* HTML的には「id は重複しないほうがいい」
* アクセシビリティツール的にもあまりよろしくない

「じゃあ `id` を手でユニークにする？」
→ コンポーネントごとに違うIDを考えるの、だんだん大変…😇

そこで登場するのが **`useId`** です 🎉

---

## 3️⃣ `useId` の正体：コンポーネント専用の「かぶらないIDメーカー」🆔✨

`useId` は React が用意してくれているフックで、

> 「このコンポーネント用の、他と被らないID文字列」を返してくれる

という超ありがたい存在です 🙏

### 🔧 基本の使い方

1. `react` から `useId` を import
2. コンポーネントの中で `const id = useId();`
3. `label` の `htmlFor` と、`input` の `id` に同じ `id` をセットする

コードで見てみましょう 👀

```tsx
import { useId } from "react";

type TextFieldProps = {
  label: string;
  type?: React.HTMLInputTypeAttribute;
};

export function TextField({ label, type = "text" }: TextFieldProps) {
  const id = useId(); // 💡 このコンポーネント専用のID

  return (
    <div style={{ marginBottom: "0.75rem" }}>
      <label htmlFor={id} style={{ display: "block", marginBottom: "0.25rem" }}>
        {label}
      </label>
      <input id={id} type={type} />
    </div>
  );
}
```

これを何回使っても OK 👍

```tsx
export function App() {
  return (
    <>
      <TextField label="お名前" />
      <TextField label="メールアドレス" type="email" />
      <TextField label="パスワード" type="password" />
    </>
  );
}
```

* それぞれの `TextField` の中で `useId()` が呼ばれる
* React が **かぶらないID** をいい感じに振り分けてくれる
* `label` と `input` はちゃんとペアになってくれる

---

## 4️⃣ ざっくりイメージ図（Mermaid）🧠✨

![react_study_110_useid](./picture/react_study_110_useid.png)

`useId` がやってることを図にすると、こんな感じです👇

```mermaid
graph LR
  C[TextField コンポーネント] -->|useId を呼ぶ| ID[一意な ID 文字列]
  ID --> L["label htmlFor={id}"]
  ID --> I["input id={id}"]
```

* コンポーネントが `useId()` を呼ぶ
* React がユニークなID文字列を返す
* そのIDを `label` と `input` で共有する
  → ペア関係がいい感じに完成 ✨

---

## 5️⃣ `useId` の嬉しいポイント 💖

### ✅ 1. かぶらないIDを自動で作ってくれる

* 同じコンポーネントを何個並べても OK
* ページ全体でIDがかぶりにくいように React ががんばってくれる

### ✅ 2. SSR（サーバーサイドレンダリング）でも安全

将来、Next.js などで「サーバー側でHTMLを作る」ようなことをするとき：

* ランダムなID（`Math.random()` など）を使うと
  → サーバー側とブラウザ側で ID がズレてトラブルになることがある 😵
* `useId` は「サーバー」と「ブラウザ」で同じIDを生成してくれるように設計されている
  → SSRでも安心して使える 🥰

（今はSSRを使ってなくても、「将来困らない書き方」として覚えておくイメージでOKです 🌱）

---

## 6️⃣ ちょっとレベルアップ：補足テキストやエラー文にもIDを使う 📝

フォームって、入力欄だけじゃなくて：

* 補足説明（例：半角英数字で入力してください）
* エラーメッセージ（例：メールアドレスの形式が正しくありません）

みたいなのも一緒に表示したいですよね。

そういう時は、`useId` で作ったIDを「ベース」にして
複数のIDを組み合わせるパターンがよく使われます 💡

### 💡 例：`aria-describedby` と一緒に使う

```tsx
import { useId } from "react";

type EmailFieldProps = {
  hasError?: boolean;
};

export function EmailField({ hasError = false }: EmailFieldProps) {
  const baseId = useId(); // ベースになるID
  const inputId = `${baseId}-input`;
  const hintId = `${baseId}-hint`;
  const errorId = `${baseId}-error`;

  const describedByIds = [
    hintId,
    hasError ? errorId : null,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div style={{ marginBottom: "1rem" }}>
      <label htmlFor={inputId}>メールアドレス</label>
      <input
        id={inputId}
        type="email"
        aria-describedby={describedByIds}
        aria-invalid={hasError || undefined}
      />
      <p id={hintId} style={{ fontSize: "0.8rem" }}>
        ログインに使うメールアドレスを入力してください。
      </p>
      {hasError && (
        <p
          id={errorId}
          style={{ fontSize: "0.8rem", color: "red", marginTop: "0.25rem" }}
        >
          メールアドレスの形式が正しくありません。
        </p>
      )}
    </div>
  );
}
```

ポイント 👇

* `baseId` を `useId()` で1つだけ作る
* そこから

  * `baseId + "-input"`
  * `baseId + "-hint"`
  * `baseId + "-error"`
    みたいに **派生IDを作る**
* それぞれを `id` に使って、`aria-describedby` でまとめて紐づける

こうしておくと、スクリーンリーダーは

> 「メールアドレス、テキスト入力。ログインに使うメールアドレスを入力してください。メールアドレスの形式が正しくありません。」

みたいな感じで、ちゃんと説明まで読み上げてくれるようになります 🎧✨

---

## 7️⃣ `useId` を「使っちゃダメ」なパターンもあるよ ⚠️

便利だからといって、なんにでも `useId` を使えばいいわけじゃありません。
特に React の世界でよく出てくるのが **`key` 問題** です。

### ❌ NG例：リストの `key` に `useId` を使う

```tsx
// これはやらない！
items.map((item) => {
  const id = useId();
  return <li key={id}>{item.name}</li>;
});
```

これがよくない理由：

* `useId` は **コンポーネントの中で** 呼ぶことを想定している
* `.map()` の中で毎回 `useId()` を呼ぶのは、フックのルール的にもアウト 😇
* リストの `key` には「そのデータに結びついたID」（例：`item.id`）を使うのが基本

👉 `useId` は **「DOMの id / aria系の属性をつなぐため」** に使うイメージで覚えておくと安心です 💡

---

## 8️⃣ 実践ミニ課題 💪🎓

### ✅ 課題 1：ハードコーディングされたIDを `useId` に置き換える

スタートコード（Before）👇

```tsx
type SimpleFieldProps = {
  label: string;
};

export function SimpleField({ label }: SimpleFieldProps) {
  return (
    <div>
      <label htmlFor="my-field">{label}</label>
      <input id="my-field" type="text" />
    </div>
  );
}
```

やってみてほしいこと ✍️

1. `react` から `useId` を import する
2. コンポーネントの中で `const id = useId();` を呼ぶ
3. `htmlFor` と `id` の `"my-field"` を `id` に置き換える

---

### ✅ 課題 2：`aria-describedby` 付きのフィールドを作る

こんな仕様のコンポーネントを自分で作ってみてください 🌈

* プロップス：

  * `label: string`
  * `description: string`
* 中で `useId()` を使う
* `input` には

  * `id` をセット
  * `aria-describedby` に説明テキストのIDをセット
* 説明テキストの `<p>` には、そのIDを `id` として付ける

ヒント：

* `const baseId = useId();`
* ``const inputId = `\${baseId}-input`;``
* ``const descId = `\${baseId}-desc`;``

みたいに分けると、すっきり書けますよ ✨

---

## 9️⃣ まとめ 🎀

`useId` のイメージ、なんとなく掴めたかな？ 😊

* `useId` は「コンポーネント専用の、一意なID文字列」を作るフック 🆔
* フォームの

  * `label` の `htmlFor`
  * `input` の `id`
    をペアでつなぐのにピッタリ ✨
* 補足テキストやエラー文には

  * `aria-describedby` と組み合わせるとアクセシビリティがアップ ⤴️
* `key` には使わない！ リストの `key` はデータに紐づいたIDを使おう ⚠️

次の章からは、また別の便利機能に進んでいくけど、
フォームを書くときはぜひ `useId` を思い出してみてくださいね 🌸💻
