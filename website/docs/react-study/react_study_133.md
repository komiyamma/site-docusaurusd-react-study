# 第133章：ルール：名前は `use` で始める

この章では「カスタムフックの名前は **`use` で始めようね！**」っていう超大事ルールを、理由もいっしょにスッキリ覚えます🧠✨
（これができると、Reactがめっちゃ味方してくれるよ〜！🥳）

---

## 1️⃣ 結論：カスタムフックは `use〇〇` にする！✅

たとえばこんな感じ👇

* ✅ `useToggle`
* ✅ `useWindowSize`
* ✅ `useLocalStorage`
* ✅ `useUser`

**先頭が `use` で始まって、次は大文字**（`use` + PascalCase）がお約束だよ〜📛✨

---

## 2️⃣ なんで `use` から始めるの？🤔💡（3つの理由）

![命名規則のイメージ](./picture/react_study_133_naming_convention.png)

### ✅ 理由①：Reactが「それフックだね！」って判定できる

React（というか周辺ツール）が **名前で「フック扱い」するか決める**ことが多いよ〜🔍
`use` で始まってると「おっ、Hookっぽい！」って分かる✨

### ✅ 理由②：フックのルール違反を見つけやすくなる（事故防止🚨）

Hookって「呼び出し方のルール」があるよね（ifの中で呼ばない、とか）🧷
`use` で始まってると、ツール側が「ルール違反かも！」を検出しやすい👍

### ✅ 理由③：コードを読む人が一瞬で理解できる👀✨

`useSomething()` って見た瞬間に
「あ、これは状態とか副作用とか持ってそう！」って察せるのが強い💪🥰
チーム開発でも神ルール🙏✨

---

## 3️⃣ 図でイメージ：カスタムフックってこう流れる🌈

```mermaid
flowchart LR
  A["コンポーネント"] -->|呼び出す| B["use〇〇 (カスタムフック)"]
  B --> C["useState など"]
  B --> D["useEffect など"]
  B --> E["useMemo など"]
  B -->|値/関数を返す| A
```

カスタムフックは「**中で別のHookを使って、便利な形にまとめて返す**」って感じだよ〜🎁✨

---

## 4️⃣ よくある命名パターン集（迷ったらコレ！🧭✨）

### 🟣 状態・機能を「使う」系

* `useToggle`
* `useCounter`
* `useTimer`

### 🔵 “値” を返す系（データ取得や計算）

* `useUser`
* `useProfile`
* `useWindowSize`

### 🟢 boolean（true/false）を返す系

* `useIsLogin`
* `useHasPermission`
* `useIsDarkMode`

（`is` を入れると意味が一瞬で伝わるよ〜✅）

---

## 5️⃣ 注意！「`use` を付けちゃダメな関数」もある⚠️😵

**Hookを使ってないただの関数**に `use` を付けるのは基本NG🙅‍♀️
（読んだ人が「Hookだ！」って誤解するし、ツールがHookとして扱うこともあるよ〜）

### ❌ ただのユーティリティ関数なのに `use` を付ける例

```ts
// ❌ Hookじゃないのに use が付いてて紛らわしい
export function useFormatDate(date: Date) {
  return date.toLocaleDateString();
}
```

### ✅ Hookじゃないなら普通に命名

```ts
// ✅ これはただの関数なので use を付けない
export function formatDate(date: Date) {
  return date.toLocaleDateString();
}
```

---

## 6️⃣ ミニ練習（3分）💪🌟

### 📝 お題：次の名前、どっちが正しい？（直してみよ〜✍️）

#### (1) Hookを使ってる（useState使う）✅

* `toggleTheme()`
* `useToggleTheme()`

👉 正解：**`useToggleTheme()`** 🎉

#### (2) Hookを使ってない（ただ文字列変換）✅

* `useToKatakana()`
* `toKatakana()`

👉 正解：**`toKatakana()`** 🎉

---

## 7️⃣ まとめ 🎀✨

* カスタムフックは **`use` で始める**（`use + 大文字`）✅
* `use` が付くと **Hookっぽい！**って伝わって事故が減る🚑✨
* Hookじゃない関数には **`use` を付けない**（誤解を生む）🙅‍♀️

---

## 次回予告 📣💖

次の **第134章** では、さっそく超定番のカスタムフック
**`useToggle`（ON/OFF切り替え）** を一緒に作るよ〜🔁✨🎉
