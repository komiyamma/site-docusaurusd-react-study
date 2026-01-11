# 第26章：Propsの「分割代入」

「`(props)` じゃなくて `({ name, age })` って書くやつ」を、ここでちゃんとマスターしちゃいましょう 💪
分割代入は**見た目もキレイ＆ミスも減る**ので、Reactではほぼ必須テクです 🎓

---

### 26-1. まずは普通の `props` の書き方をおさらい 👀

まずは「分割代入なし」の、素直な書き方から確認します。

`UserCard` という「ユーザーの名前と年齢を表示する部品」を例にします。

#### `UserCard.tsx`

```tsx
type UserCardProps = {
  name: string;
  age: number;
};

export function UserCard(props: UserCardProps) {
  return (
    <div>
      <p>名前：{props.name}</p>
      <p>年齢：{props.age}歳</p>
    </div>
  );
}
```

#### `App.tsx`（親からデータを渡す側）

```tsx
import { UserCard } from "./UserCard";

export function App() {
  return (
    <div>
      <h1>プロフィール一覧</h1>
      <UserCard name="さくら" age={20} />
    </div>
  );
}
```

ここまでは大丈夫そうかな？ 😊
この書き方だと、JSXの中で毎回 `props.name` / `props.age` と書くことになります。

---

### 26-2. 「分割代入」ってなに？🍰（JavaScriptのおさらい）

JavaScript では、**オブジェクトから中身を取り出して、変数にバラバラにする**書き方を「分割代入」と呼びます。

```ts
const user = {
  name: "さくら",
  age: 20,
};

// 分割代入なし
const name1 = user.name;
const age1 = user.age;

// 分割代入あり
const { name, age } = user;

console.log(name); // "さくら"
console.log(age);  // 20
```

`const { name, age } = user;` の一行で、

* `user.name` → `name`
* `user.age` → `age`

という変数をまとめて作ってくれます ✨
**「オブジェクトから必要なものだけスッと取り出す」**イメージです。

---

### 26-3. 関数の「引数」で分割代入する 🎯

分割代入は、**関数の引数**でも使えます。

```ts
type GreetProps = {
  name: string;
  age: number;
};

function greet(props: GreetProps) {
  console.log(`こんにちは、${props.name} さん（${props.age}歳）`);
}

// 分割代入版
function greet2({ name, age }: GreetProps) {
  console.log(`こんにちは、${name} さん（${age}歳）`);
}
```

`greet2` のほうは、引数のところで `({ name, age }: GreetProps)` と書いて、
**受け取った `props` から `name` と `age` をその場で取り出している**感じです。

Reactのコンポーネントもただの関数なので、
**まったく同じノリで「引数で分割代入」できちゃいます** ✨

---

### 26-4. Reactコンポーネントで分割代入してみよう 🌸

さっきの `UserCard` を「分割代入スタイル」に書き直してみます。

#### Before：ふつうに `props` で受け取る

```tsx
type UserCardProps = {
  name: string;
  age: number;
};

export function UserCard(props: UserCardProps) {
  return (
    <div>
      <p>名前：{props.name}</p>
      <p>年齢：{props.age}歳</p>
    </div>
  );
}
```

#### After：Propsの「分割代入」を使う ✨

```tsx
type UserCardProps = {
  name: string;
  age: number;
};

export function UserCard({ name, age }: UserCardProps) {
  return (
    <div>
      <p>名前：{name}</p>
      <p>年齢：{age}歳</p>
    </div>
  );
}
```

🎉 ポイント

* `function UserCard({ name, age }: UserCardProps)`
  → **引数のところで分割代入**している
* JSXの中では `props.` を書く必要がなくなって、
  `name` / `age` をそのまま使えるので、読みやすくなります 👀

---

### 26-5. Mermaidでイメージ図を描いてみる 🧠✨

![Props Destructuring](./picture/react_study_026_destructuring.png)


親から子へ Props が渡されて、子の中で分割代入される流れを図にしてみます。

```mermaid
flowchart LR
  P["親コンポーネント<br/>App"]
  C["子コンポーネント<br/>UserCard({ name, age })"]

  P -->|"name='さくら', age={20}"| C
```

* 親の `App` から
  `<UserCard name="さくら" age={20} />` が呼ばれる 🔁
* 子の `UserCard` は
  `({ name, age }: UserCardProps)` でその2つを受け取る 🎁

こんなイメージです 💡

---

### 26-6. TypeScriptとセットで書くときの形 🧩

TypeScript で Props の型をつける時の**よく使う定番パターン**はこれです👇

```tsx
type UserCardProps = {
  name: string;
  age: number;
};

export function UserCard({ name, age }: UserCardProps) {
  return (
    <div>
      <p>名前：{name}</p>
      <p>年齢：{age}歳</p>
    </div>
  );
}
```

* `UserCardProps`：Props の「型」を定義
* `({ name, age }: UserCardProps)`：

  * 左側：分割代入（`name`, `age` という変数を作る）
  * 右側：そのオブジェクトが `UserCardProps` 型ですよ、という宣言

VS Code で `name` や `age` にカーソルを合わせると、
ちゃんと `string` / `number` と型が出てくるはずです 🖱️✨

---

### 26-7. よくあるパターン：`children` もいっしょに分割代入 🌈

`children` を受け取る部品でも、分割代入は同じように使えます。

```tsx
type CardProps = {
  title: string;
  children: React.ReactNode;
};

export function Card({ title, children }: CardProps) {
  return (
    <section>
      <h2>{title}</h2>
      <div>{children}</div>
    </section>
  );
}
```

`({ title, children }: CardProps)` のところで、
`title` と `children` をまとめて受け取っているだけです 🧺

---

### 26-8. Propsの分割代入での「あるある注意点」⚠️

#### ① プロパティ名は**型と同じ名前**じゃないとダメ

例えば、型で `name` と書いたのに、引数で `{ username }` とするとエラーになります。

```tsx
type UserCardProps = {
  name: string;
  age: number;
};

// ❌ これはダメ（name というプロパティはあるけど、username ではない）
export function UserCard({ username, age }: UserCardProps) {
  return (
    <div>
      <p>{username}</p>
      <p>{age}</p>
    </div>
  );
}
```

もしどうしても名前を変えたいなら、**リネーム付きの分割代入**を使います。

```tsx
type UserCardProps = {
  name: string;
  age: number;
};

export function UserCard({ name: displayName, age }: UserCardProps) {
  return (
    <div>
      <p>{displayName}</p>
      <p>{age}</p>
    </div>
  );
}
```

* `name: displayName`
  → Props の `name` を、コンポーネント内では `displayName` という名前で使う、という意味です。

#### ② ときどき「まとめて props を持っておきたい」こともある

**全部の Props をそのまま他の部品に渡したいとき**などは、
分割代入しないほうがラクなケースもあります。

```tsx
type ButtonProps = {
  label: string;
  color: "primary" | "secondary";
};

export function FancyButton(props: ButtonProps) {
  // そのままログに出したいときはこうしておくと便利
  console.log(props);

  return <button>{props.label}</button>;
}
```

なので、

* **基本は「引数で分割代入」がおすすめ** ✨
* でも「全部まとめて使いたい」ときは `props` のままでもOK

くらいの気持ちで使い分ければ大丈夫です 🙆‍♀️

---

### 26-9. ミニ練習タイム ✍️💕

実際に手を動かして、分割代入を体に覚えさせちゃいましょう。

#### 📝 練習1：`Greeting` コンポーネントを書き換え

1. `src/Greeting.tsx` を作って、まずは「分割代入なし版」で書いてみます。

```tsx
type GreetingProps = {
  name: string;
  emoji: string;
};

export function Greeting(props: GreetingProps) {
  return (
    <p>
      {props.emoji} こんにちは、{props.name} さん！
    </p>
  );
}
```

2. これを **分割代入あり**の書き方に書き換えてみてください ✨

> ヒント：`function Greeting({ ???, ??? }: GreetingProps)` みたいな形です。

---

#### ✅ 練習1：解答例

```tsx
type GreetingProps = {
  name: string;
  emoji: string;
};

export function Greeting({ name, emoji }: GreetingProps) {
  return (
    <p>
      {emoji} こんにちは、{name} さん！
    </p>
  );
}
```

---

#### 📝 練習2：デフォルト値もいれてみよう（ちょっと応用）🌟

`emoji` を「省略したら自動で 🌟 になる」ようにしてみましょう。

1. 型はそのままでOKです（あとの章で `?` 付きのオプショナルをやります）

2. 分割代入のところで、`emoji` にデフォルト値をつけてみます。

✅ 解答例：

```tsx
type GreetingProps = {
  name: string;
  emoji?: string; // ← ここは第30章でちゃんと解説予定だけど、先取り
};

export function Greeting({ name, emoji = "🌟" }: GreetingProps) {
  return (
    <p>
      {emoji} こんにちは、{name} さん！
    </p>
  );
}
```

* `emoji = "🌟"`
  → Props に `emoji` が渡されなかったときの「予備の値」です。

---

### まとめ 🎀

この章で覚えてほしいことはこの3つです👇

* Props は**ただのオブジェクト**だから、分割代入できる ✨
* `function MyComp({ title, children }: Props)` の形が、React + TS では**定番スタイル** ✅
* 名前を変えたいときは `name: displayName` と書く。
  逆に、全部まとめて使いたいときは `props` のままでもOK 🙆‍♀️

次の章からも Props の型をどんどん強化していくので、
この「分割代入スタイル」に慣れておくと、あとがすごくラクになりますよ〜 🧸💻✨
