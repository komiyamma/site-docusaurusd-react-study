# 第196章：練習：ログイン/新規登録フォームを作る

この章では、**メール + パスワード**で「新規登録」と「ログイン」ができるフォームを作るよ😊💗
裏側は **Supabase Auth** を使う想定で進めるね！（メール/パスワードの `signUp` と `signInWithPassword` を使うよ） ([Supabase][1])

---

## ゴール🎯

* ✅ `/signup`：新規登録フォーム
* ✅ `/login`：ログインフォーム
* ✅ 送信中はボタンを「送信中…」にして連打防止
* ✅ 失敗したらエラー文を表示
* ✅ 成功したら好きなページへ移動（例：`/`）

---

## 全体の流れ（図解）🗺️

![ログイン・新規登録フォームのフロー](./picture/react_study_196_auth_form.png)

```mermaid
flowchart TD
A["メールとパスワード入力✍️"] --> B["送信ボタンを押す🖱️"]
B --> C["Reactの<form action>が実行⚡"]
C --> D{モードは？}
D -->|新規登録| E["supabase.auth.signUp()"]
D -->|ログイン| F["supabase.auth.signInWithPassword()"]
E --> G{errorある？}
F --> G{errorある？}
G -->|ある😭| H["エラー文を表示"]
G -->|ない🎉| I["成功メッセージ or 画面遷移"]
```

React v19 では `<form action={...}>` と `useActionState` / `useFormStatus` を使うと、フォーム処理がスッキリ書けるよ✨ ([React][2])

---

## 1) Supabase を入れる📦

ターミナルで👇

```bash
npm i @supabase/supabase-js
```

---

## 2) 環境変数（.env.local）を作る🔑

プロジェクト直下に **`.env.local`** を作って、これを入れてね👇

```env
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=xxxxxxxxxxxxxxxx
```

※ Vite では **`VITE_` から始まる環境変数だけ**が `import.meta.env` で読めるよ！ ([vitejs][3])
※ `ANON_KEY` は公開用（OK）だけど、**service_role** みたいな強い鍵はフロントに置いちゃダメだよ⚠️

---

## 3) Supabase クライアントを作る🧠

`src/lib/supabase.ts`

```ts
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
```

---

## 4) 送信中に変化するボタン（useFormStatus）を作る🔘✨

`useFormStatus()` は **フォーム送信中かどうか**を子コンポーネント側で取れるよ！ ([React][4])

`src/features/auth/SubmitButton.tsx`

```tsx
import { useFormStatus } from "react-dom";

type Props = {
  idleText: string;
  pendingText: string;
};

export function SubmitButton({ idleText, pendingText }: Props) {
  const { pending } = useFormStatus();

  return (
    <button type="submit" disabled={pending}>
      {pending ? pendingText : idleText}
    </button>
  );
}
```

---

## 5) 新規登録ページ（/signup）を作る🆕💗

`src/features/auth/SignupPage.tsx`

```tsx
import { useActionState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import { SubmitButton } from "./SubmitButton";

type FormState = {
  ok: boolean;
  message: string | null;
};

const initialState: FormState = { ok: false, message: null };

export function SignupPage() {
  const navigate = useNavigate();

  const [state, signupAction] = useActionState<FormState, FormData>(
    async (_prev, formData) => {
      const email = String(formData.get("email") ?? "");
      const password = String(formData.get("password") ?? "");

      if (!email || !password) {
        return { ok: false, message: "メールとパスワード、両方入れてね🙏💦" };
      }

      const { data, error } = await supabase.auth.signUp({ email, password }); // :contentReference[oaicite:4]{index=4}
      if (error) return { ok: false, message: error.message };

      // メール確認がONだと session がすぐ来ないこともあるよ✉️
      if (!data.session) {
        return { ok: true, message: "登録メール送ったよ✉️ 受信箱チェックしてね😊" };
      }

      navigate("/");
      return { ok: true, message: "登録できたよ🎉" };
    },
    initialState
  );

  return (
    <div style={{ maxWidth: 360, margin: "40px auto" }}>
      <h1>新規登録🆕✨</h1>

      <form action={signupAction} style={{ display: "grid", gap: 12 }}>
        <label>
          メール📧
          <input name="email" type="email" required autoComplete="email" />
        </label>

        <label>
          パスワード🔑
          <input
            name="password"
            type="password"
            required
            autoComplete="new-password"
            minLength={8}
          />
        </label>

        <SubmitButton idleText="登録する💗" pendingText="登録中…⏳" />
      </form>

      {state.message && (
        <p style={{ marginTop: 12 }}>
          {state.ok ? "✅ " : "❌ "}
          {state.message}
        </p>
      )}

      <p style={{ marginTop: 16 }}>
        もうアカウントある？👉 <Link to="/login">ログインへ</Link> 😊
      </p>
    </div>
  );
}
```

---

## 6) ログインページ（/login）を作る🔑✨

`src/features/auth/LoginPage.tsx`

```tsx
import { useActionState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import { SubmitButton } from "./SubmitButton";

type FormState = {
  ok: boolean;
  message: string | null;
};

const initialState: FormState = { ok: false, message: null };

export function LoginPage() {
  const navigate = useNavigate();

  const [state, loginAction] = useActionState<FormState, FormData>(
    async (_prev, formData) => {
      const email = String(formData.get("email") ?? "");
      const password = String(formData.get("password") ?? "");

      if (!email || !password) {
        return { ok: false, message: "メールとパスワード入れてね🙏💦" };
      }

      const { error } = await supabase.auth.signInWithPassword({ email, password }); // :contentReference[oaicite:5]{index=5}
      if (error) return { ok: false, message: error.message };

      navigate("/");
      return { ok: true, message: "ログイン成功🎉" };
    },
    initialState
  );

  return (
    <div style={{ maxWidth: 360, margin: "40px auto" }}>
      <h1>ログイン🔐✨</h1>

      <form action={loginAction} style={{ display: "grid", gap: 12 }}>
        <label>
          メール📧
          <input name="email" type="email" required autoComplete="email" />
        </label>

        <label>
          パスワード🔑
          <input
            name="password"
            type="password"
            required
            autoComplete="current-password"
          />
        </label>

        <SubmitButton idleText="ログインする✨" pendingText="ログイン中…⏳" />
      </form>

      {state.message && (
        <p style={{ marginTop: 12 }}>
          {state.ok ? "✅ " : "❌ "}
          {state.message}
        </p>
      )}

      <p style={{ marginTop: 16 }}>
        まだアカウントない？👉 <Link to="/signup">新規登録へ</Link> 🥰
      </p>
    </div>
  );
}
```

---

## 7) ルーティングに追加する🧭

`src/App.tsx`（例）

```tsx
import { Routes, Route } from "react-router-dom";
import { LoginPage } from "./features/auth/LoginPage";
import { SignupPage } from "./features/auth/SignupPage";

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/" element={<div>ホーム🏠</div>} />
    </Routes>
  );
}
```

---

## 動作チェック✅🧪

* 新規登録で **成功メッセージ**が出る？🆕
* ログインで **ホームへ遷移**する？🔐
* 送信中、ボタンが **押せなくなる**？⏳（連打防止） ([React][4])
* メール確認ONなら「確認メール送ったよ✉️」が出る？📧

---

## よくある詰まりポイント🥺💦

* `.env.local` のキー名が `VITE_...` になってなくて `undefined` になる
  → Vite は `VITE_` だけ公開する仕様だよ！ ([vitejs][3])
* 新規登録できたのにログインできない
  → Supabase側で「メール確認」がONだと、**確認メールを踏むまでログインできない**ことがあるよ✉️（設定次第）

---

## ミニ課題🎀（やってみよう）

1. ✅ エラー表示を赤っぽく、成功を緑っぽくしてみよ（CSS ModulesでもOK）🎨
2. ✅ パスワードの右に「👀表示/非表示」ボタンを付けてみよ
3. ✅ ログイン成功時に「トースト」みたいに3秒だけ表示して消す（`setTimeout`）⏳

---

次の第197章（ログアウト機能）につなげるなら、ログイン後ヘッダーに「ログアウト」ボタン置くのが気持ちいいよ😊✨

[1]: https://supabase.com/docs/reference/javascript/auth-signup?utm_source=chatgpt.com "JavaScript: Create a new user"
[2]: https://react.dev/blog/2024/12/05/react-19?utm_source=chatgpt.com "React v19"
[3]: https://vite.dev/guide/env-and-mode?utm_source=chatgpt.com "Env Variables and Modes"
[4]: https://react.dev/reference/react-dom/hooks/useFormStatus?utm_source=chatgpt.com "useFormStatus"
