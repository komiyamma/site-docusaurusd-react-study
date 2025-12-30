# 第246章：キャッシュが原因で「更新したのに変わらない😵」を卒業！`revalidateTag`で“更新ボタン”を作る🧊🔁✨

今日は **「キャッシュで固定された表示」を、ボタン1つで最新に更新する** 体験をするよ〜！😊💡
（ブログや商品一覧みたいに「更新が入るデータ」で超よく使うやつです🛍️📰）

---

## まず結論：何がうれしいの？🎁

* `fetch` に **タグ** を付けてキャッシュする🏷️
* データが変わったタイミングで `revalidateTag('タグ名')` を呼ぶと
  **次のアクセスで最新データに更新される** 🔁✨（stale-while-revalidate っぽい動き） ([nextjs.org][1])

---

## 図でイメージつかも〜🧠✨（Mermaid）

```mermaid
flowchart TD
  A[ページ表示] --> B[fetchでデータ取得]
  B --> C{cache設定}
  C -->|force-cache| D[キャッシュ保存<br/>tag: uuid-demo]
  C -->|no-store等| E[毎回取りに行く]
  D --> F[次の表示はキャッシュで高速✨]
  G[フォーム送信<br/>(Server Action)] --> H[revalidateTag('uuid-demo')]
  H --> I[タグuuid-demoを無効化( stale )🧊➡️🔁]
  I --> J[次のアクセスで再フェッチ]
  J --> K[最新データに更新✨]
```

---

## ミニ課題：UUIDが“更新ボタン”で変わるページを作る🔁🪄

外部API（UUIDを返す）を **わざとキャッシュ**して、
`revalidateTag` で「更新」できるのを目で見て確認するよ👀✨

### 1) `app/actions.ts` を作る🗂️

```ts
'use server'

import { revalidatePath, revalidateTag } from 'next/cache'

export async function refreshUuid() {
  // タグを無効化（次のアクセスで再取得される）
  revalidateTag('uuid-demo')

  // ついでにトップページも再検証（動きが分かりやすくなる）
  revalidatePath('/')
}
```

* `revalidateTag` は **Server環境でだけ**使えるよ（Client Componentでは不可）🧠✨ ([nextjs.org][2])
* `revalidatePath` は「URL単位で更新」したい時に便利だよ🚪 ([nextjs.org][3])

---

### 2) `app/RefreshButton.tsx` を作る（送信中表示つき）⏳💗

```tsx
'use client'

import { useFormStatus } from 'react-dom'

export function RefreshButton() {
  const { pending } = useFormStatus()

  return (
    <button type="submit" disabled={pending}>
      {pending ? '更新中…⏳' : '更新する🔁'}
    </button>
  )
}
```

`useFormStatus` はフォーム送信中の状態を取れて、体験がやさしくなるよ😊🌸 ([React][4])

---

### 3) `app/page.tsx` を書く🏠✨

```tsx
import { refreshUuid } from './actions'
import { RefreshButton } from './RefreshButton'

type UuidResponse = { uuid: string }

async function getUuid(): Promise<string> {
  const res = await fetch('https://httpbin.org/uuid', {
    cache: 'force-cache',
    next: { tags: ['uuid-demo'] },
  })

  const data = (await res.json()) as UuidResponse
  return data.uuid
}

export default async function Page() {
  const uuid = await getUuid()

  return (
    <main style={{ padding: 24, fontFamily: 'system-ui' }}>
      <h1>UUID 更新デモ🧊🔁</h1>

      <p>
        今のUUID：<code>{uuid}</code>
      </p>

      <form action={refreshUuid}>
        <RefreshButton />
      </form>

      <p style={{ marginTop: 16, opacity: 0.75 }}>
        「更新する🔁」を押すと、キャッシュのタグを無効化して次の表示で新しいUUIDに変わるよ✨
      </p>
    </main>
  )
}
```

ポイントはここ👇

* `cache: 'force-cache'` で **キャッシュする** 🧊 ([nextjs.org][1])
* `next: { tags: [...] }` で **タグ付け** 🏷️ ([nextjs.org][1])
* Server Actionで `revalidateTag('uuid-demo')` して **更新スイッチON** 🔁 ([nextjs.org][2])

---

## 動かし方（Windows）🪟💨

1. ターミナルで開発サーバ起動：

   ```bash
   npm run dev
   ```
2. ブラウザで `http://localhost:3000` を開く🌈
3. UUIDが表示される → **更新する🔁** を押す → UUIDが変わったら成功🎉✨

---

## よくある「うっ…😵」ポイント（回避ワザつき）🧯

* **押したのに変わらない！**
  → DevToolsの「強制リロード」やキャッシュ制御で挙動が変わることがあるよ🌀（まず普通に更新でOK）
* **`revalidateTag` を Client Component に書いちゃった！**
  → それはNG！`'use server'` のファイル（Server Action）へ避難🏃‍♀️💨 ([nextjs.org][2])

---

## まとめ✨（今日のゴール達成🎉）

* `fetch` に **タグを付けてキャッシュ**できる🏷️🧊 ([nextjs.org][1])
* データ更新のタイミングで `revalidateTag` を呼ぶと **次のアクセスで最新化**できる🔁✨ ([nextjs.org][2])
* 「更新ボタン」＋ Server Actions で、運用っぽい体験に近づいたよ〜🥳🎀

[1]: https://nextjs.org/docs/app/api-reference/functions/fetch "Functions: fetch | Next.js"
[2]: https://nextjs.org/docs/app/api-reference/functions/revalidateTag "Functions: revalidateTag | Next.js"
[3]: https://nextjs.org/docs/app/api-reference/functions/revalidatePath?utm_source=chatgpt.com "Functions: revalidatePath"
[4]: https://react.dev/blog/2024/12/05/react-19?utm_source=chatgpt.com "React v19"
