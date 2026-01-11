# 第216章：トースト通知の実装

### この章でできるようになること 🥳

* 画面右上に「保存しました🎉」みたいな通知を出せる
* 成功✅ / 失敗❌ / 注意⚠️ / 情報ℹ️ を使い分けできる
* 「取り消す↩️」みたいなアクション付きトーストも出せる
* 非同期処理（通信っぽいやつ）に合わせて「保存中…⏳」→「完了🎉」もできる

---

## トースト通知ってなに？🍞

ユーザーの操作に対して、**ちょい控えめに結果を伝える**小さな通知だよ〜📣
「保存したよ！」「エラーだよ！」を、画面を邪魔しすぎずに見せられるのがいいところ😊

※ shadcn/ui の **Toast コンポーネントは deprecated（非推奨）**になってて、今は **Sonner** を使うのが推しだよ〜🍞✨ ([Shadcn][1])

---

## 全体の流れ（図でイメージ）🗺️

![Toast Notification Flow](./picture/react_study_216_toast.png)

```mermaid
flowchart LR
  A["ボタン押す🖱️"] --> B["処理スタート⚙️"]
  B --> C{結果どう？🤔}
  C -- 成功✅ --> D["toast.success()🎉"]
  C -- 失敗❌ --> E["toast.error()😭"]
  D --> F["Toasterが画面に表示🍞"]
  E --> F
```

---

## Step 1：Sonner を追加する 🍞➕

shadcn/ui の CLI で Sonner を追加するよ（WindowsでもOK🙆‍♀️）

```bash
npx shadcn@latest add sonner
```

これで `Toaster` コンポーネント（表示場所）と、`toast()`（出す命令）が使えるようになるよ〜✨ ([Shadcn][2])

> もしここで `lucide-react` や `next-themes` が無いって怒られたら、これで入れればOKなことが多いよ👇

```bash
npm i lucide-react next-themes
```

（shadcn 側の Sonner 実装がアイコンやテーマ連携を使うことがあるよ〜）([Shadcn][2])

---

## Step 2：`<Toaster />` をアプリのどこか1箇所に置く 🏠

トーストは **「出す命令」**と **「表示する場所」**がセットだよ〜🍞
表示する場所が `<Toaster />`！

Vite なら、まずは **`App.tsx` の一番下**に置くのが分かりやすい👌
（ルートに置くのが推奨、って感じ！）([GitHub][3])

---

## Step 3：まずは「出るだけ」やってみよ！🎉

`src/App.tsx` を、こんな感じにしてみてね👇（デモ用✨）

```tsx
import { toast } from "sonner"
import { Toaster } from "@/components/ui/sonner"
import { Button } from "@/components/ui/button"

export default function App() {
  return (
    <div style={{ padding: 24 }}>
      <h1>Toast デモ 🍞</h1>

      <Button onClick={() => toast("保存しました✨")}>
        ふつうのトースト
      </Button>

      {/* これが「トーストの表示場所」だよ！ */}
      <Toaster richColors position="top-right" />
    </div>
  )
}
```

* `toast("...")` でトーストを出すよ〜📣 ([Shadcn][2])
* `richColors` と `position="top-right"` で「いい感じ」にできるよ〜🎨 ([Qiita][4])

---

## Step 4：説明文＆「取り消す」ボタン付きにする ↩️😋

トーストに **description（説明）**と **action（ボタン）**を付けられるよ✨ ([Shadcn][2])

```tsx
<Button
  variant="outline"
  onClick={() =>
    toast("プロフィール更新したよ✨", {
      description: "変更内容を反映しました〜🙌",
      action: {
        label: "取り消す",
        onClick: () => toast("取り消したよ↩️"),
      },
    })
  }
>
  詳細つき + 取り消し
</Button>
```

「取り消す」が押されたら、もう1回 toast を出してもOKだよ〜😆🍞

---

## Step 5：非同期処理に合わせて「保存中…」→「完了！」にする ⏳➡️🎉

通信みたいに時間がかかる処理は `toast.promise` が便利！✨ ([Shadcn][2])

```tsx
const save = async () => {
  toast.promise<void>(
    () => new Promise((resolve) => setTimeout(resolve, 1200)),
    {
      loading: "保存中…⏳",
      success: "保存できたよ🎉",
      error: "保存に失敗したよ😭",
    }
  )
}
```

ボタンに繋ぐならこんな感じ👇

```tsx
<Button onClick={save}>保存（Promise）</Button>
```

---

## よくあるつまづきポイント集 🧯😵‍💫

* **トーストが出ない** 👉 `<Toaster />` を置き忘れてる率が高い！🍞
* **トーストが増殖する** 👉 `<Toaster />` を複数箇所に置いちゃってるかも（1個でOK）
* **import の `@/` が使えない** 👉 プロジェクト側でパスエイリアスがまだなら、いったん相対パスでもOK！（例：`./components/ui/sonner`）

---

## ミニ課題（5分）⏱️🎀

1. 「コピーした📋」ボタンを作って、押したら `toast.success("コピーしたよ✨")` を出す
2. 失敗用に `toast.error("コピーできなかった😭")` も作って、2つのボタンで出し分けする
3. 上級（おまけ）：「元に戻す↩️」アクション付きトーストも付けてみる

---

次の章（第217章）は **カレンダー・日付選択📅**だね！
トーストができると、アプリが一気に“それっぽく”なるから楽しいよ〜🥰✨

[1]: https://ui.shadcn.com/docs/components/toast?utm_source=chatgpt.com "Toast - Shadcn UI"
[2]: https://ui.shadcn.com/docs/components/sonner "Sonner - shadcn/ui"
[3]: https://github.com/emilkowalski/sonner "GitHub - emilkowalski/sonner: An opinionated toast component for React."
[4]: https://qiita.com/Taira0222/items/4f140aac564878da5402?utm_source=chatgpt.com "【React】shadcn/ui の toast を使ってみる"
