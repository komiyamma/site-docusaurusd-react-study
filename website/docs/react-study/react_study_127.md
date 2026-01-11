# 第127章：【v19フック】`useFormStatus`

「送信中かどうか」を**子コンポーネント側から**こっそりチェックしよう✨

---

### 1. この章でやること 🎯

この章のゴールはこんな感じです👇

* `useFormStatus` フックってなにか分かる ✅
* 「フォームの送信中かどうか」を **子コンポーネント側で知る** 仕組みを理解する ✅
* 送信ボタンを「送信中…」に変えたり、押せなくしたりできるようになる ✅

React 19 では、`<form action={...}>` とセットで、`useActionState` や `useFormStatus` という「フォーム専用フック」が追加されました。`useFormStatus` はその中でも、**「送信ボタンをいい感じにする担当」**みたいな子です🥰([React][1])

---

### 2. `useFormStatus` ってどんな子？👀

![useFormStatusのイメージ](./picture/react_study_127_useformstatus.png)

公式の説明をめちゃくちゃざっくり言うと…

> `useFormStatus` は、「一番近い `<form>` の**送信状態**を教えてくれるフック」だよ。([React][2])

`useFormStatus()` を呼ぶと、こんな情報を持ったオブジェクトが返ってきます👇([React][2])

* `pending`: 今、送信中なら `true`（ここが一番よく使うやつ）
* `data`: 直近で送信された `FormData`（入力内容をここから読める）
* `method`: `"get"` / `"post"` などフォームのメソッド
* `action`: どのアクションが呼ばれているか

ポイントは、

> **子コンポーネントが、自分で `props` を受け取らなくてもフォームの状態を知れる**

というところです。これが React 19 フォームの、新しい便利ポイント🔥([MintJams][3])

---

### 3. 「昔のやり方」と「今のやり方」を比べてみる 🧪

#### 🐢 昔のやり方（`props` 地獄）

送信中フラグを子コンポーネントに伝えるために、こんな感じでやっていました：

```ts
type SubmitButtonProps = {
  isSubmitting: boolean;
};

function SubmitButton(props: SubmitButtonProps) {
  return (
    <button type="submit" disabled={props.isSubmitting}>
      {props.isSubmitting ? "送信中..." : "送信"}
    </button>
  );
}

export function Form() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    // 送信処理...
    setIsSubmitting(false);
  }

  return (
    <form onSubmit={handleSubmit}>
      {/* フォーム項目いろいろ */}
      <SubmitButton isSubmitting={isSubmitting} />
    </form>
  );
}
```

* 親が `isSubmitting` を `useState` で持つ
* 子に `isSubmitting` を `props` で渡す
* どんどんネストすると、バケツリレー状態…🥲

#### ⚡ React 19 のやり方（`useFormStatus`）

`useFormStatus` を使うと、**子コンポーネント側で「送信中かどうか」を直接聞けます**👇([React][4])

```ts
import { useFormStatus } from "react-dom";

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button type="submit" disabled={pending}>
      {pending ? "送信中..." : "送信"}
    </button>
  );
}

export function Form() {
  async function action(formData: FormData) {
    // フォーム送信処理（サーバー通信など）
  }

  return (
    <form action={action}>
      {/* フォーム項目いろいろ */}
      <SubmitButton />
    </form>
  );
}
```

* 親は「送信状態」を `state` で持たなくてOK ✨
* 子が `useFormStatus()` で勝手にフォーム状態を読みにいってくれる ✨
* その結果、コンポーネント同士の「依存」が減って、**部品として再利用しやすく**なります🌸([Zenn][5])

---

### 4. 大事なルール：「フォームの中」にいないとダメ 🚫

`useFormStatus` には超大事なルールがひとつあります👇

> `useFormStatus()` を使うコンポーネントは、**必ず `<form>` の中で表示されていること**。
> そうでないと、`pending` はずっと `false` のままです。([React][2])

OK な例↓

```tsx
export function App() {
  return (
    <form action={someAction}>
      {/* ✅ フォームの中 */}
      <SubmitButton />
    </form>
  );
}
```

ダメな例↓

```tsx
export function App() {
  return (
    <>
      {/* ❌ フォームの外なので pending は動かない */}
      <SubmitButton />

      <form action={someAction}>
        {/* ここに SubmitButton がいない */}
      </form>
    </>
  );
}
```

イメージを図にしてみると…🧠

```mermaid
graph TD
  U[ユーザーがボタンをクリック 💡] --> F[<form> が submit される]
  F --> A["Action 関数が呼ばれる"]
  A --> F2["React が「いま送信中だよ」を記録"]
  F2 --> C["フォームの中の useFormStatus()"]
  C --> B["ボタン: disabled / #quot;送信中...#quot; に切り替え"]
```

---

### 5. ミニアプリ：お問い合わせフォーム＋送信ボタン ✉️

では実際に、**「送信中…」ボタン付きお問い合わせフォーム**を作ってみます。

#### 5-1. 送信ボタンコンポーネントを作る 💄

`src/SubmitButton.tsx` みたいなファイルを用意します。

```ts
import { useFormStatus } from "react-dom";

export function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      style={{
        padding: "0.6rem 1.2rem",
        borderRadius: "999px",
        border: "none",
        cursor: pending ? "not-allowed" : "pointer",
        opacity: pending ? 0.7 : 1,
      }}
    >
      {pending ? "送信中..." : "送信する"}
    </button>
  );
}
```

ここがポイント👇

* `const { pending } = useFormStatus();`

  * `pending === true` のときだけボタンを無効化 (`disabled`)
  * 文言も「送信中…」にチェンジ🌀

#### 5-2. フォーム本体を作る 📝

`src/App.tsx` にフォームを作ります。

```tsx
import { SubmitButton } from "./SubmitButton";

async function contactAction(formData: FormData) {
  // 疑似的な通信待ち（1.5秒待つ）
  await new Promise((resolve) => {
    setTimeout(resolve, 1500);
  });

  const name = formData.get("name");
  const message = formData.get("message");

  console.log("送信されたお問い合わせ", { name, message });

  // 本当のアプリではここでサーバーに送信したり、DBに保存したりする
}

export function App() {
  return (
    <main
      style={{
        maxWidth: "480px",
        margin: "2rem auto",
        padding: "1.5rem",
        borderRadius: "1rem",
        border: "1px solid #eee",
        fontFamily: "system-ui, sans-serif",
      }}
    >
      <h1 style={{ fontSize: "1.5rem", marginBottom: "1rem" }}>
        お問い合わせフォーム ✉️
      </h1>

      <form
        action={contactAction}
        style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
      >
        <label style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
          お名前
          <input
            name="name"
            placeholder="例）山田 花子"
            required
            style={{ padding: "0.5rem", borderRadius: "0.5rem", border: "1px solid #ccc" }}
          />
        </label>

        <label style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
          メッセージ
          <textarea
            name="message"
            rows={4}
            placeholder="ご質問やご相談をどうぞ♪"
            required
            style={{ padding: "0.5rem", borderRadius: "0.5rem", border: "1px solid #ccc" }}
          />
        </label>

        {/* ここが useFormStatus を使っている子コンポーネント */}
        <SubmitButton />
      </form>
    </main>
  );
}
```

> `contactAction` が `async` 関数である間、React がフォームを「送信中」とみなしてくれます。その状態を `useFormStatus` で読んでボタン表示を変えている、という流れです。([React][4])

---

### 6. `data` を使って「誰のデータが送信中か」も出してみる 🧃

`useFormStatus` が返す `data` には、**直近の送信で送られた `FormData`** が入ってきます。([React][2])

ちょっとだけ応用して、「○○さんのメッセージ送信中…」みたいな表示にしてみます。

```ts
import { useFormStatus } from "react-dom";

export function FancySubmitMessage() {
  const { pending, data } = useFormStatus();

  const nameRaw = data?.get("name");
  const name =
    typeof nameRaw === "string" && nameRaw.length > 0 ? nameRaw : "メッセージ";

  if (!pending) {
    return null;
  }

  return (
    <p style={{ fontSize: "0.9rem", color: "#666" }}>
      {name} を送信中です... ⏳
    </p>
  );
}
```

そしてフォーム側で👇

```tsx
<form action={contactAction}>
  {/* ...入力項目... */}
  <FancySubmitMessage />
  <SubmitButton />
</form>
```

* `pending === true` の間だけメッセージを出す
* `data?.get("name")` を読んで、「誰のメッセージか」も表示
* UX がちょっとリッチになりますね✨

---

### 7. `useActionState` とどう分担するの？💭

前の章で登場した `useActionState` と `useFormStatus` は、ざっくりこう分担すると分かりやすいです：([React][1])

* `useActionState`

  * **フォームの結果（エラー / 成功メッセージ / 返ってきたデータ）** を扱う
  * 親フォームコンポーネントでよく使う
* `useFormStatus`

  * **「送信中かどうか」や、送信中のデータ** を扱う
  * 主に子コンポーネント（ボタンやスピナーなど）で使う

なので、

* エラーメッセージの表示 → `useActionState`
* ボタンの `disabled` と「送信中…」表示 → `useFormStatus`

と覚えておくと、頭の中がスッキリします🧠✨

---

### 8. よくあるハマりポイント ⚠️

最後に、`useFormStatus` でハマりやすいポイントをまとめておきます。

1. **フォームの外で使っている**

   * → `pending` が一生 `false` のままです
   * 必ず `<form>` の中でレンダーされているコンポーネントで使うこと！([React][2])

2. **`action` が同期処理で一瞬で終わる**

   * → `pending` がほぼ見えないレベルで一瞬だけ `true` になります
   * 通信など、ちゃんと `await` がある処理で使うと分かりやすいです

3. **複数のフォームがあるページ**

   * `useFormStatus` は「一番近い親の `<form>`」を見ます
   * 別のフォームと混ざらないように、コンポーネントの位置に注意👀

4. **`props` で状態を渡す癖が抜けない**

   * React 19 のフォームでは、「`props` で渡さなくても勝手に分かる」パターンが増えました
   * それでも迷ったら、「**親 = 結果管理 (`useActionState`)、子 = 見た目管理 (`useFormStatus`)**」を思い出してみてください💡

---

### 9. ちょこっと練習問題 🧩

自分の手でも試してみましょう〜！

1. 今回のお問い合わせフォームに、**チェックボックス**（「注意事項に同意します」など）を追加してみる
2. 送信中の間だけ、フォーム全体に薄いグレーの背景を敷く（`pending` によって `opacity` を変えるなど）
3. `data?.get("message")` を使って、「このメッセージを送信中です」みたいなプレビューを出してみる

---

ここまでできれば、`useFormStatus` はバッチリです🎉
次の章では、これをさらに実践的な「送信ボタン UI 改造」に発展させていきますね💪💕

[1]: https://react.dev/blog/2024/12/05/react-19?utm_source=chatgpt.com "React v19"
[2]: https://react.dev/reference/react-dom/hooks/useFormStatus?utm_source=chatgpt.com "useFormStatus"
[3]: https://www.mintjams.jp/%E3%81%AA%E3%81%9C%E4%BB%8A%E3%81%99%E3%81%90%E4%BD%BF%E3%81%86%E3%81%B9%E3%81%8D%EF%BC%9FReact%2019%E3%81%AEActions%E3%81%A8%E3%83%95%E3%82%A9%E3%83%BC%E3%83%A0%E6%94%B9%E5%96%84%E3%81%8C%E3%82%82%E3%81%9F%E3%82%89%E3%81%99%E9%96%8B%E7%99%BA%E9%9D%A9%E5%91%BD/r/blog%2Carticles%2Cweb-development%2Creact-19-actions-forms%2Cindex.html/?utm_source=chatgpt.com "なぜ今すぐ使うべき？React 19のActionsとフォーム改善が ..."
[4]: https://react.dev/reference/react-dom/components/form?utm_source=chatgpt.com "form"
[5]: https://zenn.dev/m0t0taka/articles/5de5cb152246e9?utm_source=chatgpt.com "React19で追加された 3 つの hook（useActionState, ..."
