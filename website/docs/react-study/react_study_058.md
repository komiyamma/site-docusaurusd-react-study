# 第58章：`useEffect` の「これを見張ってて」リスト

![依存配列のイメージ](./picture/react_study_058_dependency_array.png)

「`useEffect` はなんとなく分かったけど、カッコの横にあるあの `[]` ってなに？？🤔」
――この章は、その「ナゾのカッコ」、**依存配列（＝見張りリスト）**にフォーカスします。

---

## 🎯 この章のゴール

この章が終わるころには…

* `useEffect(() => { ... }, [ここ])` の **「[ここ] に何を書くか」** が分かる ✅
* 「いつ `useEffect` が実行されるか」を、自分でイメージできる ✅
* 「あ、これ依存配列に入れないとバグりそう💦」がなんとなく分かる ✅

を目指します ✨

---

## 1️⃣ 「見張りリスト（依存配列）」ってなに？📝

![CCTV Metaphor](./picture/react_study_058_cctv_metaphor.png)

`useEffect` の基本の形はこんな感じでした：

```tsx
import { useEffect } from "react";

useEffect(() => {
  // ここに「副作用」の処理を書く
});
```

ここに **「これを見張っておいてね」リスト** を渡せるのが、**依存配列（dependency array）** です。

```tsx
useEffect(() => {
  // 何かの処理
}, [count, keyword]);
```

* `[]` の中に入っている `count` や `keyword` が **「見張る対象」** です。
* React は、前回のレンダー時の `count` / `keyword` と、今回のレンダー時の値を比べます。
* **どれか1つでも変わっていたら** → `useEffect` の中身を実行します。([react.dev][1])

イメージとしては、

> 「この子たちの誰かが変化したら、またこのEffectを動かしてね」

という「監視カメラ」のリストだと思ってください 📹✨

---

## 2️⃣ いつ `useEffect` が動くの？図でイメージしよう 🎨

Mermaid でざっくり図にしてみます👇

```mermaid
graph LR
  A[コンポーネントが再レンダー] --> B{依存配列を比較}
  B -->|どれか1つでも変化| C["前回のクリーンアップを実行(あれば)"]
  C --> D[Effect本体を実行]
  B -->|全部同じ| E[Effectをスキップ]
```

ポイント💡

* **最初の1回（マウント時）** は、前回の値が存在しないので、基本的に実行されます。
* 2回目以降は、**前回の依存配列と今回の依存配列を、1つずつ比較** して、

  * どれか1つでも違ったら → クリーンアップ → Effect本体を実行
  * 全部同じだったら → スキップ

比較方法は `Object.is` という、ほぼ `===` と同じ比較を使っています。([react.dev][1])

---

## 3️⃣ 1つの値を見張る：カウンターで実験してみよう 🔢

まずは一番シンプルなパターンです。

### ✅ サンプル：`count` が変わったらだけログを出す

```tsx
import { useState, useEffect } from "react";

export function Counter() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    console.log(`count が変わりました！今の値: ${count}`);
  }, [count]); // 👈 「count を見張る」依存配列

  return (
    <div>
      <p>現在のカウント: {count}</p>
      <button onClick={() => setCount((prev) => prev + 1)}>
        1 増やす 👍
      </button>
    </div>
  );
}
```

このときの動きはこんな感じ👇

* 初回表示時（`count = 0`） → 実行（1回目）
* ボタンを押して `count = 1` → 実行（2回目）
* ボタンを押して `count = 2` → 実行（3回目）
* …という感じで、**`count` が変わるたびに** `useEffect` が走ります。([dhiwise.com][2])

逆に言うと、他の state だけが変わって `count` が変わらなかったら、**このEffectは動きません**。

---

## 4️⃣ 複数の値を見張る：検索フォームの例 🔍

今度は **複数の値を見張る** パターンです。

### ✅ サンプル：`keyword` or `page` が変わったら検索する（風）

```tsx
import { useState, useEffect } from "react";

type SearchResult = {
  id: number;
  title: string;
};

export function SearchBox() {
  const [keyword, setKeyword] = useState("React");
  const [page, setPage] = useState(1);
  const [results, setResults] = useState<SearchResult[]>([]);

  useEffect(() => {
    console.log("検索条件が変わったので、API を呼ぶイメージ ✨");
    console.log(`keyword = ${keyword}, page = ${page}`);

    // 実際のアプリではここで fetch などを書く
    // 今回はダミーデータにしておく
    const dummy: SearchResult[] = [
      { id: 1, title: `${keyword} の本 (ページ ${page})` },
      { id: 2, title: `${keyword} の入門記事 (ページ ${page})` },
    ];
    setResults(dummy);
  }, [keyword, page]); // 👈 両方を見張る

  return (
    <div>
      <h2>検索ボックス 🔎</h2>

      <div>
        <label>
          キーワード：
          <input
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
          />
        </label>
      </div>

      <div>
        <button onClick={() => setPage((p) => Math.max(1, p - 1))}>
          ← 前のページ
        </button>
        <span style={{ margin: "0 8px" }}>ページ: {page}</span>
        <button onClick={() => setPage((p) => p + 1)}>次のページ →</button>
      </div>

      <ul>
        {results.map((item) => (
          <li key={item.id}>📘 {item.title}</li>
        ))}
      </ul>
    </div>
  );
}
```

ここでは、

* `keyword` が変わる
* または `page` が変わる

どちらか一方でも変化したら、**Effect がもう一度走ります**。

> 「この中の誰かが変わったら検索やり直しね！」
> という感じです 🥰

---

## 5️⃣ 「変わったかどうか」はどう判定しているの？🧐

React は、依存配列の中を **1つずつ前回と今回で比較** しています。([react.dev][1])

* `number`, `string`, `boolean` みたいな**プリミティブ型**は、値が違えば「変わった」と判定。
* `object`, `array`, `function` などの**オブジェクト型**は、**参照（アドレス）が違えば変わった**と判定。

### ⚠️ ここでちょっと注意！

```ts
const obj1 = { value: 1 };
const obj2 = { value: 1 };

obj1 === obj2; // false（中身同じでも別オブジェクト）
```

React も同じように、依存配列の比較で

* `[{ value: 1 }]` （前回）
* `[{ value: 1 }]` （今回）

のように **新しく作り直されたオブジェクト** が入ってくると、
「中身が一緒でも別物」と見なして、Effect を毎回実行してしまいます。([Qiita][3])

---

## 6️⃣ オブジェクト・配列を依存配列に入れるときの例 😵‍💫

### ❌ あまりよくない例

```tsx
import { useState, useEffect } from "react";

export function BadExample() {
  const [value, setValue] = useState(0);

  useEffect(() => {
    const options = { multiplier: 2 };

    console.log("Effect 実行！", value * options.multiplier);
  }, [value, { multiplier: 2 }]); // 😱 ここで毎回新しいオブジェクトを作ってる

  return (
    <button onClick={() => setValue((v) => v + 1)}>
      クリック: {value}
    </button>
  );
}
```

`{ multiplier: 2 }` を直接依存配列に書いてしまうと、
**レンダーのたびに毎回新しい `{ multiplier: 2 }` が生成** されます。

→ つまり **毎回「変わった」と判定されてしまう** ので、`value` が変わってなくても Effect が走ることがあります 🥲

### ✅ よりよい書き方の例

```tsx
const multiplierOptions = { multiplier: 2 };

export function GoodExample() {
  const [value, setValue] = useState(0);

  useEffect(() => {
    console.log("Effect 実行！", value * multiplierOptions.multiplier);
  }, [value]); // 👈 ここは value だけでOK

  return (
    <button onClick={() => setValue((v) => v + 1)}>
      クリック: {value}
    </button>
  );
}
```

* 変わらないオプションは**コンポーネントの外に切り出す**のがコツです 🧩

---

## 7️⃣ よくあるミス＆「こう考えると楽」Tips 💡

### ❌ ミス1：依存配列を適当に空にしちゃう

```tsx
useEffect(() => {
  // state や props を使ってるのに…
}, []); // ← とりあえず [] にしちゃう
```

* こうすると、**中で使っている値が変わってもEffectは走りません**。
* そのため、**「古い値のまま動き続ける」＝バグ** の原因になりがちです。([dhiwise.com][2])

👉 基本ルールとしては：

> **Effect の中で使っている「React の値（state, props, コンポーネント内で宣言した関数・変数など）」は、ぜんぶ依存配列に書く**

と思っておくと安全です ✨
（詳しい話は後の章でやりますが、まずはこの直感でOK！）

---

## 8️⃣ ミニ演習 ✍️✨

ちょっと手を動かして、依存配列の「気持ち」をつかんでみましょう。

### 🎮 演習1：ドキュメントタイトルを `count` に合わせて変える

1. `Counter` コンポーネントを作る（さっきのサンプルをベースにしてOK）
2. `count` が変わるたびに `document.title = "カウント: X"` に書き換える
3. 依存配列は `[count]` にする

👉 ブラウザのタブのタイトルが、ボタンを押すたびに変わるはずです。

---

### 🎮 演習2：`keyword` だけを見張るバージョンを作る

1. さっきの `SearchBox` をコピーする
2. `page` を state から消して、依存配列も `[keyword]` だけにする
3. キーワードを変えたときだけ、Effect が動くようにしてみる

👉 「どの値を見張るか」を自分で決める練習です 💪

---

### 🎮 演習3：オブジェクトを入れてみて挙動を観察する

1. 適当なコンポーネントを作って、
2. 依存配列に `{ foo: 1 }` を直接書いた場合と、
3. コンポーネント外に `const config = { foo: 1 };` を置いて `[config]` にした場合で、
4. `console.log("effect!")` が何回出るか試してみる

👉 「参照が違うと毎回変わったとみなされる」という感覚をつかんでおきましょう 👀

---

## まとめ 🎀

この章で覚えておいてほしいことは、だいたいこの4つです：

* `useEffect` の第2引数の配列は、**「これを見張ってて」リスト（依存配列）** 📝
* React は、**前回と今回の依存配列を1個ずつ比較して、「変わったらEffect実行」「変わってなければスキップ」** している
* 数値や文字列は「値」が、オブジェクト・配列・関数は「参照」が変わるかどうかで判断される
* 基本は、**Effect の中で使っている React の値を、ちゃんと依存配列に書く** のが安全 ✅

次の章（第59章〜61章）では、

* `[]`
* `[state]`
* 依存配列なし

の3パターンを、それぞれ**具体的なコードと一緒にじっくり掘り下げて**いきます 🥳

ここまで来たあなたは、`useEffect` の半分くらいはもう理解できてます。
「見張りリスト」のイメージだけ、頭の片すみに置いておいてくださいね 🌸

[1]: https://react.dev/reference/react/useEffect?utm_source=chatgpt.com "useEffect"
[2]: https://www.dhiwise.com/post/understanding-the-importance-of-the-useeffect-dependency-array-in-react?utm_source=chatgpt.com "UseEffect Dependency Array: Best Practices For React ..."
[3]: https://qiita.com/honey32/items/62edf5165aced7d0c4bf?utm_source=chatgpt.com "【React】useEffect の標準動作は「依存配列の中身が変わると ..."
