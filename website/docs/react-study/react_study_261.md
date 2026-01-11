# 第261章：Biome 入門

この章は「Biomeって結局なに者？🤔」をスッキリさせる回だよ〜✨
※導入（インストールや初期設定）は次の第262章でガッツリやる想定だよ🛠️

---

### この章でわかること 🎯

* Biome が「何をしてくれるツール」なのか 🧰
* ESLint / Prettier と何が違うのか 🧠
* なんで Rust 製ツールが人気なのか（Biomeが選ばれる理由）🚀

---

## 1) Biome ってなに？🧩

Biomeはひとことで言うと、**Web開発の“整える・チェックする”をまとめてやってくれるツールチェーン**だよ✨
具体的には、ざっくりこの3つが主役👇

* **Formatter（整形）**：コードの見た目を整える（Prettier みたいな役）✂️
* **Linter（指摘）**：ミスや危ない書き方を見つける（ESLint みたいな役）🔎
* **Check（まとめて実行）**：整形 + 指摘 +（import整理など）をまとめてやる 🎁

Biomeは **JS / TS / JSX / TSX / JSON / HTML / CSS / GraphQL** などを対象にできて、Prettier互換も意識されてるよ💅 ([Biome][1])
さらに、ルール（指摘項目）もたくさん用意されてるよ🧠 ([Biome][1])

---

## 2) 「昔のよくある構成」との違い 🧳➡️🎒

「整形」「lint」「import整理」「CI用コマンド」…って、別々の道具を寄せ集めがちで、設定ファイルも増えがち😵‍💫
Biomeはそこを**ひとつにまとめて**、体験を揃えようとしてる感じだよ〜✨ ([GitHub][2])

図で見るとこんなイメージ👇

```mermaid
flowchart LR
  A[プロジェクトのコード ✍️] --> B{整形/チェックどうする？}
  B -->|従来| C[ESLint + Prettier + 追加ツール… 😵‍💫]
  B -->|Biome| D[Biome ひとつ 🎯]
  C --> E[設定が増えがち・組み合わせで差が出がち ⚙️]
  D --> F[設定少なめを目指す・体験を統一しやすい ✨]
```
![Traditional Setup vs Biome](./picture/react_study_261_biome_intro.png)

---

## 3) なんで Rust 製ツールが選ばれるの？🦀💨

ここがこの章のメイン！🌟
Rust製（= ネイティブバイナリ系）の開発ツールが人気な理由は、ざっくりこんな感じ👇

### ✅ 速い（ことが多い）⚡

大きいプロジェクトほど、lint/format が重いとつらいよね…😇
Biomeは「高速」を強く推してるツールだよ🏎️ ([Biome][1])

### ✅ ひとつの“道具”としてまとまる 🧰

Biomeは **formatter + linter を統合**して、共通の基盤で動かす方針。
だから診断表示・自動修正・設定などを揃えやすいよ✨ ([GitHub][2])

### ✅ Node.js に依存しない設計（思想として）🧊

Biome自体は「Node.jsが必須じゃない」方向性も書かれてるよ（配布や実行がスッキリしやすい）📦 ([GitHub][2])
※ただし、現場では npm 経由で入れて使うのも普通にアリだよ🙆‍♀️（次章でやる！）

---

## 4) React（TSX）だと何がうれしい？⚛️💖

Reactって、TSXの中にJS/TS/HTMLっぽいのが混ざるから、見た目が崩れたり、importが散らかったりしやすいんだよね〜😵‍💫

Biomeは TSX も対象だし、**保存時フォーマット**や**クイックフィックス**みたいな「普段の開発の気持ちよさ」に直結しやすいよ✨
VS Code 拡張でも「Format on save」や「Quick fixes」が用意されてるよ〜🧁 ([GitHub][3])

---

## 5) “雰囲気だけ”先に触ってみる（おためし）🎈

インストールしなくても、`npx` でちょい触りできるよ🙌
（※`--write` を付けるとファイルが書き換わるから、最初は付けないのが安心✨）

```bash
# 例：プロジェクトのルートで
npx @biomejs/biome lint
```

「整形 + lint + import整理」をまとめてやる代表コマンドが `check` だよ🎁

```bash
# 書き換えも含めて一気に整える（慣れてからでOK！）
npx @biomejs/biome check --write
```

Biomeのガイドにも、このへんの基本コマンドがまとまってるよ📚 ([Biome][4])

---

## 6) 今日のミニまとめ 📝✨

* Biomeは「整形 + lint +（いろいろ）」をまとめて面倒を減らす系ツールチェーン🧰 ([GitHub][2])
* Rust製ツールが選ばれるのは、**速さ・配布のスッキリ感・体験の統一**が効きやすいから🦀💨 ([GitHub][2])
* VS Code と相性よくて、保存時フォーマットや修正提案が気持ちいい方向に行けるよ🧁 ([GitHub][3])

---

次の第262章では、Windows環境で **Biomeの導入 → biome.json作成 → format/lint/check をプロジェクトに組み込み**まで、一本道でやろうね〜🚀💖

[1]: https://biomejs.dev/ "Biome, toolchain of the web"
[2]: https://github.com/biomejs/biome "GitHub - biomejs/biome: A toolchain for web projects, aimed to provide functionalities to maintain them. Biome offers formatter and linter, usable via CLI and LSP."
[3]: https://github.com/biomejs/biome-vscode "GitHub - biomejs/biome-vscode: Biome extension for VS Code"
[4]: https://biomejs.dev/guides/getting-started/ "Getting Started | Biome"
