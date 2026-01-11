# 第134章：練習：`useToggle`

今日は「ON / OFFを切り替えるだけ」の超よく使う仕組みを、**カスタムフック**として作っちゃいます🧁💕

---

### できるようになること ✅

* `useToggle()` を自作できる 🎉
* 「モーダル開閉」「アコーディオン開閉」「ダークモード」「いいね」みたいな *ON/OFF系* を一気に楽にできる 😍
* 同じロジックを何回もコピペしなくて済む ✂️🚫

---

## 1) まず `useToggle` の完成形をイメージしよ 🧠💡

![useToggleのイメージ](./picture/react_study_134_usetoggle.png)

「状態（boolean）と、それを切り替える関数たち」をひとまとめにして返します✨

* `value`：いま ON？OFF？（true/false）
* `toggle`：反転する（ON↔OFF）
* `setOn`：強制的にON
* `setOff`：強制的にOFF

---

## 2) 図で流れを見る（Mermaid）🗺️✨

```mermaid
flowchart TD
  A["ボタンをクリック 🖱️"] --> B["toggle() を呼ぶ"]
  B --> C["setValue(prev => !prev)"]
  C --> D["再レンダリング 🔄"]
  D --> E["表示がON/OFFで変わる 🎉"]
```

---

## 3) `useToggle.ts` を作ろう 📁✨

### ✅ 作る場所

`src/hooks/useToggle.ts`

```ts
import { useCallback, useState } from "react";

export function useToggle(initial: boolean = false) {
  const [value, setValue] = useState<boolean>(initial);

  // 反転（安全にするため prev を使うのがコツ✨）
  const toggle = useCallback(() => {
    setValue((prev) => !prev);
  }, []);

  // 強制ON / 強制OFF
  const setOn = useCallback(() => setValue(true), []);
  const setOff = useCallback(() => setValue(false), []);

  return [value, toggle, setOn, setOff] as const;
}
```

### ちょい解説 🌸

* `setValue((prev) => !prev)` ← これが超大事💎
  状態更新が重なっても安全に動きやすいです✨
* `as const` ← 戻り値が「タプル」として扱われて、取り出す時に気持ちよくなります☺️
  （型の話は次の章でさらにキレイにやるよ〜💪💕）

---

## 4) `App.tsx` で使ってみよう 🎮✨

```tsx
import { useToggle } from "./hooks/useToggle";

export default function App() {
  const [isOpen, toggleOpen, open, close] = useToggle(false);

  return (
    <div style={{ padding: 24, fontFamily: "sans-serif" }}>
      <h1>useToggle 練習 🎛️✨</h1>

      <p>
        状態：{isOpen ? "OPEN 😆" : "CLOSE 😴"}
      </p>

      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        <button onClick={toggleOpen}>トグル 🔁</button>
        <button onClick={open}>強制OPEN 🌈</button>
        <button onClick={close}>強制CLOSE 🌙</button>
      </div>

      {isOpen && (
        <div style={{ padding: 16, border: "1px solid #ccc", borderRadius: 8 }}>
          <h2>開いてるよ〜！🎉</h2>
          <p>モーダル/アコーディオン/詳細表示みたいな時に便利🩷</p>
          <button onClick={close}>閉じる 🙈</button>
        </div>
      )}
    </div>
  );
}
```

---

## 5) よくある使い道アイデア集 💡💞

* ✅ モーダルの開閉 🪟
* ✅ パスワード表示/非表示 🙈👀
* ✅ ダークモード切り替え 🌙🌞
* ✅ 「もっと見る」開閉 📖✨
* ✅ いいねのON/OFF ❤️🤍

---

## 6) ありがちミス注意 ⚠️😵‍💫

* `toggle()` を `setValue(!value)` で書くと、タイミングによってはズレることがあるよ💦
  なので **`prev => !prev`** が安心💎
* フックは **条件分岐の中で呼ばない**（`if` の中とか）🚫
  `useToggle()` はコンポーネントの一番上の方で呼ぶ✨

---

## 7) 練習問題（ミニ課題）🎒✨

### 課題A：いいねボタンを作ってみよ ❤️🤍

* `useToggle(false)` を使って
* ONなら「❤️ いいね済み」
* OFFなら「🤍 いいね」
  にして、押すたび切り替え🎉

### 課題B：「パスワード表示」🙈👀

* input の `type` を `password` / `text` で切り替えてみよう✨
  （ここでも `useToggle` が刺さる！）

---

次の第135章では、この `useToggle` の「戻り値」にもっとキレイに型を付けて、**TS的にさらに気持ちよく**していくよ〜😆🩷
