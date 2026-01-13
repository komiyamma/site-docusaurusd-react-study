# Docusaurus Customization Points (このサイトの独自実装)

このサイト (`site-docusaurus-react-study`) では、標準の Docusaurus に対して以下のカスタム実装を行っています。

## 1. Description の動的読み込み (`.memo` ファイル)

Markdown ファイルの `description` フロントマターを、同名の `.memo` ファイルから自動的に読み込むロジックを実装しています。

- **実装場所**: `docusaurus.config.ts` の `markdown.parseFrontMatter`
- **仕様**:
    1. ビルド時に Markdown ファイル (`xxx.md`) を読み込む際、同階層の `memo/` フォルダ内にある `xxx.memo` ファイルを探します。
    2. `.memo` ファイルが存在すれば、その中身を `description` として採用します。
    3. Markdown 自体に `description` が定義されている場合は、そちらを優先します。

- **ディレクトリ構成**:
    - **docs/xxx/memo/**: 各章の要約 (`description`) を格納する `.memo` ファイル置き場。

## 2. Google SEO 向け構造化データ (JSON-LD)

Google 検索結果での表示を最適化するため、JSON-LD (`application/ld+json`) を自動出力しています。

- **実装場所**:
    - `src/components/SEO/StructuredData.tsx` (コンポーネント定義)
    - `src/theme/DocItem/index.tsx` (記事ページへの埋め込み)
    - `src/pages/index.tsx` (トップページへの埋め込み)
- **出力内容**:
    - **トップページ**: `WebSite` (サイト名、説明など)
    - **記事ページ**:
        - `Article` (記事タイトル、著者、**description** 等)
        - `BreadcrumbList` (サイドバーに基づくパンくずリスト)

## 3. スタイリングのカスタマイズ

`src/css/custom.css` にて、レイアウトと配色を調整しています。

- **配色**: 独自の「Steel Blue」系カラーパレット (`#46769b` 等) を定義。
- **サイドバー幅**: デフォルトより少し広い `430px` に固定。
- **コンテンツ幅**: 大型モニタでの可読性確保のため、最大幅を `1770px` まで拡張。

## 4. 検索機能

ローカル検索プラグインを導入しています。

- **プラグイン**: `@easyops-cn/docusaurus-search-local`
- **設定場所**: `docusaurus.config.ts`
- **仕様**: 日本語 (`ja`) と英語 (`en`) に対応。

---


## 5. ナビゲーションとサイドバー構造

教材ごとにナビゲーションとサイドバーを完全に分離しています。

- **設定場所**: `docusaurus.config.ts` (navbar), `sidebars.ts` (sidebar)
- **仕様**:
    - **React Study**: `docs/react-study/` 配下のコンテンツを表示。
    - **Next Study**: `docs/next-study/` 配下のコンテンツを表示。
    - **自動生成**: `sidebars.ts` 内の `generateStudyIds` 関数により、章番号（連番）に基づくファイルパスを自動生成し、手動でのID列挙を不要にしています。
