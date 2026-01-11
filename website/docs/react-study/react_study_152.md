# 第152章：`Vitest` と `React Testing Library`

![Vitest Intro](./picture/react_study_152_vitest_intro_icon.png)

この章では、
**「Vite + React + TypeScript プロジェクトで、ちゃんとテストが動くところまで」** を目標にします 💪

---

### 🎯 この章のゴール

* Vitest が **何をしてくれる道具か** がわかる
* React Testing Library が **どのポジションの道具か** がわかる
* Vite プロジェクトで

  * 必要なパッケージをインストールして
  * 設定ファイルをちょこっと直して
  * 超シンプルなコンポーネントテストを **1つ動かせる** ようになる

---

## 1️⃣ Vitest と React Testing Library の役割イメージ 🧪🧩

まずはざっくり立ち位置から 👀

* **Vitest**

  * Vite と同じチームが作っている、**テストを実行するための「ランナー」**
  * 「どのファイルをテストとして読む？」「`test()` を順番に動かすよ〜」を担当
  * TypeScript と JSX を最初からサポートしていて、**Vite の設定をそのまま流用できる** のが強み 🏃‍♀️💨 ([vitest.dev][1])

* **React Testing Library（RTL）**

  * React コンポーネントを **ユーザー目線でテストするための道具**
  * `render()` でコンポーネントをテスト用の画面に出して、
    `screen.getByRole(...)` や `screen.getByText(...)` で要素を探すスタイルが特徴 ✨([testing-library.com][2])

* **jsdom**

  * Node.js 上に「なんちゃってブラウザ」を作ってくれるライブラリ
  * `document` や `window` がないと React コンポーネントは動けないので、その代わりをしてくれる子です 🌐([DEV Community][3])

---

## 2️⃣ 図で見る：テストが動く流れ 🧠⚙️

図解は Mermaid でいきます 🌊

```mermaid
flowchart LR
  Dev["あなた 👩‍💻"] -->|npm run test| Vitest["Vitest<br/>テストランナー"]
  Vitest -->|コンポーネントを呼び出す| RTL["React Testing Library<br/>render & screen"]
  RTL -->|DOMを使って描画| JSDOM["jsdom<br/>テスト用ブラウザ"]
  JSDOM -->|"結果(成功/失敗)"| Dev
```

ざっくり言うと：

1. あなたが `npm run test` を実行
2. **Vitest** がテストファイルを探して、順番に動かす
3. テストの中で **React Testing Library** がコンポーネントを `render()`
4. **jsdom** が「テスト用ブラウザ」として DOM を用意
5. 期待通りに表示されたら ✅、違ってたら ❌

…という感じのリレーになっています 🏃‍♀️🏃‍♂️💨

![VitestとRTLのイメージ](./picture/react_study_152_vitest_rtl.png)

---

## 3️⃣ セットアップ：必要なパッケージを入れよう 💿

前の章までで、すでに

* `npm create vite@latest` で作った **React + TypeScript** プロジェクト（`react-ts` テンプレートなど）
* `npm install` まで終わっている

という前提で進めますね 😊

### 3-1. 開発用パッケージをインストール 🎒

プロジェクトフォルダ（`package.json` がある場所）で、ターミナルを開いて 👇

```bash
npm install -D vitest jsdom \
  @testing-library/react \
  @testing-library/user-event \
  @testing-library/jest-dom
```

* `vitest` … テストランナー本体
* `jsdom` … テスト用ブラウザ環境
* `@testing-library/react` … React 用のテストユーティリティ
* `@testing-library/user-event` … クリックや入力など「ユーザー操作」を再現するため
* `@testing-library/jest-dom` … `toBeInTheDocument()` みたいな便利なアサーション（チェック用関数）([KENTEM TechBlog][4])

---

### 3-2. `package.json` にテスト用スクリプトを追加 📝

`package.json` を開いて、`"scripts"` の中にテスト用コマンドを追加します。

例えばこんな感じ：

```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "test": "vitest",
    "test:watch": "vitest --watch"
  }
}
```

* `npm run test` … 1回だけテストを実行
* `npm run test:watch` … ファイル変更を監視しながらテスト（開発中に超便利）([vitest.dev][5])

---

### 3-3. Vite に「テストの設定」を教える ⚙️

次に、**Vite の設定ファイル** に Vitest 用の設定を足します。

`vite.config.ts` を開いて、こんな感じにします：

> ※ すでに `react()` プラグインなどが書いてあると思うので、
> 「`test: { ... }` を追加するイメージ」で OK です 🙆‍♀️

```ts
/// <reference types="vitest" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/vitest.setup.ts'],
  },
})
```

ポイント ✨

* `environment: 'jsdom'`

  * テスト実行時に **jsdom を使うよ！** という宣言 ([Next.js][6])
* `setupFiles`

  * テストが始まる前に毎回読み込んでほしいファイルを指定
  * ここに **共通設定**（後で作る `vitest.setup.ts`）を書きます

---

### 3-4. `src/vitest.setup.ts` を作る 🧹

今度は、指定した **セットアップファイル本体** を作ります。

`src` フォルダの中に `vitest.setup.ts` を新規作成して、こう書きます👇

```ts
// src/vitest.setup.ts
import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterEach } from 'vitest'

// 各テストのあとに毎回、画面をお片付けする 🧹
afterEach(() => {
  cleanup()
})
```

* `@testing-library/jest-dom/vitest`

  * Vitest 用の import パスで、`expect(...).toBeInTheDocument()` などの便利メソッドを追加してくれます ([npm][7])
* `cleanup()`

  * 1つのテストが終わるたびに、前の DOM を片付けてくれます
  * これをしないと「前のテストの DOM が残っててエラーになる」ことがあるので、最初から入れておくと安心 🧘‍♀️([testing-library.com][8])

これで **テスト環境の下準備は完了** です 🎉

---

## 4️⃣ はじめてのコンポーネントテストを書いてみよう ✍️

いよいよ実際にテストを書いてみます。
ここでは、超シンプルな **挨拶コンポーネント** を例にします 👋

### 4-1. テスト対象のコンポーネントを作成 🌸

`src/components/Greeting.tsx` を作って、こんな感じに：

```tsx
// src/components/Greeting.tsx
type GreetingProps = {
  name: string
}

export function Greeting({ name }: GreetingProps) {
  return <h1>こんにちは、{name} さん！</h1>
}
```

* `GreetingProps` … 受け取るデータの「型」
* `Greeting` … `name` を受け取って、挨拶文を表示するだけの部品

---

### 4-2. テストファイルを作成 🧪

次に、同じフォルダにテストファイルを作ります。

ファイル名：`src/components/Greeting.test.tsx`

```tsx
// src/components/Greeting.test.tsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Greeting } from './Greeting'

describe('Greeting コンポーネント', () => {
  it('指定した名前で挨拶文を表示する', () => {
    // 1. コンポーネントをテスト用画面に描画
    render(<Greeting name="さくら" />)

    // 2. 画面の中から「こんにちは、さくら さん！」というテキストを探す
    const heading = screen.getByText('こんにちは、さくら さん！')

    // 3. その要素が実際に画面内に存在することをチェック
    expect(heading).toBeInTheDocument()
  })
})
```

#### ここで使っている主役たち ✨

* `render(<Greeting ... />)`

  * テスト用の画面にコンポーネントを 1 回だけ出す係

* `screen.getByText(...)`

  * 「画面の中（screen）から、テキストで要素を探す」関数
  * 見つからなかったら **テスト失敗** になるので、自然と「ちゃんと表示されてるか」のチェックになる

* `expect(heading).toBeInTheDocument()`

  * `@testing-library/jest-dom` が追加してくれる専用マッチャ
  * 「その要素が DOM の中にいるか？」を人間っぽい書き方で表現できて読みやすい 👀([testing-library.com][2])

---

## 5️⃣ テストを実行してみる 🚀

ここまで書けたら、いよいよ実行です！

プロジェクトフォルダでターミナルを開いて：

```bash
npm run test
```

* ✅ うまくいっていれば

  * `Greeting コンポーネント` のテストが 1 件パスして
  * 緑色の「passed」みたいなメッセージが出るはずです 🌈

* 続けて開発しながら動かしたいときは：

```bash
npm run test:watch
```

ファイルを保存するたびに、自動でテストを再実行してくれるので、
**「壊した瞬間にすぐ気づける」** 環境になります 🧠💡

Vitest は Vite をベースにしているので、テストの再実行もかなり速いです。([vitest.dev][1])

---

## 6️⃣ まとめ ＆ ミニ課題 💡📚

### 今日のまとめ

* **Vitest** = テストを管理・実行してくれるランナー
* **React Testing Library** = コンポーネントをユーザー目線でテストする道具
* **jsdom** = テスト用のブラウザ環境
* Vite プロジェクトでは

  * `npm install -D vitest jsdom @testing-library/...` で道具を入れて
  * `vite.config.ts` に `test: { environment: 'jsdom', setupFiles: [...] }` を追加
  * `vitest.setup.ts` で `@testing-library/jest-dom/vitest` と `cleanup` を設定
* 最後に、`render` + `screen` + `expect(...).toBeInTheDocument()` で
  **最初のテストが 1 つ動けば合格🎉**

---

### 🎁 ミニ課題（余裕があれば）

1. `Greeting` コンポーネントに

   * `message?: string` みたいな **オプショナルな props** を追加してみる
   * `message` があるとき／ないとき、それぞれの表示をテストしてみる

2. `Greeting.test.tsx` にテストケースをもう 1 つ足してみる

   * 別の名前（例：`"ゆい"`）でも正しく表示されるかを確認してみよう

---

次の章（153章）では、
React Testing Library の **`render` と `screen` を、もう少し丁寧に深堀り** していきます 🔍✨

ここまでできていれば、もう立派に「テスト書ける人」への第一歩です 👟💕

[1]: https://vitest.dev/?utm_source=chatgpt.com "Vitest | Next Generation testing framework"
[2]: https://testing-library.com/docs/react-testing-library/example-intro?utm_source=chatgpt.com "Example"
[3]: https://dev.to/janoskocs/setting-up-a-react-project-using-vite-typescript-vitest-2gl2?utm_source=chatgpt.com "Setting up a React project using Vite + TypeScript + Vitest"
[4]: https://tech.kentem.jp/entry/2024/08/06/090000?utm_source=chatgpt.com "Vite × Vitest × React Testing Library環境構築"
[5]: https://vitest.dev/guide/?utm_source=chatgpt.com "Getting Started | Guide"
[6]: https://nextjs.org/docs/app/guides/testing/vitest?utm_source=chatgpt.com "Testing: Vitest"
[7]: https://www.npmjs.com/package/%40testing-library/jest-dom?utm_source=chatgpt.com "testing-library/jest-dom"
[8]: https://testing-library.com/docs/react-testing-library/setup/?utm_source=chatgpt.com "Setup"
