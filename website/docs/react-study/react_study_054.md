# 第54章：CSS Modules の使い方とイイところ

![CSS Modulesの整理とグローバルCSSの比較](./picture/react_study_054_css_methods.png)

「コンポーネントごとにキレイにCSSを分けたい…でもクラス名かぶりそう…😇」
そんなモヤモヤを一気に解決してくれるのが **CSS Modules** です ✨

この章では、

* CSS Modules ってそもそもなに？🤔
* どうやって React + Vite プロジェクトで使うの？🛠
* TypeScript との相性は？🧩
* グローバルCSSとの使い分けはどうする？🌏
* ありがちなハマりポイントは？💣

を、ゆっくり・ていねいに見ていきます。

---

## 1️⃣ CSS Modules ってなに？ざっくりイメージ 💡

ざっくり言うと…

> **「このコンポーネント専用のCSS」を、ファイル1つで完結させる仕組み**
> しかも **クラス名が自動でユニーク** になるから、かぶらない 🛡

ふつうのCSSだと：

* `index.css` に `button { ... }` と書く
* 別のファイルでも `button { ... }` と書く
* 👉 どっちが効いてるのか、だんだんカオスになる 😵‍💫

CSS Modulesだと：

* `Button.module.css` というファイルを作る
* その中の `.button` は、**そのコンポーネント専用**
* ビルド時に、
  `button` → `Button_button__x1y2z3` みたいな「変なけどユニークな」クラス名に変換される
* 他のコンポーネントの `.button` と絶対かぶらない 💪

---

## 2️⃣ ファイル名ルール：`.module.css` をつける ✏️

CSS Modules は、**ファイル名** で「これはモジュールだよ〜」と判断します。

* ✅ `Button.module.css` → CSS Modules として扱われる
* ❌ `Button.css` → ふつうのCSS（グローバル）

たとえば、`src/components` にこんな感じで作ります：

* `src/components/Button.tsx`
* `src/components/Button.module.css`

---

## 3️⃣ 実際に使ってみよう：シンプルなボタン 👩‍💻

### 3-1. CSSファイルを作る

`src/components/Button.module.css` を作って、こんな感じで書きます：

```css
/* src/components/Button.module.css */
.button {
  padding: 8px 16px;
  border-radius: 9999px;
  border: none;
  background-color: #ff80b5;
  color: #ffffff;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.1s ease, box-shadow 0.1s ease;
}

.button:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.15);
}

.button--secondary {
  background-color: #9ca3af; /* ちょっと落ち着いた色 */
}
```

ポイント 💡

* `.button` は「基本のスタイル」
* `.button--secondary` みたいに、バリエーション用のクラスもOK

---

### 3-2. TypeScriptから読み込む（importする）

`Button.tsx` を作って、CSS Modules を読み込みます：

```tsx
// src/components/Button.tsx
import type { FC, ReactNode } from "react";
import styles from "./Button.module.css";

type ButtonProps = {
  children: ReactNode;
  variant?: "primary" | "secondary";
  onClick?: () => void;
};

export const Button: FC<ButtonProps> = ({ children, variant = "primary", onClick }) => {
  const className =
    variant === "primary"
      ? styles.button
      : `${styles.button} ${styles["button--secondary"]}`;

  return (
    <button type="button" className={className} onClick={onClick}>
      {children}
    </button>
  );
};
```

👀 見どころ

* `import styles from "./Button.module.css";`

  * `styles` は「クラス名の集まり」が入ったオブジェクトだと思ってOK
  * `styles.button` → `.button` に対応
  * `styles["button--secondary"]` → `.button--secondary` に対応（ハイフンがあるので `["..."]` でアクセス）
* `className={styles.button}` のように、
  **`className` に直接クラスを書くんじゃなくて、`styles` 経由で指定する** のがポイント 👈

---

## 4️⃣ TypeScript でもエラーにならないようにする 🧩

環境によっては、最初に

> `Cannot find module './Button.module.css' or its corresponding type declarations.`

みたいなエラーが出ることがあります 🥲
その場合は、**CSS Modules 用の型定義ファイル** を1つ用意してあげます。

### 4-1. 型定義ファイルを作る

`src/styles.d.ts` を作ります（名前はなんでもいいけど、分かりやすくこれで）：

```ts
// src/styles.d.ts
declare module "*.module.css" {
  const classes: { [className: string]: string };
  export default classes;
}
```

これで TypeScript が、

> 「あ〜 `.module.css` ってファイルは、
> ‘文字列キー → 文字列’ なオブジェクトを `default export` するんだね」

と理解してくれます ✅

VS Code でも `styles.` と打つと、
CSSに書いたクラス名をサジェストしてくれるようになります。ちょっと感動ポイントです ✨

---

## 5️⃣ CSS Modules の「スコープ」がイイ！🌈

CSS Modules の一番うれしいところは、

> **そのコンポーネントのCSSが、他の場所に漏れないこと**

です。

### 例：クラス名が同じでもOK

* `TodoItem.module.css` に `.title` がある
* `ProfileCard.module.css` にも `.title` がある

ふつうのCSSだと、どっちの `.title` が効いているのか分かりづらくなりますが、
CSS Modulesなら、ビルド後のクラス名は例えば：

* `TodoItem_title__a1b2c3`
* `ProfileCard_title__x9y8z7`

みたいに、**ファイルごとにユニークに変換** されます。

だから、**「クラス名、好きに付けていいよ〜」** という自由さがあります 🕊

---

## 6️⃣ 図でイメージしてみよう 🧠✨

1つの画面で、グローバルCSSとCSS Modulesがどう分かれているか、
ざっくり図にしてみます。

```mermaid
graph TD
  A["index.css<br/>(グローバルCSS)"] -->|全体のベーススタイル| B["App.tsx"]
  B --> C["TodoList.tsx"]
  C --> D["TodoItem.tsx"]
  D --> E["TodoItem.module.css<br/>(TodoItem専用CSS)"]
```

* `index.css` 👉 ページ全体・フォント・背景色など、**アプリ全体で共通** のもの
* `TodoItem.module.css` 👉 **TodoItemコンポーネント専用** のスタイル

こんな感じで、

> 「全体で効かせたいCSS」 と
> 「コンポーネント専用のCSS」

を分けておくと、プロジェクトが大きくなっても迷子になりにくいです 🚀

---

## 7️⃣ よくある書き方パターン集 💅

### 7-1. ふつうに1クラス当てる

```tsx
<div className={styles.container}>
  ...
</div>
```

### 7-2. ハイフン入りクラス名（BEMっぽいやつ）

```css
/* TodoItem.module.css */
.todo-item {
  /* 何かのスタイル */
}

.todo-item__title {
  font-weight: bold;
}

.todo-item--done {
  text-decoration: line-through;
}
```

使うときはこう 👇

```tsx
<li className={styles["todo-item"]}>
  <span className={styles["todo-item__title"]}>
    {title}
  </span>
</li>
```

ハイフンやアンダースコアを含むクラス名は、
JS側では `styles["todo-item__title"]` みたいに `["..."]` でアクセスするのが安全です ✅

---

### 7-3. 状態によってクラスを追加する

もっと「React らしく」やると…

```tsx
type TodoItemProps = {
  title: string;
  done: boolean;
};

export const TodoItem: FC<TodoItemProps> = ({ title, done }) => {
  const className = done
    ? `${styles["todo-item"]} ${styles["todo-item--done"]}`
    : styles["todo-item"];

  return (
    <li className={className}>
      <span className={styles["todo-item__title"]}>{title}</span>
    </li>
  );
};
```

`done` が `true` のときだけ `todo-item--done` をくっつける、という王道パターンです ✅

---

## 8️⃣ グローバルCSSとの使い分け 🧭

**どこまでCSS Modulesにして、どこまでグローバルCSSにするの？**
というのも、よく出てくる疑問です。

### おすすめのざっくり方針 ✨

* **グローバルCSS（`index.css` など）**

  * `body` の背景色
  * 全体のフォント設定
  * `<a>` のデフォルトリンクカラー
  * CSSリセット / ノーマライズ

* **CSS Modules**

  * コンポーネントごとの見た目
  * 「カード」「ボタン」「フォーム」など部品単位のスタイル
  * 画面ごとのレイアウト用クラス

イメージとしては：

> 「**世界共通のルールは index.css**」
> 「**クラス単位の細かい見た目は CSS Modules**」

という分け方にすると、かなりスッキリします 🧹

---

## 9️⃣ よくあるハマりポイント 🔥

### 💥 1. `.module.css` を付け忘れる

❌ 悪い例：

* `Button.css` を作った
* `import styles from "./Button.css";`
* `className={styles.button}` と書いた

→ ビルド時にはCSS Modulesとして扱われないので、`styles.button` が `undefined` になりがちです。

✅ 正しくは：

* `Button.module.css` にする
* `import styles from "./Button.module.css";`

---

### 💥 2. `className={styles}` と書いてしまう

「とりあえず `styles` を渡せばいいのかな？」と勘違いしがちですが、
`styles` は「クラス名の**辞書**」なので、**必ずキーを指定** します。

❌ ダメ：

```tsx
<div className={styles}>
  ...
</div>
```

✅ OK：

```tsx
<div className={styles.container}>
  ...
</div>
```

---

### 💥 3. 定義してないクラス名を参照する

CSS側：

```css
.title {
  font-size: 18px;
}
```

TSX側：

```tsx
<h1 className={styles.titel}>こんにちは</h1>
```

スペルミス（`titel`）だと、ビルドしても気づきにくいです 🙃
VS Codeのサジェストをちゃんと見る習慣をつけると、ここでミスりにくくなります ✅

---

## 🔟 ミニ練習：TODOリストをちょっとかわいくしてみよう 📝💕

> ※「第55章」で本格的にやる前の、軽めの準備運動です。

### やってみてほしいこと

1. `TodoItem.tsx` と同じフォルダに
   `TodoItem.module.css` を作る。
2. こんな感じの見た目にしてみる：

   * 1行ごとにうっすら枠線
   * ちょっと余白
   * 右側に「完了」バッジっぽい色を付ける（`done` のとき）

### ヒント用サンプルCSS 🌸

```css
/* TodoItem.module.css */
.todo-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
  margin-bottom: 6px;
  background-color: #ffffff;
}

.todo-item--done {
  background-color: #ecfdf5; /* 薄いグリーン */
}

.todo-item__title {
  font-size: 14px;
}

.todo-item__badge {
  font-size: 12px;
  padding: 2px 8px;
  border-radius: 9999px;
  background-color: #fee2e2;
  color: #b91c1c;
}

.todo-item__badge--done {
  background-color: #bbf7d0;
  color: #15803d;
}
```

### ヒント用TSX 🌟

```tsx
// TodoItem.tsx
import type { FC } from "react";
import styles from "./TodoItem.module.css";

type TodoItemProps = {
  title: string;
  done: boolean;
};

export const TodoItem: FC<TodoItemProps> = ({ title, done }) => {
  const itemClassName = done
    ? `${styles["todo-item"]} ${styles["todo-item--done"]}`
    : styles["todo-item"];

  const badgeClassName = done
    ? `${styles["todo-item__badge"]} ${styles["todo-item__badge--done"]}`
    : styles["todo-item__badge"];

  return (
    <li className={itemClassName}>
      <span className={styles["todo-item__title"]}>{title}</span>
      <span className={badgeClassName}>{done ? "完了 🎉" : "作業中 ⏳"}</span>
    </li>
  );
};
```

ここまでできたら、かなり **「コンポーネントごとにCSSを閉じ込める」感覚** がつかめているはずです ✨

---

## 🎯 この章のまとめ

* CSS Modules は「**コンポーネント専用のCSS**」を作るための仕組み 💄
* ファイル名は **`*.module.css`** にするのがルール
* `import styles from "./Something.module.css";`
  → `className={styles.xxx}` の形で使う
* TypeScriptでエラーが出たら
  `declare module "*.module.css"` の型定義を足してあげる
* グローバルCSSは「全体のルール」、
  CSS Modules は「部品ごとの見た目」を担当させるとGOOD 👍
* ハイフン入りクラス名は `styles["todo-item__title"]` でアクセスする

次の **第55章** では、
今回学んだCSS Modulesを使って、実際にTODOリスト全体を「いい感じのUI」に仕上げていきます 💪🎨

ここまでおつかれさま〜！☕💕
