# 第25章：練習：`children`と型定義を使ったカード部品を作る。

この章では、
**「中身をなんでも入れられるカード部品（Card コンポーネント）」** を作ってみます 🎉

ポイントはこの2つ 👇

1. `children` を使って、「カードの中身」を親コンポーネントから渡す
2. TypeScript で **Props の型（とくに `children`）をちゃんと定義する**

---

## 1️⃣ ゴールのイメージ

最終的に、`App.tsx` からこんなふうに使えるカードを目指します ✨

```tsx
<Card title="今日やること">
  <ul>
    <li>React の勉強 💻</li>
    <li>課題をちょっと進める ✏️</li>
    <li>推しの配信を見る 🎧</li>
  </ul>
</Card>

<Card title="メモ">
  <p>明日は友だちとランチ 🍝</p>
</Card>
```

`Card` 側は、「枠」と「タイトルだけ」決めておいて、
**中身 (`<ul>...` や `<p>...`) はぜんぶ `children` におまかせ**、というスタイルです 💡

---

## 2️⃣ ファイルを用意しよう 🗂️

VS Code で、プロジェクトの `src` フォルダの中に

> `src/components/Card.tsx`

というファイルを新しく作ってください 📁
（`components` フォルダがまだなければ作ってOK！）

---

## 3️⃣ Props の型を考える時間 💭

`Card` コンポーネントが欲しい情報はこの2つだけです。

* `title`: カードのタイトル（文字列）
* `children`: カードの中に入れる「中身」

`children` の型は、React では **`ReactNode`** を使っておくのが定番です。
文字列・数値・別のコンポーネント・配列・`null` など、
**React がレンダリングできるほとんど全部を受け取れる便利な型**です。([Zenn][1])

まずは `Card.tsx` に、型定義だけ書いてみましょう ✍️

```tsx
// src/components/Card.tsx
import type { ReactNode } from "react";

type CardProps = {
  title: string;
  children: ReactNode;
};
```

ここまでで、

* `CardProps` という **Props の形（型）**
* `children` という名前のプロパティがあり、
* その型は `ReactNode`

という準備ができました 🧩

---

## 4️⃣ `Card` コンポーネント本体を書く ✨

次に、`Card` コンポーネントそのものを書いていきます。

この章ではまだ **「Props の分割代入」**（`({ title })` って書くやつ）は次の章でやるので、
いったん素直に `props.title` / `props.children` と書きます 👀

```tsx
// src/components/Card.tsx
import type { ReactNode } from "react";

type CardProps = {
  title: string;
  children: ReactNode;
};

export const Card = (props: CardProps) => {
  return (
    <section className="card">
      <h2 className="cardTitle">{props.title}</h2>
      <div className="cardBody">{props.children}</div>
    </section>
  );
};
```

### ここでやっていること 📝

* `Card` は **`CardProps` 型の `props` を受け取る関数**として定義
* `<h2>` の中で `props.title` を表示
* `<div className="cardBody">` の中に `props.children` をそのまま表示
* `export const Card = ...` にしておくことで、
  別ファイル（`App.tsx` など）から `import` して使えるようになる

`children` は **特別な名前の Props** で、
親コンポーネントが `<Card>...ここ...</Card>` の「...ここ...」の部分を渡してくれます 🌟([LogRocket Blog][2])

---

## 5️⃣ ちょっとだけ見た目を整える（お好みで）🎨

まだスタイリングの章は後でやりますが、
「なんにも装飾がないと味気ない…😢」という人向けに、
とりあえずサクッと簡単な CSS だけ書いておきます。

`src/index.css` など、全体に効いている CSS ファイルに、次を足してみてください。

```css
.card {
  border: 1px solid #ddd;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 16px;
  background-color: #fff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.04);
}

.cardTitle {
  margin: 0 0 8px;
  font-size: 1.1rem;
  font-weight: 600;
}

.cardBody {
  font-size: 0.95rem;
  line-height: 1.6;
}
```

これで、ちょっと「それっぽいカード」になります ✨
（デザインはあとでいくらでも変えられるので、今は「動くこと」が最優先でOK！）

---

## 6️⃣ `App.tsx` から使ってみよう 🚀

今度は `App.tsx` で、作った `Card` を実際に使ってみます。

`src/App.tsx` を開いて、こんな感じに書き換えてみてください。

⚠️ すでに何か書いてある場合は、いったん全部消してから貼ってOKです。

```tsx
// src/App.tsx
import "./App.css";
import { Card } from "./components/Card";

function App() {
  return (
    <main style={{ maxWidth: 480, margin: "24px auto", padding: "0 16px" }}>
      <h1>カード部品の練習 ✨</h1>

      <Card title="今日やること">
        <ul>
          <li>React の勉強 💻</li>
          <li>大学の課題 ✏️</li>
          <li>推しチェック 👀</li>
        </ul>
      </Card>

      <Card title="メモ">
        <p>明日はカフェで勉強会 ☕️📚</p>
      </Card>

      <Card title="ひとこと">
        <p>React は慣れてくるとめっちゃ楽しいよ〜 ✨</p>
      </Card>
    </main>
  );
}

export default App;
```

### 動作チェック ✅

1. すでに `npm run dev` を動かしている場合 → ブラウザをリロード 🔁
2. まだなら、ターミナルで

   ```bash
   npm run dev
   ```

   を実行して、表示された URL（たぶん `http://localhost:5173` みたいなやつ）をブラウザで開く

カードが 3 つ並んでいれば成功です 🎉

---

## 7️⃣ `children` を使うと何がうれしいの？🤔

![Card Container](./picture/react_study_025_card_container.png)


今回の `Card` コンポーネントは、中身をぜんぶ `props.children` に任せています。

```tsx
<div className="cardBody">{props.children}</div>
```

このおかげで、親コンポーネント側では

* `<ul>...</ul>` を入れてもいいし
* `<p>...</p>` でもいいし
* もっと複雑なレイアウトを入れてもいいし
* なんなら別のコンポーネントを丸ごと入れてもOK

という **「めちゃ自由度の高い入れ物」** が作れます 📦✨

`children` の型を `ReactNode` にしてあるので、
React が表示できるほとんど全部を受け取れる、
**万能コンテナ** みたいなカードになっているわけです 🌈([Zenn][1])

---

## 8️⃣ ミニ応用：`children` を入れ忘れたらどうなる？🧐

今回の型定義では

```ts
children: ReactNode;
```

と書いているので、`children` は **必須** です。

もし `App.tsx` でこんなふうに書くと…

```tsx
// ❌ children なしの Card
<Card title="からっぽのカード" />
```

TypeScript がちゃんとエラーを出してくれます 🧠✨

> `"Card" 型には "children" が必要ですよ〜`

みたいなメッセージが出たら、「あ、`children` 渡し忘れてる！」と気づけるので安心ですね 🥰

※ もし「中身がないカードもアリ」にしたくなったら、
`children?: ReactNode;`（`?` をつける）にすると、**「あってもなくてもOK」** になります。

---

## 9️⃣ この章のまとめ 🌸

* `children` は、`<Card>ここ</Card>` の「ここ」の部分を受け取る **特別な Props**
* `children` の型には **`ReactNode`** を使うのが定番
  → 文字列・数値・別のコンポーネントなど、いろいろ受け取れて便利 🎁([LogRocket Blog][2])
* 今回は `CardProps` を自分で定義して、
  `title` と `children` を型付きで受け取るコンポーネントを作った
* `children` を使うことで、
  **「枠（見た目）は Card 側で決めて、中身は親側が自由に決める」** というパターンが実現できた✨

---

## 🔟 おまけ練習（時間があれば）💪

時間や気力に余裕があれば、こんなアレンジもやってみてね 🧪

1. `Card` に `footerText: string` という Props を追加して、

   * カードのいちばん下に小さくフッター文字を出す
   * 例：`footerText="最終更新: 2025-11-26"` みたいな感じ

2. `children` の中で、絵文字をいっぱい使ってみる
   → テキストだけのカードと、リッチなカードの見た目の違いを楽しんでみてね ✨

3. `children` をわざと `<strong>` だけにしてみる、`<img>` を入れてみる など、
   「いろんな中身」がちゃんと表示されるか試してみる 🔍

---

次の **第26章** では、
今回書いた `props.title` / `props.children` を、
もっとスッキリ書けるように **「Props の分割代入」** にチャレンジしていきます 💖

[1]: https://zenn.dev/msy/articles/e21e729eb0727d?utm_source=chatgpt.com "Reactの\"要素の型\"、それぞれの特性理解していますか？"
[2]: https://blog.logrocket.com/react-children-prop-typescript/?utm_source=chatgpt.com "Using the React children prop with TypeScript"
