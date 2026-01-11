# 第82章：`React.memo`
パフォーマンス系の話だけど、やること自体はけっこうシンプルなので、リラックスしてついてきてね 🧋

---

## 82-1 🎯 今日のゴール

この章のゴールはざっくりこの3つです：

1. `React.memo` が「何をしてくれる道具」なのか説明できる
2. TypeScript つきのコンポーネントに、自然な形で `React.memo` をつけられる
3. 「どんなときに使うとおいしいか」をイメージでつかめる

---

## 82-2 💡 `React.memo` ってなに？

**一言で言うと：**

> 「同じ Props なら、そのコンポーネントもう一回描かなくていいよ〜」って React に教えるオプション

です。

通常、React は

* 親コンポーネントが再レンダリング
  ↓
* その下にぶら下がっている子コンポーネントたちも、基本ぜんぶ再レンダリング

という動きをします。

そこで **`memo`（`React.memo`）** の出番。
コンポーネントを `memo` で包むと、

* **Props が前回と同じなら** → 再レンダリングをスキップ
* **Props が変わっていれば** → ちゃんと再レンダリング

みたいな動きをしてくれます。([React][1])

> 📝 公式ドキュメントでも「`memo` はパフォーマンス最適化のためのオプションであり、『動く・動かない』を決めるものではない」と書かれています。([React][1])

---

## 82-3 🧪 まずは「メモ化なし」のコンポーネント

小さなサンプルで、`memo` あり・なしの違いを見てみましょう 👀

### 👇 やりたいこと

* 親コンポーネント：カウンター + 名前入力
* 子コンポーネント：`name` だけを表示する「自己紹介カード」

カウンターだけ増やしているのに、**自己紹介カードも毎回レンダリングされちゃう**様子を `console.log` で観察します。

#### `App.tsx`（まだ `memo` なし）

```tsx
import { useState } from "react";

type ProfileProps = {
  name: string;
};

function Profile({ name }: ProfileProps) {
  console.log("👧 Profile がレンダリングされました");
  return <p>こんにちは、{name} さん！</p>;
}

export function App() {
  const [count, setCount] = useState(0);
  const [name, setName] = useState("りん");

  console.log("🧑‍💻 App がレンダリングされました");

  return (
    <div style={{ padding: "1rem" }}>
      <h1>React.memo の練習 ✨</h1>

      <section style={{ marginBottom: "1rem" }}>
        <h2>カウンター</h2>
        <p>クリック回数: {count}</p>
        <button onClick={() => setCount((prev) => prev + 1)}>
          1 増やす
        </button>
      </section>

      <section style={{ marginBottom: "1rem" }}>
        <h2>名前入力</h2>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="お名前を入力"
        />
      </section>

      <section>
        <h2>自己紹介カード</h2>
        <Profile name={name} />
      </section>
    </div>
  );
}
```

この状態で

* カウンターのボタンだけポチポチすると…

👉 コンソールには **`App` も `Profile` も毎回ログが出る** はずです。

> 「`name` 変えてないのに `Profile` まで動くの、ちょっともったいないよね？」
> → ここを **`React.memo`** で改善していきます 🚀

---

## 82-4 🧊 `React.memo` で子コンポーネントを「おとなしく」させる

### ✅ 基本の書き方（TypeScript 版）

```ts
import { memo } from "react";

type Props = { /* ここは普通に props の型 */ };

const MyComponent = memo(function MyComponent(props: Props) {
  // ...
});
```

* `memo` は **元のコンポーネントを変更しない** で、

  * 「メモ化された新しいコンポーネント」を返してくれます。([React][1])
* TypeScript 的には、**`Props` の型がちゃんと引き継がれる** ので相性バッチリです 💘

### 🔁 さっきの `Profile` をメモ化してみる

`Profile` を `memo` で包んでみましょう。

```tsx
import { useState, memo } from "react";

type ProfileProps = {
  name: string;
};

const Profile = memo(function Profile({ name }: ProfileProps) {
  console.log("👧 Profile がレンダリングされました（memo 版）");
  return <p>こんにちは、{name} さん！</p>;
});

export function App() {
  const [count, setCount] = useState(0);
  const [name, setName] = useState("りん");

  console.log("🧑‍💻 App がレンダリングされました");

  return (
    <div style={{ padding: "1rem" }}>
      <h1>React.memo の練習 ✨</h1>

      <section style={{ marginBottom: "1rem" }}>
        <h2>カウンター</h2>
        <p>クリック回数: {count}</p>
        <button onClick={() => setCount((prev) => prev + 1)}>
          1 増やす
        </button>
      </section>

      <section style={{ marginBottom: "1rem" }}>
        <h2>名前入力</h2>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="お名前を入力"
        />
      </section>

      <section>
        <h2>自己紹介カード</h2>
        {/* 書き方はそのまま */}
        <Profile name={name} />
      </section>
    </div>
  );
}
```

この状態で

* 「カウンターだけ」ポチポチする

  * 👉 コンソールには **App だけログが出て、Profile のログは出なくなる** はず
* 「名前だけ」変える

  * 👉 `Profile` のログもちゃんと出る（Props の `name` が変わったから）

これが `React.memo` の基本的な働きです ✨

---

## 82-5 🧠 どんなときに `React.memo` を使う？

`memo` は「とりあえず全部につける」ものじゃなくて、**ここぞ！というところだけ** 使うのがポイントです。

### 🍰 向いている場面

* 親コンポーネントが**よく再レンダリングされる**
* でもその子コンポーネントの **Props はあまり変わらない**
* しかもその子コンポーネントの処理が **ちょっと重い（リストが大きい・計算が多い など）**

たとえば：

* 大量のカードを並べる「検索結果リスト」の **各アイテムコンポーネント**
* グラフ・チャートなど、描画コストが高いコンポーネント
* 「見た目だけ」の表示専用コンポーネント（Props が変わらないかぎり同じ表示）

---

## 82-6 ⚠️ `React.memo` の注意ポイント

### ① 状態・Context には効かないよ

`memo` が見ているのは **あくまで「Props」だけ** です。([React][1])

* 子コンポーネント自身が `useState` を持っていて state が変わった
* `useContext` で読んでいる Context の値が変わった

こういうときは、**`React.memo` していても普通に再レンダリング** されます。

### ② オブジェクト・配列・関数 Props は要注意

`memo` は、Props を **「浅く比較（shallow compare）」** しています。([React][1])

* `{ foo: 1 }` みたいなオブジェクト
* `[]` や `["a", "b"]` みたいな配列
* `() => {}` みたいな関数

これらは **「中身が同じでも、毎回新しく作り直していると別物扱い」** になります。

なので

```tsx
<Profile options={{ showBorder: true }} />
```

みたいに **JSX の中でオブジェクトを新しく作る書き方** をしていると、

* 毎回 `options` が「新しいオブジェクト」と見なされる
* → `React.memo` が効かなくなる

という落とし穴があります（このあたりは次の 83章・84章で `useCallback` などと一緒に見ていきます 🌟）。

---

## 82-7 🧬 React 19 と React Compiler の関係

React 19 以降は、**React Compiler** という「自動でいい感じに最適化してくれるコンパイラ」が入ってくる予定で、

> 「`React.memo` や `useMemo` / `useCallback` をあまり意識しなくてもよくなるよ〜」

という方向に進んでいます。([React][2])

でも、

* すべてのプロジェクトで React Compiler が **すぐに有効になるわけではない**
* 既存のコードやライブラリには、まだまだ **`React.memo` がたくさん出てくる**
* 一部のケースでは、**自分で `memo` を使ったほうがいい場面** も残る

ので、

> **「`React.memo` の考え方を知っておく」ことは、まだまだとても大事**

というスタンスで覚えておくと安心です 💪

---

## 82-8 🧭 Mermaid 図でイメージしてみよう

![Memo Barrier](./picture/react_study_082_memo_barrier.png)

`React.memo` がある場合 / ない場合のイメージを図にしてみます 🗺️

（`graph TD` は「上 → 下」の矢印の図、くらいに思っておけばOKです）

```mermaid
graph TD
  A[親コンポーネントが再レンダリング] --> B["子コンポーネント (普通のコンポーネント)"]
  A --> C["子コンポーネント (React.memo されたコンポーネント)"]

  B --> D[毎回レンダリングされる]

  C -->|Props が同じ| E[レンダリングをスキップ]
  C -->|Props が変わった| F[レンダリングされる]
```

* 左側：普通の子 → 親が動くたびに **一緒にレンダリング**
* 右側：`React.memo` 子 → **Props が変わったときだけ** レンダリング

というイメージです ✨

---

## 82-9 📝 ミニ練習問題

軽いアウトプットで、理解を定着させておきましょ〜 🐣

### 練習1：アイコンだけのボタンをメモ化してみる

1. `IconButton.tsx` というコンポーネントを作る

   * Props：`label: string` / `onClick: () => void`
2. `App.tsx` から `onClick` を渡して表示する
3. 最初は `React.memo` なしで作って、
4. そのあとで `memo` を import して、`IconButton` をメモ化してみる

> 「書き方が分からなかったら、さっきの `Profile` のコードをコピペして形だけマネしてOKです👌」

### 練習2：`console.log` で「本当に減ってるか」確認してみる

1. `IconButton` の中で `console.log("IconButton レンダリング")` を仕込む
2. 親で「別の state（例：カウンター）」を増やすボタンを追加
3. そのカウンターだけをポチポチしてみて、

   * `React.memo` 前：`IconButton` のログが毎回出る
   * `React.memo` 後：`IconButton` のログが出なくなる（はず！）

---

## 82章 まとめ 🍵

* `React.memo` は **「同じ Props なら再レンダリングしないでOK」** というパフォーマンス向上テク
* TypeScript とは相性よくて、**普通に Props の型をつけた関数コンポーネントを `memo` で包むだけ** でOK
* ただし、

  * state や Context の変化には効かない
  * オブジェクト・配列・関数 Props は「毎回新しく作らない」工夫が必要
* React 19 + React Compiler 時代でも、`React.memo` の考え方はまだまだ大事 💡

次の 83章では、
**「なんで関数やオブジェクトを Props に渡すと `React.memo` が効きにくいの？」**
というところを、`useCallback` とセットで見ていきます 🧠⚡️

[1]: https://react.dev/reference/react/memo?utm_source=chatgpt.com "memo"
[2]: https://react.dev/blog/2024/12/05/react-19?utm_source=chatgpt.com "React v19"
