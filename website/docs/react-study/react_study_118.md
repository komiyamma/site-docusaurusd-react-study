# 第118章：エラーの処理 (1)

---

この章のテーマはズバリ、

> 「`use(Promise)` でデータ取ってるとき、エラーが出たらどうするの？🤯
> ふつうの JavaScript みたいに `try-catch` じゃダメなの？」

っていう話です。

React v19 からの「`use` ＋ `Suspense` スタイルのデータ取得」では、
**エラーの扱い方の考え方がちょっとだけ特殊**なので、ここで一度整理します 🧠✨

次の章（119章）で本命の「エラーバウンダリ」をガッツリやるので、
ここでは **「なぜ `try-catch` がダメっぽいのか」「代わりにどう考えるのか」** をつかむのがゴールです。

---

## 1️⃣ まず復習：`use(Promise)` の世界で何が起こってる？

React 19 の `use` フックをおさらいします 👀

* `const data = use(somePromise);`
* `somePromise` が **pending** → コンポーネントは「Promise を throw」する
  → いちばん近い `<Suspense>` がそれをキャッチして `fallback`（ローディング画面）を表示する
* `somePromise` が **resolve** → `data` に結果が入り、ふつうにレンダー
* `somePromise` が **reject** → コンポーネントは「Error を throw」する
  → いちばん近い **エラーバウンダリ** がキャッチして「エラー用 UI」を表示する ([Medium][1])

ポイントは、

> **「Promise の状態に応じて、コンポーネントが `throw` してる」**

ってことです。
これが **`Suspense`（待ち）** と **エラーバウンダリ（失敗）** につながります。

---

## 2️⃣ `try-catch` で囲めばよくない？ → 実はうまくいかない 🙅‍♀️

JavaScript だけの世界なら、よくこんな書き方しますよね 👇

```ts
try {
  const res = await fetch("/api/data");
  const data = await res.json();
} catch (error) {
  console.error("エラーだよ", error);
}
```

じゃあ React コンポーネントで：

```tsx
// ❌ やりがちな「ダメな例」
import { use } from "react";
import { fetchUsers } from "./api";

export function BadUserList() {
  try {
    const users = use(fetchUsers()); // ← ここでエラーを try-catch したい…
    return (
      <ul>
        {users.map((user) => (
          <li key={user.id}>{user.name}</li>
        ))}
      </ul>
    );
  } catch (error) {
    // ここに来てほしい…
    return <p>読み込みに失敗しました…</p>;
  }
}
```

**これ、React 19 では NG 扱い** です 🧨

React の公式ドキュメントには、

> `use` を `try-catch` の中で呼ぶと「Suspense Exception: This is not a real error!」みたいなエラーになるから、
> `try-catch` ではなく **エラーバウンダリ** か **Promise の `.catch`** を使ってね

という注意書きがあります。([React][2])

さらに、公式の ESLint ルールでも、

> 「レンダー中に起きたエラーは `try-catch` では拾えないから、
> **エラーバウンダリを使いましょう**」

とハッキリ書かれています。([React][3])

### なぜ `try-catch` じゃダメなの？

* コンポーネントの関数自体を **呼んでいるのは React 本体** だから
* レンダリング中に起きたエラーは、**React が「上方向」に伝播させてエラーバウンダリに届ける** 仕組みになっているから([Epic React][4])

なので、私たちがコンポーネントの中で `try { const data = use(...) } catch { ... }` としても、
**その `catch` にはエラーが落ちてこない**、というイメージです 🌀

---

## 3️⃣ 図でイメージしよう 🧠✨

![react_study_118_error_handling](./picture/react_study_118_error_handling.png)

`use(Promise)` の世界で、エラーとローディングがどう流れるかの図です。

```mermaid
flowchart TD
  P["Promise (#quot;fetchなど#quot;)"] -->|pending| S[コンポーネントが Promise を throw]
  S --> SP[一番近い Suspense]
  SP --> Fallback["Fallback UI (読み込み中...) を表示"]

  P -->|resolved| D[コンポーネントにデータが返る]
  D --> View[通常のUIを表示]

  P -->|rejected| E[コンポーネントが Error を throw]
  E --> EB[一番近い Error Boundary]
  EB --> ErrorUI[エラー用のUIを表示]
```

* 「待ち」の時 → **`Suspense` が担当**
* 「失敗」の時 → **エラーバウンダリが担当**

`try-catch` の出番はここにはありません 🙅‍♀️

---

## 4️⃣ エラー処理の選択肢はざっくり 2 パターン 🌈

React 19 の `use` ベースの世界では、だいたい次の 2 パターンで考えます。

### ✅ パターンA：エラーを「Promise 内側」で処理する（`.catch` パターン）

**「エラーが出ても、エラー画面にはしたくない。
代わりに『データなし』として表示したい」** みたいなケースです。

React 公式の `use` ドキュメントでも、
「Promise の `.catch` で別の値に変換する」パターンが紹介されています。([React][2])

#### 例：エラーのときは「空配列」にしてしまう

```ts
// api.ts
export type User = {
  id: number;
  name: string;
};

export function fetchUsers(): Promise<User[]> {
  return fetch("https://example.com/api/users").then((res) => {
    if (!res.ok) {
      throw new Error("ユーザー取得に失敗しました");
    }
    return res.json() as Promise<User[]>;
  });
}
```

```tsx
// UserList.tsx
import { use } from "react";
import type { User } from "./api";
import { fetchUsers } from "./api";

export function UserList() {
  // ❗ エラーが出たら空配列にしてしまう
  const userPromise: Promise<User[]> = fetchUsers().catch((error) => {
    console.error("ユーザー取得エラー", error);
    // 「データなし」として扱う
    return [];
  });

  const users = use(userPromise);

  if (users.length === 0) {
    return <p>ユーザーが見つかりませんでした。</p>;
  }

  return (
    <ul>
      {users.map((user) => (
        <li key={user.id}>{user.name}</li>
      ))}
    </ul>
  );
}
```

この書き方だと：

* ネットワークエラーが起きても **Promise の中で `.catch`** して、
* コンポーネントに届くときには **「ちゃんと resolve 済み」** になっています
* なので `use(userPromise)` は **エラーを投げず、普通に動く** ✅

> 👉 「エラー画面」ではなく
> 「データがない通常状態」として扱いたいときにピッタリです。

---

### ✅ パターンB：エラーはエラーバウンダリに任せる（次章で本格的に✨）

もうひとつの考え方は、

> エラーが起きたら、その部分の UI を「まるごとエラー画面」に切り替えたい 🧱

というパターンです。

そのときは **Promise に `.catch` を付けずに、あえて reject のまま** にしておきます。
すると、`use` が throw した Error が **一番近いエラーバウンダリ** に届きます。([Medium][1])

#### イメージコード（エラーバウンダリの中身は次章で！）

```tsx
// UserList.tsx（エラーは握りつぶさない）
import { use } from "react";
import { fetchUsers } from "./api";

export function UserList() {
  const users = use(fetchUsers()); // ← エラーが起きたら Error を throw する

  return (
    <ul>
      {users.map((user) => (
        <li key={user.id}>{user.name}</li>
      ))}
    </ul>
  );
}
```

```tsx
// App.tsx（イメージ）
import { Suspense } from "react";
import { UserList } from "./UserList";
import { AppErrorBoundary } from "./AppErrorBoundary"; // 119〜120章で実装予定

export function App() {
  return (
    <AppErrorBoundary>
      <Suspense fallback={<p>ユーザー一覧を読込中…⏳</p>}>
        <UserList />
      </Suspense>
    </AppErrorBoundary>
  );
}
```

ここでは：

* 読み込み中 → `Suspense` の `fallback`（ローディング表示）
* エラー → `AppErrorBoundary` がキャッチして「ごめんね画面」を表示

というコンビプレイになります ⚾

---

## 5️⃣ 「`try-catch` の代わりに何を使うの？」を整理しよう 📝

React のレンダリング中に起きるエラーについて、ざっくりまとめると：

* ❌ **ダメ**

  * コンポーネントの中で `try { const data = use(...); } catch { ... }`
  * → React 19 では公式ドキュメント的にも非推奨／エラー扱い ([React][2])
* ✅ **OK 1：Promise 側で処理**

  * `fetchSomething().catch(() => 代わりの値を返す)`
  * → コンポーネントには「成功済みの値」として渡す
* ✅ **OK 2：エラーバウンダリに任せる**

  * Promise はそのまま（エラーは reject のまま）
  * → `use()` が Error を throw → エラーバウンダリがキャッチ
* ✅ **OK 3：イベントハンドラの中の `try-catch`**

  * `onClick` の中など、**ふつうの JS と同じタイミング** のものは `try-catch` でOK
  * これは「レンダー中のエラー」とは別物です

---

## 6️⃣ ちょこっと練習問題 ✏️💡

時間があるときに、以下をやってみてください：

1. **今まで作った `use`＋`Suspense` のサンプル**（もしあれば）で、

   * わざと `fetch` の URL を間違えてエラーにする
   * `.catch` なし → エラーバウンダリでエラー UI（※次章で実装）
   * `.catch` あり → 「データなし」として扱う
     この２パターンを比べてみる
2. どんな画面なら

   * 「ちゃんとエラー画面を出したい」か
   * 「エラーでも、静かに空の結果として扱いたい」か
     を、自分なりに考えてメモしてみる 💭

---

## 7️⃣ この章のまとめ 🎀

* React 19 の `use(Promise)` では、

  * **pending** → `Suspense` が担当
  * **rejected** → エラーバウンダリが担当
* レンダリング中のエラーは、ふつうの `try-catch` では拾えない
  → **エラーバウンダリ** か **Promise の `.catch`** を使う世界観 ✨([React][3])
* 「エラーを画面に出すか？」「静かに別の値に置き換えるか？」を
  **UI のデザインとして決める** のが大事 🎨

次の **第119章** では、
ここでチラ見せした **「エラーバウンダリってなに？どう書くの？」** を
実際のコードでしっかり作っていきます 🧱✨お楽しみに〜！ 🎉

[1]: https://medium.com/%40sudenurcevik/use-explained-promises-context-suspense-one-render-time-api-in-react-19-7f58cdab23aa?utm_source=chatgpt.com "Promises, Context, Suspense—One Render-Time API in ..."
[2]: https://react.dev/reference/react/use?utm_source=chatgpt.com "use"
[3]: https://react.dev/reference/eslint-plugin-react-hooks/lints/error-boundaries?utm_source=chatgpt.com "error-boundaries"
[4]: https://www.epicreact.dev/why-react-error-boundaries-arent-just-try-catch-for-components-i6e2l?utm_source=chatgpt.com "Why React Error Boundaries Aren't Just Try/Catch for ..."
