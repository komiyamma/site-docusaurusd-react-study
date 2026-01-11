# 第80章：練習：ダークモード切り替え (Contextの型定義もバッチリ！)
**アプリ全体の「ダークモード切り替え」🌞🌙** を作っていきます！

React v19 らしく、**Context の型定義をガッチリ✨** 決めた上で、
どのコンポーネントからでも「いまライト？ダーク？」「切り替えて〜」が呼べるようにしてみましょう。

---

## 🎯 この章のゴール

この章が終わるころには、こんなことができています👇

* 画面右上に「🌙 ダークモード」「🌞 ライトモード」ボタンがある
* ボタンを押すと、**アプリ全体の背景や文字色が切り替わる**
* モード情報は **Context** で一元管理
* Context の型は

  * `Theme` … `"light" | "dark"`
  * `ThemeContextValue` … `{ theme, toggleTheme }`
  * `ThemeProvider` … `children` を受け取る型
  * `useTheme` … 型安全に Context を取り出すカスタムフック

---

## 🗂 ざっくり構成

Vite の `react-ts` プロジェクトがある前提で、こんな感じのファイルを作ります。

```text
src/
  main.tsx
  App.tsx
  index.css
  contexts/
    ThemeContext.tsx
  components/
    Header.tsx
```

> すでに違う構成で進めている場合は、
> 「`contexts/ThemeContext.tsx` を追加して、`Header.tsx` から使うんだな〜」くらいでOKです 👍

---

## Step 1️⃣ 型から考える：テーマ用 Context の設計

まずは「どんな情報を共有したいのか」を型で決めちゃいます。

* テーマそのもの → `"light"` か `"dark"` のどちらか
* テーマを切り替える関数 → `() => void`

### ✏️ `src/contexts/ThemeContext.tsx` を作る

```tsx
// src/contexts/ThemeContext.tsx
import { createContext, useContext, useState, ReactNode } from "react";

export type Theme = "light" | "dark";

type ThemeContextValue = {
  theme: Theme;
  toggleTheme: () => void;
};

// 🔸 まだ中身がないので undefined を入れておく
const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

type ThemeProviderProps = {
  children: ReactNode;
};
```

ポイント💡

* `Theme` は **文字列リテラルの Union 型**
  → `"light"` か `"dark"` 以外はコンパイルエラーにできる✨
* `ThemeContextValue` で
  「どんなものを共有するの？」を **1か所にまとめておく** のがコツ

---

## Step 2️⃣ `ThemeProvider` を作る

次に、実際に `theme` を持つ **Provider コンポーネント** を作ります。

React 19 では、Context を `<ThemeContext value={...}>` のように
**コンポーネントとしてそのまま Provider にできる書き方も用意されています**。([Medium][1])

これを使って、ちょっとスッキリめのコードにしてみましょう。

```tsx
// src/contexts/ThemeContext.tsx の続き

export function ThemeProvider({ children }: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>("light");

  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  return (
    <ThemeContext value={{ theme, toggleTheme }}>
      {/* ここでクラス名も付けておくと CSS で楽ちん */}
      <div className={`app-root theme-${theme}`}>{children}</div>
    </ThemeContext>
  );
}
```

💬 解説

* `useState<Theme>("light")`

  * 最初はライトモードからスタート
  * `Theme` 型で縛っているので `"light"` / `"dark"` 以外は入りません
* `toggleTheme`

  * 前の値 `prev` を見て、`light` ↔ `dark` を切り替えるだけの関数
* `<ThemeContext value={{ theme, toggleTheme }}>`

  * React 19 で追加された「Context 自体を Provider として使える」書き方✨([Medium][1])
  * もちろん従来どおり `<ThemeContext.Provider value=...>` でもOKです

---

## Step 3️⃣ 型安全なカスタムフック `useTheme`

毎回

```ts
const value = useContext(ThemeContext);
if (!value) { ... }
```

って書くのはちょっとダルいので、
**カスタムフック**で 1 か所にまとめちゃいます ✨

```tsx
// src/contexts/ThemeContext.tsx の最後に追加

export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);

  if (!context) {
    // Provider の外で呼んでしまうとここに来る
    throw new Error("useTheme must be used within a ThemeProvider");
  }

  return context;
}
```

ここがポイント🎯

* `useContext(ThemeContext)` の戻り値は
  `ThemeContextValue | undefined` だけど…
* `if (!context) throw ...` を挟むことで、
  **この先では `ThemeContextValue` として扱える** ようになります ✨
* 呼び出し側は「`useTheme()` を呼べば OK」というシンプルな API にできる

---

## Step 4️⃣ アプリ全体を `ThemeProvider` で包む

次に、アプリの「いちばん外側」で `ThemeProvider` を使います。

### ✏️ `src/main.tsx`

```tsx
// src/main.tsx
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { ThemeProvider } from "./contexts/ThemeContext";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </React.StrictMode>
);
```

これで、`App` 以下のコンポーネントならどこからでも
`useTheme()` でテーマにアクセスできる状態になりました 🎉

---

## Step 5️⃣ ヘッダーにダークモードボタンを置く

実際に Context を使ってみましょう。
`Header` コンポーネントを作って、そこにボタンを置きます。

### ✏️ `src/components/Header.tsx`

```tsx
// src/components/Header.tsx
import { useTheme } from "../contexts/ThemeContext";

export function Header() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <header className="header">
      <h1 className="headerTitle">Dark Mode Sample ✨</h1>
      <button className="themeToggleButton" onClick={toggleTheme}>
        {isDark ? "🌞 ライトモードにする" : "🌙 ダークモードにする"}
      </button>
    </header>
  );
}
```

---

## Step 6️⃣ `App.tsx` から使ってみる

メインコンテンツは超シンプルでOKです。

### ✏️ `src/App.tsx`

```tsx
// src/App.tsx
import { Header } from "./components/Header";

export default function App() {
  return (
    <>
      <Header />
      <main className="main">
        <p>ここがメインコンテンツです 📝</p>
        <p>ボタンを押して、背景と文字色が変わるか試してみてね！</p>
      </main>
    </>
  );
}
```

---

## Step 7️⃣ CSS でライト / ダークの見た目を切り替える

最後に、テーマに応じて色を変える CSS を書きます。
ここでは **CSS カスタムプロパティ（変数）** を使って、
`.theme-light` / `.theme-dark` でまとめて切り替えるスタイルにします。

### ✏️ `src/index.css`

```css
/* ベース設定 */
:root {
  color-scheme: light;
}

body {
  margin: 0;
  font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI",
    sans-serif;
}

/* ThemeProvider の中の div に付けているクラス */
.app-root {
  min-height: 100vh;
  background-color: var(--bg-color);
  color: var(--text-color);
  padding: 24px;
  transition: background-color 0.2s ease, color 0.2s ease;
}

/* ライトモード用の色たち */
.theme-light {
  --bg-color: #f9fafb;
  --text-color: #111827;
  --header-bg: #e5e7eb;
  --button-bg: #111827;
  --button-text: #f9fafb;
}

/* ダークモード用の色たち */
.theme-dark {
  color-scheme: dark;
  --bg-color: #020617;
  --text-color: #e5e7eb;
  --header-bg: #111827;
  --button-bg: #e5e7eb;
  --button-text: #020617;
}

/* ヘッダー */
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: var(--header-bg);
  padding: 12px 16px;
  border-radius: 999px;
  margin-bottom: 24px;
}

.headerTitle {
  font-size: 18px;
  font-weight: 600;
}

/* トグルボタン */
.themeToggleButton {
  border: none;
  border-radius: 999px;
  padding: 8px 16px;
  font-size: 14px;
  cursor: pointer;
  background-color: var(--button-bg);
  color: var(--button-text);
}

/* メイン部分 */
.main {
  font-size: 16px;
  line-height: 1.7;
}
```

これで、`theme` が `"light"` か `"dark"` かによって

* `.theme-light` / `.theme-dark` が切り替わる
* それに応じて `--bg-color` や `--text-color` の中身が変わる
  → 画面の見た目がスッと切り替わる ✨

---

## 🧩 全体の流れを図で見る（Mermaid）

![ダークモード切替](./picture/react_study_080_dark_mode_toggle.png)

Context がどう流れているか、図で整理してみます 👀

```mermaid
graph TD
  subgraph AppTree[アプリ全体]
    TP["ThemeProvider<br/>theme, toggleTheme を管理"]
    APP[App]
    HD["Header<br/>useTheme()"]
    MAIN[Main コンテンツ]
  end

  TP --> APP
  APP --> HD
  APP --> MAIN

  TP -- theme, toggleTheme を配る --> HD
  TP -- theme を配る --> MAIN
```

イメージとしては、

1. `ThemeProvider` がアプリ全体を包み込む 🫧
2. `ThemeProvider` の中で `theme` と `toggleTheme` を管理
3. 子コンポーネントは `useTheme()` を呼ぶだけで
   `theme` と `toggleTheme` にアクセスできる

という感じです。

---

## 🌟 React 19 らしい発展ネタ（余裕があれば）

React 19 では、新しい `use` API で **Context を読む書き方** も増えました。([React][2])

`useContext(ThemeContext)` の代わりに、こんなふうに書けます：

```tsx
// React 19 の新しい書き方のイメージ（今は眺めるだけでOK）

import { use } from "react";
import { ThemeContext } from "../contexts/ThemeContext";

export function Header() {
  const { theme, toggleTheme } = use(ThemeContext);
  // あとはさっきと同じ
}
```

この章では **従来の `useContext` + カスタムフック** をメインに練習しましたが、
「もうちょっと React 19 を攻めたいぞ！」と思ったときのために
こんな書き方もあるんだ〜くらいで覚えておいてください 💫

---

## ✅ 最後にミニチェック

自分に質問してみてください 👇

* [ ] `Theme` / `ThemeContextValue` / `ThemeProviderProps` の **型定義**を書ける？
* [ ] `createContext<値の型 | undefined>(undefined)` のパターン、説明できそう？
* [ ] `useTheme` の中で `if (!context) throw ...` してる理由、わかった？
* [ ] `ThemeProvider` をどこで包むべきか、イメージできる？
* [ ] CSS の `.theme-light` / `.theme-dark` のどこが切り替わってるか追えた？

---

## 🎒 もっと腕試ししたい人向け課題

余裕があれば、こんなアレンジもやってみてください 🔥

1. アプリ起動時に、
   `window.matchMedia("(prefers-color-scheme: dark)")` を見て初期テーマを決める
2. 選んだテーマを `localStorage` に保存して、
   次に開いたときも同じモードからスタートさせる
3. `Footer` コンポーネントを作って、
   「いまのモード：◯◯」と表示してみる（もちろん `useTheme()` で）

ここまでできたら、
**「Context でアプリ全体の状態を共有する」基本パターンはかなりマスター 🏅** です！

次の章では、このパターンをさらに発展させていきましょう〜 🌈

[1]: https://medium.com/%40ignatovich.dm/react-19-state-management-with-improved-context-api-82bba332bb69?utm_source=chatgpt.com "React 19: State Management with Improved Context API"
[2]: https://react.dev/blog/2024/12/05/react-19?utm_source=chatgpt.com "React v19"
