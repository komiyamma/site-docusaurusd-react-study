# 第75章：【フック】`useContext` (v19より古いやり方)

---

## 1. この章のゴール 🎯

この章では、「**useContextって何者？**」をちゃんと理解して、

* `useContext(SomeContext)` の**意味としくみ**がわかる
* `createContext`＋`<Context value={...}>` で用意したデータを、コンポーネント側で**読み取れる**
* React 19 の新API `use(ThemeContext)` と `useContext(ThemeContext)` の**関係がざっくり説明できる**

この3つを目標にします✨

---

## 2. そもそも `useContext` ってなに？🧐

公式ドキュメント的には、`useContext` は

> 「コンポーネントから context を読み取って、変更があれば自動で再レンダーしてくれるフック」([React][1])

という位置づけです。

書き方は超シンプルで、**型付き `useState` みたいなノリ**です：

```tsx
const value = useContext(SomeContext);
```

* `SomeContext` … 前の章で `createContext` したやつ（たとえば `UserContext`）
* `value` … Provider で渡した `value={...}` がそのまま入ってくる

React は「一番近くにある Provider からの値」を見つけてくれて、その値を返してくれます。([React][1])

---

## 3. React 19 の `use(Context)` との関係 ⚖️

React 19 では、新しい `use(resource)` API が追加されました。

* Promise や **Context** の値を読むための API
* `use(ThemeContext)` のように、**コンテキストも読める**
* しかも `if` や `for` の中でも呼べる、という自由度の高さ✨([React][2])

公式ドキュメントには、

> Context を読むときは、`useContext` より `use(context)` の方が柔軟なので **そちらが推奨** と書かれています。([React][2])

でも！

* 既存のコード
* 多くのブログ・Qiita記事
* ライブラリのサンプル

などでは、まだまだ **`useContext` が主役**です。
なのでこの章では、あえて「**v19より古いやり方（`useContext`）**」をしっかり覚えておきます 👍
（次の章で、これを包む「型安全なカスタムフック」も作ります💪）

---

## 4. 復習：Context の3ステップ ⛓️

![useContextの受信](./picture/react_study_075_use_context.png)

`useContext` を使う前に、Context 全体の流れをサクッとおさらいします。

1️⃣ **Context を定義する**（型をつけて `createContext`）
2️⃣ **Provider でアプリを包んで値を渡す**（`<UserContext value={...}>`）
3️⃣ **子コンポーネントで `useContext(UserContext)` を呼んで読む**

これを図にすると、こんなイメージです👇

```mermaid
graph TD
  A["UserProvider<br/>UserContext value={user}"] --> B[App 本体]
  B --> C[Header コンポーネント]
  B --> D[Main コンポーネント]
  C --> E[UserIcon]
  C --> F[UserMenu]

  E:::usesContext
  F:::usesContext

classDef usesContext fill:#eef,stroke:#88f,stroke-width:2px;
```

Header の奥の奥にある `UserIcon` や `UserMenu` まで、
「ログインユーザー情報」が**一気に届いている**イメージです🌊

---

## 5. 型付き `useContext` を使ってみよう 👩‍💻💖

ここからは、実際に TypeScript で書いてみましょう！

### 5-1. Context の型と本体を作る（復習）

`src/contexts/UserContext.tsx` を作るイメージです。

```tsx
// src/contexts/UserContext.tsx
import { createContext } from "react";

export type UserContextValue = {
  name: string;
  isLoggedIn: boolean;
};

// ★ v19スタイルの createContext
//   null を許容しておく（Provider で包み忘れた時用）
export const UserContext = createContext<UserContextValue | null>(null);
```

* `UserContextValue` が「Context の中身の型」
* `UserContext` が「Context そのもの」
* `createContext<T | null>(null)` にしておくと、
  「Provider で包まれていないときは `null` になるかも」と TypeScript が教えてくれます 👍

（この「`null` かもしれない問題」は、**次の第76章で解決テクニック**をやります👀）

---

### 5-2. Provider コンポーネントを用意する 🍼

次に、その Context に値をセットして配る **Provider** を作ります。

`src/contexts/UserProvider.tsx` を追加します。

```tsx
// src/contexts/UserProvider.tsx
import { useState } from "react";
import { UserContext, UserContextValue } from "./UserContext";

type UserProviderProps = {
  children: React.ReactNode;
};

export function UserProvider({ children }: UserProviderProps) {
  // 本当のアプリならここでログイン情報をAPIから取ったりする
  const [user] = useState<UserContextValue>({
    name: "さくら",
    isLoggedIn: true,
  });

  // ★ React 19 の Provider 構文
  //   <UserContext.Provider> ではなく <UserContext> でOK
  return (
    <UserContext value={user}>
      {children}
    </UserContext>
  );
}
```

ポイント✨

* React 19 では `ThemeContext.Provider` ではなく **`<ThemeContext value={...}>`** の形が推奨されています。([React][1])
* ここでは `UserProvider` という「包み込むためのコンポーネント」を作って、中で `<UserContext value={user}>` を使っています。

---

### 5-3. `useContext` でログインユーザー名を表示する 🎀

いよいよ本題！
Header コンポーネントで、`UserContext` を `useContext` で読み取ってみます。

`src/components/Header.tsx` を作ります。

```tsx
// src/components/Header.tsx
import { useContext } from "react";
import { UserContext } from "../contexts/UserContext";

export function Header() {
  const user = useContext(UserContext);

  // 型は UserContextValue | null なので、null 対応しておく
  if (!user) {
    return (
      <header style={{ padding: "8px 16px", backgroundColor: "#f5f5f5" }}>
        ログイン情報を読み込み中… 🔄
      </header>
    );
  }

  return (
    <header style={{ padding: "8px 16px", backgroundColor: "#f5f5f5" }}>
      <span>ようこそ、{user.name} さん ✨</span>
      {user.isLoggedIn ? (
        <span style={{ marginLeft: "8px" }}>（ログイン中 ✅）</span>
      ) : (
        <span style={{ marginLeft: "8px" }}>（ログアウト中 🚪）</span>
      )}
    </header>
  );
}
```

ここでやっていること：

* `const user = useContext(UserContext);`

  * `UserContext` に入っている型情報のおかげで、`user` の型は
    `UserContextValue | null` になります。
* `if (!user)` で「Provider で包まれていない／まだ値がない」場合の表示を用意。
* `user.name` や `user.isLoggedIn` に普通のオブジェクトとしてアクセスできる🎉

---

### 5-4. `UserProvider` でアプリ全体を包む 🌏

最後に、`App` から全体を Provider で包みます。

`src/App.tsx`：

```tsx
// src/App.tsx
import { UserProvider } from "./contexts/UserProvider";
import { Header } from "./components/Header";

export default function App() {
  return (
    <UserProvider>
      <Header />
      <main style={{ padding: "16px" }}>
        <p>ここにメインコンテンツが入ります 📝</p>
      </main>
    </UserProvider>
  );
}
```

これで、

1. `App` → `UserProvider` で包む
2. `UserProvider` → `<UserContext value={user}>` で値を配る
3. `Header` → `useContext(UserContext)` で値を受け取る

という流れが完成です🎊

---

## 6. `useContext` と `use(Context)` の比較チートシート 📝

| 項目        | `useContext(ThemeContext)` | `use(ThemeContext)`                   |
| --------- | -------------------------- | ------------------------------------- |
| どこで呼べる？   | コンポーネントのトップレベルだけ           | `if` や `for` の中でもOK ([React][2])      |
| 何を返す？     | Provider の `value`         | 同じ（Context の現在値）([React][1])          |
| 公式のおすすめ   | v19 では「`use` の方が柔軟なので推奨」   | 「Context を読むなら `use` が推奨」([React][2]) |
| 既存記事・サンプル | ほとんど `useContext`          | まだ少なめ（これから増える）                        |

**イメージとしては…**

* **新しいコードを書くなら**：`use(ThemeContext)` 🆕
* **既存プロジェクトや古い記事を読むとき**：`useContext(ThemeContext)` を読めないとつらい 😇

この講座では、「どっちも理解できる人」を目指します💪

---

## 7. よくあるつまずきポイント ⚠️

`useContext` を使うときにハマりやすいところをまとめておきます。

### 🧩 1. Provider で包んでいない

**症状**

* `useContext(UserContext)` の結果が `null`
* もしくは `Cannot read properties of null (reading 'name')` みたいなエラー

**チェックポイント**

* `App` か、もっと上のコンポーネントで **ちゃんと `<UserContext value={...}>` で包んでいるか？**([React][1])
* `value` を渡し忘れていないか？（`<UserContext>` だけになってない？）

---

### 🧩 2. `useContext` を if の中で呼んじゃう

```tsx
// ❌ これはダメ（Hooks のルール違反）
if (someCondition) {
  const user = useContext(UserContext);
  // ...
}
```

**Hooks は「トップレベルで同じ順番で呼ぶ」必要がある**ので、
`if` や `for` の中で呼ぶとルール違反になります。

* `useContext` を使うときは、**常にコンポーネントの先頭で呼ぶ**
* 条件分岐は「`const user = useContext(...)` の**後**」でやる

```tsx
// ✅ OK
const user = useContext(UserContext);

if (!user) {
  return <div>読み込み中…</div>;
}
```

（`use(Context)` の方は if の中でも呼べるので、そこが違いです🧐([React][2])）

---

### 🧩 3. 型が `UserContextValue | null` で毎回 if 書くのがしんどい

これは、**次の第76章で解決**します ✨

* `useContext(UserContext)` を中に隠した
  `useUser()` みたいな「**カスタムフック**」を作る
* そこで `null` のときはエラーを投げたり、デフォルト値を返したりする

という「型とエラーチェックをまとめる技」をやっていきます。

---

## 8. ハンズオン課題 ✍️🌸

最後に、この章の内容を定着させるためのミニ課題です。

### 課題1：`ThemeContext` を使ってボタンの色を変える

1. `ThemeContext` を `createContext<"light" | "dark">("light")` で作る
2. `ThemeProvider` コンポーネントを作って、`theme` state を
   `"light"` / `"dark"` でトグルできるようにする
3. `ThemedButton` コンポーネントを作って、
   `useContext(ThemeContext)` でテーマを読み取り、

   * `light` → 白背景＋黒文字
   * `dark` → 黒背景＋白文字
     にする

👉 ゴール：ボタンを押すと、テーマが切り替わって色も変わるようにする 🎨

---

### 課題2：`LanguageContext` で表示メッセージを切り替える

1. `LanguageContext` を `createContext<"ja" | "en">("ja")` で作る
2. Provider の `value` を `"ja"` にしておく
3. `Greeting` コンポーネントで `useContext(LanguageContext)` を使い、

   * `"ja"` → 「こんにちは！」
   * `"en"` → 「Hello!」
     を表示する

**発展**：`LanguageProvider` に `setLanguage` も入れて、ボタンで言語切り替えできるようにしてみてもOKです🔥

---

ここまでできたら、

* 「Context を作る」
* 「Provider で包む」
* 「`useContext` で読む」

の**一連の流れはバッチリ**です ✨
次の第76章では、これを **もっと型安全に・ラクに使うための「カスタムフック」** を一緒に作っていきましょう〜 🙌💻

[1]: https://react.dev/reference/react/useContext "useContext – React"
[2]: https://react.dev/reference/react/use "use – React"
