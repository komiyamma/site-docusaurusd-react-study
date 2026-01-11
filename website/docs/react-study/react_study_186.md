# 第186章：練習：メアドとパスワード（文字種チェック付き）のログインフォーム

この章では **React Hook Form（RHF）＋ Zod** で、
**メール + パスワード（文字種チェックあり）** のログインフォームを作るよ〜！🥳🧁

---

## ゴール 🎯

* ✅ メール形式チェック（`example@domain.com`）
* ✅ パスワードの文字種チェック（例：**8文字以上 / 大文字 / 小文字 / 数字 / 記号**）
* ✅ エラーを分かりやすく表示
* ✅ 送信中はボタンを無効化（連打防止）🚫👆
* ✅ “ログイン成功っぽい” 表示（※本物の認証は次章以降）🌸

---

## 図解（データの流れ）🗺️（Mermaid）

![ログインフォームのフロー](./picture/react_study_186_login_form.png)

```mermaid
flowchart LR
  A["入力: email/password ✍️"] --> B["RHF: registerで管理"]
  B --> C["resolver(zodResolver)"]
  C --> D["Zod schemaで検証 ✅/❌"]
  D -->|OK| E["handleSubmit → onSubmit 🚀"]
  D -->|NG| F["errorsに入る ⚠️"]
  F --> G["画面にエラーメッセージ表示 🧾"]
  E --> H["送信中はボタン無効化 ⏳"]
  E --> I["成功メッセージ表示 🎉"]
```

---

## 1) 必要パッケージを入れる 📦（まだなら）

プロジェクトのルート（`package.json` がある場所）で👇

```bash
npm i react-hook-form zod @hookform/resolvers
```

---

## 2) LoginForm コンポーネントを作る 🧩✨

### `src/components/LoginForm.tsx`

```tsx
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const loginSchema = z.object({
  email: z
    .string()
    .min(1, "メールアドレスは必須だよ✉️")
    .email("メール形式が正しくないかも…！例：name@example.com 📮"),
  password: z
    .string()
    .min(8, "パスワードは8文字以上にしてね🔐")
    .max(64, "パスワードは64文字以内にしてね🔐")
    .regex(/[a-z]/, "小文字（a〜z）を1文字以上入れてね🔡")
    .regex(/[A-Z]/, "大文字（A〜Z）を1文字以上入れてね🔠")
    .regex(/\d/, "数字（0〜9）を1文字以上入れてね🔢")
    .regex(/[^A-Za-z0-9]/, "記号（例：!@#$）を1文字以上入れてね✨"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [resultMessage, setResultMessage] = useState<string>("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isValid },
    watch,
    reset,
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    mode: "onChange",
    defaultValues: { email: "", password: "" },
  });

  const passwordValue = watch("password", "");

  const passwordChecklist = useMemo(() => {
    return {
      length: passwordValue.length >= 8,
      lower: /[a-z]/.test(passwordValue),
      upper: /[A-Z]/.test(passwordValue),
      digit: /\d/.test(passwordValue),
      symbol: /[^A-Za-z0-9]/.test(passwordValue),
    };
  }, [passwordValue]);

  const onSubmit = async (data: LoginFormValues) => {
    setResultMessage("");

    // ここは「本物のログイン」じゃなくて練習用だよ🌷
    await new Promise((r) => setTimeout(r, 800));

    // “成功っぽく”表示🎉
    setResultMessage(`ログイン成功っぽい！ようこそ、${data.email} さん🎉✨`);

    // 入力をリセットしたいなら👇（好みでOK）
    reset({ email: "", password: "" });
  };

  return (
    <div style={styles.card}>
      <h2 style={styles.title}>ログインフォーム ✨</h2>
      <p style={styles.sub}>メールとパスワードを入れてね😊</p>

      <form onSubmit={handleSubmit(onSubmit)} style={styles.form} noValidate>
        {/* Email */}
        <label style={styles.label}>
          メールアドレス ✉️
          <input
            type="email"
            placeholder="name@example.com"
            style={{
              ...styles.input,
              ...(errors.email ? styles.inputError : null),
            }}
            aria-invalid={!!errors.email}
            aria-describedby="email-error"
            {...register("email")}
          />
        </label>
        {errors.email && (
          <p id="email-error" style={styles.error}>
            {errors.email.message}
          </p>
        )}

        {/* Password */}
        <label style={{ ...styles.label, marginTop: 12 }}>
          パスワード 🔐
          <div style={styles.passwordRow}>
            <input
              type={showPassword ? "text" : "password"}
              placeholder="例：Abcdef!1"
              style={{
                ...styles.input,
                paddingRight: 10,
                flex: 1,
                ...(errors.password ? styles.inputError : null),
              }}
              aria-invalid={!!errors.password}
              aria-describedby="password-error"
              {...register("password")}
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              style={styles.toggleBtn}
            >
              {showPassword ? "隠す🙈" : "見る👀"}
            </button>
          </div>
        </label>

        {/* パスワード条件チェック（リアルタイム） */}
        <div style={styles.checklist}>
          <p style={{ margin: 0, fontWeight: 700 }}>パスワード条件 ✅</p>
          <ul style={styles.ul}>
            <li style={styles.li}>
              {passwordChecklist.length ? "✅" : "⬜"} 8文字以上
            </li>
            <li style={styles.li}>
              {passwordChecklist.lower ? "✅" : "⬜"} 小文字（a〜z）
            </li>
            <li style={styles.li}>
              {passwordChecklist.upper ? "✅" : "⬜"} 大文字（A〜Z）
            </li>
            <li style={styles.li}>
              {passwordChecklist.digit ? "✅" : "⬜"} 数字（0〜9）
            </li>
            <li style={styles.li}>
              {passwordChecklist.symbol ? "✅" : "⬜"} 記号（!@#$ など）
            </li>
          </ul>
        </div>

        {errors.password && (
          <p id="password-error" style={styles.error}>
            {errors.password.message}
          </p>
        )}

        <button
          type="submit"
          disabled={isSubmitting || !isValid}
          style={{
            ...styles.submit,
            ...(isSubmitting || !isValid ? styles.submitDisabled : null),
          }}
        >
          {isSubmitting ? "送信中...⏳" : "ログインする🚀"}
        </button>

        {resultMessage && <p style={styles.success}>{resultMessage}</p>}

        <p style={styles.note}>
          ※この章はフォーム練習だよ🌷 本物の認証（サーバー・トークンなど）は次の章でやる感じ！
        </p>
      </form>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  card: {
    maxWidth: 520,
    margin: "24px auto",
    padding: 18,
    border: "1px solid #ddd",
    borderRadius: 14,
    background: "#fff",
    boxShadow: "0 6px 18px rgba(0,0,0,0.06)",
  },
  title: { margin: 0, fontSize: 22 },
  sub: { marginTop: 6, marginBottom: 14, color: "#555" },
  form: { display: "flex", flexDirection: "column", gap: 8 },
  label: { display: "flex", flexDirection: "column", gap: 6, fontWeight: 700 },
  input: {
    padding: "10px 12px",
    borderRadius: 10,
    border: "1px solid #bbb",
    fontSize: 14,
    outline: "none",
  },
  inputError: { border: "1px solid #d33", background: "#fff5f5" },
  error: { margin: "2px 0 0", color: "#d33", fontWeight: 700 },
  passwordRow: { display: "flex", gap: 8, alignItems: "center" },
  toggleBtn: {
    padding: "10px 10px",
    borderRadius: 10,
    border: "1px solid #bbb",
    background: "#f6f6f6",
    cursor: "pointer",
    fontWeight: 700,
  },
  checklist: {
    padding: 12,
    borderRadius: 12,
    border: "1px dashed #bbb",
    background: "#fafafa",
  },
  ul: { margin: "8px 0 0", paddingLeft: 18 },
  li: { marginBottom: 4 },
  submit: {
    marginTop: 8,
    padding: "12px 12px",
    borderRadius: 12,
    border: "none",
    background: "#111",
    color: "#fff",
    fontWeight: 800,
    cursor: "pointer",
  },
  submitDisabled: { opacity: 0.5, cursor: "not-allowed" },
  success: {
    marginTop: 10,
    padding: 10,
    borderRadius: 12,
    background: "#f0fff4",
    border: "1px solid #7ad39b",
    fontWeight: 800,
  },
  note: { marginTop: 10, color: "#666", fontSize: 12 },
};
```

---

## 3) `App.tsx` で表示する 🧡

### `src/App.tsx`

```tsx
import { LoginForm } from "./components/LoginForm";

export default function App() {
  return (
    <div style={{ padding: 16 }}>
      <LoginForm />
    </div>
  );
}
```

---

## 4) 動かす ▶️🪟

```bash
npm run dev
```

ブラウザで表示されたら、いろいろ試してね！👀✨

* `name@example.com` じゃないと怒られる⚠️
* `Abcdef!1` みたいに “全部入り” だとOKになりやすい👍

---

## よくあるつまづきポイント 🧯😵‍💫

* **`resolver` の import これで合ってる？**
  `import { zodResolver } from "@hookform/resolvers/zod";` ✅
* **`mode: "onChange"` にしてるのに isValid が true にならない…**
  入力欄が空だと当然 false だよ〜🫶（必須チェックがあるからね）
* **記号チェックが通らない！**
  `!@#$%^&*` みたいな “英数字以外” が入ってるか確認してね✨

---

## ミニ課題（できたら強い💪💕）

* ✅ 成功メッセージじゃなくて **「ログイン中…」→「成功！」** をもっと分かりやすく演出してみる🎬
* ✅ パスワード欄の下に **“強さメーター”** を作ってみる🔥（条件が増えるほど強い、みたいに！）

---

次の第187章では、**エラーメッセージの出し分け＋スタイリング**をもっと可愛く整えていくよ〜🎀✨
