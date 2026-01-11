# 第153章：`render` と `screen`
**React Testing Library の `render` と `screen`** を使って、

> 「コンポーネントをテストの世界に連れてきて、画面上の要素を探す」

ところまでやってみます 🧪✨

---

## 1️⃣ 今日やることざっくり

この章でゴールにしたいことはこんな感じです👇

* `render` が「テスト用ブラウザにコンポーネントを映す」役目だとわかる 👀
* `screen` が「今映っている画面から要素を探す道具箱」だとわかる 🧰
* `render` ➜ `screen.getBy...` ➜ `expect(...)` の流れで
  **超シンプルなテストを書けるようになる** ✅

環境としては、

* Vite + React + TypeScript プロジェクト
* Vitest ＋ React Testing Library（＋ jsdom）

がすでに入っている前提で進めます（前の章でやった想定です）🧡
Vitest が jsdom という「ブラウザもどき」を作ってくれて、
React Testing Library がそこにコンポーネントを描画してくれます。([vitest.dev][1])

---

## 2️⃣ `render` の役割：テスト用ブラウザに「映す」🎬

## 1) render() と screenのイメージ

![Render Screen](./picture/react_study_153_render_screen_visual.png)

### 🧪 テストでは「別のブラウザ」を使っているイメージ

本物のブラウザでは、

* React が `root` 要素にコンポーネントを描画して
* ユーザーがクリックして…

という流れでしたよね。

**テストでは、React Testing Library の `render` 関数**を使って、
「テスト用 DOM（jsdom）」の中にコンポーネントを描画します。([testing-library.com][2])

> 「`render` を呼ぶ＝テスト専用ブラウザに画面を開く」

みたいなイメージでOKです ✨

---

### 🧪 `render` の基本的な使い方

コンポーネントをテストの世界に呼び出すコードはこんな感じです。

```ts
import { render } from '@testing-library/react';
import { MyComponent } from './MyComponent';

render(<MyComponent />);
```

これだけで、

* テスト用の `document.body` の中に
* `<MyComponent />` が「本物のブラウザ風」に描画されます。([testing-library.com][2])

`render` は実は「戻り値」も返していて、そこには

* `container`（描画された DOM）
* `rerender`（同じ場所に描画し直す）
* `unmount`（消す）
* 各種 query（`getByText` など）

が入っています。([testing-library.com][3])

でも **React Testing Library の公式推しスタイル**は、
この戻り値をあまり使わず、代わりに `screen` を使うやり方です ✅

---

## 3️⃣ `screen` の役割：「今の画面」から要素を探す 🕵️‍♀️

### 🧰 `screen` は「テスト画面のリモコン」

`screen` は、テスト中の「画面（DOM）」に対して

* `getByText`
* `getByRole`
* `findBy...`
* `queryBy...`

など、**要素を探すための関数をまとめて持っているオブジェクト**です。([testing-library.com][4])

よくある書き方はこれ：

```ts
import { render, screen } from '@testing-library/react';

render(<MyComponent />); // まず画面に映す

// そのあと、screen から要素を探す
const button = screen.getByRole('button', { name: '送信' });
```

ポイント 💡

* `render` が **「画面を映す人」**
* `screen` が **「映った画面から要素を探す人」**

という役割分担になっています。

---

### 🌟 なんで `screen` を使うの？

`render` の戻り値から `getByText` などを取り出すこともできますが、
公式ドキュメントでは **`screen` を使うスタイルをおすすめ**しています。([testing-library.com][3])

理由イメージはこんな感じ👇

* `screen` は常に「**今テスト中の画面**」を見ている
* テストコードが **「人間の目線」に近い**

  * 「画面から探す」という読み方になって自然
* どの `render` の戻り値かを意識しなくていいのでシンプル

> 「とりあえず `render` と `screen` のセットで書く」
> これを体にしみこませるのが、この章の目的です ✨

---

## 4️⃣ ミニコンポーネントをテストしてみる ✍️

ここからは、**実際にファイルを作るイメージ**で進めます。

### 🧩 1. テスト対象のコンポーネントを用意

`src/components/Hello.tsx` を作る想定で書きます。

```tsx
// src/components/Hello.tsx
export const Hello = () => {
  return <h1>こんにちは React テスト 👋</h1>;
};
```

とてもシンプルなコンポーネントですね 😌
`<h1>` 見出しを 1 個表示しているだけです。

---

### 🧪 2. テストファイルを作成する

次に、同じフォルダにテストファイルを作ります。
ファイル名は `Hello.test.tsx` とします。

```tsx
// src/components/Hello.test.tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Hello } from './Hello';

describe('Hello コンポーネント', () => {
  it('見出しが表示される', () => {
    // 1. Arrange（準備）：コンポーネントをテスト用DOMに描画
    render(<Hello />);

    // 2. Act（操作）：今回は特になし（クリックなどしない）

    // 3. Assert（確認）：見出しが画面にあるかチェック
    const heading = screen.getByRole('heading', {
      name: 'こんにちは React テスト 👋',
    });

    expect(heading).toBeInTheDocument();
  });
});
```

ポイントを一緒に整理してみましょう 📝

---

### 🧠 コードの中身を分解してみる

#### ✅ `describe` / `it` / `expect`

Vitest が用意してくれる「テストを書くための関数」です。([vitest.dev][1])

* `describe('Hello コンポーネント', () => { ... })`

  * テストのグループ（「このコンポーネントのテスト集」みたいな感じ）
* `it('見出しが表示される', () => { ... })`

  * 実際の 1 つのテストケース
* `expect(...).toBeInTheDocument()`

  * 「◯◯であってほしい」という期待（アサーション）
  * `toBeInTheDocument` は `@testing-library/jest-dom` で追加される便利マッチャーです([Zenn][5])

#### ✅ `render(<Hello />);`

* React Testing Library の `render` で
* `Hello` コンポーネントを **テスト用の DOM に描画**しています。([testing-library.com][2])

これを呼ばないと、当然 `screen` は何も見つけられません。

#### ✅ `screen.getByRole('heading', { name: '...' })`

* `screen.getByRole` は「指定したロール（役割）の要素」を探す関数です。
* `role: 'heading'` で `<h1>`〜`<h6>` を対象にしつつ、
* `name: 'こんにちは React テスト 👋'` という「見出しとして読めるテキスト」で絞り込みます。([testing-library.com][4])

> 「人間が画面を読むときに、どんな風に見えるか」に近い探し方をしようね、
> というのが Testing Library の大事な考え方です 🌱([testing-library.com][4])

---

### 🖥️ 3. テストを実行してみる

プロジェクトのルートで、ターミナル（PowerShell でも OK）から：

```bash
npm run test
```

または

```bash
npx vitest
```

を実行すると、`Hello.test.tsx` が実行されて、
テスト結果が表示されるはずです ✅

Vitest にはブラウザ UI で結果を見られる `--ui` オプションもありますが、
それはまたテスト環境回りの章でゆっくり触れましょう。([KENTEM TechBlog][6])

---

## 5️⃣ `render` と `screen` の関係を図でイメージする 🎨

テストの流れを Mermaid で図にしてみますね。

```mermaid
flowchart LR
  A["テストコード<br/>Hello.test.tsx"] --> B["render(<Hello />)"]
  B --> C["jsdom の document.body<br/>に Hello を描画"]
  C --> D["screen オブジェクト"]
  D --> E["screen.getByRole<br/>'heading' を探す"]
  E --> F["expect(...).toBeInTheDocument()"]
```

ざっくりいうと、

1. テストコードが `render` を呼ぶ
2. `render` がテスト用 DOM（jsdom）にコンポーネントを描画
3. `screen` が「今の DOM 全体」を見て、`getBy...` で要素を探す
4. 見つけた要素に対して `expect` でチェック

という「4ステップの流れ」になっています ✨

![renderとscreenのイメージ](./picture/react_study_153_render_screen.png)

---

## 6️⃣ よくあるつまずきポイント 😵‍💫

### 🐣 ケース1：`screen.getByText` がエラーになる

> `Unable to find an element with the text: ...`

みたいなエラーが出たときは、まずここをチェック👇

* 本当にそのテキストが画面に出ている？

  * 全角・半角・スペース・絵文字の違いなど
* `<h1>` ではなく別タグにしていない？
* `render` を呼ぶ前に `screen.getBy...` していない？

`screen.debug()` を一度使ってみると、
「今テスト上でどういう HTML が描画されているか」を表示できて便利です。([Cybozu Inside Out | サイボウズエンジニアのブログ][7])

```ts
render(<Hello />);
screen.debug(); // コンソールに今のDOMがドーンと出る
```

---

### 🐣 ケース2：`render` をインポートし忘れた

テストの先頭で

```ts
import { render, screen } from '@testing-library/react';
```

を入れ忘れると当然エラーになります。
補完が効いているはずなので、VS Code に頼りまくってOKです 💻✨

---

### 🐣 ケース3：`toBeInTheDocument` が型エラーになる

TypeScript 的には、

> Property 'toBeInTheDocument' does not exist on type 'Assertion'

みたいなエラーになることがあります。
この場合は、**Vitest のセットアップファイルで**

* `@testing-library/jest-dom/vitest` をちゃんと import しているか
* そのファイルを `vitest.config.ts` の `setupFiles` に設定しているか

を確認してみてください。([Qiita][8])

（このあたりはテスト環境の章でしっかりやる想定です〜）

---

## 7️⃣ まとめ＆ミニ課題 🎓

### 🌈 今日のまとめ

* `render`
  👉 コンポーネントを **テスト用 DOM（jsdom）** に描画する関数
* `screen`
  👉 「今の画面」から要素を探すための **道具箱オブジェクト**
* パターンとしては

  1. `render(<Component />);`
  2. `const el = screen.getByRole(...)` や `screen.getByText(...)`
  3. `expect(el).toBeInTheDocument();`

  という流れでテストを書くのが定番スタイル 💃([testing-library.com][3])

---

### 🏋️‍♀️ ミニ課題（やってみよう！）

時間があれば、こんな練習をしてみてください 💪

1. **「ボタンだけ」のコンポーネントを作る**

   * ファイル名：`src/components/SimpleButton.tsx`
   * 中身：`<button>ログイン</button>` だけ

2. そのコンポーネントに対して、テストを書く

   * `render(<SimpleButton />);`
   * `screen.getByRole('button', { name: 'ログイン' })` で探す
   * `expect` で存在チェック

3. 余裕があったら…

   * ボタンのラベルを別の文字に変えて、
   * テストが失敗 ➜ ラベルを直す ➜ テストが成功
     というサイクルを体験してみてください 🌀

---

次の章では、`getBy...` / `findBy...` / `queryBy...` の違いを見ていきます。
`render` ＋ `screen` のペアは、これからずーっと使う大事な相棒なので、
今のうちに「なんとなく手が自然に動く」くらいまで慣れていきましょ〜 🧡

[1]: https://vitest.dev/guide/?utm_source=chatgpt.com "Getting Started | Guide"
[2]: https://testing-library.com/docs/react-testing-library/api/?utm_source=chatgpt.com "API"
[3]: https://testing-library.com/docs/react-testing-library/cheatsheet/?utm_source=chatgpt.com "Cheatsheet"
[4]: https://testing-library.com/docs/queries/about/?utm_source=chatgpt.com "About Queries"
[5]: https://zenn.dev/takubii/articles/eded24be6a41a3?utm_source=chatgpt.com "ReactにVitestを追加してテスト環境を整備する方法"
[6]: https://tech.kentem.jp/entry/2024/08/06/090000?utm_source=chatgpt.com "Vite × Vitest × React Testing Library環境構築"
[7]: https://blog.cybozu.io/entry/2022/08/29/110000?utm_source=chatgpt.com "実装例から見る React のテストの書き方 - Cybozu Inside Out"
[8]: https://qiita.com/mziyut/items/dfaeb4b05befab7da673?utm_source=chatgpt.com "Remix プロジェクトに Vitest を導入する #TypeScript"
