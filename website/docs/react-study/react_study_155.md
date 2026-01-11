# 第155章：練習：カウンターアプリのテストを書いてみる

この章では、**カウンター（＋1／－1／リセット）**を例にして、**「画面に出るものを確認するテスト」**を書いていくよ〜😊✨
ポイントは **ユーザー目線**（ボタン押したら数字が変わる？）でチェックすること！👀💡

---

### この章のゴール🎯

* ✅ カウンター部品を **render** して表示を確認できる
* ✅ ボタンをクリックして **数が変わる**ことをテストできる
* ✅ テストの基本形 **AAA（Arrange / Act / Assert）** が分かる🙆‍♀️

---

## テストの流れを図でイメージしよ🧠✨

```mermaid
flowchart LR
  A["Arrange: 画面を用意する render()"] --> B["Act: ユーザー操作 クリックなど"]
  B --> C["Assert: 期待どおりか確認 expect()"]
```

![カウンターテストのイメージ](./picture/react_study_155_counter_test_flow_diag.png)

---

## 1) カウンター部品を用意しよう🧩✨

`src/Counter.tsx` を作って、こうしてね👇（すでにある人は読み替えでOK！）

```tsx
import { useState } from "react";

type CounterProps = {
  initial?: number;
};

export default function Counter({ initial = 0 }: CounterProps) {
  const [count, setCount] = useState<number>(initial);

  return (
    <div>
      <h2>Counter</h2>

      {/* テストしやすいように label を付けるよ */}
      <output aria-label="count">{count}</output>

      <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
        <button type="button" onClick={() => setCount((c) => c + 1)}>
          ＋1
        </button>

        <button type="button" onClick={() => setCount((c) => c - 1)}>
          －1
        </button>

        <button type="button" onClick={() => setCount(0)}>
          リセット
        </button>
      </div>
    </div>
  );
}
```

---

## 2) テスト環境チェック🧰✨（入ってなければ入れる）

第152章で入れてる想定だけど、もしまだなら（PowerShellで）👇

```bash
npm i -D vitest jsdom @testing-library/react @testing-library/jest-dom
```

### `package.json` にテストコマンドも用意しよう📝

```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "preview": "vite preview",
    "test": "vitest"
  }
}
```

---

## 3) `vite.config.ts` にテスト設定を追加⚙️✨

プロジェクト直下の `vite.config.ts` をこうしてね👇
（すでに `test:` があるなら追記でOK！）

```ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: "./src/setupTests.ts",
  },
});
```

---

## 4) `setupTests.ts` を作る🧪✨（便利な matcher を使う）

`src/setupTests.ts` を作って、これ👇

```ts
import "@testing-library/jest-dom/vitest";
```

これで `toBeInTheDocument()` とか `toHaveTextContent()` が使えるよ〜🥳💕

---

## 5) いよいよテストを書くよ！🧪🔥（第155章のメイン）

`src/Counter.test.tsx` を作って、これを書こう👇

```tsx
import { render, screen, fireEvent } from "@testing-library/react";
import Counter from "./Counter";

describe("Counter", () => {
  test("初期表示は 0", () => {
    // Arrange
    render(<Counter />);

    // Assert
    const output = screen.getByLabelText("count");
    expect(output).toHaveTextContent("0");
  });

  test("＋1 を押すと 1 になる", () => {
    // Arrange
    render(<Counter />);

    // Act
    const plusButton = screen.getByRole("button", { name: "＋1" });
    fireEvent.click(plusButton);

    // Assert
    expect(screen.getByLabelText("count")).toHaveTextContent("1");
  });

  test("＋1 を2回押して、－1 を押すと 1 になる", () => {
    // Arrange
    render(<Counter />);

    // Act
    const plusButton = screen.getByRole("button", { name: "＋1" });
    const minusButton = screen.getByRole("button", { name: "－1" });

    fireEvent.click(plusButton);
    fireEvent.click(plusButton);
    fireEvent.click(minusButton);

    // Assert
    expect(screen.getByLabelText("count")).toHaveTextContent("1");
  });

  test("リセットを押すと 0 に戻る", () => {
    // Arrange
    render(<Counter />);

    // Act
    const plusButton = screen.getByRole("button", { name: "＋1" });
    const resetButton = screen.getByRole("button", { name: "リセット" });

    fireEvent.click(plusButton);
    fireEvent.click(plusButton);
    fireEvent.click(resetButton);

    // Assert
    expect(screen.getByLabelText("count")).toHaveTextContent("0");
  });
});
```

---

## 6) テストを実行しよう🏃‍♀️💨

```bash
npm run test
```

うまくいくと、緑のチェック✅が出るよ〜！🥰✨

---

## よくあるつまずき🐣💦（すぐ直るやつ！）

* 😵 `document is not defined`
  → `vite.config.ts` の `environment: "jsdom"` が入ってるか見てね！

* 😵 `toHaveTextContent is not a function`
  → `src/setupTests.ts` が作れてるか、`setupFiles` のパスが合ってるか確認！

---

## ミニ課題💖（できたら天才👏✨）

* 🧠 `initial` を使って **初期値が 10 のとき 10 が出る**テストを書いてみて！
  ヒント：`render(<Counter initial={10} />)` だよ😺

---

次の第156章では、もっとリアルな操作ができる **`@testing-library/user-event`** を使って、テストがさらに「人間っぽく」なるよ〜👩‍💻💗
