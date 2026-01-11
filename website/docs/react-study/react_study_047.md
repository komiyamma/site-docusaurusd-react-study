# 第47章：練習：オブジェクトのStateを「イミュータブル（元のを変えず）」に更新する

---

## 1️⃣ この章でやること

この章では、こんなゴールを目指します ✨

* 「オブジェクトの State を**直接書き換えちゃダメ**」というルールを体で覚える
* `setState` するときに

  * `...`（スプレッド）を使って **コピーを作る書き方**
  * `setState(prev => ...)` で **前の値から計算する書き方**
    を両方マスターする 💪

React の公式ドキュメントでも

> State に入ってるオブジェクトは、そのまま書き換えず「コピーを作ってから set してね」

と説明されています。([react.dev][1])

---

## 2️⃣ イミュータブル更新のイメージ図 🧠

![イミュータブル更新のイメージ](./picture/react_study_047_spread_copy.png)

「元のオブジェクトを触らずに、新しいオブジェクトを作る」流れを図でみてみよう 👀

```mermaid
flowchart TD
  A["今の user State<br/> { name, age, favoriteColor }"] --> B["クリックなどのイベント"]
  B --> C["新しいオブジェクトを作る<br/> {...user, age: user.age + 1}"]
  C --> D["setUser(新しいオブジェクト)"]
  D --> E["React が「変わった！」と気づいて<br/>画面を再レンダリング"]
```

ポイントはここ 👉

* **今の `user` を書き換えるのではなく**
* **`{ ...user, age: ... }` みたいに「コピー + 上書き」で新しいオブジェクトを作る**

React は「参照が変わったかどうか（＝別オブジェクトかどうか）」で変化をチェックします。
だから、同じオブジェクトをいじるだけだと、React が変化に気づかないことがあります。([reacttraining.com][2])

---

## 3️⃣ ミニアプリの準備：プロフィール State を作ろう 👩‍🎓💻

Vite + React + TS のプロジェクトがある前提で進めます。
`src` フォルダの中に `UserProfile.tsx` を作って、こんな感じで書いてみてください ✍️

### 3-1. `User` 型と `useState` の準備

```tsx
// src/UserProfile.tsx
import { useState } from "react";

type User = {
  name: string;
  age: number;
  favoriteColor: string;
};

export function UserProfile() {
  const [user, setUser] = useState<User>({
    name: "りん",
    age: 20,
    favoriteColor: "pink",
  });

  return (
    <div>
      <h2>プロフィール ✨</h2>
      <p>名前: {user.name}</p>
      <p>年齢: {user.age}</p>
      <p>好きな色: {user.favoriteColor}</p>
    </div>
  );
}
```

### 3-2. `App.tsx` から呼び出す

```tsx
// src/App.tsx
import "./App.css";
import { UserProfile } from "./UserProfile";

function App() {
  return (
    <div className="app">
      <h1>第47章：オブジェクト State 練習 🧪</h1>
      <UserProfile />
    </div>
  );
}

export default App;
```

`npm run dev` で、プロフィールが表示されれば準備OKです ✅

---

## 4️⃣ ダメな例をあえて見てみる 🙅‍♀️（やっちゃいけない書き方）

まず、「やりがちな NG パターン」を見ておきましょう。
※ 実際に動かすとしても、あとでちゃんと直してくださいね 🥹

例えば「年齢 +1 ボタン」を作るとします。
**やってはいけない書き方** はこんな感じです：

```tsx
// ❌ よくない例（やらないでね）
function handleBirthdayBad() {
  user.age = user.age + 1; // ← ここで直接書き換えてる
  setUser(user);           // ← 同じオブジェクトを渡している
}
```

これの何がダメかというと…

* `user` は **今の State オブジェクトそのもの**
* それを `user.age = ...` で直接書き換えている
* `setUser(user)` は「同じオブジェクトの参照」を渡しているだけなので
  React から見ると「変わってないかも？」となることがある 😵

React 公式も「State に入っているオブジェクトは**読み取り専用**として扱ってね」と言っています。([react.dev][1])

---

## 5️⃣ 正しいイミュータブル更新（基本パターン）🌈

では、**ちゃんとした書き方** を練習していきます ✨

### パターンA：固定値でプロパティを変える

「好きな色を一発で `blue` に変える」ボタンを作ってみます 💙

```tsx
function handleChangeColorToBlue() {
  setUser({
    ...user,              // まず今の user をコピー
    favoriteColor: "blue" // その上から好きな色だけ上書き
  });
}
```

* `...user` で `name`, `age`, `favoriteColor` を丸ごとコピー
* その後に `favoriteColor: "blue"` と書くことで
  **同じキーを上書き** → 新しいオブジェクトができる

React 公式の例でも、同じように
`setPerson({ ...person, firstName: e.target.value })` のように書いています。([react.dev][1])

---

### パターンB：前の値から計算して変える（関数版）🧮

「年齢 +1」みたいに、**前の値に依存して計算** するときは、
`setUser(prev => ...)` の形がオススメです 💡

```tsx
function handleBirthday() {
  setUser((prevUser) => ({
    ...prevUser,
    age: prevUser.age + 1,
  }));
}
```

この書き方のいいところは…

* `prevUser` は **その時点での最新の user**
* 同時にいろんな更新が走っても、安全に計算できる
* React 公式も「前の State から計算するときは関数を渡そう」と解説しています ([react.dev][3])

---

### パターンC：フォーム入力からオブジェクトを更新 ✍️

`<input>` の値から、`user.name` や `user.favoriteColor` を更新してみましょう。

```tsx
import type React from "react"; // イベント型用

function handleNameChange(e: React.ChangeEvent<HTMLInputElement>) {
  const value = e.target.value;

  setUser((prevUser) => ({
    ...prevUser,
    name: value,
  }));
}

function handleFavoriteColorChange(e: React.ChangeEvent<HTMLInputElement>) {
  const value = e.target.value;

  setUser((prevUser) => ({
    ...prevUser,
    favoriteColor: value,
  }));
}
```

---

## 6️⃣ 完成版コンポーネント 👑

ここまでの内容をぜんぶまとめた `UserProfile` の完成形です 🎉

```tsx
// src/UserProfile.tsx
import { useState } from "react";
import type React from "react";

type User = {
  name: string;
  age: number;
  favoriteColor: string;
};

export function UserProfile() {
  const [user, setUser] = useState<User>({
    name: "りん",
    age: 20,
    favoriteColor: "pink",
  });

  function handleBirthday() {
    setUser((prevUser) => ({
      ...prevUser,
      age: prevUser.age + 1,
    }));
  }

  function handleChangeColorToBlue() {
    setUser((prevUser) => ({
      ...prevUser,
      favoriteColor: "blue",
    }));
  }

  function handleNameChange(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value;
    setUser((prevUser) => ({
      ...prevUser,
      name: value,
    }));
  }

  function handleFavoriteColorChange(
    e: React.ChangeEvent<HTMLInputElement>
  ) {
    const value = e.target.value;
    setUser((prevUser) => ({
      ...prevUser,
      favoriteColor: value,
    }));
  }

  return (
    <div style={{ border: "1px solid #ccc", padding: "16px", borderRadius: 8 }}>
      <h2>プロフィール ✨</h2>

      <p>名前: {user.name}</p>
      <p>年齢: {user.age}</p>
      <p>好きな色: {user.favoriteColor}</p>

      <hr />

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <label>
          名前を変更 📝：
          <input
            type="text"
            value={user.name}
            onChange={handleNameChange}
            style={{ marginLeft: 8 }}
          />
        </label>

        <label>
          好きな色を変更 🎨：
          <input
            type="text"
            value={user.favoriteColor}
            onChange={handleFavoriteColorChange}
            style={{ marginLeft: 8 }}
          />
        </label>

        <button onClick={handleBirthday}>🎂 誕生日ボタン（年齢 +1）</button>
        <button onClick={handleChangeColorToBlue}>💙 色を blue にする</button>
      </div>
    </div>
  );
}
```

### 動かしたときにチェックしてほしいところ ✅

* 入力欄を変えると、ちゃんと State も画面も更新されるか
* 「誕生日ボタン」を押すたびに `age` が +1 されるか
* 「色を blue にする」ボタンで `favoriteColor` が `"blue"` に変わるか

どの更新も、`setUser` の中で

* **元のオブジェクトは触らない**
* `...prevUser` でコピーしてから、必要なプロパティだけ上書き

というパターンになっているのがポイントです 🌟

---

## 7️⃣ ちょっと先の話：ネストや配列でも考え方は同じ 📚

今回の `User` はフラットなオブジェクトでしたが、
React では**ネストしたオブジェクトや配列も同じように「コピーしてから更新」**する必要があります。([react.dev][1])

次の章（第48章）では、

* 配列の State をイミュータブルに更新する（追加・削除・更新）
  をやっていくので、

今回の「オブジェクトはコピーしてから上書きする」という感覚を
しっかり馴染ませておいてくださいね ❤️

---

## 8️⃣ まとめ 🎀

この章で覚えておきたいポイントはこの3つ ✨

1. **State のオブジェクトは直接書き換えない！**
2. `setState({ ...oldState, foo: newFoo })` で
   **コピー + 上書き** の新しいオブジェクトを作る
3. 前の値から計算するときは
   `setState(prev => ({ ...prev, ... }))` の形が安心＆おすすめ 💪

ここがしっかりわかっていると、
このあと出てくる配列・フォーム・`useReducer` なども
めちゃくちゃスムーズに理解できるようになります 🕊️

おつかれさま！次は「配列版のイミュータブル更新」に進んでみよう〜 🚀

[1]: https://react.dev/learn/updating-objects-in-state?utm_source=chatgpt.com "Updating Objects in State"
[2]: https://reacttraining.com/blog/state-in-react-is-immutable?utm_source=chatgpt.com "State in React is Immutable"
[3]: https://react.dev/reference/react/useState?utm_source=chatgpt.com "useState"
