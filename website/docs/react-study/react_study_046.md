# 第46章：`useState` でオブジェクト（複数のデータ）を扱うときの注意

この章では、

> 「`useState` で **オブジェクトの state** を持たせるとき、どこに気をつければいいの？」

というポイントをまとめていきます 🥰
TODOリストの1件ぶんの情報・プロフィール情報・フォームの入力内容…
「**関連するデータをひとまとめにしたい**」ときに、オブジェクトの state が大活躍します。

ただし、書き方をちょっとミスると

* 画面が更新されない…😇
* 他のプロパティがなぜか消える…😱

みたいな事故が起きやすいところでもあります。

---

### 1. まずは「オブジェクトの state」ってどんな感じ？🎀

たとえば、ユーザーのプロフィールをこんなオブジェクトで持ちたいとします。

* `name`: ユーザー名
* `age`: 年齢
* `isStudent`: 学生かどうか

TypeScript で型を作って、`useState` に乗せてみます。

```tsx
import { useState } from "react";

type Profile = {
  name: string;
  age: number;
  isStudent: boolean;
};

export function ProfileEditor() {
  const [profile, setProfile] = useState<Profile>({
    name: "さくら",
    age: 20,
    isStudent: true,
  });

  return (
    <div>
      <p>名前: {profile.name}</p>
      <p>年齢: {profile.age}</p>
      <p>学生？: {profile.isStudent ? "はい" : "いいえ"}</p>
    </div>
  );
}
```

`useState` は**文字列・数値だけじゃなくて、オブジェクトや配列も state にできる**のがポイントです 💡([react.dev][1])

---

### 2. 注意①：オブジェクトを「直接いじらない」🙅‍♀️

React では「**state は直接書き換えちゃダメ**」という大事ルールがありましたね（第39章の復習）✨
オブジェクト state のときも同じです。

#### ❌ やっちゃダメな書き方（直接変更）

```tsx
function badIncrementAge() {
  // ❌ 直接書き換えている
  profile.age = profile.age + 1;
  // setProfile を呼んでないから、React は「変わった」と気づかない
}
```

これだと

* TypeScript 的にはエラーにならない場合もある
* でも React は「`profile` という **オブジェクト自体** は同じだね」と判断して
* 画面を再レンダリングしてくれないことがあります 🥺([react.dev][1])

#### ✅ 正しいパターン：**新しいオブジェクトを作る**

```tsx
function goodIncrementAge() {
  setProfile({
    ...profile,           // もとのプロパティをコピー
    age: profile.age + 1, // 上書きしたいところだけ変える
  });
}
```

ここで大事なのは

> **「元のオブジェクトを使って、新しいオブジェクトを作る」**

という考え方です ✨

---

### 3. 図解：オブジェクト state 更新の流れをイメージしよう 📊

![オブジェクトStateの更新イメージ](./picture/react_study_046_object_state.png)

`setProfile` で更新するときのイメージを Mermaid で軽く図にしてみます。

```mermaid
flowchart TD
  A["今の profile state<br/> { name, age, isStudent }"] 
    --> B["setProfile(prev => ({ ...prev, age: prev.age + 1 }))"]
  B --> C["新しいオブジェクトを作る<br/>{ name, age+1, isStudent }"]
  C --> D[React が「変わった！」と気づく]
  D --> E[画面を再レンダリング ✨]
```

* `prev`（または `profile`）をもとに
* **スプレッド構文 `...prev` でコピー**
* 変えたいところだけ上書きして
* **まったく新しいオブジェクト**として渡してあげる、という流れです 🧠

---

### 4. 注意②：「一部だけ変えたつもり」が全部上書きになることも…😵

オブジェクトの state でありがちなミスがこちら👇

#### ❌ 他のプロパティを消してしまうパターン

```tsx
function badChangeName() {
  // name だけ変えたいつもり…
  // でも Profile 型の他のプロパティ(age, isStudent)が消えてしまう😱
  setProfile({
    name: "ゆり",
  });
}
```

TypeScript で `Profile` の型をちゃんと付けていれば、
「`age` や `isStudent` が足りないよ！」とエラーを出してくれることが多いです。
**型を付けておくと、こういうミスにすぐ気づける**のも嬉しいポイントですね 💖([react.dev][1])

#### ✅ 正しいパターン：スプレッド構文で「元の情報をコピー」してから上書き

```tsx
function goodChangeName() {
  setProfile({
    ...profile,  // まずは全部コピー
    name: "ゆり", // 変えたいところだけ後から上書き
  });
}
```

この順番も大事で、

1. `...profile` で全部コピー
2. 後ろに `name: "ゆり"` と書くことで、`name` だけ上書き

という動きになっています ✨

---

### 5. 注意③：`prev` を使う「関数型アップデート」🧠

次は、こういうコードを見たことがあるかもしれません 👀

```tsx
setProfile((prev) => ({
  ...prev,
  age: prev.age + 1,
}));
```

この `(prev) => ({ ... })` という形式を**関数型アップデート**と呼んだりします。

#### なんで `prev` を使うの？ 🤔

ボタンを連続で押したり、別の state 更新と同時に起きたりすると、

* 画面に「見えている `profile`」と
* React が内部で持っている「最新の `profile`」

に**ズレが出る**ことがあるからです。

`setProfile` に**関数**を渡すと、React は

> 「**いちばん新しい state** を `prev` に入れてから、この関数を実行するね〜」

という動きをしてくれます。([react.dev][1])

その結果、

* 連続クリックしても age がちゃんと +1 ずつ増える
* 他の更新と混ざっても、最新の state から計算してくれる

という、ちょっと賢い更新ができるようになります ✨

---

### 6. 注意④：ネストしたオブジェクトは“二段階コピー”になる 🏯

Profile に「住所」まで入れたくなったとします。

```tsx
type Address = {
  city: string;
  detail: string;
};

type Profile = {
  name: string;
  age: number;
  isStudent: boolean;
  address: Address;
};
```

初期値はこんな感じ：

```tsx
const [profile, setProfile] = useState<Profile>({
  name: "さくら",
  age: 20,
  isStudent: true,
  address: {
    city: "東京",
    detail: "千代田区",
  },
});
```

「市区町村だけ変えたいな〜」というとき、
ネストしている `address` も**イミュータブルに更新**する必要があります。

#### ✅ ネストしたオブジェクトの更新パターン

```tsx
function changeCity() {
  setProfile((prev) => ({
    ...prev, // まずは Profile 全体をコピー
    address: {
      ...prev.address, // その中の address もコピー
      city: "京都",     // 変えたいプロパティを上書き
    },
  }));
}
```

* 外側の `Profile` オブジェクトを `...prev`
* 内側の `address` オブジェクトを `...prev.address`

という**二段階コピー**になっているのがポイントです 💡

ネストが深くなってくると大変なので、

* なるべくネストを浅く設計する
* 第47章以降で扱う「`useImmer`」みたいなライブラリを使う

などの工夫もよく使われます 🌱

---

### 7. 注意⑤：オブジェクト1個 vs `useState`を分ける、どっちがいい？⚖️

よくある迷いどころがこれです👇

> 「`Profile` みたいにひとまとめで持つか、`nameState`, `ageState` って分けるか？」

どっちが正解、というより**ケースバイケース**です。

#### オブジェクト1個にまとめるとよい場合 💼

* そのデータが「**1つのまとまり**」として扱われることが多い
* まとめてサーバーに送る・まとめてリセットする など

```tsx
// ※説明用、コードブロックではない
const [profile, setProfile] = useState<Profile>(...);
```

#### `useState` を分けたほうがよい場合 🌸

* それぞれの値が「ほぼ独立」していて、別々に扱うことが多い
* 部分的な更新が多くて、オブジェクトのコピーが面倒すぎる

```tsx
// ※説明用
const [name, setName] = useState("");
const [age, setAge] = useState(0);
const [isStudent, setIsStudent] = useState(false);
```

この章では「**オブジェクトで持つ場合の注意**」が主役なので、
まとめて持つパターンを中心に練習していきます ✨

---

### 8. ミニ実践：プロフィール編集フォームを作ってみよう ✍️💕

最後に、この章の内容をぎゅっとまとめたサンプルです。

* `Profile` 型を定義
* `useState<Profile>` で state を持つ
* 入力フォームでそれぞれの値を編集
* 更新するときは「イミュータブル」に！

```tsx
import { useState } from "react";

type Profile = {
  name: string;
  age: number;
  isStudent: boolean;
};

export function ProfileForm() {
  const [profile, setProfile] = useState<Profile>({
    name: "さくら",
    age: 20,
    isStudent: true,
  });

  const handleChangeName = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setProfile((prev) => ({
      ...prev,
      name: value,
    }));
  };

  const handleChangeAge = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(e.target.value) || 0;
    setProfile((prev) => ({
      ...prev,
      age: value,
    }));
  };

  const handleToggleStudent = () => {
    setProfile((prev) => ({
      ...prev,
      isStudent: !prev.isStudent,
    }));
  };

  const handleReset = () => {
    setProfile({
      name: "さくら",
      age: 20,
      isStudent: true,
    });
  };

  return (
    <div>
      <h2>プロフィール編集フォーム 🌸</h2>

      <label>
        名前：
        <input
          type="text"
          value={profile.name}
          onChange={handleChangeName}
        />
      </label>

      <br />

      <label>
        年齢：
        <input
          type="number"
          value={profile.age}
          onChange={handleChangeAge}
        />
      </label>

      <br />

      <label>
        学生？
        <input
          type="checkbox"
          checked={profile.isStudent}
          onChange={handleToggleStudent}
        />
      </label>

      <hr />

      <p>名前: {profile.name}</p>
      <p>年齢: {profile.age}</p>
      <p>学生？: {profile.isStudent ? "はい" : "いいえ"}</p>

      <button onClick={handleReset}>リセット 🔁</button>
    </div>
  );
}
```

ここで意識してほしいのは、

* どの更新関数も `setProfile((prev) => ({ ...prev, ... }))` になっている
* 「一部だけ変えたいとき」でも、必ず**元のオブジェクトをコピー**してから上書きしている

という2点です ✅

---

### 9. 今日のまとめチェックリスト ✅✨

`useState` でオブジェクトを扱うときは、つぎのポイントを思い出してください 💡

* ⭕ **state のオブジェクトは直接書き換えない**
* ⭕ 変えたいときは **新しいオブジェクトを作って渡す**
* ⭕ 「一部だけ変えたい」ときは `...prev` でコピーしてから上書き
* ⭕ 他の更新と混ざる可能性があるときは `setState(prev => ...)` 形式（関数型アップデート）を使う
* ⭕ ネストしたオブジェクトは「二段階コピー」でイミュータブル更新
* ⭕ まとまりとして扱うならオブジェクト1個、バラバラなら `useState` を分けるのもアリ

この章の内容がしっかりわかると、
次の **第47章「オブジェクトのStateをイミュータブルに更新する練習」** がぐっと楽になりますよ〜🌈

「オブジェクトをまるごと取り替える」が React 流なんだな、というイメージをぜひ掴んでおいてください 🐰💻

[1]: https://react.dev/reference/react/useState?utm_source=chatgpt.com "useState"
