# 第86章：【フック】`useMemo`

---

#### 🎯 この章のゴール

この章では、

* `useMemo` が「何をしてくれるフック」なのか
* どんなときに使うと嬉しいのか
* TypeScript と一緒にどう書くのか

を、**重たい計算の例**を使いながら身につけます 💪

---

## 1️⃣ そもそも `useMemo` ってなに？🤔

一言でいうと…

> **「同じ計算を何度もやらずに、前の結果を覚えておいてくれるフック」** です。

React のコンポーネントは、State が変わるたびに**関数がもう一度呼ばれ**ます。
その中で

* 時間がかかる計算（配列をガッツリ集計したり）
* 大きなデータを `.filter()` / `.map()` / `.sort()` しまくる処理

を**毎回ゼロからやり直している**と、アプリがモッサリしてきます 🐢💤

そこで登場するのが `useMemo` ✨

> 「この計算は、**特定の値が変わったときだけ**やり直してね」

と React にお願いするイメージです。

---

## 2️⃣ イメージ図：`useMemo` の働き 🧩

![useMemoイメージ](./picture/react_study_086_usememo.png)

「入力データが変わった時だけ計算し直して、それ以外は前回の結果を再利用する」イメージを図にしてみます 👀

```mermaid
graph LR;
  A["入力データ<br/>（props や state）"] --> B["useMemo フック<br/>useMemo(() => 計算, [依存配列])"];
  B --> C["計算結果（キャッシュ済みの値）"];
  C --> D["コンポーネントの表示<br/>JSXに使われる"];

  A -->|値が変わったときだけ| B;
  B -->|依存が変わらなければ<br/>前回の結果を再利用| C;
```

* **依存配列（`[dep1, dep2]`）が変わったときだけ** ➜ 計算をやり直す
* 変わっていないとき ➜ **前回の結果（キャッシュ）をそのまま使う**

こうして「重たい計算のやり直し」を減らしてくれます 🥳

---

## 3️⃣ 基本の書き方 📝

まずはシグネチャをサクッと👇

```tsx
import { useMemo } from "react";

const result = useMemo(
  () => {
    // ここで「重たい計算」をする
    return 計算結果;
  },
  [依存する値1, 依存する値2] // ← この値が変わったときだけ再計算
);
```

ポイントはこの2つだけ👇

1. 第1引数：**計算を行う関数**（`() => {...}`）
2. 第2引数：**「この値が変わったら計算し直してね」リスト（依存配列）**

---

## 4️⃣ 例：重たい合計計算を `useMemo` で軽くする 💸

### 💥 まずは「ダメな例」（毎回計算しちゃう）

例えば「商品リストの合計金額」を計算するコンポーネントを考えます。

```tsx
import { useState } from "react";

type Item = {
  id: number;
  name: string;
  price: number;
};

const itemsMaster: Item[] = [
  { id: 1, name: "ノートPC", price: 120000 },
  { id: 2, name: "マウス", price: 2000 },
  { id: 3, name: "キーボード", price: 8000 },
];

export function ShoppingExample() {
  const [quantity, setQuantity] = useState(1);
  const [keyword, setKeyword] = useState("");

  // ❌ ここが毎回ゼロから計算される
  const filteredItems = itemsMaster.filter((item) =>
    item.name.includes(keyword)
  );

  const totalPrice = filteredItems.reduce((sum, item) => {
    // わざと重い処理っぽくループを書く（イメージ）
    for (let i = 0; i < 1_000_000; i++) {
      // なにか重たい計算…と仮定
    }
    return sum + item.price * quantity;
  }, 0);

  return (
    <div>
      <h2>ショッピング例 🛒</h2>

      <div>
        <label>
          検索：
          <input
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
          />
        </label>
      </div>

      <div>
        <label>
          個数：
          <input
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(Number(e.target.value))}
          />
        </label>
      </div>

      <p>合計金額：{totalPrice.toLocaleString()} 円</p>
    </div>
  );
}
```

このコードだと、

* `keyword` が変わるたび
* `quantity` が変わるたび

**毎回 `filteredItems` と `totalPrice` が最初から計算されます** 🥲
データが増えると、どんどん重たくなります。

---

### ✅ `useMemo` で「合計計算だけ」覚えさせる

ここで「合計金額の計算は重いから、必要な時だけやり直そう！」
という感じで `useMemo` を使います ✨

```tsx
import { useMemo, useState } from "react";

type Item = {
  id: number;
  name: string;
  price: number;
};

const itemsMaster: Item[] = [
  { id: 1, name: "ノートPC", price: 120000 },
  { id: 2, name: "マウス", price: 2000 },
  { id: 3, name: "キーボード", price: 8000 },
];

export function ShoppingExample() {
  const [quantity, setQuantity] = useState(1);
  const [keyword, setKeyword] = useState("");

  // これはそこまで重くないので、まずはそのままでもOK
  const filteredItems = useMemo(
    () =>
      itemsMaster.filter((item) => item.name.includes(keyword)),
    [keyword]
  );

  // 🔥 重たい合計計算を useMemo でラップ！
  const totalPrice = useMemo(() => {
    console.log("💡 合計金額を再計算します");

    return filteredItems.reduce((sum, item) => {
      // 重めの処理があると仮定
      for (let i = 0; i < 1_000_000; i++) {
        // なにかゴニョゴニョ…
      }
      return sum + item.price * quantity;
    }, 0);
  }, [filteredItems, quantity]); // ← これらが変わった時だけ計算し直す

  return (
    <div>
      <h2>ショッピング例 🛒</h2>

      <div>
        <label>
          検索：
          <input
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
          />
        </label>
      </div>

      <div>
        <label>
          個数：
          <input
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(Number(e.target.value))}
          />
        </label>
      </div>

      <ul>
        {filteredItems.map((item) => (
          <li key={item.id}>
            {item.name}：{item.price.toLocaleString()} 円
          </li>
        ))}
      </ul>

      <p>合計金額：{totalPrice.toLocaleString()} 円</p>
    </div>
  );
}
```

ここで大事なのは依存配列👇

```ts
[filteredItems, quantity]
```

* 商品リスト（`filteredItems`）が変わったとき
* 個数（`quantity`）が変わったとき

**だけ** 合計金額を再計算します。
それ以外の State が変わっても、前回の合計金額をそのまま再利用します ✅

---

## 5️⃣ TypeScript と `useMemo` の型づけ 🎓

`useMemo` は TypeScript とめちゃくちゃ相性が良いです。

### 🔹 型は基本「推論におまかせ」でOK

さっきの `totalPrice` の例、型を書かなかったのに、
VS Code はちゃんと `number` と認識してくれます。

```ts
const totalPrice = useMemo(() => {
  // ...
  return 123; // ← number
}, [依存配列]);
// totalPrice は number 型として推論される
```

多くの場合は、**わざわざ `<number>` と書かなくてもOK** です 👍

---

### 🔹 明示的に型を書くパターンも覚えておこう

たとえば「配列を返したいけど、型をハッキリさせたい」とき👇

```tsx
type User = {
  id: number;
  name: string;
};

const allUsers: User[] = [
  { id: 1, name: "Alice" },
  { id: 2, name: "Bob" },
];

export function UserList({ keyword }: { keyword: string }) {
  const filteredUsers = useMemo<User[]>(() => {
    return allUsers.filter((user) => user.name.includes(keyword));
  }, [keyword]);

  // filteredUsers は User[] として扱える
  return (
    <ul>
      {filteredUsers.map((user) => (
        <li key={user.id}>{user.name}</li>
      ))}
    </ul>
  );
}
```

`useMemo<返り値の型>` という形で書ける、というのを
頭の片隅に置いておけばOKです 🧠✨

---

## 6️⃣ 依存配列のコツ：なにを入れればいいの？🧩

**ルールはシンプル** です👇

> 「`useMemo` の中で使っている **外側の値** を、全部依存配列に入れる」

例えば 👇

```tsx
const totalPrice = useMemo(() => {
  return filteredItems.reduce((sum, item) => {
    return sum + item.price * quantity;
  }, 0);
}, [filteredItems, quantity]);
```

この関数の中で使っている「外側の変数」は…？

* `filteredItems`
* `quantity`

なので、その2つを依存配列に入れています ✅

> もし入れ忘れると、「値は変わってるのに計算結果が古いまま」という
> バグの原因になるので要注意です ⚠️

---

## 7️⃣ `useMemo` の使いすぎ注意！🚫💊

`useMemo` は便利なんですが、**なんでもかんでも付ければいい**
というわけではありません。

### ❌ よくあるやりがちパターン

* 全然重くない計算にまで `useMemo` を付ける
* 見た目の「なんとなくキレイさ」のためだけに使う

実は `useMemo` 自体にも **すこしコスト** がかかります。
なので、

* 配列がめちゃくちゃ大きい
* 毎回同じ計算をしていて、明らかに無駄
* 実際に「なんかカクつくな…」と感じるレベル

みたいな**重たい処理に絞って**使うのがコツです 🎯

> 💡 この辺りの「使いどころ」は
> 第88章（`useMemo` と `useCallback`、いつ使うの？）で
> もう少しじっくりやります！

---

## 8️⃣ `useMemo` と他のメモ化との関係🧠

ここまでで出てきたキーワードを整理しておきます👇

* `React.memo`
  ➜ 「**コンポーネント** の結果」を覚えておく

* `useCallback`
  ➜ 「**関数** そのもの」を覚えておく

* `useMemo`
  ➜ 「**計算した値**（配列・オブジェクト・数値など）」を覚えておく

どれも「**前の結果を覚えておいて、ムダな処理を減らす**」仲間たちです。

---

## 9️⃣ ミニ演習 ✍️（手を動かして覚えよう）

最後に、小さな課題を2つ出します 📝

### 🧪 演習1：重たいフィルターを `useMemo` に

1. 1万件くらいのダミーデータ（`id` と `name` を持つユーザー配列）を作る
2. `keyword` で `.filter()` して画面に表示するコンポーネントを書く
3. 最初は `useMemo` を使わずに実装してみる
4. そのあとで `useMemo` を使って

   * 「フィルター済みの配列」をメモ化してみる

キーボード入力のカクカク具合が変わるか、試してみてください 👀

---

### 🧪 演習2：合計点を `useMemo` で計算

1. `scores` という配列の State を用意する（例：各教科の点数）
2. 各教科の点数を入力できるフォームを作る
3. 合計点（`totalScore`）を `reduce` で計算する
4. 合計点の計算部分を `useMemo` でラップしてみる
5. 依存配列に何を入れるべきか、自分で考えてみる ✨

---

## 🔚 まとめ

この章で覚えておきたいこと💡

* `useMemo` は **「重たい計算結果を覚えておく」フック**
* 依存配列に入れた値が変わったときだけ、計算をやり直す
* TypeScript とは相性バツグンで、型推論に任せてOKなことが多い
* なんでもかんでも使うのではなく、**本当に重たい処理だけ**に使うのがコツ

次の第87章では、ここで学んだ `useMemo` を使って
**実際に「重たい計算をスキップする」練習問題**を解いていきます 💻✨

おつかれさま〜！ここまで読めたあなたは `useMemo` マスターへの第一歩です 🧠🚶‍♀️💨
