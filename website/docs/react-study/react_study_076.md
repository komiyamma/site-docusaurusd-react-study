# 第76章：`useContext` の型チェック
〜 `null` をこわがらなくていいカスタムフックを作ろう 〜

---

### 1️⃣ この章でやりたいこと ✨

この章のゴールはたったひとつです👇

> **「`useContext` の `null` 問題を、カスタムフックでまるごと隠す」**

* `createContext<UserContextValue | null>(null)` みたいに
  **`null` を許す形**で Context を作った
* そのせいで `useContext(UserContext)` の型が
  `UserContextValue | null` になってしまう
* どこでも毎回 `if (!userContext) { ... }` とか書くのダルい…

という状況を、**カスタムフックで一発解決**します 😎

---

### 2️⃣ いまの前提コードを整理しよう 📚

ここでは例として「ユーザー名」を共有する Context を使います。
（71〜75章までで作ったものを、ちょっとだけ思い出す感じです）

例として `src/contexts/UserContext.tsx` を想定します。

#### 今までの書き方（おさらい）

```tsx
// src/contexts/UserContext.tsx
import { createContext, useState } from "react";

type UserContextValue = {
  userName: string;
  setUserName: (name: string) => void;
};

// 👇 「まだ値がないよ〜」という意味で null を入れておく
export const UserContext = createContext<UserContextValue | null>(null);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [userName, setUserName] = useState("ゲスト");

  const value: UserContextValue = {
    userName,
    setUserName,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}
```

**ポイント**

* 型は `UserContextValue | null`
* `createContext` の初期値は `null`
* `UserProvider` がいるときだけ、本物の値が入る

この「`| null`」があるせいで、
`useContext(UserContext)` を使う側では **毎回 `null` チェックが必要**になります。([LogRocket Blog][1])

---

### 3️⃣ `useContext` をそのまま使うと何がつらい？😢

たとえば、ユーザー名を表示するコンポーネント。

```tsx
// src/components/UserNameLabel.tsx
import { useContext } from "react";
import { UserContext } from "../contexts/UserContext";

export function UserNameLabel() {
  const userContext = useContext(UserContext);

  if (!userContext) {
    // Provider で囲まれていなかった場合の保険
    return <p>コンテキストが使えません 😭</p>;
  }

  return <p>こんにちは、{userContext.userName} さん 🌸</p>;
}
```

**問題点**

* 毎回 `if (!userContext) { ... }` を書くのがめんどくさい
* うっかり書き忘れると、`userContext` が `null` のまま使われてバグる
* JSXの中も `userContext?.userName` だらけになりがち…

これを**1か所でチェックして、他では気にしなくていい**ようにしたい、
というのがこの章のテーマです 💪

---

### 4️⃣ カスタムフック `useUserContext` を作る 🎣

#### やりたいこと

* `useContext(UserContext)` を **ラップ**したカスタムフックを作る
* 中で一度だけ `null` チェックする
* `null` のときは **はっきりしたエラーを投げる**
* それ以外のコンポーネント側では
  `const { userName } = useUserContext();` と、**安全に使える**ようにする

このパターンは TypeScript + React ではかなりよく使われる「定番」になっています。([GitHub][2])

---

### 5️⃣ 実装：`UserContext` に安全ベルトをつける 🛟

同じファイル `UserContext.tsx` に、カスタムフックを足します。

```tsx
// src/contexts/UserContext.tsx
import { createContext, useContext, useState } from "react";

type UserContextValue = {
  userName: string;
  setUserName: (name: string) => void;
};

export const UserContext = createContext<UserContextValue | null>(null);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [userName, setUserName] = useState("ゲスト");

  const value: UserContextValue = {
    userName,
    setUserName,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

// ⭐ この章の主役：安全なカスタムフック
export function useUserContext(): UserContextValue {
  const context = useContext(UserContext);

  if (context === null) {
    // React DevTools のコンソールに出るメッセージ
    throw new Error("useUserContext は UserProvider の中で使ってください。");
  }

  // ここに来るときは context は絶対に null じゃない！
  return context;
}
```

**ここがポイント！**

* `function useUserContext(): UserContextValue { ... }`

  * **戻り値の型に `| null` がなくなる**のが大事 🎯
* 中で `useContext(UserContext)` を呼んで…

  * `if (context === null) { throw new Error(...) }`
* `null` だったら「ちゃんと Provider で囲んでね！」とエラーを出す
* `null` じゃなければ、そのまま返す → 以降は `UserContextValue` として安心して使える

---

### 6️⃣ 使う側のコードがこう変わる ✨

さっきの `UserNameLabel` を、カスタムフック版に書き換えてみます。

```tsx
// src/components/UserNameLabel.tsx
import { useUserContext } from "../contexts/UserContext";

export function UserNameLabel() {
  // ⭐ もう null チェック不要！
  const { userName } = useUserContext();

  return <p>こんにちは、{userName} さん 🌸</p>;
}
```

スッキリしたの、分かりますか？😊

* `if (!userContext)` が **消える**
* JSXも `{userName}` と素直に書ける
* もし Provider で囲み忘れていたら？

  * 画面はエラーになってくれて、
  * コンソールに **「useUserContext は UserProvider の中で使ってください」** と教えてくれます

「気づかないままヘンな表示になる」より、
**バキッとエラーが出てくれた方がデバッグしやすい**んです 🔍

---

### 7️⃣ 図でイメージをつかもう 🧠

![カスタムフックの安全ベルト](./picture/react_study_076_custom_hook_guard.png)

`UserProvider`（親）と、`UserNameLabel`（子）、その間に
`useUserContext` が入っているイメージを Mermaid で描いてみます。

```mermaid
graph TD
  A["UserProvider<br/>(UserContext.Provider)"] --> B[ページ内のいろんなコンポーネント]
  B --> C["useUserContext<br/>(カスタムフック)"]
  C --> D["UserContext の中身<br/>(userName, setUserName)"]

  style A fill:#f9f,stroke:#333,stroke-width:1px
  style C fill:#bbf,stroke:#333,stroke-width:1px
```

* `UserProvider` が **Context の値を用意**して配る
* 子コンポーネントは直接 `useContext` ではなく
  **`useUserContext` にだけ頼む**
* `useUserContext` の中で **nullチェックしてから** 値を返す

という流れになっています 🎵

---

### 8️⃣ 「外で使ったらどうなるの？」実験 💣

ちょっとわざとミスしてみましょう。

`App.tsx` をこんなふうに書いたとします（わざとミスです）。

```tsx
// src/App.tsx
import { UserNameLabel } from "./components/UserNameLabel";
// ❌ UserProvider で囲み忘れてる！

function App() {
  return (
    <div>
      <h1>テストアプリ</h1>
      <UserNameLabel />
    </div>
  );
}

export default App;
```

この状態で画面を開くと…

* 画面がエラーになって止まる
* コンソールに
  **「useUserContext は UserProvider の中で使ってください。」**
  というメッセージが出る（さっき throw したやつ）

👉 **「あ、Provider で囲んでなかったんだな」**とすぐ分かるので、
バグの場所を見つけやすくなります 💡

---

### 9️⃣ よくある「別解」と、この教材でのオススメ ✅ / ❌

TypeScript + Context で、`null` 問題をどう扱うかはいくつか流派があります。

#### ❌ 型アサーションでゴリ押しするパターン

```tsx
const userContext = useContext(UserContext)!;
// か
const userContext = useContext(UserContext) as UserContextValue;
```

* TypeScriptには怒られない
* でも **ほんとうに null が来たら即クラッシュ** 💥
* **どこで間違ってるのか分かりにくい**

→ この教材では **オススメしません**。

#### ✅ カスタムフックでチェックしてあげるパターン（今やったやつ）

```tsx
export function useUserContext(): UserContextValue {
  const context = useContext(UserContext);

  if (context === null) {
    throw new Error("useUserContext は UserProvider の中で使ってください。");
  }

  return context;
}
```

* **型的にも安全**（戻り値は `UserContextValue`）
* **実行時にも安全**（ミスってたらメッセージ付きでエラー）
* コンポーネント側はスッキリ ✨

TypeScript の React チートシート的な資料でも
「ランタイムチェック＋カスタムフック」のパターンがよく紹介されています。([GitHub][2])

---

### 🔟 ちょこっと応用：いろんな Context で同じパターンを使う 🌈

このカスタムフックのアイデアは、他の Context にもそのまま使えます。

例：テーマ（ライト/ダーク）を管理する `ThemeContext` を作ったとしたら…

* `useThemeContext`
* `useAuthContext`
* `useSettingsContext`

…など、それぞれの Context ごとに
**「安全なカスタムフック」をセットで作る**
というのが、かなり実務っぽいパターンです 💼

---

### 1️⃣1️⃣ 練習タイム 📝（軽めでOK）

時間があるときに、こんな感じで手を動かしてみてください ✋

1. **`ThemeContext` を作ってみる**

   * `theme: "light" | "dark"`
   * `toggleTheme: () => void`
   * を持つ `ThemeContext` と `ThemeProvider` を作る
   * `useThemeContext` も **同じパターン**で作る

2. `ThemeContext` を使って

   * ページの背景色や文字色を切り替えるコンポーネントを作る
   * `useThemeContext` を使って、`theme` を読み取る

3. わざと `ThemeProvider` で囲むのを忘れてみて、

   * どんなエラーが出るか
   * そのメッセージで原因が分かりやすいか
   * を確認してみる

---

### まとめ 🌸

この章で覚えてほしいことはただひとつ：

> **「`useContext` にそのまま触らず、カスタムフック経由にして `null` チェックを1か所に集める」**

これだけで、

* コンポーネントが読みやすくなる ✨
* TypeScript の型もスッキリする 💻
* ミスしたときにエラーで教えてくれる 🐞

という、いいことづくめです。

次の章からも、Context を使うときは
**「Context本体 + Provider + 安全なカスタムフック」**の3点セットを
基本形として使っていきますよ〜 🎉

[1]: https://blog.logrocket.com/how-to-use-react-context-typescript/?utm_source=chatgpt.com "How to use React Context with TypeScript"
[2]: https://github.com/typescript-cheatsheets/react?utm_source=chatgpt.com "typescript-cheatsheets/react"
